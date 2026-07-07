import ollama
import json
from semantic_search import find_top_k_chunks
from settings_manager import load_settings

def generate_flashcards(topic: str, num_cards: int = 10):
    settings = load_settings()
    results = find_top_k_chunks(topic, k=settings.get("top_k", 5) + 3)
    filtered = [r["chunk"]["text"] for r in results if r["score"] >= settings.get("min_similarity", 0.45)]
    
    context_text = "\n\n".join(filtered)
    
    if not context_text:
        return {"error": "Not enough context found to generate flashcards on this topic."}

    prompt = f"""You are an expert AI Study Assistant.
Generate {num_cards} high-yield flashcards based ONLY on the provided study material.
Topic: {topic}

You MUST return ONLY a valid JSON array of objects. Do not write any markdown formatting, do not write '```json', just return the raw JSON array.
Format each object exactly like this:
[
  {{
    "front": "Key Term or Question",
    "back": "Concise Definition or Answer"
  }}
]

Study Material:
{context_text}
"""

    response = ollama.chat(
        model=settings.get("model", "qwen3:1.7b"),
        messages=[{"role": "user", "content": prompt}],
        options={
            "temperature": 0.1,
            "num_predict": 1000
        },
        think=False
    )
    
    content = response['message']['content']
    
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        flashcards = json.loads(content)
        return flashcards
    except Exception as e:
        print("JSON Parsing Error:", e)
        print("Raw Content:", content)
        return {"error": "Failed to parse the generated flashcards. Please try again."}


def generate_cheat_sheet(topic: str):
    settings = load_settings()
    results = find_top_k_chunks(topic, k=settings.get("top_k", 5) + 5)
    filtered = [r["chunk"]["text"] for r in results if r["score"] >= settings.get("min_similarity", 0.45)]
    
    context_text = "\n\n".join(filtered)
    
    if not context_text:
        return "I couldn't find enough information in your uploaded documents to create a cheat sheet for this topic."

    prompt = f"""You are an expert AI Study Assistant.
Create a hyper-condensed "Cheat Sheet" for quick revision on the following topic, based ONLY on the provided study material.
Topic: {topic}

Rules for the Cheat Sheet:
1. Use extreme brevity (bullet points, short sentences).
2. Highlight formulas, key dates, important names, and core definitions.
3. Use markdown bolding extensively for keywords.
4. Structure it logically with clear markdown headings.
5. Do NOT write fluff or introductory sentences. Get straight to the facts.

Study Material:
{context_text}
"""

    response = ollama.chat(
        model=settings.get("model", "qwen3:1.7b"),
        messages=[{"role": "user", "content": prompt}],
        options={
            "temperature": 0.2,
            "num_predict": 1000
        },
        think=False
    )
    
    return response['message']['content']
