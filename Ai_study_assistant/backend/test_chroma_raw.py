from embeddings import get_embedding
from vector_store import collection

question = "Tell me what is the case study given on the primary market vs secondary market."
query_embedding = get_embedding(question)

results = collection.query(
    query_embeddings=[query_embedding],
    n_results=10
)

for i in range(len(results["documents"][0])):
    distance = results["distances"][0][i]
    text = results["documents"][0][i]
    print(f"Distance: {distance:.4f} | Text: {text[:150].strip()}")
