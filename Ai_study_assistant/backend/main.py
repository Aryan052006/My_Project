from pydantic import BaseModel
import ollama
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import time

from pdf_utils import extract_text_from_pdf
from vector_store import (
    add_chunks,
    total_chunks
)
from document_stats import get_document_stats
from chunking import create_chunks
from embeddings import get_embedding
from semantic_search import find_top_k_chunks
from rag import generate_answer
from answer_sheet_service import generate_answer_sheet

app = FastAPI()

# Retrieval Configuration
TOP_K = 5

# Minimum similarity threshold
MIN_SIMILARITY = 0.65

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

        if total_chunks() == 0:

            return {
                "success": False,
                "message": "No PDF uploaded."
            }

        retrieval_start = time.time()

        results = find_top_k_chunks(
            request.question,
            k=TOP_K
        )

        retrieval_end = time.time()

        if len(results) == 0:

            return {
                "success": True,
                "answer": "Information not found in study material.",
                "sources": []
            }

        print(
            f"\nBest Similarity: {results[0]['score']:.4f}"
        )

        # Keep only relevant chunks
        filtered_results = [

            result

            for result in results

            if result["score"] >= MIN_SIMILARITY

        ]

        if len(filtered_results) == 0:

            return {
                "success": True,
                "answer": "Information not found in study material.",
                "sources": []
            }

        contexts = [

            result["chunk"]["text"]

            for result in filtered_results

        ]

        sources = [

            {

                "pdf":
                result["chunk"]["source"],

                "chunk_id":
                result["chunk"]["id"],

                "similarity":
                round(
                    result["score"],
                    4
                ),

                "distance":
                round(
                    result["distance"],
                    4
                ),

                "preview":
                result["chunk"]["text"][:150]

            }

            for result in filtered_results

        ]

        generation_start = time.time()

        answer = generate_answer(
            request.question,
            contexts
        )

        generation_end = time.time()

        print("\n========== PERFORMANCE ==========")

        print(
            f"Retrieval Time: {retrieval_end - retrieval_start:.2f} sec"
        )

        print(
            f"Generation Time: {generation_end - generation_start:.2f} sec"
        )

        print(
            f"Total Time: {generation_end - start_time:.2f} sec"
        )

        print("\nRetrieved Chunks")

        for result in filtered_results:

            print("=" * 60)

            print(
                "Similarity:",
                round(result["score"], 4)
            )

            print(
                "Distance:",
                round(result["distance"], 4)
            )

            print(
                "Source:",
                result["chunk"]["source"]
            )

            print(
                result["chunk"]["text"][:200]
            )

        print("=================================\n")

        return {

            "success": True,

            "answer": answer,

            "sources": sources

        }

    except Exception as e:

        import traceback

        traceback.print_exc()

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


@app.post("/generate-answer-sheet")
async def generate_sheet(
    file: UploadFile = File(...)
):

    try:

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        total_questions = generate_answer_sheet(
            file_path
        )

        return {
            "success": True,
            "questions_found": total_questions,
            "pdf": "generated_answers.pdf"
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


@app.get("/download-answer-sheet")
def download_answer_sheet():

    pdf_path = "generated_answers.pdf"

    return FileResponse(
        path=pdf_path,
        filename="generated_answers.pdf",
        media_type="application/pdf"
    )