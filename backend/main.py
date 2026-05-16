import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import init_db
from routers import books, borrowers, transactions, search

load_dotenv()

CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]

app = FastAPI(
    title="Library Management System",
    version="1.0.0",
    description="Phase 1 LMS API — RAG-ready architecture for Phase 2 semantic search.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(books.router, prefix=API_PREFIX)
app.include_router(borrowers.router, prefix=API_PREFIX)
app.include_router(transactions.router, prefix=API_PREFIX)
app.include_router(search.router, prefix=API_PREFIX)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get(f"{API_PREFIX}/health", tags=["health"])
def health_check() -> dict:
    """
    Returns current API phase and feature flags.
    In Phase 2, flip semantic_search_enabled to true once the vector store is connected.
    """
    return {
        "data": {
            "status": "ok",
            "phase": "1",
            "rag_ready": True,
            "semantic_search_enabled": False,
        },
        "message": "Service is healthy",
        "status": "success",
    }
