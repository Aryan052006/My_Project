import chromadb

client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_collection(name="study_material")

data = collection.get()
print(f"Total in DB: {len(data['ids'])}")

found = 0
for text in data["documents"]:
    if "TechNova" in text:
        found += 1
        print("Found TechNova in DB!")

if found == 0:
    print("TechNova NOT in DB! They need to re-upload the PDF through the UI.")
