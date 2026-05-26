from datetime import date
from fastapi import APIRouter, Query
from backend.app.services.bigquery_service import query_overview

router = APIRouter()

@router.get("/overview")
def get_overview(
    start: date = Query(..., description="Start date in YYYY-MM-DD"),
    end: date = Query(..., description="End date in YYYY-MM-DD"),
):
    return query_overview(start=start, end=end)
