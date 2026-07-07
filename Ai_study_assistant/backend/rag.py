import ollama


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
- Answer in 50-60 words.
- {points_instruction}
- Give a precise and direct answer.
"""
        num_predict = 100

    elif marks == 3:
        answer_style = f"""
This is a 3-mark question.

Instructions:
- Answer in approximately 100 words.
- {points_instruction}
- Provide a clear explanation with key details.
"""
        num_predict = 150

    elif marks <= 5:
        answer_style = f"""
This is a {marks}-mark question.

Instructions:
- Answer in 130-140 words.
- {points_instruction}
- Provide a comprehensive explanation.
"""
        num_predict = 200

    elif marks <= 8:
        answer_style = f"""
This is a {marks}-mark question.

Instructions:
- Answer in approximately 180 words.
- {points_instruction}
- Structure with a clear introduction and detailed explanation.
"""
        num_predict = 300

    else:
        answer_style = f"""
This is a {marks}-mark question.

Instructions:
- Answer in 200-210 words.
- {points_instruction}
- Structure with an introduction, detailed explanation, and a brief conclusion if appropriate.
"""
        num_predict = 350

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
    response = ollama.chat(

        model=model,

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        options={
            "temperature": settings.get("temperature", 0.0),
            "num_predict": settings.get("max_tokens", 500)
        },

        think=False

    )

    answer = response.message.content.strip()

    answer = answer.replace(
        "</think>",
        ""
    )

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
        answer_style = f"This is a {marks}-mark question.\nInstructions:\n- Answer in 50-60 words.\n- {points_instruction}\n- Give a precise and direct answer."
    elif marks == 3:
        answer_style = f"This is a 3-mark question.\nInstructions:\n- Answer in approximately 100 words.\n- {points_instruction}\n- Provide a clear explanation with key details."
    elif marks <= 5:
        answer_style = f"This is a {marks}-mark question.\nInstructions:\n- Answer in 130-140 words.\n- {points_instruction}\n- Provide a comprehensive explanation."
    elif marks <= 8:
        answer_style = f"This is a {marks}-mark question.\nInstructions:\n- Answer in approximately 180 words.\n- {points_instruction}\n- Structure with a clear introduction and detailed explanation."
    else:
        answer_style = f"This is a {marks}-mark question.\nInstructions:\n- Answer in 200-210 words.\n- {points_instruction}\n- Structure with an introduction, detailed explanation, and a brief conclusion if appropriate."

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

    response = ollama.chat(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        options={
            "temperature": settings.get("temperature", 0.0),
            "num_predict": settings.get("max_tokens", 500)
        },
        think=False,
        stream=True
    )

    for chunk in response:
        content = chunk.get('message', {}).get('content', '')
        if content:
            content = content.replace("</think>", "")
            if content:
                yield content


def generate_followup_questions(answer, model="qwen3:1.7b"):
    if len(answer) < 20 or "Information not found" in answer:
        return []
        
    prompt = f"""Based on the following answer, suggest 3 short, relevant follow-up questions the user might want to ask next to learn more.
Return ONLY the 3 questions, each on a new line, starting with a dash (-).

Answer:
{answer}"""

    try:
        response = ollama.chat(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            think=False,
            options={"temperature": 0.5, "num_predict": 100}
        )
        content = response.message.content.strip().replace("</think>", "")
        lines = [line.strip().lstrip('-').strip() for line in content.split('\n') if line.strip()]
        return lines[:3]
    except Exception:
        return []