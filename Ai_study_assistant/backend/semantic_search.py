from sklearn.metrics.pairwise import cosine_similarity
from embeddings import get_embedding


def find_top_k_chunks(
    query,
    chunks,
    k=3,
    threshold=0.65
):

    query_embedding = get_embedding(query)

    scored_chunks = []

    for chunk in chunks:

        similarity = cosine_similarity(
            [query_embedding],
            [chunk["embedding"]]
        )[0][0]

        if similarity >= threshold:

            scored_chunks.append(
                {
                    "chunk": chunk,
                    "score": similarity
                }
            )

    scored_chunks.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return scored_chunks[:k]