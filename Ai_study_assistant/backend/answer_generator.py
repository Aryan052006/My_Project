from semantic_search import find_top_k_chunks
from rag import generate_answer
from vector_store import total_chunks


def answer_question(
    question,
    marks=5,
    user_id="default"
):
    """
    Generates an answer for a single question
    using ChromaDB + RAG.
    """

    if total_chunks(user_id=user_id) == 0:

        return (
            "No study material has been uploaded."
        )

    # Retrieve more context for long answers
    if marks <= 5:
        k = 2
    elif marks <= 10:
        k = 5
    else:
        k = 7

    results = find_top_k_chunks(
        question,
        k=k,
        user_id=user_id
    )

    if len(results) == 0:

        return (
            "Information not found in study material."
        )

    # Reject low-confidence retrieval
    if results[0]["score"] < 0.65:

        return (
            "Information not found in study material."
        )

    contexts = []

    for result in results:

        if result["score"] >= 0.65:

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