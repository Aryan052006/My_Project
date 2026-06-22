from document_store import get_chunks


def get_document_stats():

    chunks = get_chunks()

    documents = {}

    for chunk in chunks:

        pdf = chunk["source"]

        if pdf not in documents:

            documents[pdf] = 0

        documents[pdf] += 1

    return documents