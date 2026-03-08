import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "📊",
    title: "Descriptive Statistics",
    desc: "Histogram, box plot, mean, variance, standard deviation, skewness and kurtosis derived from real lap time telemetry.",
    color: "#e10600",
  },
  {
    icon: "📈",
    title: "Correlation & Regression",
    desc: "Pearson correlation coefficient and linear regression to model how lap times trend across a race distance.",
    color: "#3ac47d",
  },
  {
    icon: "🔔",
    title: "Probability Distributions",
    desc: "Fit Normal, Binomial, Poisson, and Exponential distributions to lap times, pit stops, podiums, and mechanical failures.",
    color: "#f3c623",
  },
  {
    icon: "⚖️",
    title: "Hypothesis Testing",
    desc: "T-tests, Z-tests, Chi-square, and ANOVA to statistically compare two drivers or two teams at a given significance level.",
    color: "#5b9bd5",
  },
];

const steps = [
  {
    num: "01",
    title: "Select Season & Race",
    desc: "Choose any F1 season from 2018 to 2025 and the specific Grand Prix you want to study.",
  },
  {
    num: "02",
    title: "Pick Drivers & Teams",
    desc: "Select a primary driver, a comparison driver, and two constructors for the pit-stop comparison.",
  },
  {
    num: "03",
    title: "Run the Analysis",
    desc: "The engine fetches FastF1 telemetry and computes the full statistical suite automatically in the background.",
  },
  {
    num: "04",
    title: "Explore the Results",
    desc: "Browse interactive Plotly charts and statistical outputs across four dedicated analysis tabs.",
  },
];

const mockBars = [40, 65, 90, 70, 55, 80, 95, 60, 75, 50, 85, 70];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-24 md:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_rgba(225,6,0,0.18),_transparent)]" />
        <div className="mx-auto max-w-5xl text-center relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-f1red/30 bg-f1red/10 px-4 py-1.5 text-sm text-f1red">
            <span className="h-2 w-2 rounded-full bg-f1red animate-pulse" />
            Real FastF1 telemetry · Seasons 2018 – 2025
          </div>

          <h1 className="mt-3 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            Formula 1
            <span className="block text-f1red">Statistical Analysis</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
            Apply probability theory and inferential statistics to real Formula 1 race data.
            Explore distributions, regression models, and hypothesis tests — all from your browser.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/analyze")}
              className="rounded-xl bg-f1red px-8 py-4 text-base font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-f1red/20"
            >
              Start Analysis
            </button>
            <button
              onClick={() => navigate("/analyze?example=1")}
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              View Example — Monaco 2024
            </button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-white/35">
            <span>8 seasons of data</span>
            <span className="hidden md:inline">·</span>
            <span>4 statistical modules</span>
            <span className="hidden md:inline">·</span>
            <span>Interactive charts</span>
            <span className="hidden md:inline">·</span>
            <span>No sign-up required</span>
          </div>
        </div>
      </section>

      {/* ── Dashboard preview mockup ──────────────────────────────────────── */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="card overflow-hidden border-white/15 shadow-2xl shadow-black/60">
            {/* browser chrome */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-black/50 px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/60" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <span className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-4 flex-1 rounded-md bg-white/8 px-3 py-1 text-xs text-white/35">
                f1-analysis.app/results/a3f9…
              </span>
            </div>

            {/* mock page header */}
            <div className="border-b border-white/10 bg-f1black px-6 py-4">
              <p className="text-xs text-f1red font-semibold uppercase tracking-widest">Results Dashboard</p>
              <p className="mt-0.5 text-sm text-white/50">2024 Monaco Grand Prix · VER vs LEC · Red Bull vs Ferrari</p>
            </div>

            <div className="bg-f1black p-6">
              {/* stat cards */}
              <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Analyzed Laps", "57"],
                  ["Mean Lap Time", "76.4 s"],
                  ["Std Deviation", "1.21 s"],
                  ["Pearson r", "0.82"],
                ].map(([title, value]) => (
                  <div key={title} className="rounded-lg border border-white/10 bg-f1gray p-3">
                    <p className="text-xs text-white/45">{title}</p>
                    <p className="mt-1 text-xl font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* mock tab bar */}
              <div className="mb-4 flex flex-wrap gap-2">
                {["Descriptive Statistics", "Correlation & Regression", "Probability Distributions", "Hypothesis Testing"].map(
                  (t, i) => (
                    <span
                      key={t}
                      className={`rounded px-3 py-1 text-xs font-semibold ${
                        i === 0
                          ? "bg-f1red text-white"
                          : "border border-white/15 text-white/40"
                      }`}
                    >
                      {t}
                    </span>
                  )
                )}
              </div>

              {/* mock charts */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* histogram mockup */}
                <div className="rounded-lg border border-white/10 bg-f1gray/60 p-4">
                  <p className="mb-3 text-xs text-white/40">Lap Time Distribution — Histogram</p>
                  <div className="flex h-32 items-end gap-1">
                    {mockBars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t"
                        style={{
                          height: `${h}%`,
                          background: `rgba(225,6,0,${0.35 + i * 0.04})`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-white/25">
                    <span>74.0 s</span>
                    <span>76.5 s</span>
                    <span>79.0 s</span>
                  </div>
                </div>

                {/* box plot mockup */}
                <div className="rounded-lg border border-white/10 bg-f1gray/60 p-4">
                  <p className="mb-3 text-xs text-white/40">Box Plot — Driver Comparison</p>
                  <div className="flex flex-col justify-center gap-4 h-32">
                    {[
                      { label: "VER", left: "12%", right: "22%", med: "42%", color: "#e10600" },
                      { label: "LEC", left: "18%", right: "25%", med: "48%", color: "#ffffff" },
                    ].map(({ label, left, right, med, color }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="w-8 text-xs text-white/40">{label}</span>
                        <div className="relative flex-1 h-5 flex items-center">
                          <div
                            className="absolute h-4 rounded border"
                            style={{
                              left,
                              right,
                              borderColor: color,
                              background: `${color}25`,
                            }}
                          />
                          <div
                            className="absolute w-0.5 h-5"
                            style={{ left: med, background: color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-white/25">
            Preview — Results Dashboard · 2024 Monaco Grand Prix · VER vs LEC
          </p>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white">How it works</h2>
          <p className="mt-2 text-center text-sm text-white/45">
            Four steps from race selection to full statistical insights
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="card p-5">
                <span className="text-4xl font-black text-f1red/30">{num}</span>
                <h3 className="mt-2 font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analysis Modules ─────────────────────────────────────────────── */}
      <section id="features" className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white">Analysis Modules</h2>
          <p className="mt-2 text-center text-sm text-white/45">
            Comprehensive statistics across four independent tabs
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {features.map(({ icon, title, desc, color }) => (
              <div
                key={title}
                className="card flex gap-4 p-6 hover:border-white/20 transition-colors"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ background: `${color}18`, border: `1px solid ${color}35` }}
                >
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/50">
            Free · No account required · Open source
          </div>
          <h2 className="text-3xl font-bold text-white">Ready to dig into the data?</h2>
          <p className="mt-3 text-white/45">
            Select a race, pick your drivers, and get a full statistical report in seconds.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/analyze")}
              className="rounded-xl bg-f1red px-8 py-4 font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-f1red/20"
            >
              Start Analysis
            </button>
            <button
              onClick={() => navigate("/docs")}
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Read the Docs
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-5 w-1 rounded bg-f1red" />
              <div className="h-3 w-1 rounded bg-f1red/40" />
            </div>
            <span className="text-sm font-bold text-white/60">F1 Statistical Analysis Platform</span>
          </div>
          <p className="text-xs text-white/25">
            Data via FastF1 · Built with React + FastAPI · Seasons 2018–2025
          </p>
        </div>
      </footer>
    </div>
  );
}
