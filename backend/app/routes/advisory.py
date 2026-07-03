from fastapi import APIRouter
from app.agents.advisory_agent import get_advisories, LANGUAGES

router = APIRouter()

@router.get("/")
def advisory(language: str = "en", city: str = "Bengaluru"):
    return {"status": "ok", "data": get_advisories(language, city)}

@router.get("/languages")
def languages():
    return {"status": "ok", "data": LANGUAGES}
