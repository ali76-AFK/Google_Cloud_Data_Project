from fastapi import APIRouter
from backend.app.services.metric_definitions import METRIC_DEFINITIONS

router = APIRouter()

@router.get("/metadata/source")
def get_source_metadata():
    return {
        "dataset": "ga4_obfuscated_sample_ecommerce",
        "provider": "Google",
        "date_coverage": {
            "start": "2020-11-01",
            "end": "2021-01-31"
        },
        "notes": [
            "Sample dataset is obfuscated.",
            "Some fields may contain placeholder values such as <Other>, NULL, or empty strings.",
            "Internal consistency may be limited."
        ]
    }

@router.get("/definitions/metrics")
def get_metric_definitions():
    return METRIC_DEFINITIONS
