from embeddings import get_embedding
from vector_store import search


def find_top_k_chunks(
    question,
    k=5
):
    """
    Generate embedding for the question
    and retrieve the most relevant chunks
    from ChromaDB.
    """

    query_embedding = get_embedding(
        question
    )

    results = search(
        query_embedding=query_embedding,
        k=k
    )

    return results