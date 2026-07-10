import os
import requests
from dotenv import load_dotenv

load_dotenv()

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
        
    if COHERE_API_KEY:
        return _get_cohere_embeddings(texts)
    elif GEMINI_API_KEY:
        return _get_gemini_embeddings(texts)
    else:
        raise ValueError("Neither COHERE_API_KEY nor GEMINI_API_KEY is set in the environment variables.")

def _get_cohere_embeddings(texts: list[str]) -> list[list[float]]:
    print(f"Using Cohere API for {len(texts)} chunks...")
    url = "https://api.cohere.com/v1/embed"
    headers = {
        "Authorization": f"Bearer {COHERE_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "texts": texts,
        "model": "embed-english-v3.0",
        "input_type": "search_document"
    }
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()["embeddings"]

def _get_gemini_embeddings(texts: list[str]) -> list[list[float]]:
    print(f"Using Gemini API for {len(texts)} chunks...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    
    requests_payload = []
    for text in texts:
        requests_payload.append({
            "model": "models/text-embedding-004",
            "content": {
                "parts": [{"text": text}]
            }
        })
        
    data = {"requests": requests_payload}
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    
    embeddings = []
    for embed_obj in response.json().get("embeddings", []):
        embeddings.append(embed_obj["values"])
    return embeddings

def get_embedding(text: str) -> list[float]:
    return get_embeddings_batch([text])[0]