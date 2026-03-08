# =============================================================================
# Multi-stage Dockerfile — F1 Statistical Analysis Platform
#
# Stage 1 (frontend-builder): compiles the React/Vite app into static files.
# Stage 2 (runtime):          runs the FastAPI backend which also serves those
#                              static files, giving a single deployable image.
#
# Build:  docker build -t f1-stat-analysis .
# Run:    docker run -p 8080:8080 f1-stat-analysis
# =============================================================================

# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Cache npm install layer separately
COPY F1_Probabilty-main/f1-stat-analysis/frontend/package*.json ./
RUN npm ci

COPY F1_Probabilty-main/f1-stat-analysis/frontend/ ./

# Empty string → axios uses relative URLs (same-origin as the backend)
ARG VITE_API_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm run build
# Output is in /build/dist

# ── Stage 2: Python backend + static frontend ─────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install OS-level build deps needed by some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies (cached layer)
COPY F1_Probabilty-main/f1-stat-analysis/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Backend source code
COPY F1_Probabilty-main/f1-stat-analysis/backend/ ./

# FastF1 cache (pre-populated race data — avoids live downloads on first run)
# Already included in the backend/cache directory above.

# Built frontend → served as static files by app.py
COPY --from=frontend-builder /build/dist ./static/

# Cloud Run injects PORT env var (default 8080).
ENV PORT=8080

EXPOSE 8080

# app.py = main.py routes + static file mount
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
