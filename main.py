from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from database import engine,Base
from models.responder import Responder
from models.hospital import Hospital
from models.incident import Incident
from routes.hospitals import router as hospital_router
from routes.incidents import router as incident_router
from routes.responders import router as responder_router

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "https://emergency-platform-three.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incident_router)
app.include_router(responder_router)
app.include_router(hospital_router)

@app.get("/")
def home():
    return {
        "message": "Emergency Response Backend is running!"
    }
