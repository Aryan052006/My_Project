from pdf_utils import extract_text_from_pdf
from chunking import create_chunks
from embeddings import get_embedding
from vector_store import add_chunks
from semantic_search import find_top_k_chunks
from rag import generate_answer


text = extract_text_from_pdf("sample.pdf")

chunks = create_chunks(
    text,
    source="sample.pdf"
)

for chunk in chunks:
    chunk["embedding"] = get_embedding(
        chunk["text"]
    )

add_chunks(chunks)

question = "Define Stock Exchange"

results = find_top_k_chunks(
    question,
    k=1
)

if not results:

    print("No relevant information found.")

else:

    best_chunk = results[0]["chunk"]

    answer = generate_answer(
        question,
        best_chunk["text"]
    )

    print(answer)   