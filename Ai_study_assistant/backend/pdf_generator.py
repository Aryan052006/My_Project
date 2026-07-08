import re
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def generate_pdf(
    questions,
    answers,
    filename="generated_answers.pdf"
):
    pdf = SimpleDocTemplate(filename)
    styles = getSampleStyleSheet()
    content = []

    for i, (question, answer) in enumerate(zip(questions, answers), start=1):
        content.append(Paragraph(f"<b>Question {i}</b>", styles["Heading2"]))
        content.append(Paragraph(question, styles["BodyText"]))
        content.append(Spacer(1, 10))
        content.append(Paragraph("<b>Answer</b>", styles["Heading3"]))
        
        # Parse Answer Markdown blocks
        blocks = answer.split('\n\n')
        for block in blocks:
            block = block.strip()
            if not block:
                continue
                
            # Detect Markdown Table
            if '|' in block and '-|-' in block.replace(' ', ''):
                lines = block.split('\n')
                table_data = []
                for line in lines:
                    line = line.strip()
                    cells = [c.strip() for c in line.split('|')]
                    if line.startswith('|'): cells = cells[1:]
                    if line.endswith('|'): cells = cells[:-1]
                    
                    if not cells: continue
                    
                    # Skip separator row (e.g. |---|---|)
                    if all(all(char in '-: ' for char in c) for c in cells if c):
                        continue
                        
                    # Parse bold in cells
                    parsed_cells = []
                    for c in cells:
                        c = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', c)
                        parsed_cells.append(Paragraph(c, styles["BodyText"]))
                    table_data.append(parsed_cells)
                    
                if table_data:
                    # Fix column widths to match page
                    t = Table(table_data)
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
                        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0,0), (-1,0), 10),
                        ('TOPPADDING', (0,0), (-1,-1), 8),
                        ('BACKGROUND', (0,1), (-1,-1), colors.white),
                        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#94A3B8'))
                    ]))
                    content.append(t)
                    content.append(Spacer(1, 12))
            else:
                # Normal paragraph (convert markdown bold and newlines)
                block = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', block)
                block = block.replace('\n', '<br/>')
                content.append(Paragraph(block, styles["BodyText"]))
                content.append(Spacer(1, 12))
                
        content.append(Spacer(1, 20))

    pdf.build(content)
    print(f"PDF Saved: {filename}")