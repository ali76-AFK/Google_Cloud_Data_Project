from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.overview import router as overview_router
from backend.app.api.funnel import router as funnel_router
from backend.app.api.metadata import router as metadata_router

app = FastAPI(title="CampaignPulse API", version="0.1.0")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(overview_router, prefix="/api", tags=["overview"])
app.include_router(funnel_router, prefix="/api", tags=["funnel"])
app.include_router(metadata_router, prefix="/api", tags=["metadata"])