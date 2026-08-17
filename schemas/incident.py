from pydantic import BaseModel


class IncidentCreate(BaseModel):
    type: str
    description: str | None = None
    latitude: float
    longitude: float
