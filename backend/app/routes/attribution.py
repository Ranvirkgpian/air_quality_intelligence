from fastapi import APIRouter
from app.agents.attribution_agent import get_attribution

router = APIRouter()

@router.get("/")
def attribution(ward: str = "Silk Board"):
    return {"status": "ok", "data": get_attribution(ward)}
