from pdf_utils import extract_text_from_pdf
from question_extractor import extract_questions
from answer_generator import answer_question
from chunking import create_chunks
from embeddings import get_embedding
from document_store import add_chunks
from answer_sheet_generator import save_answers
from pdf_generator import generate_pdf
from question_parser import extract_marks

print("Loading Study Material...")

# Load study material
study_text = extract_text_from_pdf(
    "updated OS_Module-I_DDR (1)_compressed.pdf"
)

# Create chunks
study_chunks = create_chunks(
    study_text,
    source="updated OS_Module-I_DDR (1)_compressed.pdf"
)

# Generate embeddings
for chunk in study_chunks:
    chunk["embedding"] = get_embedding(
        chunk["text"]
    )

# Store chunks
add_chunks(study_chunks)

print(
    f"Loaded {len(study_chunks)} chunks."
)

# Load question paper
text = extract_text_from_pdf(
    "question_bank_marks_test.pdf"
)

print(text[:1000])

# Extract questions
questions = extract_questions(text)

print(
    "Questions Found:",
    len(questions)
)

print(
    questions[:3]
)

answers = []

# Generate answers
for i, question in enumerate(
    questions[:3],
    start=1
):

    print("\n" + "=" * 70)

    print(
        f"QUESTION {i}"
    )
    
    print(question)

    print(
        "\nANSWER:"
    )

    marks = extract_marks(
        question
    )

    print(
        f"Detected Marks: {marks}"
    )

    answer = answer_question(
        question,
        marks
    )

    # Debugging (optional)
    # print("\nANSWER LENGTH:", len(answer))
    # print("RAW ANSWER:")
    # print(repr(answer))

    answers.append(
        answer
    )

    print(answer)

# Save answers to text/document
save_answers(
    questions[:3],
    answers
)

# Generate PDF
generate_pdf(
    questions[:3],
    answers
)

print("\nDone!")