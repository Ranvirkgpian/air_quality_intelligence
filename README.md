# AI-Powered Urban Air Quality Intelligence
### ET AI Hackathon 2026 — Problem Statement 5

## Quick start (PowerShell)

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```
API runs at http://localhost:8000
Docs at http://localhost:8000/docs

### Frontend
```powershell
cd frontend
npm install
copy .env.example .env.local
npm run dev
```
App runs at http://localhost:5173

## API endpoints
- GET /aqi/live — all station readings
- GET /aqi/forecast/{station_id} — 72h forecast
- GET /attribution/?ward=Silk+Board — source attribution
- GET /enforcement/?city=Bengaluru — enforcement targets
- GET /advisory/?language=en — citizen advisories (en/hi/kn)

## Deployment
- Backend → Render (render.com) — connect GitHub, set root dir to `backend`
- Frontend → Vercel (vercel.com) — connect GitHub, set root dir to `frontend`
- Database → Supabase (supabase.com) — free PostGIS

## Architecture
5 AI agents → FastAPI backend → React frontend
- Agent 1: Geospatial pollution source attribution
- Agent 2: Hyperlocal 24-72h AQI forecasting
- Agent 3: Enforcement intelligence & prioritisation
- Agent 4: Citizen health risk advisory (multilingual)
- Agent 5: Multi-city comparative dashboard
