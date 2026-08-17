from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.responder import Responder
from models.incident import Incident

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


@router.put("/responders/{responder_id}/assign")
def assign_responder(
    responder_id: int,
    db: Session = Depends(get_db)
):
    responder = db.query(Responder).filter(
        Responder.id == responder_id
    ).first()

    if not responder:
        raise HTTPException(
            status_code=404,
            detail="Responder not found"
        )

    if responder.availability != "Available":
        raise HTTPException(
            status_code=400,
            detail="Responder is not available"
        )

    responder.availability = "Assigned"

    db.commit()
    db.refresh(responder)

    return {
        "message": "Responder assigned successfully",
        "responder_id": responder.id,
        "name": responder.name,
        "department": responder.department,
        "availability": responder.availability
    }


@router.put("/incidents/{incident_id}/assign-responder")
def assign_responder_to_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    responder = db.query(Responder).filter(
        Responder.availability == "Available"
    ).first()

    if not responder:
        raise HTTPException(
            status_code=404,
            detail="No available responders"
        )

    incident.responder_id = responder.id
    responder.availability = "Assigned"

    db.commit()
    db.refresh(incident)
    db.refresh(responder)

    return {
        "message": "Responder assigned to incident",
        "incident_id": incident.id,
        "responder_id": responder.id,
        "responder_name": responder.name,
        "department": responder.department,
        "status": responder.availability
    }
