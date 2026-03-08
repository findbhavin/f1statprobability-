# Formula 1 Statistical Analysis Platform

A full-stack web application that applies **probability theory and inferential statistics** to real Formula 1 race telemetry via the **FastF1** library.

## Live Demo

Visit the deployed app and click **"View Example — Monaco 2024"** to run a pre-configured analysis (VER vs LEC, Red Bull vs Ferrari) with no setup required.

---

## How the Website Works

### 1. Select a Race
From the **Analyze** page (`/analyze`), choose:
- **Season** — any year from 2018 to 2025
- **Grand Prix** — the specific race
- **Primary Driver** and **Comparison Driver**
- **Two Teams** (for pit-stop comparison)

### 2. Run the Analysis
Click **"Run Statistical Analysis"**. The backend:
1. Fetches lap telemetry from FastF1 (cached after first load)
2. Runs the full statistical pipeline
3. Returns a `job_id` and redirects you to the results

### 3. Explore the Results Dashboard (`/results/:jobId`)

Four tabs group the output:

| Tab | What it contains |
|-----|-----------------|
| **Descriptive Statistics** | Histogram, box plot, mean, variance, std dev, skewness, kurtosis, random variable analysis |
| **Correlation & Regression** | Scatter plot + regression line, Pearson r, p-value, trend interpretation |
| **Probability Distributions** | Normal, Binomial, Poisson, Exponential fits with overlay chart |
| **Hypothesis Testing** | T-test (drivers), T-test (pit stops), Z-test, Chi-square, ANOVA |

### 4. Read the Docs
The built-in **Docs** page (`/docs`) explains every module, metric, and formula in plain English.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Plotly.js |
| Backend | Python 3.11 + FastAPI + Uvicorn |
| Data & Stats | FastF1, pandas, numpy, scipy, scikit-learn |
| Deployment | Docker (multi-stage) · Google Cloud Run |

---

## Local Development

### Option A — Docker Compose (recommended)

```bash
docker compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### Option B — Manual

**Backend**

```bash
cd F1_Probabilty-main/f1-stat-analysis/backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

**Frontend**

```bash
cd F1_Probabilty-main/f1-stat-analysis/frontend
npm install
# create .env:  VITE_API_BASE=http://localhost:8000
npm run dev
```

---

## Production Deployment (Google Cloud Run)

```bash
bash deploy-gcp.sh
```

Or with Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml
```

The multi-stage `Dockerfile` compiles the React app and copies `dist/` into the Python image so a **single container** serves both the API and the frontend on port 8080.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/seasons` | Available seasons (2018–2025) |
| `GET` | `/races/{year}` | Race schedule for a season |
| `GET` | `/session/{year}/{race}` | Driver codes and team names |
| `POST` | `/analyze` | Trigger analysis, returns `job_id` |
| `GET` | `/results/{job_id}` | Retrieve completed analysis |
| `GET` | `/docs` | Interactive Swagger UI (FastAPI) |
| `GET` | `/redoc` | ReDoc API reference |

---

## Project Structure

```
f1statprobability/
├── Dockerfile                  # Multi-stage build (Node → Python)
├── docker-compose.yml          # Local dev (hot-reload)
├── cloudbuild.yaml             # GCP Cloud Build pipeline
├── deploy-gcp.sh               # One-shot Cloud Run deploy script
└── F1_Probabilty-main/
    └── f1-stat-analysis/
        ├── backend/
        │   ├── app.py              # Production entry (API + static files)
        │   ├── main.py             # FastAPI routes
        │   ├── analysis_engine.py  # Orchestrates the full analysis
        │   ├── statistics_module.py# scipy-based stats functions
        │   ├── f1_data_loader.py   # FastF1 data interface
        │   └── requirements.txt
        └── frontend/
            ├── src/
            │   ├── App.jsx             # Routes + global Nav
            │   ├── pages/
            │   │   ├── LandingPage.jsx # Home page with demo preview
            │   │   ├── AnalysisPage.jsx# Race & driver selection form
            │   │   ├── ResultsPage.jsx # 4-tab results dashboard
            │   │   └── DocsPage.jsx    # Full documentation
            │   ├── components/
            │   │   ├── Nav.jsx         # Global navigation bar
            │   │   ├── PageHeader.jsx
            │   │   ├── StatCard.jsx
            │   │   └── FormulaBlock.jsx
            │   ├── charts/             # Plotly.js chart wrappers
            │   └── services/api.js     # Axios API client
            └── package.json
```

---

## Decision Rule (Hypothesis Testing)

All tests use **α = 0.05**:
- **Reject H₀** if p-value < 0.05 — statistically significant difference
- **Fail to reject H₀** if p-value ≥ 0.05 — insufficient evidence
