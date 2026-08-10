# Emergency Response Platform — API Contract

## Base URL

http://127.0.0.1:8000

---

# 1. Create Incident

### POST /incidents

Used when a citizen reports an emergency.

### Request

```json
{
  "type": "Road Accident",
  "description": "Two cars collided near the junction",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "severity": "High"
}
