from document_store import (
    add_chunks,
    get_chunks,
    total_chunks
)

sample_chunks = [
    {
        "id": 0,
        "text": "Hello"
    },
    {
        "id": 1,
        "text": "World"
    }
]

add_chunks(sample_chunks)

print(get_chunks())
print(total_chunks())