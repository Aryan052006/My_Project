import ollama

history_text = "User: What is the difference between primary market vs secondary market?\nAssistant: Primary is new, secondary is trading.\n"
question = "Tell me what is the case study given on this topic."

prompt = f"""Rewrite the following question so it can be understood without the conversation history. Replace words like 'this topic', 'it', 'they' with the actual subject from the conversation history.

Conversation History:
{history_text}

Original Question: {question}

Rewritten Question (only the question, no conversational filler):"""

print("PROMPT:")
print(prompt)

response = ollama.chat(model='qwen3:1.7b', messages=[{'role': 'user', 'content': prompt}], options={'temperature': 0})
print("RESPONSE:")
print(response.message.content)
