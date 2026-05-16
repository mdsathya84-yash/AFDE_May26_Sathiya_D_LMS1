from __future__ import annotations
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# ── Envelope ──────────────────────────────────────────────────────────────────

class APIResponse(BaseModel):
    data: Any
    message: str
    status: str = "success"


# ── Book ──────────────────────────────────────────────────────────────────────

class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    isbn: str = Field(..., min_length=10, max_length=20)
    description: Optional[str] = None
    tags: Optional[str] = None

    @field_validator("isbn")
    @classmethod
    def validate_isbn(cls, v: str) -> str:
        digits = re.sub(r"[-\s]", "", v)
        if len(digits) not in (10, 13) or not digits.isdigit():
            raise ValueError("ISBN must be 10 or 13 digits (hyphens allowed)")
        return v


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    author: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    isbn: Optional[str] = Field(None, min_length=10, max_length=20)
    description: Optional[str] = None
    tags: Optional[str] = None
    availability_status: Optional[str] = None

    @field_validator("isbn")
    @classmethod
    def validate_isbn(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        digits = re.sub(r"[-\s]", "", v)
        if len(digits) not in (10, 13) or not digits.isdigit():
            raise ValueError("ISBN must be 10 or 13 digits (hyphens allowed)")
        return v


class BookResponse(BaseModel):
    book_id: int
    title: str
    author: str
    category: str
    isbn: str
    availability_status: str
    description: Optional[str]
    tags: Optional[str]
    embedding_id: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Borrower ──────────────────────────────────────────────────────────────────

class BorrowerBase(BaseModel):
    borrower_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)


class BorrowerCreate(BorrowerBase):
    pass


class BorrowerUpdate(BaseModel):
    borrower_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)


class BorrowerResponse(BaseModel):
    borrower_id: int
    borrower_name: str
    email: str
    phone: Optional[str]
    created_at: Optional[datetime]
    active_borrows: int = 0

    model_config = {"from_attributes": True}


# ── Transaction ───────────────────────────────────────────────────────────────

class BorrowRequest(BaseModel):
    book_id: int = Field(..., gt=0)
    borrower_id: int = Field(..., gt=0)


class ReturnRequest(BaseModel):
    transaction_id: int = Field(..., gt=0)


class TransactionResponse(BaseModel):
    transaction_id: int
    book_id: int
    borrower_id: int
    borrow_date: Optional[datetime]
    return_date: Optional[datetime]
    status: str
    book_title: Optional[str] = None
    borrower_name: Optional[str] = None

    model_config = {"from_attributes": True}
