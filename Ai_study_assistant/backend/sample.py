from vector_store import collection

data = collection.get()

print(data["ids"])
print(data["metadatas"])