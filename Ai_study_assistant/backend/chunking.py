import re


def create_chunks(
    text,
    source,
    chunk_size=900,
    overlap=150
):

    text = re.sub(r"\r", "", text)
    text = re.sub(r"\n{2,}", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)

    chunks = []

    start = 0
    chunk_id = 0

    text_length = len(text)

    while start < text_length:

        end = min(start + chunk_size, text_length)

        # Extend to sentence end
        if end < text_length:

            while (
                end < text_length
                and text[end] not in ".!?\n"
            ):
                end += 1

            if end < text_length:
                end += 1

        chunk_text = text[start:end].strip()

        if chunk_text:

            chunks.append(
                {
                    "id": chunk_id,
                    "chunk_number": chunk_id,
                    "source": source,
                    "text": chunk_text
                }
            )

            chunk_id += 1

        # Stop if we've reached the end
        if end >= text_length:
            break

        # Advance with overlap
        next_start = end - overlap

        # Prevent infinite loop
        if next_start <= start:
            next_start = end

        start = next_start

    return chunks