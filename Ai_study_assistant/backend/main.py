from pydantic import BaseModel
import ollama
from fastapi import FastAPI, UploadFile, File
import os
import time
from pdf_utils import extract_text_from_pdf
from document_store import (
    add_chunks,
    clear_store,
    total_chunks
)
from document_stats import get_document_stats
from chunking import create_chunks
from embeddings import get_embedding
from document_store import get_chunks
from semantic_search import find_top_k_chunks
from rag import generate_answer


app = FastAPI()

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class ChatRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "AI Study Assistant Backend Running"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    try:

        start_time = time.time()

        chunks = get_chunks()

        if len(chunks) == 0:

            return {
                "success": False,
                "message": "No PDF uploaded."
            }

        retrieval_start = time.time()

        results = find_top_k_chunks(
            request.question,
            chunks,
            k=2
        )

        retrieval_end = time.time()

        if len(results) == 0:

            return {
                "success": True,
                "answer": "Information not found in study material."
            }

        # Contexts for RAG
        contexts = [
            result["chunk"]["text"]
            for result in results
        ]

        # Sources for citations
        sources = []

        for result in results:

            sources.append(
            {
                "pdf": result["chunk"]["source"],
                "chunk_id": result["chunk"]["id"],
                "score": round(result["score"], 4),
                "preview":
                result["chunk"]["text"][:150]
            }
        )
            
        generation_start = time.time()

        answer = generate_answer(
            request.question,
            contexts
        )

        generation_end = time.time()

        print("\n========== PERFORMANCE ==========")

        print(
            f"Retrieval Time: "
            f"{retrieval_end - retrieval_start:.2f} sec"
        )

        print(
            f"Generation Time: "
            f"{generation_end - generation_start:.2f} sec"
        )

        print(
            f"Total Time: "
            f"{generation_end - start_time:.2f} sec"
        )

        print("=================================\n")

        return {
            "success": True,
            "answer": answer,
            "sources": sources
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }
    
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    try:

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(file_path, "wb") as f:

            content = await file.read()

            f.write(content)

        text = extract_text_from_pdf(
            file_path
        )

        chunks = create_chunks(
            text,
            source=file.filename
        )

        for chunk in chunks:

            chunk["embedding"] = get_embedding(
                chunk["text"]
            )

        # clear_store()

        add_chunks(chunks)

        return {
        "success": True,
        "filename": file.filename,
        "new_chunks": len(chunks),
        "total_chunks": total_chunks()
    }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }
    
@app.get("/documents")
def documents():

    stats = get_document_stats()

    return {
        "total_documents": len(stats),
        "documents": stats
    }