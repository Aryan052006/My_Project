from pdf_utils import extract_text_from_pdf
from chunking import create_chunks
from embeddings import get_embedding
from semantic_search import find_best_chunk
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

question = "Define Stock Exchange"

best_chunk, score = find_best_chunk(
    question,
    chunks
)

if best_chunk is None:

    print("No relevant information found.")
    print("Score:", score)

else:

    answer = generate_answer(
        question,
        best_chunk["text"]
    )

    print(answer)   