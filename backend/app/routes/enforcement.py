from fastapi import APIRouter
from app.agents.enforcement_agent import get_enforcement_targets

router = APIRouter()

@router.get("/")
def enforcement(city: str = "Bengaluru"):
    return {"status": "ok", "data": get_enforcement_targets(city)}
