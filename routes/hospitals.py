from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models.hospital import Hospital

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/hospitals")
def create_hospital(
    name: str,
    latitude: float,
    longitude: float,
    available_beds: int = 0,
    emergency_capacity: str = "Available",
    db: Session = Depends(get_db)
):
    hospital = Hospital(
        name=name,
        latitude=latitude,
        longitude=longitude,
        available_beds=available_beds,
        emergency_capacity=emergency_capacity
    )

    db.add(hospital)
    db.commit()
    db.refresh(hospital)

    return hospital


@router.get("/hospitals")
def get_hospitals(db: Session = Depends(get_db)):
    return db.query(Hospital).all()
