from pdf_utils import extract_text_from_pdf
from chunking import create_chunks

text = extract_text_from_pdf("sample.pdf")

chunks = create_chunks(
    text,
    source="sample.pdf"
)

print(f"Total Chunks: {len(chunks)}")
print(chunks[0])