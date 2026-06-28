import re

def extract_marks(question):

    patterns = [

        r"\[(\d+)\]",
        r"\[(\d+)\s*Marks?\]",
        r"\((\d+)\s*Marks?\)",
        r"(\d+)\s*M\b",
        r"(\d+)\s*Marks?"
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            question,
            re.IGNORECASE
        )

        if match:

            return int(
                match.group(1)
            )

    return 5