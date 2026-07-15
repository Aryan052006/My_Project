import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

# ===========================
# Initialize Pinecone
# ===========================
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY is missing!")

pc = Pinecone(api_key=PINECONE_API_KEY)
index_name = "ai-study-assistant"

# Create index if it doesn't exist
existing_indexes = [idx.name for idx in pc.list_indexes()]
if index_name not in existing_indexes:
    from embeddings import get_embedding
    # Dynamically find the embedding dimension
    dim = len(get_embedding("test dimension"))
    pc.create_index(
        name=index_name,
        dimension=dim,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

index = pc.Index(index_name)


# ===========================
# Fetch All Chunks (Hack for Pinecone)
# ===========================
def get_all_chunks(user_id="default"):
    """
    Pinecone doesn't support 'select *'.
    We use a dummy vector to retrieve up to 10k chunks for BM25 and stats.
    """
    dim = index.describe_index_stats().dimension
    dummy_vector = [0.1] * dim
    
    results = index.query(
        vector=dummy_vector,
        top_k=10000,
        include_metadata=True,
        filter={"user_id": user_id}
    )
    
    documents = []
    metadatas = []
    ids = []
    for match in results.matches:
        documents.append(match.metadata.get("text", ""))
        metadatas.append(match.metadata)
        ids.append(match.id)
        
    return {"documents": documents, "metadatas": metadatas, "ids": ids}


# ===========================
# Add Chunks
# ===========================
def add_chunks(chunks, user_id="default"):
    vectors = []
    for chunk in chunks:
        # Create a unique ID for Pinecone
        pinecone_id = f"{user_id}_{chunk['source']}_{chunk['id']}"
        vectors.append((
            pinecone_id,
            chunk["embedding"],
            {
                "text": chunk["text"],
                "source": chunk["source"],
                "chunk_id": chunk["id"],
                "user_id": user_id
            }
        ))
    
    # Upsert in batches of 100
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        try:
            index.upsert(vectors=vectors[i:i + batch_size])
        except Exception as e:
            print(f"Failed to upsert batch to Pinecone: {e}")


# ===========================
# Search
# ===========================
def search(query_embedding, k=5, threshold=1.1, user_id="default"):
    # Chroma uses distance (lower is better), Pinecone uses similarity (higher is better).
    # If chroma threshold was 1.1, it meant similarity > 0.45.
    results = index.query(
        vector=query_embedding,
        top_k=k,
        include_metadata=True,
        filter={"user_id": user_id}
    )

    formatted_results = []
    seen = set()

    for match in results.matches:
        similarity = match.score
        
        # Filter out bad matches
        if similarity < 0.2:
            continue

        metadata = match.metadata
        text = metadata.get("text", "")

        if text in seen:
            continue
        seen.add(text)

        formatted_results.append({
            "chunk": {
                "text": text,
                "source": metadata.get("source"),
                "id": metadata.get("chunk_id")
            },
            "score": similarity,
            "distance": 1.0 - similarity
        })

    return formatted_results


# ===========================
# Total Chunks
# ===========================
def total_chunks(user_id="default"):
    data = get_all_chunks(user_id)
    return len(data["ids"])


# ===========================
# Check if PDF Exists
# ===========================
def document_exists(filename, user_id="default"):
    data = get_all_chunks(user_id)
    for meta in data["metadatas"]:
        if meta.get("source") == filename:
            return True
    return False


# ===========================
# Delete One PDF
# ===========================
def delete_document(filename, user_id="default"):
    data = get_all_chunks(user_id)
    ids_to_delete = [
        data["ids"][i] for i, meta in enumerate(data["metadatas"]) 
        if meta.get("source") == filename
    ]
    
    if ids_to_delete:
        index.delete(ids=ids_to_delete)
        return True
    return False


# ===========================
# Rename Document
# ===========================
def rename_document(old_filename, new_filename, user_id="default"):
    data = get_all_chunks(user_id)
    
    vectors_to_update = []
    for i, meta in enumerate(data["metadatas"]):
        if meta.get("source") == old_filename:
            # We must fetch the embedding to upsert again with new metadata?
            # Actually, Pinecone allows metadata-only updates in v3!
            # Let's do it using index.update()
            try:
                index.update(
                    id=data["ids"][i],
                    set_metadata={"source": new_filename}
                )
            except Exception as e:
                print(f"Failed to update metadata for {data['ids'][i]}: {e}")
                
    return True


# ===========================
# Document Statistics
# ===========================
def get_document_stats(user_id="default"):
    data = get_all_chunks(user_id)
    documents = {}

    for metadata in data["metadatas"]:
        pdf = metadata.get("source", "Unknown")
        if pdf not in documents:
            documents[pdf] = 0
        documents[pdf] += 1

    return documents


# ===========================
# Clear Database
# ===========================
def clear_database(user_id="default"):
    # Delete all vectors for this user
    data = get_all_chunks(user_id)
    if data["ids"]:
        index.delete(ids=data["ids"])