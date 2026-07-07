import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not set in .env")

client = Groq(api_key=GROQ_API_KEY)

DEFAULT_MODEL = "llama-3.1-8b-instant" 

def get_chat_completion(prompt, temperature=0.3, max_tokens=1024):
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=DEFAULT_MODEL,
        temperature=temperature,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content

def get_chat_completion_stream(prompt, temperature=0.3, max_tokens=1024):
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=DEFAULT_MODEL,
        temperature=temperature,
        max_tokens=max_tokens,
        stream=True
    )
    for chunk in response:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
