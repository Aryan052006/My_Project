from pdf_utils import extract_text_from_pdf
from chunking import create_chunks
from embeddings import get_embedding
from semantic_search import find_top_k_chunks

text = extract_text_from_pdf("sample.pdf")

chunks = create_chunks(
    text,
    source="sample.pdf"
)

for chunk in chunks:
    chunk["embedding"] = get_embedding(
        chunk["text"]
    )

results = find_top_k_chunks(
    "Functions of Stock Exchange",
    chunks,
    k=3
)

print(f"Found {len(results)} chunks\n")

for i, result in enumerate(results, start=1):

    print("=" * 50)

    print(
        f"Rank {i} | Score: {result['score']:.4f}"
    )

    print(
        result["chunk"]["text"][:300]
    )

    print("\n")