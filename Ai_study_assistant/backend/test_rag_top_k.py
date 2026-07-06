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

question = (
    "Explain the functions of a Stock Exchange"
)

results = find_top_k_chunks(
    question,
    k=3
)

contexts = [
    result["chunk"]["text"]
    for result in results
]

answer = generate_answer(
    question,
    contexts
)

print(answer)