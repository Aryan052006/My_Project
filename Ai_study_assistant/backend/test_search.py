from pdf_utils import extract_text_from_pdf
from chunking import create_chunks
from embeddings import get_embedding
from semantic_search import find_best_chunk

# Extract text
text = extract_text_from_pdf("sample.pdf")

# Create chunks
chunks = create_chunks(
    text,
    source="sample.pdf"
)

# Generate embeddings for every chunk
for chunk in chunks:
    chunk["embedding"] = get_embedding(
        chunk["text"]
    )

print(f"Generated embeddings for {len(chunks)} chunks")

# Search
result, score = find_best_chunk(
    "How do stock markets function?",
    chunks
)

print("\nSimilarity Score:")
print(score)

print("\nRetrieved Chunk:")
print(result["text"])