import { useNavigate } from "react-router-dom";

const apiEndpoints = [
  {
    method: "GET",
    path: "/seasons",
    desc: "Returns the list of available seasons.",
    response: '{ "seasons": [2018, 2019, ..., 2025] }',
  },
  {
    method: "GET",
    path: "/races/{year}",
    desc: "Returns the race schedule for a given season.",
    response: '{ "year": 2024, "races": [{ "round": 1, "race_name": "Bahrain Grand Prix", ... }] }',
  },
  {
    method: "GET",
    path: "/session/{year}/{race}",
    desc: "Returns driver codes, team names, and metadata for a race session.",
    response: '{ "drivers": [{ "code": "VER", "team": "Red Bull Racing" }, ...], "teams": [...] }',
  },
  {
    method: "POST",
    path: "/analyze",
    desc: "Triggers the full statistical analysis. Returns a job_id immediately.",
    response: '{ "job_id": "uuid", "status": "completed" | "error" }',
  },
  {
    method: "GET",
    path: "/results/{job_id}",
    desc: "Retrieves the analysis result for a completed job.",
    response: '{ "job_id": "...", "status": "completed", "result": { ... } }',
  },
  {
    method: "GET",
    path: "/api/health",
    desc: "Health check endpoint — confirms the API is running.",
    response: '{ "status": "ok", "service": "Formula 1 Statistical Analysis Platform API" }',
  },
];

const modules = [
  {
    id: "descriptive",
    title: "Descriptive Statistics",
    icon: "📊",
    color: "#e10600",
    sections: [
      {
        heading: "What it shows",
        body: "A histogram of the selected driver's lap times across the race, a box plot comparing that driver against the comparison driver, and a full summary table of key statistics.",
      },
      {
        heading: "Metrics computed",
        body: "Mean (μ), Variance (σ²), Standard Deviation (σ), Skewness, Kurtosis, Min, Max, Q1, Median, Q3.",
      },
      {
        heading: "Interpretation",
        body: "A low standard deviation indicates consistent lap times. High positive skewness suggests occasional very slow laps (e.g. behind a safety car or after a pit stop).",
      },
    ],
  },
  {
    id: "correlation",
    title: "Correlation & Regression",
    icon: "📈",
    color: "#3ac47d",
    sections: [
      {
        heading: "What it shows",
        body: "A scatter plot of Lap Number vs Lap Time with the fitted regression line overlaid, plus a separate time-series line chart of the driver's pace through the race.",
      },
      {
        heading: "Metrics computed",
        body: "Pearson correlation coefficient (r), p-value for correlation significance, and the linear regression equation ŷ = mx + b with slope and intercept.",
      },
      {
        heading: "Interpretation",
        body: "A positive r means lap times increase (slow down) as the race progresses (e.g. tyre degradation). A negative r means the driver gets faster. Values near 0 indicate no linear trend. p < 0.05 means the correlation is statistically significant.",
      },
    ],
  },
  {
    id: "distributions",
    title: "Probability Distributions",
    icon: "🔔",
    color: "#f3c623",
    sections: [
      {
        heading: "What it shows",
        body: "Overlay chart of four fitted theoretical distributions — Normal, Binomial, Poisson, and Exponential — together with their parameter estimates.",
      },
      {
        heading: "Which distribution models what",
        body: "Normal → lap time spread. Binomial → podium outcomes over a season. Poisson → average pit stops per race. Exponential → intervals between mechanical failures.",
      },
      {
        heading: "How parameters are estimated",
        body: "Normal: μ = sample mean, σ = sample std. Poisson: λ = mean pit-stop count. Binomial: p = podium fraction over total races. Exponential: λ = 1 / mean failure interval.",
      },
    ],
  },
  {
    id: "hypothesis",
    title: "Hypothesis Testing",
    icon: "⚖️",
    color: "#5b9bd5",
    sections: [
      {
        heading: "Tests performed",
        body: "T-test comparing driver lap times, T-test comparing team pit-stop durations, Z-test (large sample), Chi-square goodness-of-fit, and one-way ANOVA across multiple drivers.",
      },
      {
        heading: "Decision rule",
        body: "Reject H₀ if p-value < 0.05 (95 % confidence level). Each card shows the test statistic, p-value, and a plain-English decision.",
      },
      {
        heading: "Example interpretation",
        body: 'If the driver T-test returns p = 0.003, the decision is "Reject H₀ — lap times differ significantly between VER and LEC at Monaco 2024."',
      },
    ],
  },
];

function Badge({ method }) {
  const colors = {
    GET: "bg-green-500/20 text-green-400 border-green-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return (
    <span className={`rounded border px-2 py-0.5 text-xs font-bold ${colors[method] || "bg-white/10 text-white/60"}`}>
      {method}
    </span>
  );
}

export default function DocsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-white/10 px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-f1red">Documentation</p>
          <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">How the Platform Works</h1>
          <p className="mt-4 max-w-2xl text-base text-white/55 leading-relaxed">
            A complete guide to the Formula 1 Statistical Analysis Platform — from selecting a race
            to reading the statistical output.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Overview", "Usage Guide", "Analysis Modules", "API Reference"].map((s) => (
              <a
                key={s}
                href={`#${s.toLowerCase().replace(/ /g, "-")}`}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12 space-y-16">
        {/* Overview */}
        <section id="overview">
          <h2 className="text-2xl font-bold text-white">Overview</h2>
          <div className="mt-4 h-px bg-white/10" />
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/65">
            <p>
              The <strong className="text-white">Formula 1 Statistical Analysis Platform</strong> is a
              full-stack web application that fetches real race telemetry via the{" "}
              <strong className="text-white">FastF1</strong> library and applies a comprehensive
              suite of probability and statistics to it — all in your browser with no installation
              required.
            </p>
            <p>
              The backend is a <strong className="text-white">FastAPI</strong> service (Python) that
              handles data loading, statistical computation, and exposes a REST API. The frontend is
              a <strong className="text-white">React + Vite</strong> single-page application styled
              with Tailwind CSS and using Plotly.js for interactive charts.
            </p>
            <p>
              The platform covers data from <strong className="text-white">2018 through 2025</strong>{" "}
              (all seasons supported by the FastF1 data pipeline). Race sessions are cached on the
              server after the first fetch to avoid repeated downloads.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: "Frontend", value: "React 18 + Vite + Tailwind + Plotly.js" },
              { label: "Backend", value: "Python 3.11 + FastAPI + FastF1 + scipy" },
              { label: "Deployment", value: "Docker · Google Cloud Run · Port 8080" },
            ].map(({ label, value }) => (
              <div key={label} className="card p-4">
                <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
                <p className="mt-1 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Usage Guide */}
        <section id="usage-guide">
          <h2 className="text-2xl font-bold text-white">Usage Guide</h2>
          <div className="mt-4 h-px bg-white/10" />
          <ol className="mt-6 space-y-6">
            {[
              {
                step: 1,
                title: "Go to the Analyze page",
                body: 'Click "Start Analysis" from the home page or navigate to /analyze directly. The form loads available seasons automatically.',
              },
              {
                step: 2,
                title: "Select a Season",
                body: "Use the Season dropdown to choose a year between 2018 and 2025. The Race dropdown will refresh with all Grands Prix for that year.",
              },
              {
                step: 3,
                title: "Select a Race",
                body: "Pick any Grand Prix from the list. Once selected, the system fetches available drivers and team names for that specific session.",
              },
              {
                step: 4,
                title: "Choose Drivers",
                body: 'Select your primary driver and a different comparison driver. The comparison driver list automatically excludes the primary selection to prevent duplicates.',
              },
              {
                step: 5,
                title: "Choose Teams",
                body: "Select two constructors for the pit-stop comparison (used in the T-test under Hypothesis Testing).",
              },
              {
                step: 6,
                title: 'Click "Run Statistical Analysis"',
                body: "The analysis runs synchronously on the server. When complete, you are automatically redirected to the Results Dashboard.",
              },
              {
                step: 7,
                title: "Browse the Results Dashboard",
                body: "Four tabs group the results: Descriptive Statistics, Correlation & Regression, Probability Distributions, and Hypothesis Testing. Switch tabs to explore each module.",
              },
              {
                step: 8,
                title: "Run a new analysis",
                body: 'Use the "Run New Analysis" button at the bottom of the Results page to return to the form with your previous configuration pre-filled.',
              },
            ].map(({ step, title, body }) => (
              <li key={step} className="flex gap-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-f1red/40 bg-f1red/10 text-sm font-bold text-f1red">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/55 leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 card p-5 border-yellow-500/20 bg-yellow-500/5">
            <p className="text-sm font-semibold text-yellow-400">Tip — Try the Example</p>
            <p className="mt-1 text-sm text-white/55">
              The <strong className="text-white">Monaco 2024</strong> example (VER vs LEC, Red Bull vs Ferrari)
              is pre-configured on the home page. It loads cached data so there is no wait for downloads.
            </p>
          </div>
        </section>

        {/* Analysis Modules */}
        <section id="analysis-modules">
          <h2 className="text-2xl font-bold text-white">Analysis Modules</h2>
          <div className="mt-4 h-px bg-white/10" />
          <div className="mt-6 space-y-8">
            {modules.map(({ id, title, icon, color, sections }) => (
              <div key={id} className="card p-6" id={id}>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                    style={{ background: `${color}18`, border: `1px solid ${color}35` }}
                  >
                    {icon}
                  </div>
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
                <div className="mt-4 space-y-4">
                  {sections.map(({ heading, body }) => (
                    <div key={heading}>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
                        {heading}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* API Reference */}
        <section id="api-reference">
          <h2 className="text-2xl font-bold text-white">API Reference</h2>
          <div className="mt-4 h-px bg-white/10" />
          <p className="mt-4 text-sm text-white/55">
            The platform exposes a REST API that the React frontend consumes. You can also call it
            directly or use the interactive Swagger UI at{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/80">/docs</code>{" "}
            (served by FastAPI automatically).
          </p>

          <div className="mt-6 space-y-4">
            {apiEndpoints.map(({ method, path, desc, response }) => (
              <div key={path} className="card p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge method={method} />
                  <code className="text-sm font-bold text-white">{path}</code>
                </div>
                <p className="mt-2 text-sm text-white/55">{desc}</p>
                <div className="mt-3 rounded-lg bg-black/40 px-4 py-3">
                  <code className="text-xs text-white/50 break-all">{response}</code>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 card p-5 border-blue-500/20 bg-blue-500/5">
            <p className="text-sm font-semibold text-blue-400">Interactive API Docs</p>
            <p className="mt-1 text-sm text-white/55">
              FastAPI automatically generates Swagger UI at{" "}
              <code className="rounded bg-white/10 px-1 text-xs text-white/80">/docs</code> and
              ReDoc at{" "}
              <code className="rounded bg-white/10 px-1 text-xs text-white/80">/redoc</code>.
              These endpoints let you try every route directly from your browser.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <h2 className="text-2xl font-bold text-white">FAQ</h2>
          <div className="mt-4 h-px bg-white/10" />
          <div className="mt-6 space-y-4">
            {[
              {
                q: "Why does the first analysis for a race take longer?",
                a: "FastF1 downloads and caches the session telemetry on the first request. Subsequent analyses for the same race use the local cache and are much faster.",
              },
              {
                q: "What data does FastF1 provide?",
                a: "FastF1 fetches lap-by-lap timing data, sector times, pit stop records, driver metadata, and team information from the official F1 timing feed and Ergast API.",
              },
              {
                q: "What does the analysis run on the server vs the browser?",
                a: "All statistical computation (scipy, numpy, pandas) happens on the Python backend. The browser only renders the charts and result JSON returned by the API.",
              },
              {
                q: "Are results stored permanently?",
                a: "No. Results are held in server memory for the current process lifetime only. Restarting the server clears all cached results (but not the FastF1 race data cache on disk).",
              },
              {
                q: "Can I compare drivers across different races?",
                a: "Not directly — the current analysis is scoped to a single race session. You can run multiple analyses and compare the summary statistics manually.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="card group p-5 cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-white list-none">
                  {q}
                  <span className="ml-3 shrink-0 text-white/30 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="card p-8 text-center">
          <h3 className="text-xl font-bold text-white">Ready to try it?</h3>
          <p className="mt-2 text-sm text-white/50">Run a live analysis on any F1 race from 2018 to 2025.</p>
          <button
            onClick={() => navigate("/analyze")}
            className="mt-5 rounded-xl bg-f1red px-8 py-3 font-bold text-white hover:opacity-90 transition-opacity"
          >
            Start Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
