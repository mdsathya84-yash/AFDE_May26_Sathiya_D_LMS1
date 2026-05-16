from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from dependencies import get_db
from schemas import APIResponse, BookResponse
from services.search_service import SearchService

router = APIRouter(tags=["search"])


@router.get("/search", response_model=APIResponse)
def search_books(
    q: str = Query("", description="Full-text search query"),
    category: Optional[str] = Query(None),
    author: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> APIResponse:
    service = SearchService(db)
    # Phase 2: swap for service.semantic_search(q) when VECTOR_STORE_URL is set
    books = service.keyword_search(q=q, category=category, author=author)
    return APIResponse(
        data=[BookResponse.model_validate(b).model_dump() for b in books],
        message=f"Found {len(books)} result(s)",
    )
