from semantic_search import find_top_k_chunks

question = "Tell me what is the case study given on the primary market vs secondary market."
results = find_top_k_chunks(question, k=5)

for i, r in enumerate(results):
    print(f"Result {i+1}: Score={r['score']} Distance={r['distance']}")
    print(r['chunk']['text'][:200])
    print("-" * 40)
