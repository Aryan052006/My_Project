import os
from semantic_search import find_top_k_chunks
import logging

logging.basicConfig(level=logging.INFO)

query = "What is a rational agent?"
print(f"Query: {query}")
results = find_top_k_chunks([query], k=5, user_id="default")
for r in results:
    print(f"Score: {r['score']} | Text: {r['chunk']['text'][:100]}")
