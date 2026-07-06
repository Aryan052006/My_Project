import ollama


def rewrite_question(question, history):

    if not history:

        return question

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

Conversation History:
{history_text}

Original Question: {question}

Rewritten Question (only the question):"""

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
            "temperature": 0
        }

    )

    rewritten = response.message.content.strip()

    rewritten = rewritten.replace(
        "</think>",
        ""
    )

    if rewritten == "":

        return question

    return rewritten