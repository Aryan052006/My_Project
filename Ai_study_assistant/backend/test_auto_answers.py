from pdf_utils import extract_text_from_pdf
from question_extractor import extract_questions
from answer_generator import answer_question
from pdf_utils import extract_text_from_pdf
from chunking import create_chunks
from embeddings import get_embedding
from document_store import add_chunks
from answer_sheet_generator import save_answers
from pdf_generator import generate_pdf

print("Loading Study Material...")

study_text = extract_text_from_pdf(
    "updated OS_Module-I_DDR (1)_compressed.pdf"
)

study_chunks = create_chunks(
    study_text,
    source="updated OS_Module-I_DDR (1)_compressed.pdf"
)

for chunk in study_chunks:

    chunk["embedding"] = get_embedding(
        chunk["text"]
    )

add_chunks(study_chunks)

print(
    f"Loaded {len(study_chunks)} chunks."
)

text = extract_text_from_pdf(
    "questionss.pdf"
)
print(text[:1000])
questions = extract_questions(text)
print("Questions Found:", len(questions))
print(questions[:3])

answers = []
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

    answer = answer_question(
    question
)
    # print("\nANSWER LENGTH:", len(answer))
    # print("RAW ANSWER:")
    # print(repr(answer))

    answers.append(
    answer
)

    print(answer)
    

save_answers(
    questions[:3],
    answers
)

generate_pdf(
    questions[:3],
    answers
)