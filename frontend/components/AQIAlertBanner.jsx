import { useState, useEffect } from "react"

const THRESHOLD_LEVELS = [
  { min: 300, label: "SEVERE",       bg: "#7F1D1D", border: "#991B1B", icon: "☠️", pulse: true  },
  { min: 200, label: "VERY POOR",    bg: "#6B21A8", border: "#7C3AED", icon: "🚨", pulse: true  },
  { min: 150, label: "POOR",         bg: "#C2410C", border: "#EA580C", icon: "⚠️", pulse: false },
  { min: 100, label: "MODERATE",     bg: "#B45309", border: "#D97706", icon: "⚡", pulse: false },
]

function getAlertLevel(aqi) {
  return THRESHOLD_LEVELS.find(t => aqi >= t.min) || null
}

export default function AQIAlertBanner({ stations }) {
  const [dismissed, setDismissed]     = useState([])
  const [expanded, setExpanded]       = useState(true)
  const [blinkOn, setBlinkOn]         = useState(true)

  // Blink effect for severe alerts
  useEffect(() => {
    const interval = setInterval(() => setBlinkOn(b => !b), 800)
    return () => clearInterval(interval)
  }, [])

  if (!stations || stations.length === 0) return null

  // Find all stations above threshold 200
  const criticalStations = stations
    .filter(s => s.aqi >= 200)
    .sort((a, b) => b.aqi - a.aqi)

  // Find all stations above 150 (poor)
  const poorStations = stations
    .filter(s => s.aqi >= 150 && s.aqi < 200)
    .sort((a, b) => b.aqi - a.aqi)

  // Active alerts not dismissed
  const activeAlerts = criticalStations.filter(s => !dismissed.includes(s.station_id))

  // Highest AQI station overall
  const worstStation = [...stations].sort((a, b) => b.aqi - a.aqi)[0]

  if (activeAlerts.length === 0 && poorStations.length === 0) return null

  const topAlert    = activeAlerts[0] || poorStations[0]
  const alertLevel  = getAlertLevel(topAlert?.aqi)
  if (!alertLevel) return null

  const isSevere = topAlert.aqi >= 200
  const showBlink = alertLevel.pulse && blinkOn

  return (
    <div style={{
      background:   alertLevel.bg,
      border:       `2px solid ${alertLevel.border}`,
      borderRadius: 10,
      marginBottom: 16,
      overflow:     "hidden",
      boxShadow:    isSevere ? `0 0 20px ${alertLevel.border}88` : "0 2px 8px rgba(0,0,0,0.2)",
      transition:   "box-shadow 0.4s",
    }}>
      {/* Main alert bar */}
      <div style={{
        display:    "flex",
        alignItems: "center",
        gap:        12,
        padding:    "12px 16px",
        cursor:     "pointer",
      }} onClick={() => setExpanded(e => !e)}>

        {/* Pulsing icon */}
        <div style={{
          fontSize:  24,
          opacity:   showBlink ? 1 : 0.4,
          transition:"opacity 0.3s",
          flexShrink: 0,
        }}>
          {alertLevel.icon}
        </div>

        {/* Alert text */}
        <div style={{ flex: 1 }}>
          <div style={{
            color:      "#fff",
            fontWeight: 700,
            fontSize:   15,
            display:    "flex",
            alignItems: "center",
            gap:        8,
          }}>
            <span style={{
              background:   "rgba(255,255,255,0.2)",
              padding:      "1px 8px",
              borderRadius: 4,
              fontSize:     11,
              letterSpacing:"0.05em",
            }}>{alertLevel.label}</span>
            AQI ALERT — {activeAlerts.length > 0
              ? `${activeAlerts.length} station${activeAlerts.length > 1 ? "s" : ""} in critical zone`
              : `${poorStations.length} station${poorStations.length > 1 ? "s" : ""} in poor zone`
            }
          </div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 }}>
            Worst: <strong>{topAlert.station_name}</strong> — AQI {topAlert.aqi} ({topAlert.category})
            {isSevere && " · Immediate action required"}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display:     "flex",
          gap:         16,
          flexShrink:  0,
          alignItems:  "center",
        }}>
          {isSevere && (
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>CRITICAL</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>
                {activeAlerts.length}
              </div>
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>PEAK AQI</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>
              {topAlert.aqi}
            </div>
          </div>
          <div style={{
            color:      "rgba(255,255,255,0.7)",
            fontSize:   18,
            transform:  expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>▾</div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          background: "rgba(0,0,0,0.25)",
          padding:    "12px 16px",
          borderTop:  `1px solid ${alertLevel.border}`,
        }}>
          {/* Critical stations */}
          {activeAlerts.length > 0 && (
            <div style={{ marginBottom: poorStations.length > 0 ? 12 : 0 }}>
              <div style={{
                color: "rgba(255,255,255,0.6)", fontSize: 11,
                marginBottom: 8, letterSpacing: "0.05em"
              }}>
                🚨 CRITICAL STATIONS (AQI ≥ 200)
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {activeAlerts.map(s => (
                  <div key={s.station_id} style={{
                    background:   "rgba(255,255,255,0.15)",
                    border:       "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 8,
                    padding:      "8px 12px",
                    minWidth:     160,
                    flex:         "1 1 160px",
                  }}>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
                      {s.station_name}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>
                      AQI: <strong>{s.aqi}</strong> · PM2.5: {s.pm25} µg/m³
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 }}>
                      Zone: {s.zone}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setDismissed(d => [...d, s.station_id]) }}
                      style={{
                        marginTop:    6, fontSize: 10, padding: "2px 8px",
                        background:   "rgba(255,255,255,0.2)", color: "#fff",
                        border:       "1px solid rgba(255,255,255,0.4)",
                        borderRadius: 4, cursor: "pointer"
                      }}
                    >
                      Acknowledge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Poor stations */}
          {poorStations.length > 0 && (
            <div>
              <div style={{
                color: "rgba(255,255,255,0.6)", fontSize: 11,
                marginBottom: 8, letterSpacing: "0.05em"
              }}>
                ⚠️ POOR AIR QUALITY STATIONS (AQI 150–200)
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {poorStations.map(s => (
                  <div key={s.station_id} style={{
                    background:   "rgba(255,255,255,0.1)",
                    border:       "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    padding:      "6px 10px",
                    fontSize:     12,
                    color:        "rgba(255,255,255,0.85)",
                    flex:         "1 1 140px",
                  }}>
                    <strong>{s.station_name}</strong> — AQI {s.aqi}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advisory */}
          <div style={{
            marginTop:    12,
            padding:      "8px 12px",
            background:   "rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize:     12,
            color:        "rgba(255,255,255,0.9)",
            borderLeft:   "3px solid rgba(255,255,255,0.5)",
          }}>
            💡 <strong>Recommended:</strong>{" "}
            {topAlert.aqi >= 300
              ? "Declare air quality emergency. Close schools and outdoor venues. Issue health advisory citywide."
              : topAlert.aqi >= 200
              ? "Restrict outdoor activity. Alert hospitals and schools. Deploy enforcement teams immediately."
              : "Limit outdoor exposure for sensitive groups. Issue advisories to schools and hospitals."}
          </div>
        </div>
      )}
    </div>
  )
}
