import ollama


def generate_answer(
    question,
    contexts
):

    context_text = "\n\n".join(contexts)

    prompt = f"""
    You are an academic assistant.

    Do NOT explain your reasoning.
    Do NOT think step by step.
    Provide only the final answer.

    Answer ONLY using the study material.

    Rules:
    - Answer in 3-5 bullet points.
    - Maximum 60 words.
    - Do not include reasoning.
    - Give only the final answer.

    Study Material:
    {context_text}

    Question:
    {question}
    """

    response = ollama.chat(
    model="qwen3:1.7b",
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ],
    options={
        "temperature": 0,
        "num_predict": 150
    },
    think=False
)

    # print("\nFULL RESPONSE:")
    # print(response)

    # print("\nCONTENT:")
    # print(response.message.content)

    answer = response.message.content

    answer = answer.replace(
        "</think>",
        ""
    )

    # if answer.strip() == "":
    #     print("\nEMPTY RESPONSE DETECTED")
    #     print(response)
    return answer.strip()