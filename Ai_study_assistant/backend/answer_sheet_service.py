from pdf_utils import extract_text_from_pdf
from question_extractor import extract_questions
from answer_generator import answer_question
from pdf_generator import generate_pdf
from question_parser import extract_marks


def generate_answer_sheet(
    question_bank_path
):

    text = extract_text_from_pdf(
        question_bank_path
    )

    questions = extract_questions(
        text
    )

    answers = []

    for question in questions:

        marks = extract_marks(
            question
        )

        answer = answer_question(
            question,
            marks
        )

        answers.append(
            answer
        )

    generate_pdf(
        questions,
        answers,
        filename="generated_answers.pdf"
    )

    marks = extract_marks(question)

    print(
        f"Question: {question}"
    )
    print(
        f"Marks: {marks}"
    )
    return len(
        questions
    )

