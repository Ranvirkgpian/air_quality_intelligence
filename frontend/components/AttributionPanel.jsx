import { useState, useEffect } from "react"
import { api } from "../services/api"

const SOURCE_COLORS = {
  "Vehicular traffic":    "#8e24aa",
  "Industrial emissions": "#e53935",
  "Construction dust":    "#f9a825",
  "Waste burning":        "#fb8c00",
  "Residential/other":    "#43a047",
}

const SOURCE_ICONS = {
  "Vehicular traffic":    "🚛",
  "Industrial emissions": "🏭",
  "Construction dust":    "🏗️",
  "Waste burning":        "🔥",
  "Residential/other":    "🏘️",
}

export default function AttributionPanel({ ward = "Silk Board" }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getAttribution(ward)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [ward])

  if (loading) return (
    <div style={{ padding: 20, textAlign: "center", color: "#888", fontSize: 13 }}>
      Running attribution analysis...
    </div>
  )

  if (!data) return null

  return (
    <div>
      {/* Method badge */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{
          background: "#e8f5e9", color: "#2e7d32",
          border: "1px solid #a5d6a7",
          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500
        }}>
          📊 Spatial-temporal lag-correlation
        </span>
        <span style={{
          background: "#e8f0fe", color: "#1a73e8",
          border: "1px solid #aecbfa",
          padding: "3px 10px", borderRadius: 20, fontSize: 11
        }}>
          🤖 Gemini LLM explanation
        </span>
        <span style={{
          background: "#f3e5f5", color: "#6a1b9a",
          border: "1px solid #ce93d8",
          padding: "3px 10px", borderRadius: 20, fontSize: 11
        }}>
          AQI: {data.current_aqi}
        </span>
      </div>

      {/* LLM Explanation box */}
      {data.explanation && (
        <div style={{
          background:   "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
          border:       "1px solid #90caf9",
          borderLeft:   "4px solid #1565c0",
          borderRadius: "0 8px 8px 0",
          padding:      "12px 14px",
          marginBottom: 14,
          fontSize:     13,
          lineHeight:   1.7,
          color:        "#1a1a2e",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#1565c0", marginBottom: 6, letterSpacing: "0.05em" }}>
            🤖 AI ANALYSIS — {ward.toUpperCase()}
          </div>
          {data.explanation}
        </div>
      )}

      {/* Source bars */}
      <div style={{ marginBottom: 4, fontSize: 12, color: "#888" }}>Source attribution breakdown</div>
      {data.sources.map((src, i) => {
        const color = SOURCE_COLORS[src.source] || "#666"
        const icon  = SOURCE_ICONS[src.source]  || "📍"
        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span>{icon}</span>
                <span>{src.source}</span>
              </span>
              <span style={{ display: "flex", gap: 8 }}>
                <span style={{ fontWeight: 600, color }}>{src.percentage}%</span>
                <span style={{ color: "#aaa", fontSize: 11 }}>conf: {src.confidence}%</span>
              </span>
            </div>
            {/* Attribution bar */}
            <div style={{ background: "#eee", borderRadius: 4, height: 8, position: "relative" }}>
              <div style={{
                width:        `${src.percentage}%`,
                height:       "100%",
                background:   color,
                borderRadius: 4,
                transition:   "width 0.6s ease",
              }} />
              {/* Confidence indicator */}
              <div style={{
                position:   "absolute",
                left:       `${src.confidence}%`,
                top:        -2,
                width:      2,
                height:     12,
                background: "#333",
                opacity:    0.3,
                borderRadius: 2,
              }} title={`Confidence: ${src.confidence}%`} />
            </div>
          </div>
        )
      })}

      {/* Dominant source highlight */}
      <div style={{
        marginTop:    12,
        background:   "#fff8e1",
        border:       "1px solid #ffe082",
        borderRadius: 8,
        padding:      "8px 12px",
        fontSize:     12,
        color:        "#7a5c00",
      }}>
        ⚡ <strong>Primary driver:</strong> {data.dominant_source} in the <strong>{data.zone}</strong> zone
        at <strong>{new Date(data.timestamp).toLocaleTimeString()}</strong>
      </div>
    </div>
  )
}
