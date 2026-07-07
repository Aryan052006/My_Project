from fastembed import TextEmbedding

print("Loading FastEmbed Model...")
# FastEmbed uses ONNX, saving ~300MB RAM by not loading PyTorch!
model = TextEmbedding("BAAI/bge-small-en-v1.5")
print("Embedding Model Loaded!")

def get_embedding(text):
    # model.embed returns a generator of numpy arrays
    embedding = list(model.embed([text]))[0]
    return embedding.tolist()