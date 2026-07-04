import { useState, useEffect } from "react"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, CartesianGrid, Area, AreaChart
} from "recharts"
import { api } from "../services/api"

function aqiColor(aqi) {
  if (aqi <= 50)  return "#00c851"
  if (aqi <= 100) return "#ffbb33"
  if (aqi <= 200) return "#ff8800"
  if (aqi <= 300) return "#cc0000"
  return "#7b0099"
}

function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:00`
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div style={{
      background: "#fff", border: "1px solid #eee", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{formatTime(d.timestamp)}</div>
      <div>AQI: <strong style={{ color: aqiColor(d.aqi) }}>{d.aqi}</strong></div>
      {d.aqi_lower && (
        <div style={{ fontSize: 11, color: "#888" }}>
          Range: {d.aqi_lower} – {d.aqi_upper}
        </div>
      )}
      <div>PM2.5: <strong>{d.pm25} µg/m³</strong></div>
      {d.temperature && <div>Temp: <strong>{d.temperature}°C</strong></div>}
      {d.wind_speed  && <div>Wind: <strong>{d.wind_speed} km/h</strong></div>}
      <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
        Category: {d.category}
      </div>
    </div>
  )
}

export default function ForecastPanel({ stationId, stationName, stationLat, stationLng, currentAqi, onClose }) {
  const [data, setData]       = useState([])
  const [modelInfo, setModelInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hours, setHours]     = useState(24)

  useEffect(() => {
    if (!stationId) return
    setLoading(true)
    const lat = stationLat || 12.9716
    const lng = stationLng || 77.5946
    const aqi = currentAqi || 120

    fetch(`http://localhost:8000/aqi/forecast/${stationId}?hours=72&lat=${lat}&lng=${lng}&current_aqi=${aqi}`)
      .then(r => r.json())
      .then(r => {
        setData(r.data || [])
        setModelInfo(r.model || null)
      })
      .finally(() => setLoading(false))
  }, [stationId])

  const displayed = data.slice(0, hours)
  const maxAqi    = displayed.length ? Math.max(...displayed.map(d => d.aqi)) : 0
  const avgAqi    = displayed.length ? Math.round(displayed.reduce((s, d) => s + d.aqi, 0) / displayed.length) : 0
  const trend     = displayed.length > 1
    ? displayed[displayed.length-1].aqi > displayed[0].aqi ? "↑ Worsening" : "↓ Improving"
    : ""

  if (!stationId) return (
    <div style={{
      background: "#f8f9fc", border: "1.5px dashed #d0d4e0", borderRadius: 10,
      padding: 32, textAlign: "center", color: "#888", fontSize: 14
    }}>
      Click any station marker on the map to see its 72-hour AQI forecast
    </div>
  )

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h2 className="card-title" style={{ margin: 0 }}>Forecast — {stationName}</h2>
          {!loading && (
            <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
              Peak: <strong style={{ color: aqiColor(maxAqi) }}>{maxAqi}</strong> &nbsp;·&nbsp;
              Avg: <strong>{avgAqi}</strong> &nbsp;·&nbsp;
              Trend: <strong>{trend}</strong>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[24, 48, 72].map(h => (
            <button key={h} onClick={() => setHours(h)} style={{
              padding: "5px 12px", borderRadius: 20, border: "1px solid #ddd",
              cursor: "pointer", fontSize: 12,
              background: hours === h ? "#1565c0" : "#fff",
              color:      hours === h ? "#fff"    : "#333",
            }}>{h}h</button>
          ))}
          <button onClick={onClose} style={{
            padding: "5px 10px", borderRadius: 20, border: "1px solid #ddd",
            cursor: "pointer", background: "#fff", color: "#888", fontSize: 12, marginLeft: 4
          }}>✕</button>
        </div>
      </div>

      {/* Model badge */}
      {modelInfo && (
        <div style={{
          display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap"
        }}>
          <span style={{
            background: modelInfo.trained ? "#e8f5e9" : "#fff8e1",
            color:      modelInfo.trained ? "#2e7d32" : "#7a5c00",
            border:     `1px solid ${modelInfo.trained ? "#a5d6a7" : "#ffe082"}`,
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500
          }}>
            {modelInfo.trained ? "🤖 XGBoost Model" : "📊 Statistical Model"}
          </span>
          {modelInfo.rmse && (
            <span style={{
              background: "#e3f2fd", color: "#1565c0",
              border: "1px solid #90caf9",
              padding: "3px 10px", borderRadius: 20, fontSize: 11
            }}>
              RMSE: {modelInfo.rmse}
            </span>
          )}
          {modelInfo.mae && (
            <span style={{
              background: "#e3f2fd", color: "#1565c0",
              border: "1px solid #90caf9",
              padding: "3px 10px", borderRadius: 20, fontSize: 11
            }}>
              MAE: {modelInfo.mae}
            </span>
          )}
          {modelInfo.features && (
            <span style={{
              background: "#f3e5f5", color: "#6a1b9a",
              border: "1px solid #ce93d8",
              padding: "3px 10px", borderRadius: 20, fontSize: 11
            }}>
              {modelInfo.features} features
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading" style={{ padding: 32 }}>Running XGBoost forecast...</div>
      ) : (
        <>
          {/* Chart with confidence band */}
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={displayed} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1565c0" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1565c0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={ts => {
                  const d = new Date(ts)
                  return `${d.getHours()}:00`
                }}
                tick={{ fontSize: 10 }}
                interval={Math.floor(displayed.length / 8)}
              />
              <YAxis tick={{ fontSize: 11 }} domain={["auto","auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={100} stroke="#ffbb33" strokeDasharray="4 4"
                label={{ value: "Moderate", fontSize: 10, fill: "#ffbb33" }} />
              <ReferenceLine y={200} stroke="#ff4444" strokeDasharray="4 4"
                label={{ value: "Poor", fontSize: 10, fill: "#ff4444" }} />
              {/* Confidence band */}
              <Area
                type="monotone" dataKey="aqi_upper"
                stroke="none" fill="#1565c022"
                activeDot={false}
              />
              <Area
                type="monotone" dataKey="aqi"
                stroke="#1565c0" strokeWidth={2.5}
                fill="url(#aqiGradient)"
                dot={false} activeDot={{ r: 5 }}
              />
              <Area
                type="monotone" dataKey="aqi_lower"
                stroke="none" fill="#fff"
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* AQI legend */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {[
              ["Good ≤50",         "#00c851"],
              ["Satisfactory ≤100","#ffbb33"],
              ["Moderate ≤200",    "#ff8800"],
              ["Poor ≤300",        "#cc0000"],
            ].map(([label, color]) => (
              <span key={label} style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 4,
                background: color + "22", color,
                border: `1px solid ${color}44`
              }}>{label}</span>
            ))}
          </div>

          {/* Weather summary */}
          {displayed[0]?.temperature && (
            <div style={{
              marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap",
              background: "#f8f9fc", borderRadius: 8, padding: "8px 12px"
            }}>
              <span style={{ fontSize: 12, color: "#555" }}>
                🌡️ {displayed[0].temperature}°C
              </span>
              <span style={{ fontSize: 12, color: "#555" }}>
                💨 {displayed[0].wind_speed} km/h
              </span>
              <span style={{ fontSize: 12, color: "#555" }}>
                💧 Forecast powered by Open-Meteo
              </span>
              <span style={{ fontSize: 12, color: "#1565c0", fontWeight: 500 }}>
                Model: {displayed[0].model}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
