import chromadb

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="study_material"
)


def add_chunks(chunks):

    for chunk in chunks:

        chunk_id = f"{chunk['source']}_{chunk['id']}"

        try:

            collection.add(
                ids=[chunk_id],
                documents=[
                    chunk["text"]
                ],
                embeddings=[
                    chunk["embedding"]
                ],
                metadatas=[
                    {
                        "source": chunk["source"],
                        "chunk_id": chunk["id"]
                    }
                ]
            )

        except Exception:
            # Chunk already exists
            pass


def total_chunks():

    return collection.count()


def clear_database():

    global collection

    try:

        client.delete_collection(
            "study_material"
        )

    except Exception:
        pass

    collection = client.get_or_create_collection(
        name="study_material"
    )


def search(
    query_embedding,
    k=5,
    threshold=0.45
):
    """
    Returns only relevant chunks.

    threshold:
        Maximum allowed distance.

    Smaller distance = better match.
    """

    results = collection.query(
        query_embeddings=[
            query_embedding
        ],
        n_results=k
    )

    formatted_results = []

    if len(results["documents"][0]) == 0:
        return []

    seen = set()

    for i in range(
        len(results["documents"][0])
    ):

        distance = results["distances"][0][i]

        # Reject weak matches
        if distance > threshold:
            continue

        text = results["documents"][0][i]

        # Remove duplicate chunks
        if text in seen:
            continue

        seen.add(text)

        similarity = round(
            1 - distance,
            4
        )

        formatted_results.append(

            {
                "chunk": {

                    "text": text,

                    "source":
                    results["metadatas"][0][i]["source"],

                    "id":
                    results["metadatas"][0][i]["chunk_id"]

                },

                "score": similarity,

                "distance": round(
                    distance,
                    4
                )

            }

        )

    return formatted_results