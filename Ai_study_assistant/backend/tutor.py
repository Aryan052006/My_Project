import json
from semantic_search import find_top_k_chunks
from settings_manager import load_settings

def generate_summary(topic: str, difficulty: str = "Medium", taxonomy: str = "Understanding", user_id: str = "default"):
    settings = load_settings()
    # 1. Retrieve context
    results = find_top_k_chunks(topic, k=settings.get("top_k", 5), user_id=user_id)
    filtered = [r["chunk"]["text"] for r in results if r["score"] >= settings.get("min_similarity", 0.45)]
    
    context_text = "\n\n".join(filtered)
    
    if not context_text:
        return "I couldn't find enough information in your uploaded documents to summarize this topic."

    prompt = f"""You are an expert AI Tutor.
Your goal is to summarize the following topic using ONLY the provided study material.
Topic: {topic}
Difficulty Level: {difficulty}
Bloom's Taxonomy Focus: {taxonomy}

Make the summary structured, engaging, and easy to read. Tailor the depth and language to the requested Difficulty Level.
Focus your explanation around the cognitive skill of {taxonomy} (e.g., if Analyzing, break down components; if Applying, show use cases).
Use headings, bullet points, and bold text.
At the end of your summary, you MUST include a Mermaid.js diagram (e.g., flowchart, mindmap) that visually represents the core concepts of the topic, wrapped in ```mermaid ... ``` tags.

CRITICAL MERMAID SYNTAX RULES:
1. NEVER use parentheses `()`, brackets `[]`, or special characters inside node text WITHOUT wrapping the text in double quotes. 
   - BAD: `A[Concept (Detail)]`
   - GOOD: `A["Concept (Detail)"]`
2. Do not use HTML tags in labels.
3. Keep the diagram structure simple and valid.

Study Material:
{context_text}

Summary and Diagram:"""

    from llm_client import get_chat_completion
    response_text = get_chat_completion(prompt, temperature=settings.get("temperature", 0.3), max_tokens=1024)
    return response_text


def generate_quiz(topic: str, num_questions: int = 5, difficulty: str = "Medium", taxonomy: str = "Understanding", user_id: str = "default"):
    settings = load_settings()
    results = find_top_k_chunks(topic, k=settings.get("top_k", 5) + 3, user_id=user_id) # Fetch a bit more context for quizzes
    filtered = [r["chunk"]["text"] for r in results if r["score"] >= settings.get("min_similarity", 0.45)]
    
    context_text = "\n\n".join(filtered)
    
    if not context_text:
        return {"error": "Not enough context found to generate a quiz on this topic."}

    prompt = f"""You are an expert AI Quiz Generator.
Generate a {num_questions}-question multiple-choice quiz based ONLY on the provided study material.
Topic: {topic}
Difficulty Level: {difficulty}
Bloom's Taxonomy Focus: {taxonomy}

The questions MUST be tailored to the Difficulty Level ({difficulty}) and require the student to use the cognitive skill of {taxonomy}.
For example, if the taxonomy is 'Applying', ask scenario-based questions. If 'Remembering', ask factual recall questions.
You MUST return ONLY a valid JSON array of objects. Do not write any markdown formatting, do not write '```json', just return the raw JSON array.
Format each object exactly like this:
[
  {{
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,  // The integer index (0-3) of the correct option
    "explanation": "Short explanation of why this is correct."
  }}
]

Study Material:
{context_text}
"""

    from llm_client import get_chat_completion
    content = get_chat_completion(prompt, temperature=0.1, max_tokens=1024)
    
    # Try to parse the JSON output
    try:
        # Sometimes models wrap in markdown anyway
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        quiz_data = json.loads(content)
        return quiz_data
    except Exception as e:
        print("JSON Parsing Error:", e)
        print("Raw Content:", content)
        return {"error": "Failed to parse the generated quiz. Please try again."}
