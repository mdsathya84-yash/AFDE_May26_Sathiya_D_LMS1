"""
Search abstraction layer for the Library Management System.

Phase 1: SQL ILIKE keyword search across title, author, category, and tags.
Phase 2: Replace semantic_search() body with a vector store query
         (ChromaDB, Pinecone, or Vertex AI Vector Search).
         keyword_search() remains unchanged and can run in parallel
         as a hybrid retrieval strategy.
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Book


class SearchService:
    """
    Abstraction layer for book search.

    Phase 1 : SQL ILIKE keyword search across title, author,
              category, and tags columns.
    Phase 2 : Replace semantic_search() body with a vector
              store query (ChromaDB, Pinecone, or Vertex AI
              Vector Search). keyword_search() remains
              unchanged and can run in parallel as a hybrid
              retrieval strategy.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def keyword_search(
        self,
        q: str,
        category: str | None = None,
        author: str | None = None,
    ) -> list[Book]:
        """
        SQL-based search using ILIKE across title, author, category, and tags.
        Applies optional category and author filters.
        Returns matching Book ORM objects ordered by title.
        """
        query = self.db.query(Book)

        if q:
            pattern = f"%{q}%"
            query = query.filter(
                or_(
                    Book.title.ilike(pattern),
                    Book.author.ilike(pattern),
                    Book.category.ilike(pattern),
                    Book.tags.ilike(pattern),
                )
            )

        if category:
            query = query.filter(Book.category.ilike(f"%{category}%"))

        if author:
            query = query.filter(Book.author.ilike(f"%{author}%"))

        return query.order_by(Book.title).all()

    def semantic_search(
        self,
        q: str,
        top_k: int = 10,
    ) -> list[Book]:
        """
        Phase 2 hook: embed q using the configured embedding model, query the
        vector store, resolve document IDs back to Book objects via
        embedding_id, and return the top_k results ranked by cosine similarity.

        Phase 1 behaviour: raises NotImplementedError.

        Phase 2 implementation outline:
          1. Load embedding model from EMBEDDING_MODEL env var
          2. Embed q → query_vector
          3. Query vector store at VECTOR_STORE_URL
          4. Map returned doc IDs to Book.embedding_id
          5. Fetch and return Book objects from DB
        """
        raise NotImplementedError(
            "Semantic search is a Phase 2 feature. "
            "Set VECTOR_STORE_URL and EMBEDDING_MODEL in .env "
            "and implement this method."
        )

    def index_book(self, book: Book) -> None:
        """
        Phase 2 hook: generate an embedding from book.description and
        book.tags, upsert it into the vector store, and write the returned
        document ID back to book.embedding_id.

        Phase 1 behaviour: no-op (pass). The call already exists in
        POST /books so Phase 2 requires no changes to the router layer.

        Phase 2 implementation outline:
          1. Concatenate book.title + book.description + book.tags
          2. Embed using the configured embedding model
          3. Upsert into vector store with book_id as metadata
          4. Store returned doc ID in book.embedding_id
          5. Commit the embedding_id update to the DB
        """
        pass  # Phase 2: implement embedding and vector store upsert
