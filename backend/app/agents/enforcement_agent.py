import random
from datetime import datetime

def get_enforcement_targets(city: str = "Bengaluru"):
    import urllib.parse, requests as req, random

    # Geocode city to get coordinates
    try:
        url  = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(city)}&format=json&limit=1"
        resp = req.get(url, headers={"User-Agent": "AQI-Platform/1.0"}, timeout=5)
        if resp.ok and resp.json():
            d       = resp.json()[0]
            base_lat = float(d["lat"])
            base_lng = float(d["lon"])
        else:
            base_lat, base_lng = 12.9716, 77.5946
    except Exception:
        base_lat, base_lng = 12.9716, 77.5946

    VIOLATION_TEMPLATES = [
        {"type": "Industrial",    "violation": "Stack emissions exceeding national limits",     "action": "Immediate stack emission test + show cause notice"},
        {"type": "Waste burning", "violation": "Open burning of municipal solid waste",         "action": "Deploy fire watch + municipal closure notice"},
        {"type": "Construction",  "violation": "No dust suppression measures active",           "action": "Water sprinkling mandate + stop-work until compliance"},
        {"type": "Vehicular",     "violation": "High-emission vehicles operating in city limits","action": "Vehicle interception + emission checks"},
        {"type": "Industrial",    "violation": "Operating without valid environmental clearance","action": "Surprise inspection + licence suspension"},
    ]

    targets = []
    aqi_contributions = [18, 13, 11, 9, 8]
    evidence_scores   = [94, 91, 87, 83, 79]

    for i, tmpl in enumerate(VIOLATION_TEMPLATES):
        lat = round(base_lat + random.uniform(-0.12, 0.12), 4)
        lng = round(base_lng + random.uniform(-0.12, 0.12), 4)
        targets.append({
            "rank":             i + 1,
            "name":             f"{city} {tmpl['type']} Site #{i+1}",
            "type":             tmpl["type"],
            "violation":        tmpl["violation"],
            "aqi_contribution": aqi_contributions[i],
            "evidence_score":   evidence_scores[i],
            "lat":              lat,
            "lng":              lng,
            "action":           tmpl["action"],
        })

    return {
        "city":          city,
        "generated_at":  datetime.now().isoformat(),
        "total_targets": len(targets),
        "targets":       targets,
    }
