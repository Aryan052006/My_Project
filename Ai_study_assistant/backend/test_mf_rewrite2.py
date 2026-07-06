from query_rewriter import rewrite_question
import ollama

history = [
    {"role": "user", "content": "What are mutual funds"},
    {"role": "assistant", "content": "- Mutual funds are trusts that pool money from multiple investors..."}
]
question = "Explain advantages for same"

history_text = ""
for message in history[-2:]:
    role = "User" if message["role"] == "user" else "Assistant"
    history_text += f"{role}: {message['content']}\n"

prompt = f"""Rewrite the following question into a standalone query. If the question uses vague words like 'it', 'they', 'this', 'that', 'same', or 'this topic', replace them with the main subject from the Conversation History.

Conversation History:
{history_text}

Original Question: {question}

Rewritten Question (only the question):"""

response = ollama.chat(
    model="qwen3:1.7b",
    messages=[{"role": "user", "content": prompt}],
    options={"temperature": 0.0}
)
print("PROMPT 1:", response.message.content)

prompt2 = f"""You must rewrite the Original Question to include the specific topic from the Conversation History.
Replace any vague references ("same", "it", "this topic", "those") with the exact noun.

Conversation History:
{history_text}

Original Question: {question}

Rewritten Question:"""

response2 = ollama.chat(
    model="qwen3:1.7b",
    messages=[{"role": "user", "content": prompt2}],
    options={"temperature": 0.0}
)
print("PROMPT 2:", response2.message.content)

prompt3 = f"""Context:
{history_text}

Question: {question}

Rewrite the Question so it can be asked independently, replacing words like "same" or "it" with the topic from the Context.
Rewritten:"""

response3 = ollama.chat(
    model="qwen3:1.7b",
    messages=[{"role": "user", "content": prompt3}],
    options={"temperature": 0.0}
)
print("PROMPT 3:", response3.message.content)

