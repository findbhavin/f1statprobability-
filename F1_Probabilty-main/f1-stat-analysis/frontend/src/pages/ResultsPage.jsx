import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BoxPlotChart from "../charts/BoxPlotChart";
import DistributionCurveChart from "../charts/DistributionCurveChart";
import HistogramChart from "../charts/HistogramChart";
import LineChart from "../charts/LineChart";
import ScatterRegressionChart from "../charts/ScatterRegressionChart";
import FormulaBlock from "../components/FormulaBlock";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { fetchResults } from "../services/api";

const tabs = [
  "Descriptive Statistics",
  "Correlation & Regression",
  "Probability Distributions",
  "Hypothesis Testing",
];

export default function ResultsPage() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [tab, setTab] = useState(tabs[0]);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchResults(jobId);
        // The backend stores "error" status when analysis fails — surface the
        // message rather than letting the page crash on missing result keys.
        if (data.status === "error") {
          setError(data.error || "Analysis failed on the server.");
          return;
        }
        if (data.status !== "completed") {
          setError("Analysis is not completed yet. Please try again.");
          return;
        }
        if (!data.result) {
          setError("Server returned an empty result. Please run the analysis again.");
          return;
        }
        setPayload(data.result);
      } catch (e) {
        setError(e?.response?.data?.detail || e.message || "Failed to load results.");
      }
    }
    load();
  }, [jobId]);

  // Guard every section against a partially-formed payload so a missing field
  // doesn't crash the whole page.
  const meta = payload?.meta ?? {};
  const ds = payload?.descriptive_statistics;
  const rv = payload?.random_variables;
  const cr = payload?.correlation_regression;
  const pd = payload?.probability_distributions;
  const ht = payload?.hypothesis_testing;

  const distTraces = useMemo(() => {
    if (!pd) return [];
    const safe = (obj) => obj?.curve ?? { x: [], y: [] };
    return [
      { x: safe(pd.normal).x, y: safe(pd.normal).y, mode: "lines", name: "Normal", line: { color: "#e10600", width: 3 } },
      { x: safe(pd.binomial).x, y: safe(pd.binomial).y, mode: "lines+markers", name: "Binomial", line: { color: "#ffffff" } },
      { x: safe(pd.poisson).x, y: safe(pd.poisson).y, mode: "lines+markers", name: "Poisson", line: { color: "#f3c623" } },
      { x: safe(pd.exponential).x, y: safe(pd.exponential).y, mode: "lines", name: "Exponential", line: { color: "#3ac47d", width: 3 } },
    ];
  }, [pd]);

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <div className="card mx-auto max-w-xl p-6 border-red-500/30 bg-red-500/5">
          <p className="text-sm font-semibold text-red-400">Analysis Error</p>
          <p className="mt-2 text-sm text-white/70">{error}</p>
          <button
            className="mt-4 rounded-lg bg-f1red px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            onClick={() => navigate("/analyze")}
          >
            Back to Analysis
          </button>
        </div>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-f1red border-t-transparent mx-auto" />
          <p className="text-sm text-white/60">Loading results…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Results Dashboard"
          subtitle={`${meta.season ?? ""} ${meta.race ?? ""} | Driver: ${meta.driver ?? "—"} | vs ${meta.comparison_driver ?? "N/A"} | ${meta.team1 ?? ""} vs ${meta.team2 ?? ""}`}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard title="Analyzed Laps" value={meta.laps_analyzed ?? "—"} />
          <StatCard title="Mean Lap Time" value={ds?.summary?.mean != null ? `${ds.summary.mean}s` : "—"} />
          <StatCard title="Std Deviation" value={ds?.summary?.std_dev != null ? `${ds.summary.std_dev}s` : "—"} />
          <StatCard title="Correlation (r)" value={cr?.correlation_coefficient ?? "—"} subtitle={cr?.equation} />
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((name) => (
            <button
              key={name}
              onClick={() => setTab(name)}
              className={`tab-btn ${tab === name ? "tab-btn-active" : "tab-btn-inactive"}`}
            >
              {name}
            </button>
          ))}
        </div>

        {tab === "Descriptive Statistics" && ds ? (
          <section className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="card p-4"><HistogramChart values={ds.histogram?.values ?? []} /></div>
              <div className="card p-4"><BoxPlotChart values={ds.boxplot?.values ?? []} /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <FormulaBlock title="Mean" formula={ds.formulas?.mean} />
              <FormulaBlock title="Variance" formula={ds.formulas?.variance} />
              <FormulaBlock title="Standard Deviation" formula={ds.formulas?.std_dev} />
            </div>
            <p className="card p-4 text-sm text-white/80">{ds.interpretation}</p>
            {rv && (
              <p className="card p-4 text-sm text-white/80">
                Random Variable: {rv.definition}. E[X] = {rv.expectation}, Var(X) = {rv.variance}, Covariance with {rv.comparison_driver || "comparison driver"} = {rv.covariance_with_comparison_driver ?? "N/A"}
              </p>
            )}
          </section>
        ) : null}

        {tab === "Correlation & Regression" && cr ? (
          <section className="space-y-5">
            <div className="card p-4">
              <ScatterRegressionChart scatter={cr.scatter} line={cr.regression_line} />
            </div>
            <div className="card p-4">
              <LineChart
                title="Lap Number vs Lap Time"
                x={cr.scatter?.x ?? []}
                y={cr.scatter?.y ?? []}
                xTitle="Lap Number"
                yTitle="Lap Time (s)"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormulaBlock title="Correlation Formula" formula={cr.formulas?.correlation} note={`r = ${cr.correlation_coefficient}, p = ${cr.correlation_p_value}`} />
              <FormulaBlock title="Regression Formula" formula={cr.formulas?.regression} note={cr.equation} />
            </div>
            <p className="card p-4 text-sm text-white/80">{cr.interpretation}</p>
          </section>
        ) : null}

        {tab === "Probability Distributions" && pd ? (
          <section className="space-y-5">
            <div className="card p-4">
              <DistributionCurveChart title="Distribution Curves" traces={distTraces} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormulaBlock title="Normal Distribution" formula={pd.normal?.formula} note={`mu = ${pd.normal?.parameters?.mu}, sigma = ${pd.normal?.parameters?.sigma}`} />
              <FormulaBlock title="Binomial Distribution" formula={pd.binomial?.formula} note={`n = ${pd.binomial?.parameters?.n}, p = ${pd.binomial?.parameters?.p}`} />
              <FormulaBlock title="Poisson Distribution" formula={pd.poisson?.formula} note={`lambda = ${pd.poisson?.parameters?.lambda}`} />
              <FormulaBlock title="Exponential Distribution" formula={pd.exponential?.formula} note={`lambda = ${pd.exponential?.parameters?.lambda}`} />
            </div>
            <p className="card p-4 text-sm text-white/80">Distribution analysis models podium outcomes (Binomial), pit-stop count (Poisson), lap time spread (Normal), and failure intervals (Exponential).</p>
          </section>
        ) : null}

        {tab === "Hypothesis Testing" && ht ? (
          <section className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(ht)
                .filter(([k]) => ["z_test", "t_test", "chi_square", "anova"].includes(k))
                .map(([name, test]) => (
                  <div key={name} className="card p-4">
                    <p className="text-sm font-semibold text-f1red uppercase">{name.replace("_", " ")}</p>
                    {test.error ? (
                      <p className="mt-2 text-sm text-white/75">{test.error}</p>
                    ) : (
                      <>
                        <p className="mt-2 text-sm text-white/75">Statistic: {test.statistic}</p>
                        <p className="text-sm text-white/75">p-value: {test.p_value}</p>
                        <p className="text-sm text-white/75">Decision: {test.decision}</p>
                      </>
                    )}
                  </div>
                ))}
            </div>
            <p className="card p-4 text-sm text-white/80">{ht.decision_rule}</p>
          </section>
        ) : null}

        <button
          className="mt-8 rounded-lg border border-white/20 px-5 py-2 text-sm hover:bg-white/10"
          onClick={() => navigate("/analyze", { state: location.state })}
        >
          Run New Analysis
        </button>
      </div>
    </main>
  );
}
