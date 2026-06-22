import ollama

print("Starting...")

response = ollama.chat(
    model="qwen3:8b",
    messages=[
        {
            "role": "user",
            "content": "Hello"
        }
    ]
)

print("Response received!")
print(response)