from pdf_utils import extract_text_from_pdf
from chunking import create_chunks

text = extract_text_from_pdf("uploads/Module-III Notes - MRJ.pdf")
chunks = create_chunks(text, "Module-III")
print(f"Total Chunks: {len(chunks)}")

for c in chunks:
    if "Case Study" in c["text"] or "TechNova" in c["text"]:
        print("\nFOUND CHUNK:")
        print(c["text"])