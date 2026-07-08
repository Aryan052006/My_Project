

def generate_answer(
    question,
    contexts,
    history=None,
    marks=5,
    model="qwen3:1.7b"
):
    from settings_manager import load_settings
    settings = load_settings()
    
    context_text = "\n\n".join(contexts)

    points_instruction = "Use bullet points ONLY if explicitly requested in the question. Otherwise, answer in paragraphs."
    if "point" in question.lower() or "bullet" in question.lower():
        points_instruction = "Use bullet points as requested."

    if marks <= 2:
        answer_style = f"""
This is a {marks}-mark question.

Instructions:
- Answer in 30-50 words (2 to 3 lines).
- {points_instruction}
- Give a precise and direct answer.
"""
        num_predict = 100

    elif marks == 3:
        answer_style = f"""
This is a 3-mark question.

Instructions:
- Answer in 60-90 words.
- {points_instruction}
- Provide a clear explanation with key details.
"""
        num_predict = 150

    elif marks <= 5:
        answer_style = f"""
This is a {marks}-mark question.

Instructions:
- Answer in 150-200 words.
- {points_instruction}
- Provide a comprehensive explanation.
"""
        num_predict = 300

    else:
        answer_style = f"""
This is a {marks}-mark question.

Instructions:
- Answer in 400-600 words.
- {points_instruction}
- Structure with an introduction, detailed explanation, and a brief conclusion if appropriate.
"""
        num_predict = 800

    if history is None:

        history = []

    history_text = ""

    for message in history:

        if message["role"] == "user":

            history_text += (
                f"User: {message['content']}\n"
            )

        else:

            history_text += (
                f"Assistant: {message['content']}\n"
            )
    prompt = f"""
You are an AI Study Assistant.

You MUST answer ONLY from the provided study material.

Conversation History:

{history_text}

Study Material:

{context_text}

Current Question:

{question}

{answer_style}

IMPORTANT RULES

1. NEVER use outside knowledge.

2. NEVER guess.

3. If the study material does not contain the answer, reply EXACTLY:

Information not found in study material.

4. Use the conversation history only to understand references like:
   - it
   - they
   - this concept
   - previous topic

5. NEVER answer from conversation history alone.

6. Always use the study material as the source of truth.

7. Give only the final answer.

"""
    from llm_client import get_chat_completion
    answer = get_chat_completion(prompt, temperature=settings.get("temperature", 0.0), max_tokens=settings.get("max_tokens", 500))
    return answer


def generate_answer_stream(
    question,
    contexts,
    history=None,
    marks=5,
    model="qwen3:1.7b"
):
    from settings_manager import load_settings
    settings = load_settings()
    context_text = "\n\n".join(contexts)

    points_instruction = "Use bullet points ONLY if explicitly requested in the question. Otherwise, answer in paragraphs."
    if "point" in question.lower() or "bullet" in question.lower():
        points_instruction = "Use bullet points as requested."

    if marks <= 2:
        answer_style = f"This is a {marks}-mark question.\nInstructions:\n- Answer in 30-50 words (2 to 3 lines).\n- {points_instruction}\n- Give a precise and direct answer."
    elif marks == 3:
        answer_style = f"This is a 3-mark question.\nInstructions:\n- Answer in 60-90 words.\n- {points_instruction}\n- Provide a clear explanation with key details."
    elif marks <= 5:
        answer_style = f"This is a {marks}-mark question.\nInstructions:\n- Answer in 150-200 words.\n- {points_instruction}\n- Provide a comprehensive explanation."
    else:
        answer_style = f"This is a {marks}-mark question.\nInstructions:\n- Answer in 400-600 words.\n- {points_instruction}\n- Structure with an introduction, detailed explanation, and a brief conclusion if appropriate."

    if history is None:
        history = []

    history_text = ""
    for message in history:
        if message["role"] == "user":
            history_text += f"User: {message['content']}\n"
        else:
            history_text += f"Assistant: {message['content']}\n"
            
    prompt = f"""You are an AI Study Assistant.
You MUST answer ONLY from the provided study material.

Conversation History:
{history_text}

Study Material:
{context_text}

Current Question:
{question}

{answer_style}

IMPORTANT RULES
1. NEVER use outside knowledge.
2. NEVER guess.
3. If the study material does not contain the answer, reply EXACTLY:
Information not found in study material.
4. Always use the study material as the source of truth.
5. Give only the final answer."""

    from llm_client import get_chat_completion_stream
    stream = get_chat_completion_stream(prompt, temperature=settings.get("temperature", 0.0), max_tokens=settings.get("max_tokens", 500))
    for chunk in stream:
        if chunk:
            yield chunk


def generate_followup_questions(answer, model="qwen3:1.7b"):
    if len(answer) < 20 or "Information not found" in answer:
        return []
        
    prompt = f"""Based on the following answer, suggest 3 short, relevant follow-up questions the user might want to ask next to learn more.
Return ONLY the 3 questions, each on a new line, starting with a dash (-).

Answer:
{answer}"""

    try:
        from llm_client import get_chat_completion
        content = get_chat_completion(prompt, temperature=0.5, max_tokens=150)
        lines = [line.strip().lstrip('-').strip() for line in content.split('\n') if line.strip()]
        return lines[:3]
    except Exception:
        return []