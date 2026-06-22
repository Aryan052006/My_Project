from embeddings import get_embedding

vector = get_embedding(
    "What is an Operating System?"
)

print(type(vector))
print(len(vector))
print(vector[:10])