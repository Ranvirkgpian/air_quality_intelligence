import requests
from fastapi import APIRouter, Query
from app.data.simulator import get_all_live_readings, get_forecast
from app.models.aqi_model import predict_aqi_forecast, get_model_metrics

router = APIRouter()

@router.get("/live")
def live_aqi(city: str = "Bengaluru"):
    return {"status": "ok", "city": city, "data": get_all_live_readings(city)}

@router.get("/forecast/{station_id}")
def forecast(
    station_id: str,
    hours: int = 72,
    lat: float = 12.9716,
    lng: float = 77.5946,
    current_aqi: float = 120,
):
    """XGBoost-powered AQI forecast with real Open-Meteo weather data."""
    data = predict_aqi_forecast(
        station_id=station_id,
        lat=lat, lng=lng,
        hours=hours,
        current_aqi=current_aqi,
    )
    metrics = get_model_metrics()
    return {
        "status":     "ok",
        "station_id": station_id,
        "model":      metrics,
        "data":       data,
    }

@router.get("/model/metrics")
def model_metrics():
    """Return XGBoost model performance metrics."""
    return {"status": "ok", "data": get_model_metrics()}

@router.get("/stations")
def stations(city: str = "Bengaluru"):
    return {"status": "ok", "city": city, "data": get_all_live_readings(city)}

@router.get("/cities")
def get_available_cities(
    country_code: str = Query(..., description="ISO country code e.g. IN, US")
):
    openaq_headers = {
        "User-Agent": "AQI-Platform/1.0",
        "X-API-Key":  "ea5faa19e5520b2f4966928479ed32eacb759f9319148af5535b2ad19ee179c7"
    }
    try:
        url  = f"https://api.openaq.org/v3/locations?iso={country_code}&limit=100"
        resp = requests.get(url, headers=openaq_headers, timeout=10)
        if resp.ok:
            return resp.json()
    except Exception as e:
        print(f"Cities fetch error: {e}")
    return {"results": []}
