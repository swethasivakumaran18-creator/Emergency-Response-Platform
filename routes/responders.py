from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models.responder import Responder

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/responders")
def create_responder(
    name: str,
    department: str,
    vehicle_type: str = None,
    latitude: float = None,
    longitude: float = None,
    db: Session = Depends(get_db)
):
    responder = Responder(
        name=name,
        department=department,
        vehicle_type=vehicle_type,
        latitude=latitude,
        longitude=longitude
    )

    db.add(responder)
    db.commit()
    db.refresh(responder)

    return responder


@router.get("/responders")
def get_responders(db: Session = Depends(get_db)):
    return db.query(Responder).all()
