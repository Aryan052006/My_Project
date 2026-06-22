import fitz


def extract_text_from_pdf(pdf_path):

    document = fitz.open(pdf_path)

    full_text = ""

    for page in document:
        full_text += page.get_text()

    document.close()

    return full_text