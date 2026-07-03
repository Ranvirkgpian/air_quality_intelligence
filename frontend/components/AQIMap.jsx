import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

function aqiColor(aqi) {
  if (aqi <= 50)  return "#00c851"
  if (aqi <= 100) return "#ffbb33"
  if (aqi <= 200) return "#ff8800"
  if (aqi <= 300) return "#cc0000"
  return "#7b0099"
}

function createMarkerIcon(aqi, selected) {
  const color = aqiColor(aqi)
  const size  = selected ? 52 : 44
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};color:#fff;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:${selected?"4px solid #1565c0":"3px solid #fff"};box-shadow:0 2px 8px rgba(0,0,0,0.3);">${aqi}</div>`,
    iconSize:   [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor:[0, -size/2 - 4],
  })
}

export default function AQIMap({ stations, selectedStation, onStationClick, city }) {
  const mapRef     = useRef(null)
  const mapObj     = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapObj.current) {
      mapObj.current = L.map(mapRef.current, {
        center: [12.9716, 77.5946], zoom: 11, zoomControl: true,
      })
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapObj.current)
    }
  }, [])

  // Auto-center map when stations change (new city searched)
  useEffect(() => {
    if (!mapObj.current || !stations.length) return
    const lats = stations.map(s => s.lat)
    const lngs = stations.map(s => s.lng)
    const bounds = L.latLngBounds(
      stations.map(s => [s.lat, s.lng])
    )
    mapObj.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
  }, [city, stations])

  // Update markers
  useEffect(() => {
    if (!mapObj.current || !stations.length) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    stations.forEach(s => {
      const isSelected = selectedStation?.station_id === s.station_id
      const marker = L.marker([s.lat, s.lng], {
        icon: createMarkerIcon(s.aqi, isSelected),
      })
        .addTo(mapObj.current)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <div style="font-weight:600;font-size:14px;margin-bottom:6px">${s.station_name}</div>
            <div style="margin-bottom:3px">Zone: <strong>${s.zone}</strong></div>
            <div style="margin-bottom:3px">AQI: <strong style="color:${aqiColor(s.aqi)}">${s.aqi} — ${s.category}</strong></div>
            <div style="margin-bottom:3px">PM2.5: <strong>${s.pm25} µg/m³</strong></div>
            <div style="margin-bottom:6px">PM10: <strong>${s.pm10} µg/m³</strong></div>
            <div style="font-size:11px;color:#1565c0;">📈 Click marker to see 72h forecast</div>
          </div>
        `)
        .on("click", () => {
          onStationClick && onStationClick(s)
          setTimeout(() => {
            const el = document.getElementById("forecast-panel")
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
          }, 100)
        })
      markersRef.current.push(marker)
    })
  }, [stations, selectedStation])

  return (
    <div ref={mapRef}
      style={{ width: "100%", height: "380px", borderRadius: 10, overflow: "hidden", zIndex: 0 }}
    />
  )
}
