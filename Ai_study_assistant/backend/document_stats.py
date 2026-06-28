from vector_store import collection


def get_document_stats():
    """
    Returns the number of chunks stored for each PDF.
    """

    data = collection.get(
        include=["metadatas"]
    )

    documents = {}

    for metadata in data["metadatas"]:

        pdf = metadata["source"]

        if pdf not in documents:
            documents[pdf] = 0

        documents[pdf] += 1

    return documents