from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Book, Borrower, Transaction, AvailabilityStatus, TransactionStatus
from schemas import BookCreate, BookUpdate, BorrowerCreate, BorrowerUpdate


# ── Book CRUD ──────────────────────────────────────────────────────────────────

def get_books(
    db: Session,
    category: Optional[str] = None,
    availability: Optional[str] = None,
) -> list[Book]:
    query = db.query(Book)
    if category:
        query = query.filter(Book.category.ilike(f"%{category}%"))
    if availability:
        query = query.filter(Book.availability_status == availability)
    return query.order_by(Book.title).all()


def get_book(db: Session, book_id: int) -> Optional[Book]:
    return db.query(Book).filter(Book.book_id == book_id).first()


def get_book_by_isbn(db: Session, isbn: str) -> Optional[Book]:
    return db.query(Book).filter(Book.isbn == isbn).first()


def create_book(db: Session, book_data: BookCreate) -> Book:
    book = Book(**book_data.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


def update_book(db: Session, book: Book, updates: BookUpdate) -> Book:
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(book, field, value)
    db.commit()
    db.refresh(book)
    return book


def delete_book(db: Session, book: Book) -> None:
    db.delete(book)
    db.commit()


def is_book_currently_borrowed(db: Session, book_id: int) -> bool:
    return (
        db.query(Transaction)
        .filter(
            Transaction.book_id == book_id,
            Transaction.status == TransactionStatus.borrowed,
        )
        .first()
        is not None
    )


# ── Borrower CRUD ──────────────────────────────────────────────────────────────

def get_borrowers(db: Session) -> list[Borrower]:
    return db.query(Borrower).order_by(Borrower.borrower_name).all()


def get_borrower(db: Session, borrower_id: int) -> Optional[Borrower]:
    return db.query(Borrower).filter(Borrower.borrower_id == borrower_id).first()


def get_borrower_by_email(db: Session, email: str) -> Optional[Borrower]:
    return db.query(Borrower).filter(Borrower.email == email).first()


def count_active_borrows(db: Session, borrower_id: int) -> int:
    return (
        db.query(func.count(Transaction.transaction_id))
        .filter(
            Transaction.borrower_id == borrower_id,
            Transaction.status == TransactionStatus.borrowed,
        )
        .scalar()
        or 0
    )


def create_borrower(db: Session, borrower_data: BorrowerCreate) -> Borrower:
    borrower = Borrower(**borrower_data.model_dump())
    db.add(borrower)
    db.commit()
    db.refresh(borrower)
    return borrower


def update_borrower(db: Session, borrower: Borrower, updates: BorrowerUpdate) -> Borrower:
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(borrower, field, value)
    db.commit()
    db.refresh(borrower)
    return borrower


def delete_borrower(db: Session, borrower: Borrower) -> None:
    db.delete(borrower)
    db.commit()


def borrower_has_active_borrows(db: Session, borrower_id: int) -> bool:
    return count_active_borrows(db, borrower_id) > 0


# ── Transaction CRUD ───────────────────────────────────────────────────────────

def get_transactions(
    db: Session,
    status: Optional[str] = None,
) -> list[Transaction]:
    query = db.query(Transaction)
    if status:
        query = query.filter(Transaction.status == status)
    return query.order_by(Transaction.borrow_date.desc()).all()


def get_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    return db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()


def create_borrow_transaction(db: Session, book_id: int, borrower_id: int) -> Transaction:
    transaction = Transaction(
        book_id=book_id,
        borrower_id=borrower_id,
        status=TransactionStatus.borrowed,
        borrow_date=datetime.utcnow(),
    )
    db.add(transaction)

    book = db.query(Book).filter(Book.book_id == book_id).first()
    book.availability_status = AvailabilityStatus.borrowed

    db.commit()
    db.refresh(transaction)
    return transaction


def process_return(db: Session, transaction: Transaction) -> Transaction:
    transaction.return_date = datetime.utcnow()
    transaction.status = TransactionStatus.returned

    book = db.query(Book).filter(Book.book_id == transaction.book_id).first()
    book.availability_status = AvailabilityStatus.available

    db.commit()
    db.refresh(transaction)
    return transaction
