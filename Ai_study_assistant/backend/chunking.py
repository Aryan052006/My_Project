def create_chunks(
    text,
    source,
    chunk_size=1000,
    overlap=200
):

    chunks = []

    start = 0
    chunk_id = 0

    while start < len(text):

        end = start + chunk_size

        chunk_text = text[start:end]

        chunks.append(
        {
            "id": chunk_id,
            "chunk_number": chunk_id,
            "source": source,
            "text": chunk_text
        }
    )

        chunk_id += 1

        start += chunk_size - overlap

    return chunks