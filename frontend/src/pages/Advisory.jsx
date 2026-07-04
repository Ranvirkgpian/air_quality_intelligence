import { useState, useEffect } from "react"
import { api } from "../services/api"

const RISK_COLOR = { High: "#e53935", Moderate: "#fb8c00", Low: "#43a047" }

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "bn", label: "বাংলা" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
]

export default function Advisory({ city = "Bengaluru" }) {
  const [data, setData]       = useState(null)
  const [lang, setLang]       = useState("en")
  const [loading, setLoading] = useState(true)

  const fetchAdvisory = (l, c) => {
    setLoading(true)
    api.getAdvisory(l, c)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAdvisory(lang, city) }, [lang, city])

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 className="card-title">Citizen health advisories — {city}</h2>
            <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              Ward-level risk alerts for vulnerable populations
            </p>
          </div>

          {/* Language selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                style={{
                  padding:      "5px 12px",
                  borderRadius: 20,
                  border:       "1px solid #ddd",
                  background:   lang === l.code ? "#1565c0" : "#fff",
                  color:        lang === l.code ? "#fff"    : "#333",
                  cursor:       "pointer",
                  fontSize:     12,
                  fontWeight:   lang === l.code ? 500 : 400,
                  transition:   "all 0.15s",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="loading">Loading advisories for {city}...</div>}

      {!loading && data?.advisories.map((a, i) => (
        <div className="card" key={i} style={{
          marginBottom: 12,
          borderLeft:   `4px solid ${RISK_COLOR[a.risk_level] || "#999"}`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{a.ward}</h3>
                <span style={{
                  background:   RISK_COLOR[a.risk_level],
                  color:        "#fff",
                  padding:      "2px 10px",
                  borderRadius: 20,
                  fontSize:     11,
                  fontWeight:   600,
                }}>{a.risk_level} Risk</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 10px", color: "#333" }}>
                {a.message}
              </p>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#666" }}>
                <span>🏫 Schools: <strong>{a.schools_affected}</strong></span>
                <span>🏥 Hospitals: <strong>{a.hospitals_affected}</strong></span>
                <span>👴 Elderly: <strong>{a.elderly_population.toLocaleString()}</strong></span>
              </div>
            </div>
            <div style={{ textAlign: "right", marginLeft: 16, flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: "#888" }}>Current AQI</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: RISK_COLOR[a.risk_level] }}>
                {a.current_aqi}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
