import { useState } from "react"
import Dashboard from "./pages/Dashboard"
import Enforcement from "./pages/Enforcement"
import Advisory from "./pages/Advisory"
import "./App.css"

const TABS = [
  { id: "dashboard",   label: "Live Dashboard" },
  { id: "enforcement", label: "Enforcement" },
  { id: "advisory",    label: "Citizen Advisory" },
]

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedCity, setSelectedCity] = useState("Bengaluru")

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div>
            <h1 className="header-title">AQI Intelligence Platform</h1>
            <p className="header-sub">
              {selectedCity} Urban Air Quality Command Centre
            </p>
          </div>
          <nav className="nav">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`nav-btn ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">
        {activeTab === "dashboard"   && (
          <Dashboard onCityChange={setSelectedCity} />
        )}
        {activeTab === "enforcement" && (
          <Enforcement city={selectedCity} />
        )}
        {activeTab === "advisory"    && (
          <Advisory city={selectedCity} />
        )}
      </main>
    </div>
  )
}
