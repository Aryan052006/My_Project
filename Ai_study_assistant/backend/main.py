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
    total_chunks,
    get_document_stats,
    document_exists,
    delete_document
)
from chunking import create_chunks
from embeddings import get_embedding
from semantic_search import find_top_k_chunks
from rag import generate_answer
from answer_sheet_service import generate_answer_sheet
from chat_memory import (
    add_message,
    get_history,
    clear_history
)
from query_rewriter import rewrite_question

app = FastAPI()

# Retrieval Configuration
TOP_K = 5

# Minimum similarity threshold
MIN_SIMILARITY = 0.45

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
    session_id: str = "default"


@app.get("/")
def home():
    return {
        "message": "AI Study Assistant Backend Running"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    try:

        start_time = time.time()

        session_id = request.session_id

        if total_chunks() == 0:

            return {
                "success": False,
                "message": "No PDF uploaded."
            }

        # =============================
        # Conversation History
        # =============================

        history = get_history(session_id)

        rewritten_question = rewrite_question(
            request.question,
            history
        )

        print("\n==============================")
        print("Original Question:")
        print(request.question)

        print("\nRewritten Question:")
        print(rewritten_question)
        print("==============================")

        # Save current user message AFTER rewriting
        add_message(
            session_id,
            "user",
            request.question
        )

        # =============================
        # Retrieval
        # =============================

        retrieval_start = time.time()

        results = find_top_k_chunks(
            rewritten_question,
            k=TOP_K
        )

        retrieval_end = time.time()

        print("\nRetrieved using:")
        print(rewritten_question)

        if len(results) == 0:

            return {
                "success": True,
                "answer": "Information not found in study material.",
                "sources": []
            }

        print(
            f"\nBest Similarity: {results[0]['score']:.4f}"
        )

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

        # =============================
        # Build Context
        # =============================

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

        # Get updated history (includes current user message)
        history = get_history(session_id)

        # =============================
        # Generate Answer
        # =============================

        generation_start = time.time()

        answer = generate_answer(
            question=request.question,
            contexts=contexts,
            history=history
        )

        generation_end = time.time()

        # Save assistant reply
        add_message(
            session_id,
            "assistant",
            answer
        )

        # =============================
        # Logs
        # =============================

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

    print("========== UPLOAD START ==========")

    try:

        print("1")

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        print("2")

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        print("3")

        text = extract_text_from_pdf(file_path)

        print("4")

        chunks = create_chunks(
            text,
            source=file.filename
        )

        print(f"Chunks created: {len(chunks)}")

        print("5")

        for chunk in chunks:
            chunk["embedding"] = get_embedding(
                chunk["text"]
            )

        print("6")

        add_chunks(chunks)

        print("7")

        response = {
            "success": True,
            "filename": file.filename,
            "new_chunks": len(chunks),
            "total_chunks": total_chunks()
        }

        print(response)
        print("========== UPLOAD END ==========")

        return response

    except Exception as e:

        import traceback
        traceback.print_exc()

        return {
            "success": False,
            "error": str(e)
        }

@app.get("/documents")
def documents():

    stats = get_document_stats()

    documents = []

    for name, chunks in stats.items():

        documents.append(
            {
                "name": name,
                "chunks": chunks
            }
        )

    return {

        "success": True,

        "total_documents": len(documents),

        "documents": documents

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

@app.delete(
    "/documents/{filename}"
)
def remove_document(
    filename: str
):

    deleted = delete_document(
        filename
    )

    if not deleted:

        return {
            "success": False,
            "message": "Document not found."
        }

    return {
        "success": True,
        "deleted": filename
    }

@app.post("/clear-chat")
def clear_chat(session_id: str = "default"):

    clear_history(
        session_id
    )

    return {
        "success": True,
        "message": "Chat cleared."
    }

@app.get("/sessions")
def get_sessions():
    from chat_memory import get_all_sessions
    return {"sessions": get_all_sessions()}

@app.get("/chat/history")
def get_chat_history(session_id: str = "default"):
    from chat_memory import get_all_history
    return {"history": get_all_history(session_id)}