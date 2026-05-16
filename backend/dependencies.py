from typing import Generator
from sqlalchemy.orm import Session
from database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Yield a database session and ensure it is closed after each request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
