from pdf_utils import extract_text_from_pdf
from question_extractor import extract_questions


text = extract_text_from_pdf(
    "question.pdf"
)

questions = extract_questions(
    text
)

print(
    f"Questions Found: {len(questions)}"
)

for i, q in enumerate(
    questions[:10],
    start=1
):

    print(f"\nQ{i}:")
    print(q)