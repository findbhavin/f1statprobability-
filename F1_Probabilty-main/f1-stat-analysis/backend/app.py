"""
app.py - Production entry point.

Imports all API routes from main.py, then mounts the built React frontend
as static files so a single container serves both the API and the UI.

Run locally:   uvicorn app:app --reload --port 8000
Run on GCP CR: uvicorn app:app --host 0.0.0.0 --port 8080
"""

import os

from fastapi.staticfiles import StaticFiles

from main import app  # noqa: F401 – registers all API routes

# ---------------------------------------------------------------------------
# Serve the built frontend (npm run build → dist/ → copied to ./static/)
# API routes registered in main.py always take priority over this catch-all.
# ---------------------------------------------------------------------------
_static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.isdir(_static_dir):
    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="frontend")
