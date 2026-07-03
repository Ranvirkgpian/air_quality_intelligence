const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

export const api = {
  getLive:        (city = "Bengaluru")      => fetch(`${BASE}/aqi/live?city=${encodeURIComponent(city)}`).then(r => r.json()),
  getForecast:    (id, hours = 72)          => fetch(`${BASE}/aqi/forecast/${id}?hours=${hours}`).then(r => r.json()),
  getAttribution: (ward = "Silk Board")     => fetch(`${BASE}/attribution/?ward=${encodeURIComponent(ward)}`).then(r => r.json()),
  getEnforcement: (city = "Bengaluru")      => fetch(`${BASE}/enforcement/?city=${encodeURIComponent(city)}`).then(r => r.json()),
  getAdvisory:    (lang = "en", city = "Bengaluru") => fetch(`${BASE}/advisory/?language=${lang}&city=${encodeURIComponent(city)}`).then(r => r.json()),
}
