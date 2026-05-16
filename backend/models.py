import enum
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Enum, ForeignKey, Index
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class AvailabilityStatus(str, enum.Enum):
    available = "available"
    borrowed = "borrowed"


class TransactionStatus(str, enum.Enum):
    borrowed = "borrowed"
    returned = "returned"


class Book(Base):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    isbn = Column(String(20), unique=True, nullable=False, index=True)
    availability_status = Column(
        Enum(AvailabilityStatus),
        default=AvailabilityStatus.available,
        nullable=False,
    )
    # RAG Phase 2: primary embedding source — store full book synopsis here
    description = Column(Text, nullable=True)
    # RAG Phase 2: comma-separated keywords for hybrid keyword+vector search
    tags = Column(String(500), nullable=True)
    # RAG Phase 2: foreign key to the vector store document ID
    embedding_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    transactions = relationship("Transaction", back_populates="book")

    __table_args__ = (
        Index("ix_books_title_author", "title", "author"),
    )

    def __repr__(self) -> str:
        return f"<Book id={self.book_id} title={self.title!r} isbn={self.isbn!r}>"


class Borrower(Base):
    __tablename__ = "borrowers"

    borrower_id = Column(Integer, primary_key=True, autoincrement=True)
    borrower_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    transactions = relationship("Transaction", back_populates="borrower")

    def __repr__(self) -> str:
        return f"<Borrower id={self.borrower_id} name={self.borrower_name!r} email={self.email!r}>"


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    book_id = Column(Integer, ForeignKey("books.book_id"), nullable=False)
    borrower_id = Column(Integer, ForeignKey("borrowers.borrower_id"), nullable=False)
    borrow_date = Column(DateTime, nullable=False, server_default=func.now())
    return_date = Column(DateTime, nullable=True)
    status = Column(
        Enum(TransactionStatus),
        default=TransactionStatus.borrowed,
        nullable=False,
    )

    book = relationship("Book", back_populates="transactions")
    borrower = relationship("Borrower", back_populates="transactions")

    def __repr__(self) -> str:
        return (
            f"<Transaction id={self.transaction_id} "
            f"book_id={self.book_id} borrower_id={self.borrower_id} "
            f"status={self.status!r}>"
        )
