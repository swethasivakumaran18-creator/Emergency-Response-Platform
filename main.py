from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="AI Emergency Analyzer")


class Incident(BaseModel):
    type: str
    description: str
    location: str


def analyze_incident(incident: Incident):
    text = (
        incident.type + " " +
        incident.description
    ).lower()

    # Category
    if "fire" in text or "smoke" in text:
        category = "Fire"
    elif "accident" in text or "crash" in text:
        category = "Accident"
    elif "medical" in text or "injury" in text or "unconscious" in text:
        category = "Medical Emergency"
    elif "crime" in text or "theft" in text or "robbery" in text:
        category = "Crime"
    else:
        category = "Other Emergency"

    # Severity
    if any(word in text for word in ["death", "unconscious", "major", "severe","serious","trapped"]):
        severity = "High"
    elif any(word in text for word in ["injury", "smoke", "minor", "damage"]):
        severity = "Medium"
    else:
        severity = "Low"

    # Summary
    summary = (
        f"{category} reported at {incident.location}. "
        f"Incident description: {incident.description}"
    )

    # Recommended response
    if category == "Fire":
        response = "Contact the fire department and evacuate people from the affected area."
    elif category == "Accident":
        response = "Contact emergency services and provide medical assistance if safe."
    elif category == "Medical Emergency":
        response = "Contact emergency medical services immediately and provide first aid if safe."
    elif category == "Crime":
        response = "Contact the police and avoid approaching the suspected danger."
    else:
        response = "Contact the appropriate emergency service and move to a safe location."

    return {
        "category": category,
        "severity": severity,
        "summary": summary,
        "recommended_response": response
    }


@app.post("/analyze")
def analyze(incident: Incident):
    return analyze_incident(incident)