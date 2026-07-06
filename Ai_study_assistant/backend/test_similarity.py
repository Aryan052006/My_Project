from pdf_utils import extract_text_from_pdf
from chunking import create_chunks
from embeddings import get_embedding
import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

text = extract_text_from_pdf("uploads/Module-III Notes - MRJ.pdf")
chunks = create_chunks(text, "Module-III")

question = "What is the case study given on the primary market vs secondary market?"
q_emb = get_embedding(question)

print("Query:", question)
for c in chunks:
    if "Case Study" in c["text"] or "TechNova" in c["text"]:
        c_emb = get_embedding(c["text"])
        sim = cosine_sim(q_emb, c_emb)
        print(f"\nSimilarity: {sim:.4f}")
        text_safe = c["text"].encode('ascii', 'ignore').decode('ascii')
        print(text_safe[:300])

