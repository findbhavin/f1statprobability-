#!/usr/bin/env bash
# =============================================================================
# deploy-gcp.sh — One-shot GCP Cloud Run deployment script
#
# Usage:
#   chmod +x deploy-gcp.sh
#   ./deploy-gcp.sh                          # uses defaults below
#   PROJECT_ID=my-project ./deploy-gcp.sh   # override project
# =============================================================================

set -euo pipefail

# ── Configuration (override via env vars) ─────────────────────────────────────
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project)}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-f1-stat-analysis}"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE}"

echo ""
echo "════════════════════════════════════════════════"
echo "  F1 Stat Analysis — GCP Cloud Run Deploy"
echo "  Project : ${PROJECT_ID}"
echo "  Region  : ${REGION}"
echo "  Service : ${SERVICE}"
echo "  Image   : ${IMAGE}"
echo "════════════════════════════════════════════════"
echo ""

# ── 1. Enable required GCP APIs ───────────────────────────────────────────────
echo "▶ Enabling GCP APIs..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  --project="${PROJECT_ID}"

# ── 2. Build & push Docker image ──────────────────────────────────────────────
echo "▶ Building Docker image (this takes a few minutes)..."
gcloud builds submit \
  --tag "${IMAGE}:latest" \
  --project="${PROJECT_ID}" \
  .

# ── 3. Deploy to Cloud Run ────────────────────────────────────────────────────
echo "▶ Deploying to Cloud Run..."
gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}:latest" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 10 \
  --min-instances 0 \
  --max-instances 5 \
  --project "${PROJECT_ID}"

# ── 4. Print the live URL ─────────────────────────────────────────────────────
SERVICE_URL=$(gcloud run services describe "${SERVICE}" \
  --platform managed \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --format "value(status.url)")

echo ""
echo "════════════════════════════════════════════════"
echo "  ✅ Deployment complete!"
echo "  🌐 URL: ${SERVICE_URL}"
echo "  📊 API docs: ${SERVICE_URL}/docs"
echo "════════════════════════════════════════════════"
echo ""
