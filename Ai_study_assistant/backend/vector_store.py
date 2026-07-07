import chromadb

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="study_material"
)


# ===========================
# Add Chunks
# ===========================

def add_chunks(chunks):

    for chunk in chunks:

        chunk_id = f"{chunk['source']}_{chunk['id']}"

        try:
         collection.add(
        ids=[chunk_id],
        documents=[chunk["text"]],
        embeddings=[chunk["embedding"]],
        metadatas=[{
            "source": chunk["source"],
            "chunk_id": chunk["id"]
        }]
    )

        except Exception as e:
            print(f"Failed to add {chunk_id}: {e}")

# ===========================
# Search
# ===========================

def search(
    query_embedding,
    k=5,
    threshold=1.1  # Set default distance threshold higher so valid cosine similarities > 0.45 aren't dropped
):

    results = collection.query(
 
        query_embeddings=[
            query_embedding
        ],

        n_results=k

    )

    formatted_results = []

    if len(results["documents"][0]) == 0:
        return []

    seen = set()

    for i in range(
        len(results["documents"][0])
    ):

        distance = results["distances"][0][i]

        if distance > threshold:
            continue

        text = results["documents"][0][i]

        if text in seen:
            continue

        seen.add(text)

        # ChromaDB uses Squared L2 distance by default.
        # L2_squared = 2 - 2 * cosine_similarity
        # Therefore, cosine_similarity = 1 - (distance / 2)
        similarity = round(
            1 - (distance / 2),
            4
        )

        formatted_results.append(

            {

                "chunk": {

                    "text": text,

                    "source":
                    results["metadatas"][0][i]["source"],

                    "id":
                    results["metadatas"][0][i]["chunk_id"]

                },

                "score": similarity,

                "distance": round(
                    distance,
                    4
                )

            }

        )

        print("\n========== RAW SEARCH ==========")

    for i in range(len(results["documents"][0])):

        print("Distance :", results["distances"][0][i])

        print("Source   :", results["metadatas"][0][i]["source"])

        print(results["documents"][0][i][:200])

        print("-" * 50)

    return formatted_results


# ===========================
# Total Chunks
# ===========================

def total_chunks():

    return collection.count()


# ===========================
# Check if PDF Exists
# ===========================

def document_exists(filename):

    data = collection.get(
        where={
            "source": filename
        }
    )

    return len(data["ids"]) > 0


# ===========================
# Delete One PDF
# ===========================

def delete_document(filename):

    data = collection.get(
        where={
            "source": filename
        }
    )

    ids = data["ids"]

    if len(ids) == 0:

        return False

    collection.delete(
        ids=ids
    )

    return True


# ===========================
# Rename Document
# ===========================

def rename_document(old_filename, new_filename):
    data = collection.get(
        where={
            "source": old_filename
        }
    )
    
    ids = data["ids"]
    if len(ids) == 0:
        return False
        
    new_metadatas = []
    for metadata in data["metadatas"]:
        new_metadatas.append({
            "source": new_filename,
            "chunk_id": metadata["chunk_id"]
        })
        
    collection.update(
        ids=ids,
        metadatas=new_metadatas
    )
    return True


# ===========================
# Document Statistics
# ===========================

def get_document_stats():

    data = collection.get(
        include=["metadatas"]
    )

    documents = {}

    for metadata in data["metadatas"]:

        pdf = metadata["source"]

        if pdf not in documents:

            documents[pdf] = 0

        documents[pdf] += 1

    return documents


# ===========================
# Clear Database
# ===========================

def clear_database():

    global collection

    try:

        client.delete_collection(
            "study_material"
        )

    except Exception:
        pass

    collection = client.get_or_create_collection(
        name="study_material"
    )

# ===========================
# Fetch All Chunks (for BM25)
# ===========================

def get_all_chunks():

    data = collection.get(
        include=["documents", "metadatas"]
    )
    
    return data