import { useState, useEffect } from "react"

const COUNTRIES = [
  {code:"AF",name:"Afghanistan",flag:"🇦🇫"},{code:"AL",name:"Albania",flag:"🇦🇱"},
  {code:"DZ",name:"Algeria",flag:"🇩🇿"},{code:"AR",name:"Argentina",flag:"🇦🇷"},
  {code:"AM",name:"Armenia",flag:"🇦🇲"},{code:"AU",name:"Australia",flag:"🇦🇺"},
  {code:"AT",name:"Austria",flag:"🇦🇹"},{code:"AZ",name:"Azerbaijan",flag:"🇦🇿"},
  {code:"BH",name:"Bahrain",flag:"🇧🇭"},{code:"BD",name:"Bangladesh",flag:"🇧🇩"},
  {code:"BE",name:"Belgium",flag:"🇧🇪"},{code:"BZ",name:"Belize",flag:"🇧🇿"},
  {code:"BJ",name:"Benin",flag:"🇧🇯"},{code:"BT",name:"Bhutan",flag:"🇧🇹"},
  {code:"BO",name:"Bolivia",flag:"🇧🇴"},{code:"BA",name:"Bosnia and Herzegovina",flag:"🇧🇦"},
  {code:"BR",name:"Brazil",flag:"🇧🇷"},{code:"BN",name:"Brunei",flag:"🇧🇳"},
  {code:"BG",name:"Bulgaria",flag:"🇧🇬"},{code:"BF",name:"Burkina Faso",flag:"🇧🇫"},
  {code:"KH",name:"Cambodia",flag:"🇰🇭"},{code:"CM",name:"Cameroon",flag:"🇨🇲"},
  {code:"CA",name:"Canada",flag:"🇨🇦"},{code:"CL",name:"Chile",flag:"🇨🇱"},
  {code:"CN",name:"China",flag:"🇨🇳"},{code:"CO",name:"Colombia",flag:"🇨🇴"},
  {code:"CD",name:"Congo (DRC)",flag:"🇨🇩"},{code:"CR",name:"Costa Rica",flag:"🇨🇷"},
  {code:"HR",name:"Croatia",flag:"🇭🇷"},{code:"CU",name:"Cuba",flag:"🇨🇺"},
  {code:"CY",name:"Cyprus",flag:"🇨🇾"},{code:"CZ",name:"Czech Republic",flag:"🇨🇿"},
  {code:"DK",name:"Denmark",flag:"🇩🇰"},{code:"DO",name:"Dominican Republic",flag:"🇩🇴"},
  {code:"EC",name:"Ecuador",flag:"🇪🇨"},{code:"EG",name:"Egypt",flag:"🇪🇬"},
  {code:"SV",name:"El Salvador",flag:"🇸🇻"},{code:"ET",name:"Ethiopia",flag:"🇪🇹"},
  {code:"FI",name:"Finland",flag:"🇫🇮"},{code:"FR",name:"France",flag:"🇫🇷"},
  {code:"GE",name:"Georgia",flag:"🇬🇪"},{code:"DE",name:"Germany",flag:"🇩🇪"},
  {code:"GH",name:"Ghana",flag:"🇬🇭"},{code:"GR",name:"Greece",flag:"🇬🇷"},
  {code:"GT",name:"Guatemala",flag:"🇬🇹"},{code:"HN",name:"Honduras",flag:"🇭🇳"},
  {code:"HK",name:"Hong Kong",flag:"🇭🇰"},{code:"HU",name:"Hungary",flag:"🇭🇺"},
  {code:"IS",name:"Iceland",flag:"🇮🇸"},{code:"IN",name:"India",flag:"🇮🇳"},
  {code:"ID",name:"Indonesia",flag:"🇮🇩"},{code:"IR",name:"Iran",flag:"🇮🇷"},
  {code:"IQ",name:"Iraq",flag:"🇮🇶"},{code:"IE",name:"Ireland",flag:"🇮🇪"},
  {code:"IL",name:"Israel",flag:"🇮🇱"},{code:"IT",name:"Italy",flag:"🇮🇹"},
  {code:"JM",name:"Jamaica",flag:"🇯🇲"},{code:"JP",name:"Japan",flag:"🇯🇵"},
  {code:"JO",name:"Jordan",flag:"🇯🇴"},{code:"KZ",name:"Kazakhstan",flag:"🇰🇿"},
  {code:"KE",name:"Kenya",flag:"🇰🇪"},{code:"KW",name:"Kuwait",flag:"🇰🇼"},
  {code:"KG",name:"Kyrgyzstan",flag:"🇰🇬"},{code:"LA",name:"Laos",flag:"🇱🇦"},
  {code:"LV",name:"Latvia",flag:"🇱🇻"},{code:"LB",name:"Lebanon",flag:"🇱🇧"},
  {code:"LY",name:"Libya",flag:"🇱🇾"},{code:"LT",name:"Lithuania",flag:"🇱🇹"},
  {code:"LU",name:"Luxembourg",flag:"🇱🇺"},{code:"MK",name:"Macedonia",flag:"🇲🇰"},
  {code:"MY",name:"Malaysia",flag:"🇲🇾"},{code:"MV",name:"Maldives",flag:"🇲🇻"},
  {code:"ML",name:"Mali",flag:"🇲🇱"},{code:"MT",name:"Malta",flag:"🇲🇹"},
  {code:"MX",name:"Mexico",flag:"🇲🇽"},{code:"MD",name:"Moldova",flag:"🇲🇩"},
  {code:"MN",name:"Mongolia",flag:"🇲🇳"},{code:"MA",name:"Morocco",flag:"🇲🇦"},
  {code:"MZ",name:"Mozambique",flag:"🇲🇿"},{code:"MM",name:"Myanmar",flag:"🇲🇲"},
  {code:"NP",name:"Nepal",flag:"🇳🇵"},{code:"NL",name:"Netherlands",flag:"🇳🇱"},
  {code:"NZ",name:"New Zealand",flag:"🇳🇿"},{code:"NI",name:"Nicaragua",flag:"🇳🇮"},
  {code:"NG",name:"Nigeria",flag:"🇳🇬"},{code:"KP",name:"North Korea",flag:"🇰🇵"},
  {code:"NO",name:"Norway",flag:"🇳🇴"},{code:"OM",name:"Oman",flag:"🇴🇲"},
  {code:"PK",name:"Pakistan",flag:"🇵🇰"},{code:"PA",name:"Panama",flag:"🇵🇦"},
  {code:"PY",name:"Paraguay",flag:"🇵🇾"},{code:"PE",name:"Peru",flag:"🇵🇪"},
  {code:"PH",name:"Philippines",flag:"🇵🇭"},{code:"PL",name:"Poland",flag:"🇵🇱"},
  {code:"PT",name:"Portugal",flag:"🇵🇹"},{code:"QA",name:"Qatar",flag:"🇶🇦"},
  {code:"RO",name:"Romania",flag:"🇷🇴"},{code:"RU",name:"Russia",flag:"🇷🇺"},
  {code:"RW",name:"Rwanda",flag:"🇷🇼"},{code:"SA",name:"Saudi Arabia",flag:"🇸🇦"},
  {code:"SN",name:"Senegal",flag:"🇸🇳"},{code:"RS",name:"Serbia",flag:"🇷🇸"},
  {code:"SG",name:"Singapore",flag:"🇸🇬"},{code:"SK",name:"Slovakia",flag:"🇸🇰"},
  {code:"SI",name:"Slovenia",flag:"🇸🇮"},{code:"SO",name:"Somalia",flag:"🇸🇴"},
  {code:"ZA",name:"South Africa",flag:"🇿🇦"},{code:"KR",name:"South Korea",flag:"🇰🇷"},
  {code:"SS",name:"South Sudan",flag:"🇸🇸"},{code:"ES",name:"Spain",flag:"🇪🇸"},
  {code:"LK",name:"Sri Lanka",flag:"🇱🇰"},{code:"SD",name:"Sudan",flag:"🇸🇩"},
  {code:"SE",name:"Sweden",flag:"🇸🇪"},{code:"CH",name:"Switzerland",flag:"🇨🇭"},
  {code:"SY",name:"Syria",flag:"🇸🇾"},{code:"TW",name:"Taiwan",flag:"🇹🇼"},
  {code:"TJ",name:"Tajikistan",flag:"🇹🇯"},{code:"TZ",name:"Tanzania",flag:"🇹🇿"},
  {code:"TH",name:"Thailand",flag:"🇹🇭"},{code:"TN",name:"Tunisia",flag:"🇹🇳"},
  {code:"TR",name:"Turkey",flag:"🇹🇷"},{code:"TM",name:"Turkmenistan",flag:"🇹🇲"},
  {code:"UG",name:"Uganda",flag:"🇺🇬"},{code:"UA",name:"Ukraine",flag:"🇺🇦"},
  {code:"AE",name:"United Arab Emirates",flag:"🇦🇪"},{code:"GB",name:"United Kingdom",flag:"🇬🇧"},
  {code:"US",name:"United States",flag:"🇺🇸"},{code:"UY",name:"Uruguay",flag:"🇺🇾"},
  {code:"UZ",name:"Uzbekistan",flag:"🇺🇿"},{code:"VE",name:"Venezuela",flag:"🇻🇪"},
  {code:"VN",name:"Vietnam",flag:"🇻🇳"},{code:"YE",name:"Yemen",flag:"🇾🇪"},
  {code:"ZM",name:"Zambia",flag:"🇿🇲"},{code:"ZW",name:"Zimbabwe",flag:"🇿🇼"},
]

export default function LocationSelector({ onSearch, searching }) {
  const [states, setStates]                   = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedState, setSelectedState]     = useState(null)
  const [loadingStates, setLoadingStates]     = useState(false)

  useEffect(() => {
    if (!selectedCountry) return
    setStates([])
    setSelectedState(null)
    setLoadingStates(true)

    // PROXY FETCH: This points directly to your working FastAPI server!
    fetch(`http://127.0.0.1:8000/aqi/cities?country_code=${selectedCountry.code}`)
      .then(async r => {
        if (!r.ok) {
           const errText = await r.text();
           throw new Error(`Backend Error ${r.status}: ${errText}`);
        }
        return r.json();
      })
      .then(data => {
        const results = data.results || []
        const seen = new Set()
        const unique = []
        
        // --- UPDATED SMART EXTRACTION BLOCK ---
        results.forEach(loc => {
          let cityName = "";
          
          if (loc.locality && loc.locality !== "null") {
            cityName = loc.locality;
          } else if (loc.city && loc.city !== "null") {
            cityName = loc.city;
          } else if (loc.name) {
            // Smart extraction: Look at "Punjabi Bagh, Delhi - DPCC" and extract "Delhi"
            if (loc.name.includes(",")) {
              cityName = loc.name.split(",")[1].split("-")[0].trim();
            } else {
              // If no comma, take the primary name before any hyphen
              cityName = loc.name.split("-")[0].trim();
            }
          }

          // Filter out tiny acronyms (like "IIT") that map geocoders cannot understand
          if (cityName && cityName.length > 3 && !seen.has(cityName)) {
            seen.add(cityName)
            unique.push({ name: cityName, displayName: cityName })
          }
        })
        // ---------------------------------------
        
        const sorted = unique.sort((a, b) => a.name.localeCompare(b.name))
        
        if (sorted.length > 0) {
          setStates(sorted)
          // If exactly 1 real city exists, automatically load it
          if (sorted.length === 1) {
            setSelectedState(sorted[0])
            const query = selectedCountry.name === sorted[0].name ? sorted[0].name : `${sorted[0].name}, ${selectedCountry.name}`
            onSearch(query, sorted[0].displayName)
          }
        } else {
          // Country has no OpenAQ sensors
          const fallback = [{ name: selectedCountry.name, displayName: `No real stations - Simulating ${selectedCountry.name}` }]
          setStates(fallback)
          setSelectedState(fallback[0])
          onSearch(selectedCountry.name, fallback[0].displayName)
        }
      })
      .catch((error) => {
        console.error("Local proxy fetch error:", error.message);
        const fallback = [{ name: selectedCountry.name, displayName: `Backend Error - Simulating ${selectedCountry.name}` }]
        setStates(fallback)
        setSelectedState(fallback[0])
        onSearch(selectedCountry.name, fallback[0].displayName)
      })
      .finally(() => setLoadingStates(false))
  }, [selectedCountry])

  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #e8eaf0",
      padding: "16px 18px", marginBottom: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#555", marginBottom: 12 }}>
        🌍 Select location to load AQI data
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        
        <div style={{ flex: 2, minWidth: 200 }}>
          <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>
            STEP 1 — Country
          </label>
          <select
            value={selectedCountry?.code || ""}
            onChange={e => {
              const c = COUNTRIES.find(x => x.code === e.target.value)
              setSelectedCountry(c || null)
              setSelectedState(null)
            }}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8,
              border: "1px solid #ddd", fontSize: 14, background: "#fff",
              cursor: "pointer", outline: "none"
            }}
          >
            <option value="">Select a country</option>
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 2, minWidth: 200 }}>
          <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>
            STEP 2 — Available Cities
          </label>
          <select
            value={selectedState?.name || ""}
            onChange={e => {
              const s = states.find(x => x.name === e.target.value)
              setSelectedState(s || null)

              if (s && selectedCountry) {
                const query = selectedCountry.name === s.name
                  ? s.name
                  : `${s.name}, ${selectedCountry.name}`
                onSearch(query, s.displayName)
              }
            }}
            disabled={!selectedCountry || loadingStates}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 8,
              border: "1px solid #ddd", fontSize: 14, background: "#fff",
              cursor: selectedCountry && !loadingStates ? "pointer" : "not-allowed",
              opacity: !selectedCountry ? 0.5 : 1, outline: "none"
            }}
          >
            <option value="">
              {!selectedCountry
                ? "Select a country first"
                : loadingStates
                ? "Checking OpenAQ for stations..."
                : "Select an available city"}
            </option>
            {states.map(s => (
              <option key={s.name} value={s.name}>{s.displayName}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedState && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#1565c0" }}>
          📍 Loaded: <strong>{selectedState.displayName}, {selectedCountry.name}</strong>
        </div>
      )}
    </div>
  )
}