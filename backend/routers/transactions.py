from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import crud
from dependencies import get_db
from schemas import APIResponse, BorrowRequest, ReturnRequest, TransactionResponse
from models import AvailabilityStatus

router = APIRouter(tags=["transactions"])


def _format_transaction(t) -> dict:
    data = TransactionResponse.model_validate(t).model_dump()
    data["book_title"] = t.book.title if t.book else None
    data["borrower_name"] = t.borrower.borrower_name if t.borrower else None
    return data


@router.post("/borrow", response_model=APIResponse, status_code=201)
def borrow_book(payload: BorrowRequest, db: Session = Depends(get_db)) -> APIResponse:
    book = crud.get_book(db, payload.book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if book.availability_status != AvailabilityStatus.available:
        raise HTTPException(status_code=409, detail="Book is not available for borrowing")

    borrower = crud.get_borrower(db, payload.borrower_id)
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")

    transaction = crud.create_borrow_transaction(db, payload.book_id, payload.borrower_id)
    return APIResponse(
        data=_format_transaction(transaction),
        message="Book borrowed successfully",
    )


@router.post("/return", response_model=APIResponse)
def return_book(payload: ReturnRequest, db: Session = Depends(get_db)) -> APIResponse:
    transaction = crud.get_transaction(db, payload.transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.status == "returned":
        raise HTTPException(status_code=409, detail="This book has already been returned")

    transaction = crud.process_return(db, transaction)
    return APIResponse(
        data=_format_transaction(transaction),
        message="Book returned successfully",
    )


@router.get("/transactions", response_model=APIResponse)
def list_transactions(
    status: Optional[str] = Query(None, pattern="^(borrowed|returned)$"),
    db: Session = Depends(get_db),
) -> APIResponse:
    transactions = crud.get_transactions(db, status=status)
    return APIResponse(
        data=[_format_transaction(t) for t in transactions],
        message=f"Retrieved {len(transactions)} transaction(s)",
    )
