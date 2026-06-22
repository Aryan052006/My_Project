import re


def extract_questions(text):

    pattern = r'(?:Q\d+\.?|[0-9]+\.)\s*(.*?)(?=(?:Q\d+\.?|[0-9]+\.)|$)'

    matches = re.findall(
        pattern,
        text,
        re.DOTALL
    )

    questions = []

    for match in matches:

        question = match.strip()

        if len(question) > 5:

            questions.append(question)

    return questions