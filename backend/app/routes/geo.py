from fastapi import APIRouter
import requests
import urllib.parse

router = APIRouter()

@router.get("/countries")
def get_countries():
    """Return list of countries that have OpenAQ monitoring stations."""
    try:
        resp = requests.get(
            "https://api.openaq.org/v3/countries?limit=200&order_by=name",
            timeout=10
        )
        if resp.ok:
            results = resp.json().get("results", [])
            countries = [
                {"code": c.get("code",""), "name": c.get("name","")}
                for c in results if c.get("name")
            ]
            return {"status": "ok", "data": sorted(countries, key=lambda x: x["name"])}
    except Exception as e:
        print(f"Countries error: {e}")
    return {"status": "error", "data": []}

@router.get("/states")
def get_states(country_code: str):
    """Return states/provinces for a country using Nominatim."""
    try:
        url = (
            f"https://nominatim.openstreetmap.org/search"
            f"?country={urllib.parse.quote(country_code)}"
            f"&featureType=state&format=json&limit=50&addressdetails=1"
        )
        resp = requests.get(url, headers={"User-Agent": "AQI-Platform/1.0"}, timeout=10)
        if resp.ok:
            results = resp.json()
            states = []
            seen = set()
            for r in results:
                name = r.get("display_name","").split(",")[0].strip()
                lat  = float(r.get("lat", 0))
                lng  = float(r.get("lon", 0))
                if name and name not in seen:
                    seen.add(name)
                    states.append({"name": name, "lat": lat, "lng": lng})
            if states:
                return {"status": "ok", "data": sorted(states, key=lambda x: x["name"])}
    except Exception as e:
        print(f"States nominatim error: {e}")

    # Fallback: use OpenAQ locations to infer regions
    try:
        resp2 = requests.get(
            f"https://api.openaq.org/v3/locations?countries_id={country_code}&limit=100",
            timeout=10
        )
        if resp2.ok:
            locs = resp2.json().get("results", [])
            seen = set()
            states = []
            for loc in locs:
                city = loc.get("locality") or loc.get("name","").split("-")[0].strip()
                lat  = loc.get("coordinates",{}).get("latitude", 0)
                lng  = loc.get("coordinates",{}).get("longitude", 0)
                if city and city not in seen:
                    seen.add(city)
                    states.append({"name": city, "lat": lat, "lng": lng})
            return {"status": "ok", "data": sorted(states, key=lambda x: x["name"])[:30]}
    except Exception as e:
        print(f"States fallback error: {e}")

    return {"status": "ok", "data": []}
