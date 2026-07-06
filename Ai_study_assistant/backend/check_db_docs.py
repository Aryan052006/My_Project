import chromadb

client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_collection(name="study_material")
data = collection.get(include=["metadatas"])
docs = set([m["source"] for m in data["metadatas"]])
print("Documents in DB:", docs)
