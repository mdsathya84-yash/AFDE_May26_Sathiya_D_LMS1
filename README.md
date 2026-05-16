# Library Management System

A full-stack Library Management System built with React (Vite) and FastAPI. It digitises library operations — managing books, borrowers, and borrow/return transactions — and is architecturally designed to integrate a RAG (Retrieval-Augmented Generation) semantic search layer in Phase 2 without any breaking changes.

## Prerequisites

- Node 18+
- Python 3.11+

## Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

The API will be available at http://localhost:8000. Interactive docs at http://localhost:8000/docs.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:5173.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./library.db` | SQLAlchemy connection string |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed CORS origins |
| `APP_ENV` | `development` | Application environment |
| `VECTOR_STORE_URL` | _(empty)_ | Phase 2: ChromaDB/Pinecone endpoint |
| `EMBEDDING_MODEL` | _(empty)_ | Phase 2: Embedding model name |
| `OPENAI_API_KEY` | _(empty)_ | Phase 2: Required for OpenAI embeddings |
| `VERTEX_AI_PROJECT` | _(empty)_ | Phase 2: GCP project for Vertex AI |
| `VERTEX_AI_LOCATION` | _(empty)_ | Phase 2: GCP region, e.g. `us-central1` |

## API Reference

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | Service health and feature flags |
| GET | `/api/v1/books` | List all books (filter: `?category=&availability=`) |
| GET | `/api/v1/books/{id}` | Get single book by ID |
| POST | `/api/v1/books` | Create a new book |
| PUT | `/api/v1/books/{id}` | Update a book |
| DELETE | `/api/v1/books/{id}` | Delete a book (409 if borrowed) |
| GET | `/api/v1/borrowers` | List all borrowers |
| GET | `/api/v1/borrowers/{id}` | Get borrower + active borrow count |
| POST | `/api/v1/borrowers` | Create a new borrower |
| PUT | `/api/v1/borrowers/{id}` | Update a borrower |
| DELETE | `/api/v1/borrowers/{id}` | Delete borrower (409 if active borrows) |
| POST | `/api/v1/borrow` | Borrow a book |
| POST | `/api/v1/return` | Return a book |
| GET | `/api/v1/transactions` | List transactions (filter: `?status=borrowed\|returned`) |
| GET | `/api/v1/search` | Search books (`?q=&category=&author=`) |

All endpoints return:
```json
{ "data": "...", "message": "...", "status": "success|error" }
```

## Project Structure

```
library-management-system/
├── backend/
│   ├── main.py               # FastAPI app, CORS, router registration
│   ├── database.py           # SQLAlchemy engine, SessionLocal, Base
│   ├── models.py             # ORM models: Book, Borrower, Transaction
│   ├── schemas.py            # Pydantic v2 request/response schemas
│   ├── crud.py               # All DB operations
│   ├── dependencies.py       # get_db dependency
│   ├── routers/
│   │   ├── books.py
│   │   ├── borrowers.py
│   │   ├── transactions.py
│   │   └── search.py
│   ├── services/
│   │   └── search_service.py
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/api.js
    │   ├── hooks/
    │   │   ├── useBooks.js
    │   │   ├── useBorrowers.js
    │   │   └── useTransactions.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── BookCard.jsx
    │   │   ├── BorrowerCard.jsx
    │   │   └── TransactionRow.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Books.jsx
    │   │   ├── Borrowers.jsx
    │   │   ├── BorrowReturn.jsx
    │   │   └── Search.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Phase 2 RAG Upgrade Guide

When you're ready to enable semantic search:

1. **Set environment variables** in `.env`:
   ```
   VECTOR_STORE_URL=<your-chromadb-or-pinecone-endpoint>
   EMBEDDING_MODEL=text-embedding-3-small   # or textembedding-gecko
   OPENAI_API_KEY=<your-key>               # if using OpenAI
   ```

2. **Install Phase 2 dependencies**:
   ```bash
   pip install langchain chromadb openai
   # or for GCP:
   pip install langchain-google-vertexai
   ```

3. **Implement `SearchService`** in `backend/services/search_service.py`:
   - Fill in `semantic_search()`: embed the query, call the vector store, resolve `embedding_id` back to Book rows
   - Fill in `index_book()`: embed `title + description + tags`, upsert into the vector store, save the returned doc ID to `book.embedding_id`

4. **Run the one-time backfill script** (to be created in Phase 2) to embed all existing books and populate `embedding_id` on each row.

5. **Flip the feature flag** in `main.py`:
   ```python
   "semantic_search_enabled": True
   ```
   The `/api/v1/health` endpoint will reflect this change immediately.

6. **Frontend requires no changes** — the Search page already calls the same `/api/v1/search` endpoint. Add the optional semantic toggle described in the comment block at the top of `Search.jsx` if you want a UI switch between keyword and semantic modes.
