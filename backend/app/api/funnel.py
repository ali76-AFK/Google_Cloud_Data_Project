from datetime import date
from fastapi import APIRouter, Query
from backend.app.services.bigquery_service import query_funnel

router = APIRouter()

@router.get("/funnel")
def get_funnel(
    start: date = Query(..., description="Start date in YYYY-MM-DD"),
    end: date = Query(..., description="End date in YYYY-MM-DD"),
):
    return query_funnel(start=start, end=end)
