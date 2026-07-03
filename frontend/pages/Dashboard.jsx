import { useState, useEffect } from "react"
import { api } from "../services/api"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import AQIMap from "../components/AQIMap"
import ForecastPanel from "../components/ForecastPanel"
import LocationSelector from "../components/LocationSelector"
import AQIAlertBanner from "../components/AQIAlertBanner"
import AttributionPanel from "../components/AttributionPanel"

function aqiColor(aqi) {
  if (aqi <= 50)  return "#00c851"
  if (aqi <= 100) return "#ffbb33"
  if (aqi <= 200) return "#ff8800"
  if (aqi <= 300) return "#cc0000"
  return "#7b0099"
}

function AQIBadge({ aqi, category }) {
  return (
    <span style={{
      background: aqiColor(aqi), color: "#fff", padding: "2px 10px",
      borderRadius: 20, fontSize: 12, fontWeight: 500
    }}>
      {aqi} — {category}
    </span>
  )
}

export default function Dashboard({ onCityChange }) {
  const [stations, setStations]               = useState([])
  const [attribution, setAttribution]         = useState(null)
  const [loading, setLoading]                 = useState(false)
  const [lastUpdated, setLastUpdated]         = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [city, setCity]                       = useState("")
  const [displayName, setDisplayName]         = useState("")
  const [searching, setSearching]             = useState(false)
  const [noData, setNoData]                   = useState(false)
  const [hasSearched, setHasSearched]         = useState(false)

  const fetchData = async (query, label) => {
    setSearching(true)
    setLoading(true)
    setNoData(false)
    setSelectedStation(null)
    setHasSearched(true)
    try {
      const [liveRes, attrRes] = await Promise.all([
        api.getLive(query),
        api.getAttribution(label),
      ])
      const stationData = liveRes.data || []
      setStations(stationData)
      setAttribution(attrRes.data || null)
      setLastUpdated(new Date().toLocaleTimeString())
      const isMock = stationData.length === 0 || stationData.some(s => s.station_id?.startsWith("mock-"))
      setNoData(isMock)
    } catch (e) {
      console.error("Fetch error:", e)
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  const handleSearch = (query, label) => {
    setCity(query)
    setDisplayName(label)
    fetchData(query, label)
    if (onCityChange) onCityChange(label)
  }

  const avgAqi = stations.length
    ? Math.round(stations.reduce((s, x) => s + x.aqi, 0) / stations.length) : 0
  const worst = stations.length ? [...stations].sort((a, b) => b.aqi - a.aqi)[0] : null

  return (
    <div>
      {/* Location selector */}
      <LocationSelector onSearch={handleSearch} searching={searching} />

      {/* AQI Alert Banner — shows automatically when stations cross threshold */}
      <AQIAlertBanner stations={stations} />

      {/* Initial state — before any search */}
      {!hasSearched && (
        <div style={{
          background: "#f0f4ff", border: "1.5px dashed #b0c4f0",
          borderRadius: 10, padding: 40, textAlign: "center", color: "#5570a0"
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
            Select a country and state to load live AQI data
          </div>
          <div style={{ fontSize: 13, color: "#7890b0" }}>
            Covers monitoring stations worldwide via OpenAQ
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading">
          Loading AQI data for {displayName}...
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <>
          {/* No data warning */}
          {noData && (
            <div style={{
              background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8,
              padding: "10px 16px", fontSize: 13, color: "#7a5c00", marginBottom: 14
            }}>
              ⚠️ No live monitoring stations found for <strong>{displayName}</strong> on OpenAQ.
              Showing simulated data for demonstration.
            </div>
          )}

          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Region avg AQI</div>
              <div className="stat-value" style={{ color: aqiColor(avgAqi) }}>{avgAqi}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Stations monitored</div>
              <div className="stat-value">{stations.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Worst station</div>
              <div className="stat-value" style={{ fontSize: 16 }}>{worst?.station_name || "-"}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{worst?.aqi} AQI</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Last updated</div>
              <div className="stat-value" style={{ fontSize: 16 }}>{lastUpdated}</div>
            </div>
          </div>

          {/* Map */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 className="card-title">Live AQI map — {displayName}</h2>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 10, marginTop: -8 }}>
              Click any station marker to see its 72-hour forecast
            </p>
            <AQIMap
              stations={stations}
              selectedStation={selectedStation}
              onStationClick={setSelectedStation}
              city={city}
            />
          </div>

          {/* Forecast panel */}
          <div id="forecast-panel" style={{ marginBottom: 16 }}>
            <ForecastPanel
              stationId={selectedStation?.station_id}
              stationName={selectedStation?.station_name}
              stationLat={selectedStation?.lat}
              stationLng={selectedStation?.lng}
              currentAqi={selectedStation?.aqi}
              onClose={() => setSelectedStation(null)}
            />
          </div>

          {/* Table + Chart */}
          <div className="panel-grid">
            <div className="card">
              <h2 className="card-title">Station readings</h2>
              <table className="table">
                <thead>
                  <tr><th>Station</th><th>Zone</th><th>AQI</th><th>PM2.5</th><th>PM10</th></tr>
                </thead>
                <tbody>
                  {stations.map(s => (
                    <tr key={s.station_id} onClick={() => setSelectedStation(s)}
                      style={{
                        cursor: "pointer",
                        background: selectedStation?.station_id === s.station_id ? "#e3f0ff" : "transparent"
                      }}
                    >
                      <td>{s.station_name}</td>
                      <td><span className="badge">{s.zone}</span></td>
                      <td><AQIBadge aqi={s.aqi} category={s.category} /></td>
                      <td>{s.pm25}</td>
                      <td>{s.pm10}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h2 className="card-title">AQI by station</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stations} margin={{ top: 4, right: 8, left: -10, bottom: 40 }}>
                  <XAxis dataKey="station_name" angle={-35} textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
                    {stations.map((s, i) => <Cell key={i} fill={aqiColor(s.aqi)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="card-title">Source attribution — {displayName}</h2>
              <AttributionPanel ward={displayName || "Silk Board"} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
