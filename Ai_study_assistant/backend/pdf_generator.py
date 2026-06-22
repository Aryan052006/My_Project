from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak
)

from reportlab.lib.styles import (
    getSampleStyleSheet
)


def generate_pdf(
    questions,
    answers,
    filename="generated_answers.pdf"
):

    pdf = SimpleDocTemplate(
        filename
    )

    styles = getSampleStyleSheet()

    content = []

    for i, (
        question,
        answer
    ) in enumerate(
        zip(
            questions,
            answers
        ),
        start=1
    ):

        content.append(
            Paragraph(
                f"<b>Question {i}</b>",
                styles["Heading2"]
            )
        )

        content.append(
            Paragraph(
                question,
                styles["BodyText"]
            )
        )

        content.append(
            Spacer(1, 10)
        )

        content.append(
            Paragraph(
                "<b>Answer</b>",
                styles["Heading3"]
            )
        )

        content.append(
            Paragraph(
                answer,
                styles["BodyText"]
            )
        )

        content.append(
            Spacer(1, 20)
        )

    pdf.build(content)

    print(
        f"PDF Saved: {filename}"
    )