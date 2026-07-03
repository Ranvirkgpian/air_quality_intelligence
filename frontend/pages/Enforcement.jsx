import { useState, useEffect, useRef } from "react"
import { api } from "../services/api"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const TYPE_COLOR = {
  Industrial:      "#e53935",
  "Waste burning": "#fb8c00",
  Construction:    "#f9a825",
  Vehicular:       "#8e24aa",
}

const TYPE_ICON = {
  Industrial:      "🏭",
  "Waste burning": "🔥",
  Construction:    "🏗️",
  Vehicular:       "🚛",
}

function createEnforcementIcon(type, rank) {
  const color = TYPE_COLOR[type] || "#e53935"
  const icon  = TYPE_ICON[type]  || "⚠️"
  return L.divIcon({
    className: "",
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          background: ${color};
          color: #fff;
          border-radius: 50%;
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        ">${icon}</div>
        <div style="
          background: ${color};
          color: #fff;
          font-size: 10px; font-weight: 700;
          padding: 1px 6px; border-radius: 4px;
          margin-top: 2px;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        ">#${rank}</div>
      </div>`,
    iconSize:    [42, 58],
    iconAnchor:  [21, 58],
    popupAnchor: [0, -60],
  })
}

function EnforcementMap({ targets }) {
  const mapRef     = useRef(null)
  const mapObj     = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapObj.current) {
      mapObj.current = L.map(mapRef.current, {
        center: [12.9716, 77.5946],
        zoom: 11,
        zoomControl: true,
      })
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapObj.current)
    }
  }, [])

  useEffect(() => {
    if (!mapObj.current || !targets.length) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    targets.forEach(t => {
      const color  = TYPE_COLOR[t.type] || "#e53935"
      const marker = L.marker([t.lat, t.lng], {
        icon: createEnforcementIcon(t.type, t.rank),
      })
        .addTo(mapObj.current)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:220px">
            <div style="
              background:${color}; color:#fff;
              padding:8px 12px; margin:-14px -20px 10px;
              border-radius:4px 4px 0 0; font-weight:600; font-size:13px;
            ">
              #${t.rank} ${TYPE_ICON[t.type] || "⚠️"} ${t.type}
            </div>
            <div style="font-weight:600;font-size:14px;margin-bottom:6px">${t.name}</div>
            <div style="font-size:12px;color:#c00;margin-bottom:6px">
              ⚠️ ${t.violation}
            </div>
            <div style="display:flex;gap:12px;font-size:12px;margin-bottom:8px">
              <span>AQI impact: <strong style="color:${color}">${t.aqi_contribution}%</strong></span>
              <span>Evidence: <strong>${t.evidence_score}/100</strong></span>
            </div>
            <div style="
              background:#e8f5e9; border-left:3px solid #43a047;
              padding:6px 8px; font-size:11px; border-radius:0 4px 4px 0;
            ">
              ✅ <strong>Action:</strong> ${t.action}
            </div>
          </div>
        `)
      markersRef.current.push(marker)
    })

    // Auto-fit map to show all markers
    if (targets.length > 0) {
      const bounds = L.latLngBounds(targets.map(t => [t.lat, t.lng]))
      mapObj.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 })
    }
  }, [targets])

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "420px", borderRadius: 10, overflow: "hidden", zIndex: 0 }}
    />
  )
}

export default function Enforcement({ city = "Bengaluru" }) {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.getEnforcement(city)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [city])

  if (loading) return <div className="loading">Loading enforcement targets...</div>

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>
              Enforcement priority targets — {data?.city}
            </h2>
            <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              Generated {new Date(data?.generated_at).toLocaleString()} · {data?.total_targets} targets identified
            </p>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(TYPE_COLOR).map(([type, color]) => (
              <span key={type} style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 4,
                background: color + "22", color, border: `1px solid ${color}44`,
                display: "flex", alignItems: "center", gap: 4
              }}>
                {TYPE_ICON[type]} {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 className="card-title">Enforcement targets map</h2>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 10, marginTop: -8 }}>
          Click any marker to see violation details and recommended action
        </p>
        <EnforcementMap targets={data?.targets || []} />
      </div>

      {/* Target cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {data?.targets.map(t => (
          <div
            key={t.rank}
            className="card"
            onClick={() => setSelected(selected?.rank === t.rank ? null : t)}
            style={{
              cursor: "pointer",
              borderLeft: `4px solid ${TYPE_COLOR[t.type] || "#999"}`,
              outline: selected?.rank === t.rank ? `2px solid ${TYPE_COLOR[t.type]}` : "none",
              transition: "box-shadow 0.15s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                {/* Rank + name */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: TYPE_COLOR[t.type] || "#999",
                    color: "#fff", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0
                  }}>#{t.rank}</span>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4,
                    background: (TYPE_COLOR[t.type] || "#999") + "22",
                    color: TYPE_COLOR[t.type] || "#999" }}>
                    {TYPE_ICON[t.type]} {t.type}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "#c00", marginBottom: 6 }}>⚠️ {t.violation}</div>

                {/* Metrics */}
                <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#888" }}>AQI contribution</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: TYPE_COLOR[t.type] }}>
                      {t.aqi_contribution}%
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#888" }}>Evidence score</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#1565c0" }}>
                      {t.evidence_score}
                    </div>
                  </div>
                  {/* Evidence bar */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>Evidence strength</div>
                    <div style={{ background: "#eee", borderRadius: 4, height: 8 }}>
                      <div style={{
                        width: `${t.evidence_score}%`, height: "100%",
                        background: TYPE_COLOR[t.type], borderRadius: 4,
                        transition: "width 0.5s"
                      }} />
                    </div>
                  </div>
                </div>

                {/* Recommended action */}
                <div style={{
                  background: "#e8f5e9", borderLeft: "3px solid #43a047",
                  padding: "6px 10px", borderRadius: "0 6px 6px 0", fontSize: 12
                }}>
                  ✅ <strong>Recommended action:</strong> {t.action}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
