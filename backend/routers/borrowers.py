from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
from dependencies import get_db
from schemas import APIResponse, BorrowerCreate, BorrowerUpdate, BorrowerResponse

router = APIRouter(prefix="/borrowers", tags=["borrowers"])


@router.get("", response_model=APIResponse)
def list_borrowers(db: Session = Depends(get_db)) -> APIResponse:
    borrowers = crud.get_borrowers(db)
    result = []
    for b in borrowers:
        data = BorrowerResponse.model_validate(b).model_dump()
        data["active_borrows"] = crud.count_active_borrows(db, b.borrower_id)
        result.append(data)
    return APIResponse(data=result, message=f"Retrieved {len(result)} borrower(s)")


@router.get("/{borrower_id}", response_model=APIResponse)
def get_borrower(borrower_id: int, db: Session = Depends(get_db)) -> APIResponse:
    borrower = crud.get_borrower(db, borrower_id)
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")
    data = BorrowerResponse.model_validate(borrower).model_dump()
    data["active_borrows"] = crud.count_active_borrows(db, borrower_id)
    return APIResponse(data=data, message="Borrower retrieved")


@router.post("", response_model=APIResponse, status_code=201)
def create_borrower(borrower_data: BorrowerCreate, db: Session = Depends(get_db)) -> APIResponse:
    existing = crud.get_borrower_by_email(db, str(borrower_data.email))
    if existing:
        raise HTTPException(status_code=409, detail="A borrower with this email already exists")
    borrower = crud.create_borrower(db, borrower_data)
    return APIResponse(
        data=BorrowerResponse.model_validate(borrower).model_dump(),
        message="Borrower created successfully",
    )


@router.put("/{borrower_id}", response_model=APIResponse)
def update_borrower(
    borrower_id: int, updates: BorrowerUpdate, db: Session = Depends(get_db)
) -> APIResponse:
    borrower = crud.get_borrower(db, borrower_id)
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")

    if updates.email and str(updates.email) != borrower.email:
        existing = crud.get_borrower_by_email(db, str(updates.email))
        if existing:
            raise HTTPException(status_code=409, detail="Email already in use by another borrower")

    borrower = crud.update_borrower(db, borrower, updates)
    return APIResponse(
        data=BorrowerResponse.model_validate(borrower).model_dump(),
        message="Borrower updated successfully",
    )


@router.delete("/{borrower_id}", response_model=APIResponse)
def delete_borrower(borrower_id: int, db: Session = Depends(get_db)) -> APIResponse:
    borrower = crud.get_borrower(db, borrower_id)
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")

    if crud.borrower_has_active_borrows(db, borrower_id):
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a borrower who has unreturned books",
        )

    crud.delete_borrower(db, borrower)
    return APIResponse(data=None, message="Borrower deleted successfully")
