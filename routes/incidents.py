from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx

from database import SessionLocal
from models.incident import Incident
from schemas.incident import IncidentCreate

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/incidents")
def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db)
):
    # Send incident to AI analyzer
    ai_response = httpx.post(
        "http://127.0.0.1:8001/analyze",
        json={
            "type": incident.type,
            "description": incident.description or "",
            "location": f"{incident.latitude}, {incident.longitude}"
        },
        timeout=10.0
    )

    ai_response.raise_for_status()
    ai_result = ai_response.json()

    # Save incident with AI-generated severity
    new_incident = Incident(
        type=incident.type,
        description=incident.description,
        latitude=incident.latitude,
        longitude=incident.longitude,
        severity=ai_result["severity"]
    )

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return {
        "message": "Incident reported successfully",
        "incident_id": new_incident.id,
        "status": new_incident.status,
        "category": ai_result["category"],
        "severity": ai_result["severity"],
        "summary": ai_result["summary"],
        "recommended_response": ai_result["recommended_response"]
    }


@router.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    return incidents


@router.get("/incidents/{incident_id}")
def get_incident(
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

    return incident


@router.put("/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    status: str,
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

    incident.status = status
    db.commit()
    db.refresh(incident)

    return {
        "message": "Incident status updated",
        "incident_id": incident.id,
        "status": incident.status
    }
