import re


def create_chunks(
    text,
    source
):
    from settings_manager import load_settings
    settings = load_settings()
    chunk_size = settings.get("chunk_size", 900)
    overlap = settings.get("chunk_overlap", 150)

    text = re.sub(r"\r", "", text)
    lines = text.split("\n")
    
    chunks = []
    chunk_id = 0
    current_heading = "General"
    current_chunk_text = ""
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Heuristic for heading: short line, no ending punctuation, not just a number
        is_heading = False
        if len(line) < 80 and not line.endswith((".", "?", "!", ",", ":", ";")) and not line.isdigit():
            # If it's mostly uppercase or title case, strong indicator of heading
            if line.isupper() or line.istitle():
                is_heading = True
            # Or if it starts with Chapter, Unit, Module, etc.
            elif re.match(r"^(chapter|unit|module|section|part)\s+\d+", line, re.IGNORECASE):
                is_heading = True
                
        if is_heading:
            # If we already have accumulated text, save it as a chunk before starting new section
            if current_chunk_text and len(current_chunk_text) > 50:
                chunks.append({
                    "id": chunk_id,
                    "chunk_number": chunk_id,
                    "source": source,
                    "text": f"[{current_heading}] {current_chunk_text}"
                })
                chunk_id += 1
                current_chunk_text = ""
            current_heading = line
            continue
            
        # Append line to current chunk
        if current_chunk_text:
            current_chunk_text += " " + line
        else:
            current_chunk_text = line
            
        # If current chunk exceeds chunk_size, split it and keep some overlap
        if len(current_chunk_text) >= chunk_size:
            chunks.append({
                "id": chunk_id,
                "chunk_number": chunk_id,
                "source": source,
                "text": f"[{current_heading}] {current_chunk_text}"
            })
            chunk_id += 1
            # Keep overlap: take the last `overlap` characters, but don't split words
            overlap_text = current_chunk_text[-overlap:]
            space_idx = overlap_text.find(" ")
            if space_idx != -1:
                overlap_text = overlap_text[space_idx+1:]
            current_chunk_text = overlap_text

    # Add the last chunk
    if current_chunk_text and len(current_chunk_text.strip()) > 10:
        chunks.append({
            "id": chunk_id,
            "chunk_number": chunk_id,
            "source": source,
            "text": f"[{current_heading}] {current_chunk_text}"
        })
        chunk_id += 1

    return chunks