from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import crud
from dependencies import get_db
from schemas import APIResponse, BookCreate, BookUpdate, BookResponse
from services.search_service import SearchService

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=APIResponse)
def list_books(
    category: Optional[str] = Query(None),
    availability: Optional[str] = Query(None, pattern="^(available|borrowed)$"),
    db: Session = Depends(get_db),
) -> APIResponse:
    books = crud.get_books(db, category=category, availability=availability)
    return APIResponse(
        data=[BookResponse.model_validate(b).model_dump() for b in books],
        message=f"Retrieved {len(books)} book(s)",
    )


@router.get("/{book_id}", response_model=APIResponse)
def get_book(book_id: int, db: Session = Depends(get_db)) -> APIResponse:
    book = crud.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return APIResponse(
        data=BookResponse.model_validate(book).model_dump(),
        message="Book retrieved",
    )


@router.post("", response_model=APIResponse, status_code=201)
def create_book(book_data: BookCreate, db: Session = Depends(get_db)) -> APIResponse:
    existing = crud.get_book_by_isbn(db, book_data.isbn)
    if existing:
        raise HTTPException(status_code=409, detail="A book with this ISBN already exists")

    book = crud.create_book(db, book_data)

    # Phase 2: index_book will embed description+tags and upsert into vector store
    search_service = SearchService(db)
    search_service.index_book(book)

    return APIResponse(
        data=BookResponse.model_validate(book).model_dump(),
        message="Book created successfully",
    )


@router.put("/{book_id}", response_model=APIResponse)
def update_book(
    book_id: int, updates: BookUpdate, db: Session = Depends(get_db)
) -> APIResponse:
    book = crud.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if updates.isbn and updates.isbn != book.isbn:
        existing = crud.get_book_by_isbn(db, updates.isbn)
        if existing:
            raise HTTPException(status_code=409, detail="A book with this ISBN already exists")

    book = crud.update_book(db, book, updates)
    return APIResponse(
        data=BookResponse.model_validate(book).model_dump(),
        message="Book updated successfully",
    )


@router.delete("/{book_id}", response_model=APIResponse)
def delete_book(book_id: int, db: Session = Depends(get_db)) -> APIResponse:
    book = crud.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if crud.is_book_currently_borrowed(db, book_id):
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a book that is currently borrowed",
        )

    crud.delete_book(db, book)
    return APIResponse(data=None, message="Book deleted successfully")
