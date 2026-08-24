from semantic_search import find_top_k_chunks
from rag import generate_answer
from vector_store import total_chunks


from settings_manager import load_settings

def answer_question(
    question,
    marks=5,
    user_id="default"
):
    """
    Generates an answer for a single question
    using Pinecone + RAG.
    """

    if total_chunks(user_id=user_id) == 0:

        return (
            "No study material has been uploaded."
        )

    settings = load_settings()
    k_val = settings.get("top_k", 15)

    results = find_top_k_chunks(
        question,
        k=k_val,
        user_id=user_id
    )

    if len(results) == 0:
        return "Information not found in study material."

    min_sim = settings.get("min_similarity", 0.05)

    # Reject low-confidence retrieval
    if results[0]["score"] < min_sim:
        return "Information not found in study material."

    contexts = []
    
    # Cap context length based on marks to avoid token overflow
    limit = 5 if marks <= 5 else 10

    for result in results[:limit]:
        if result["score"] >= min_sim:
            contexts.append(
                result["chunk"]["text"]
            )

    if len(contexts) == 0:

        return (
            "Information not found in study material."
        )

    answer = generate_answer(
        question=question,
        contexts=contexts,
        marks=marks
    )

    return answer