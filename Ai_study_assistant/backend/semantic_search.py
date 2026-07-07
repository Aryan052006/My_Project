from embeddings import get_embedding
from vector_store import search, get_all_chunks
from rank_bm25 import BM25Okapi



def find_top_k_chunks(
    queries,
    k=5
):
    """
    Hybrid Search (Semantic + BM25) + Query Expansion + AI Re-ranking.
    queries: list of expanded queries
    """
    
    # Ensure it's a list even if a string is passed accidentally
    if isinstance(queries, str):
        queries = [queries]
        
    all_semantic_results = {}
    
    # 1. Semantic Search for all query variations
    for query in queries:
        query_embedding = get_embedding(query)
        # Fetch a wider net for hybrid ranking
        results = search(query_embedding=query_embedding, k=15)
        for rank, res in enumerate(results):
            chunk_id = res['chunk']['id']
            # RRF (Reciprocal Rank Fusion) Score
            score = 1.0 / (60 + rank)
            if chunk_id not in all_semantic_results:
                all_semantic_results[chunk_id] = {"chunk": res['chunk'], "semantic_score": score, "bm25_score": 0}
            else:
                all_semantic_results[chunk_id]["semantic_score"] += score

    # 2. BM25 Keyword Search
    all_data = get_all_chunks()
    if all_data and len(all_data["documents"]) > 0:
        tokenized_corpus = [doc.lower().split(" ") for doc in all_data["documents"]]
        bm25 = BM25Okapi(tokenized_corpus)
        
        for query in queries:
            tokenized_query = query.lower().split(" ")
            bm25_scores = bm25.get_scores(tokenized_query)
            
            # Sort indices by bm25 score
            top_indices = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)[:15]
            for rank, idx in enumerate(top_indices):
                chunk_id = all_data["metadatas"][idx]["chunk_id"]
                score = 1.0 / (60 + rank)
                if chunk_id in all_semantic_results:
                    all_semantic_results[chunk_id]["bm25_score"] += score
                else:
                    all_semantic_results[chunk_id] = {
                        "chunk": {
                            "text": all_data["documents"][idx],
                            "source": all_data["metadatas"][idx]["source"],
                            "id": chunk_id
                        },
                        "semantic_score": 0,
                        "bm25_score": score
                    }

    # 3. Combine scores and get top K candidates for AI Re-ranking
    combined_results = []
    for chunk_id, data in all_semantic_results.items():
        total_score = data["semantic_score"] + data["bm25_score"]
        combined_results.append({
            "chunk": data["chunk"],
            "score": total_score,
            "distance": 0  # Dummy distance
        })
        
    combined_results.sort(key=lambda x: x["score"], reverse=True)
    top_candidates = combined_results[:10]
    
    if len(top_candidates) == 0:
        return []

    # 4. AI Re-ranking (Using Ollama to score relevance 0-10)
    reranked_results = []
    main_query = queries[0]
    
    for candidate in top_candidates:
        prompt = f"""Score the relevance of the following document to the query on a scale of 0 to 10.
Return ONLY a single number from 0 to 10. Do not write anything else.

Query: {main_query}

Document: {candidate['chunk']['text']}"""

        try:
            from llm_client import get_chat_completion
            content = get_chat_completion(prompt, temperature=0.0, max_tokens=10)
            score_match = "".join(filter(str.isdigit, content.strip()))
            rerank_score = int(score_match) if score_match else 0
        except Exception as e:
            print(f"Reranking error: {e}")
            rerank_score = 0
            
        candidate["rerank_score"] = rerank_score
        reranked_results.append(candidate)
        
    # Sort by AI score, then fallback to Hybrid RRF score
    reranked_results.sort(key=lambda x: (x["rerank_score"], x["score"]), reverse=True)
    
    # Normalize score back to 0.0-1.0 format so main.py's MIN_SIMILARITY threshold works
    final_results = []
    for res in reranked_results[:k]:
        res["score"] = res["rerank_score"] / 10.0
        final_results.append(res)
        
    return final_results