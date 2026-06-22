from document_store import get_chunks
from semantic_search import find_top_k_chunks
from rag import generate_answer


def answer_question(question):

    chunks = get_chunks()
    print("Total Chunks:", len(chunks))
    results = find_top_k_chunks(
        question,
        chunks,
        k=2
    )

    # print("\nQUESTION:", question)
    # print("TOP SCORE:", results[0]["score"])

    if len(results) == 0:

        return (
            "Information not found in study material."
        )

    contexts = [

        result["chunk"]["text"]

        for result in results
    ]

    answer = generate_answer(
        question,
        contexts
    )

    
    return answer