from fastapi import FastAPI
from database import engine,Base
from models.responder import Responder
from models.hospital import Hospital
from models.incident import Incident
from routes.incidents import router as incident_router
from routes.responders import router as responder_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(incident_router)
app.include_router(responder_router)

@app.get("/")
def home():
    return {
        "message": "Emergency Response Backend is running!"
    }
