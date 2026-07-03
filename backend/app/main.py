from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import aqi, attribution, enforcement, advisory
from app.routes import geo

app = FastAPI(title="Air Quality Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(aqi.router,         prefix="/aqi",         tags=["AQI"])
app.include_router(attribution.router, prefix="/attribution", tags=["Attribution"])
app.include_router(enforcement.router, prefix="/enforcement", tags=["Enforcement"])
app.include_router(advisory.router,    prefix="/advisory",    tags=["Advisory"])
app.include_router(geo.router,         prefix="/geo",         tags=["Geography"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Air Quality Intelligence API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
