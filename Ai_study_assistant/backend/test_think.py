import ollama

response = ollama.chat(
    model="qwen3:1.7b",
    messages=[
        {
            "role": "user",
            "content": "What is an Operating System?"
        }
    ],
    think=False
)

print(response)