documents = []


def add_chunks(chunks):
    documents.extend(chunks)


def get_chunks():
    return documents


def clear_store():
    documents.clear()


def total_chunks():
    return len(documents)