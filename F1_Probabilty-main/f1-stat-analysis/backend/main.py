from __future__ import annotations

import logging
import os
import threading
import uuid
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from analysis_engine import AnalysisEngine
from f1_data_loader import F1DataLoader

logger = logging.getLogger(__name__)

# Single source of truth for the supported season range.
FIRST_SEASON = 2018
LAST_SEASON = 2025

app = FastAPI(title="Formula 1 Statistical Analysis Platform", version="1.0.0")

# CORS origins are configurable via CORS_ORIGINS env var so the same Docker
# image works in dev and prod without a rebuild.
# e.g. CORS_ORIGINS="http://localhost:5173,https://your-domain.com"
_raw_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
_allow_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

loader = F1DataLoader(cache_dir="./cache")
engine = AnalysisEngine(loader)

# FastAPI runs sync endpoints in a thread-pool, so results_store must be
# protected against concurrent writes from simultaneous /analyze requests.
results_store: dict[str, dict[str, Any]] = {}
_store_lock = threading.Lock()


class AnalyzeRequest(BaseModel):
    year: int = Field(ge=FIRST_SEASON, le=LAST_SEASON)
    race: str | int
    driver: str
    comparison_driver: str | None = None
    team1: str
    team2: str


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "Formula 1 Statistical Analysis Platform API"}


@app.get("/seasons")
def get_seasons() -> dict[str, list[int]]:
    return {"seasons": loader.seasons()}


@app.get("/races/{year}")
def get_races(year: int) -> dict[str, Any]:
    if year < FIRST_SEASON or year > LAST_SEASON:
        raise HTTPException(
            status_code=400,
            detail=f"Year must be between {FIRST_SEASON} and {LAST_SEASON}",
        )
    try:
        return {"year": year, "races": loader.races_for_year(year)}
    except Exception as exc:
        logger.exception("Failed to load races for year %s", year)
        raise HTTPException(status_code=500, detail="Could not load race schedule.") from exc


@app.get("/session/{year}/{race}")
def get_session(year: int, race: str) -> dict[str, Any]:
    try:
        return loader.session_metadata(year, race)
    except Exception as exc:
        logger.exception("Failed to load session metadata year=%s race=%s", year, race)
        raise HTTPException(status_code=500, detail="Could not load session data.") from exc


@app.post("/analyze")
def analyze(payload: AnalyzeRequest) -> dict[str, str]:
    job_id = str(uuid.uuid4())

    with _store_lock:
        results_store[job_id] = {"job_id": job_id, "status": "running"}

    try:
        analysis_result = engine.run(
            year=payload.year,
            race=payload.race,
            driver=payload.driver,
            comparison_driver=payload.comparison_driver,
            team1=payload.team1,
            team2=payload.team2,
        )
        entry: dict[str, Any] = {
            "job_id": job_id,
            "status": "completed",
            "result": analysis_result,
        }
    except Exception as exc:
        # Log full traceback server-side; return only the safe message to the client.
        logger.exception("Analysis failed for job %s", job_id)
        entry = {
            "job_id": job_id,
            "status": "error",
            "error": str(exc),
        }

    with _store_lock:
        results_store[job_id] = entry

    return {"job_id": job_id, "status": entry["status"]}


@app.get("/results/{job_id}")
def get_results(job_id: str) -> dict[str, Any]:
    with _store_lock:
        result = results_store.get(job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Job not found")
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
