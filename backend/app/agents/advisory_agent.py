import random
import urllib.parse
import requests
from datetime import datetime

LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "ta": "Tamil",
    "te": "Telugu",
    "mr": "Marathi",
    "bn": "Bengali",
    "fr": "French",
    "ar": "Arabic",
    "zh": "Chinese",
}

def get_city_wards(city: str, count: int = 5):
    """Fetch real ward/district names for any city using Nominatim."""
    try:
        # Search for suburbs/districts within the city
        url = (
            f"https://nominatim.openstreetmap.org/search"
            f"?q={urllib.parse.quote(city)}&format=json&limit=1&addressdetails=1"
        )
        resp = requests.get(url, headers={"User-Agent": "AQI-Platform/1.0"}, timeout=6)
        if resp.ok and resp.json():
            d        = resp.json()[0]
            base_lat = float(d["lat"])
            base_lng = float(d["lon"])

            # Search for neighbourhoods/suburbs
            sub_url = (
                f"https://nominatim.openstreetmap.org/search"
                f"?q=neighbourhood+{urllib.parse.quote(city)}&format=json&limit=15&addressdetails=1"
            )
            sub_resp = requests.get(sub_url, headers={"User-Agent": "AQI-Platform/1.0"}, timeout=6)
            if sub_resp.ok and sub_resp.json():
                seen  = set()
                wards = []
                for item in sub_resp.json():
                    name = (
                        item.get("address", {}).get("suburb") or
                        item.get("address", {}).get("neighbourhood") or
                        item.get("address", {}).get("quarter") or
                        item.get("display_name", "").split(",")[0].strip()
                    )
                    if name and name not in seen and len(name) > 2:
                        seen.add(name)
                        wards.append({
                            "ward":       name,
                            "schools":    random.randint(4, 15),
                            "hospitals":  random.randint(1, 6),
                            "elderly_pop":random.randint(3000, 10000),
                        })
                if len(wards) >= 3:
                    return wards[:count]
    except Exception as e:
        print(f"Ward fetch error: {e}")

    # Fallback — generate generic zone names for the city
    zones = ["North", "South", "East", "West", "Central"]
    return [
        {
            "ward":       f"{city} {zone}",
            "schools":    random.randint(4, 15),
            "hospitals":  random.randint(1, 6),
            "elderly_pop":random.randint(3000, 10000),
        }
        for zone in zones[:count]
    ]

def generate_advisory_message(ward: str, aqi: int, risk: str, schools: int, language: str):
    """Generate advisory message in the requested language."""
    action = "Avoid all outdoor activity." if risk == "High" else "Limit prolonged outdoor exposure."

    messages = {
        "en": f"AQI {aqi} in {ward}. {action} {schools} schools notified.",
        "hi": f"{ward} में वायु गुणवत्ता सूचकांक {aqi} है। {'बाहर जाने से बचें।' if risk == 'High' else 'बाहरी गतिविधि सीमित करें।'} {schools} स्कूलों को सूचित किया गया।",
        "kn": f"{ward} ನಲ್ಲಿ ವಾಯು ಗುಣಮಟ್ಟ ಸೂಚ್ಯಂಕ {aqi}. {'ಹೊರಗೆ ಹೋಗದಿರಿ।' if risk == 'High' else 'ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆ ಮಿತಿಗೊಳಿಸಿ।'} {schools} ಶಾಲೆಗಳಿಗೆ ತಿಳಿಸಲಾಗಿದೆ.",
        "ta": f"{ward} இல் காற்று தர குறியீடு {aqi}. {'வெளியில் செல்ல வேண்டாம்.' if risk == 'High' else 'வெளிப்புற செயல்பாட்டை குறைக்கவும்.'} {schools} பள்ளிகளுக்கு அறிவிக்கப்பட்டது.",
        "te": f"{ward} లో వాయు నాణ్యత సూచిక {aqi}. {'బయటకు వెళ్ళకండి.' if risk == 'High' else 'బయటి కార్యకలాపాలను పరిమితం చేయండి.'} {schools} పాఠశాలలకు తెలియజేయబడింది.",
        "mr": f"{ward} मध्ये हवा गुणवत्ता निर्देशांक {aqi} आहे. {'बाहेर जाणे टाळा.' if risk == 'High' else 'बाहेरील क्रियाकलाप मर्यादित करा.'} {schools} शाळांना कळवले आहे.",
        "bn": f"{ward}-এ বায়ু মান সূচক {aqi}। {'বাইরে যাওয়া এড়িয়ে চলুন।' if risk == 'High' else 'বাইরের কার্যকলাপ সীমিত করুন।'} {schools}টি স্কুলকে জানানো হয়েছে।",
        "fr": f"Indice de qualité de l'air à {ward}: {aqi}. {'Évitez toute activité extérieure.' if risk == 'High' else 'Limitez les activités extérieures.'} {schools} écoles notifiées.",
        "ar": f"مؤشر جودة الهواء في {ward}: {aqi}. {'تجنب النشاط الخارجي.' if risk == 'High' else 'قلل النشاط الخارجي.'} تم إخطار {schools} مدارس.",
        "zh": f"{ward}空气质量指数：{aqi}。{'避免户外活动。' if risk == 'High' else '限制户外活动。'}{schools}所学校已收到通知。",
    }
    return messages.get(language, messages["en"])

def get_advisories(language: str = "en", city: str = "Bengaluru"):
    aqi_now = random.randint(145, 220)
    risk    = "High" if aqi_now > 200 else "Moderate" if aqi_now > 150 else "Low"

    # Get real ward names for this city
    zones = get_city_wards(city, count=5)

    advisories = []
    for zone in zones:
        msg = generate_advisory_message(
            zone["ward"], aqi_now, risk, zone["schools"], language
        )
        advisories.append({
            "ward":               zone["ward"],
            "risk_level":         risk,
            "current_aqi":        aqi_now,
            "schools_affected":   zone["schools"],
            "hospitals_affected": zone["hospitals"],
            "elderly_population": zone["elderly_pop"],
            "message":            msg,
            "timestamp":          datetime.now().isoformat(),
        })

    return {
        "city":       city,
        "language":   language,
        "advisories": advisories,
        "available_languages": LANGUAGES,
    }
