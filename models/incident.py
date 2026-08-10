from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func

from database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    severity = Column(String(20), default="Medium")
    status = Column(String(30), default="Reported")

    reported_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

