import ollama


def rewrite_question(question, history):

    if not history:

        return [question]

    history_text = ""

    # Only use the last 6 messages
    recent_history = history[-6:]

    for message in recent_history:

        role = (
            "User"
            if message["role"] == "user"
            else "Assistant"
        )

        history_text += (
            f"{role}: {message['content']}\n"
        )

    prompt = f"""Rewrite the following question into a standalone query. If the question uses vague words like 'it', 'they', 'this', 'that', 'same', or 'this topic', replace them with the main subject from the Conversation History.
Then, generate 2 alternative variations of the rewritten question using synonyms or different phrasing to improve search recall.

Conversation History:
{history_text}

Original Question: {question}

Return exactly 3 lines, one for each variation (the rewritten query + 2 alternatives), with no numbers, bullets, or extra text."""

    response = ollama.chat(

        model="qwen3:1.7b",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        think=False,

        options={
            "temperature": 0.2
        }

    )

    rewritten = response.message.content.strip()

    rewritten = rewritten.replace(
        "</think>",
        ""
    )

    lines = [line.strip() for line in rewritten.split('\n') if line.strip()]
    
    if not lines:
        return [question]

    return lines[:3]