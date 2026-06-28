import ollama


def generate_answer(
    question,
    contexts,
    marks=5
):

    context_text = "\n\n".join(contexts)

    if marks <= 2:

        answer_style = """
This is a 2-mark university question.

Instructions:
- Answer in 2-3 sentences.
- Maximum 40 words.
- No bullet points.
- Give only a precise definition.
"""

        num_predict = 60

    elif marks <= 5:

        answer_style = """
This is a 5-mark university question.

Instructions:
- Answer in exactly 5 bullet points.
- Maximum 120 words.
- Be concise.
"""

        num_predict = 150

    elif marks <= 10:

        answer_style = """
This is a 10-mark university question.

Structure:

Introduction

Detailed Explanation

Advantages / Features

Conclusion

Minimum 200 words.
"""

        num_predict = 350

    else:

        answer_style = """
This is a 15-mark university question.

Structure:

Introduction

Detailed Explanation

Advantages

Disadvantages

Applications

Conclusion

Minimum 350 words.
"""

        num_predict = 600

    prompt = f"""
You are an AI Study Assistant.

You MUST answer ONLY from the study material.

IMPORTANT RULES

1. NEVER use your own knowledge.

2. NEVER guess.

3. NEVER complete missing information.

4. If the study material does not contain enough information to answer the question, reply EXACTLY with:

Information not found in study material.

5. Do not mention the study material.

6. Do not say "According to the context".

7. Give only the final answer.

{answer_style}

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

            "num_predict": num_predict

        },

        think=False

    )

    answer = response.message.content.strip()

    answer = answer.replace(
        "</think>",
        ""
    )

    return answer