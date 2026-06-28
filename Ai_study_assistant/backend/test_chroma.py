from vector_store import (
    add_chunks,
    total_chunks,
    clear_database
)

clear_database()

chunks = [

    {
        "id": 0,
        "source": "sample.pdf",
        "text": "Operating System",
        "embedding": [0.1] * 384
    },

    {
        "id": 1,
        "source": "sample.pdf",
        "text": "Process Management",
        "embedding": [0.2] * 384
    }

]

add_chunks(chunks)

print(
    "Total Chunks:",
    total_chunks()
)