from sentence_transformers import SentenceTransformer

print("Loading Embedding Model...")
model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5"
)
print("Embedding Model Loaded!")

def get_embedding(text):

    embedding = model.encode(text)

    return embedding.tolist()