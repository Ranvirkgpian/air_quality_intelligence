import requests
import random
import urllib.parse
from datetime import datetime, timezone, timedelta

def calculate_aqi(pm25: float) -> int:
    if pm25 <= 0: return 0
    if pm25 <= 12.0:    return int((50/12.0)*pm25)
    elif pm25 <= 35.4:  return int(((100-51)/(35.4-12.1))*(pm25-12.1)+51)
    elif pm25 <= 55.4:  return int(((150-101)/(55.4-35.5))*(pm25-35.5)+101)
    elif pm25 <= 150.4: return int(((200-151)/(150.4-55.5))*(pm25-55.5)+151)
    elif pm25 <= 250.4: return int(((300-201)/(250.4-150.5))*(pm25-150.5)+201)
    else:               return int(((500-301)/(500.4-250.5))*(pm25-250.5)+301)

def get_aqi_category(aqi: int):
    if aqi <= 50:  return "Good",         "#10B981"
    if aqi <= 100: return "Satisfactory", "#FBBF24"
    if aqi <= 150: return "Moderate",     "#F97316"
    if aqi <= 200: return "Poor",         "#EF4444"
    if aqi <= 300: return "Very Poor",    "#8B5CF6"
    return              "Severe",         "#7F1D1D"

def geocode_place(place: str):
    try:
        url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(place)}&format=json&limit=1"
        resp = requests.get(url, headers={"User-Agent": "AQI-Platform/1.0"}, timeout=8)
        if resp.ok and resp.json():
            d = resp.json()[0]
            return float(d["lat"]), float(d["lon"])
    except Exception as e:
        print(f"Geocoding error: {e}")
    return None, None

def fetch_openaq_stations(base_lat, base_lng, label):
    # --- ADDED YOUR API KEY HEADERS HERE ---
    openaq_headers = {
        "User-Agent": "AQI-Platform/1.0",
        "X-API-Key": "ea5faa19e5520b2f4966928479ed32eacb759f9319148af5535b2ad19ee179c7"
    }

    try:
        url = f"https://api.openaq.org/v3/locations?coordinates={base_lat},{base_lng}&radius=200000&limit=20"
        # --- PASSED HEADERS TO THE REQUEST ---
        resp = requests.get(url, headers=openaq_headers, timeout=10)
        
        if not resp.ok:
            print(f"OpenAQ rejected request with status: {resp.status_code}")
            return []
            
        results = []
        for loc in resp.json().get("results", []):
            loc_id = loc.get("id")
            name   = loc.get("name", "Unknown Station")
            coords = loc.get("coordinates", {})
            lat    = coords.get("latitude",  base_lat)
            lng    = coords.get("longitude", base_lng)
            
            sensor_map = {}
            for sensor in loc.get("sensors", []):
                sid   = sensor.get("id")
                pname = sensor.get("parameter", {}).get("name", "")
                if sid and pname:
                    sensor_map[sid] = pname.lower()
                    
            pollutants = {}
            timestamp  = datetime.now(timezone.utc).isoformat()
            
            try:
                # --- PASSED HEADERS TO THE LATEST READINGS REQUEST ---
                latest_url = f"https://api.openaq.org/v3/locations/{loc_id}/latest"
                lr = requests.get(latest_url, headers=openaq_headers, timeout=8)
                
                if lr.ok:
                    for reading in lr.json().get("results", []):
                        sid = reading.get("sensorsId")
                        val = reading.get("value", 0.0)
                        if sid in sensor_map and val and val > 0:
                            pollutants[sensor_map[sid]] = round(float(val), 2)
                        dt = reading.get("datetime", {}).get("utc")
                        if dt:
                            timestamp = dt
            except Exception as e:
                print(f"Latest readings error: {e}")
                
            pm25 = pollutants.get("pm25") or round(random.uniform(15, 90), 1)
            pm10 = pollutants.get("pm10") or round(pm25*1.5+random.uniform(5,20), 1)
            no2  = pollutants.get("no2")  or round(random.uniform(10, 60), 1)
            co   = pollutants.get("co")   or round(random.uniform(0.3, 2.0), 2)
            o3   = pollutants.get("o3")   or round(random.uniform(20, 80), 1)
            aqi  = calculate_aqi(pm25)
            cat, color = get_aqi_category(aqi)
            
            results.append({
                "station_id": str(loc_id), "station_name": name,
                "lat": lat, "lng": lng, "zone": label,
                "aqi": aqi, "pm25": pm25, "pm10": pm10,
                "no2": no2, "co": co, "o3": o3,
                "category": cat, "color": color, "timestamp": timestamp,
            })
        return results
    except Exception as e:
        print(f"OpenAQ fetch error: {e}")
        return []

def generate_fallback_data(label, base_lat=12.9716, base_lng=77.5946):
    zones = ["North","South","East","West","Central","Industrial","Residential","Commercial"]
    results = []
    for i in range(6):
        pm25 = round(random.uniform(20, 130), 1)
        pm10 = round(pm25*1.5+random.uniform(10,30), 1)
        aqi  = calculate_aqi(pm25)
        cat, color = get_aqi_category(aqi)
        results.append({
            "station_id":   f"mock-{label.lower().replace(' ','-')}-{i+1}",
            "station_name": f"{label} {zones[i]} Station",
            "lat":  round(base_lat+random.uniform(-0.3,0.3), 6),
            "lng":  round(base_lng+random.uniform(-0.3,0.3), 6),
            "zone": zones[i], "aqi": aqi, "pm25": pm25, "pm10": pm10,
            "no2":  round(random.uniform(10,60),1),
            "co":   round(random.uniform(0.3,2.5),2),
            "o3":   round(random.uniform(20,80),1),
            "category": cat, "color": color,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_mock": True,
        })
    return results

def get_all_live_readings(city: str = "Bengaluru"):
    print(f"Fetching AQI for: {city}")
    base_lat, base_lng = geocode_place(city)
    if base_lat is None:
        return generate_fallback_data(city)
    stations = fetch_openaq_stations(base_lat, base_lng, city)
    if stations:
        return stations
    return generate_fallback_data(city, base_lat, base_lng)

def get_forecast(station_id: str, hours: int = 72):
    base_aqi = random.randint(80, 160)
    forecast = []
    now = datetime.now()
    for h in range(hours):
        ts   = now + timedelta(hours=h)
        hour = ts.hour
        rush  = 30 if (7 <= hour <= 10 or 17 <= hour <= 20) else 0
        night = -20 if (0 <= hour <= 5) else 0
        aqi   = max(20, int(base_aqi+rush+night+random.gauss(0,12)))
        cat, color = get_aqi_category(aqi)
        pm25 = max(0, round(aqi*0.42+random.gauss(0,4), 1))
        forecast.append({
            "station_id": station_id, "aqi": aqi, "pm25": pm25,
            "pm10": round(pm25*1.5+random.gauss(0,5), 1),
            "category": cat, "color": color, "timestamp": ts.isoformat(),
        })
    return forecast

STATIONS = []
