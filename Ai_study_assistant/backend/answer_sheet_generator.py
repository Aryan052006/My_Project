def save_answers(
    questions,
    answers,
    filename="generated_answers.txt"
):

    with open(
        filename,
        "w",
        encoding="utf-8"
    ) as f:

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

            f.write(
                f"QUESTION {i}\n"
            )

            f.write(
                question
            )

            f.write(
                "\n\nANSWER\n"
            )

            f.write(
                answer
            )

            f.write(
                "\n\n"
            )

            f.write(
                "=" * 70
            )

            f.write(
                "\n\n"
            )

    print(
        f"Saved to {filename}"
    )