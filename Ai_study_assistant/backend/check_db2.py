import chromadb

client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_collection(name="study_material")

data = collection.get()

for text in data["documents"]:
    if "TechNova" in text:
        text_safe = text.encode('ascii', 'ignore').decode('ascii')
        print("FOUND DB CHUNK:")
        print(text_safe[:300])
        print("---")
