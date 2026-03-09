# F1 Statistical Analysis Platform — Statistics & Probability Documentation

> **Note:** This is a temporary reference document summarising the statistical and probabilistic concepts implemented in the platform.

---

## Overview

The platform applies five core areas of statistics and probability to real Formula 1 race data (2018–2025). The primary subject of analysis is **lap times** (the main random variable), enriched by pit stop data, podium records, and mechanical failure history. All computations run on actual telemetry fetched from FastF1 and the Jolpica API.

---

## 1. Descriptive Statistics

**What it covers:** Complete single-variable summary of a driver's lap times in a race.

**Random Variable:** X = Lap time (seconds)

| Metric | Formula | Interpretation in F1 Context |
|--------|---------|-------------------------------|
| Count (n) | Number of finite lap times | Laps actually analysed |
| Mean (μ) | μ = Σxᵢ / n | Average pace |
| Variance (σ²) | σ² = Σ(xᵢ − μ)² / n | Pace consistency (ddof=0, population) |
| Std Deviation (σ) | σ = √σ² | Spread of lap times in seconds |
| Skewness | E[(X−μ)³] / σ³ | Asymmetry — positive skew = occasional slow laps (traffic, VSC) |
| Excess Kurtosis | E[(X−μ)⁴] / σ⁴ − 3 | Tail heaviness — high kurtosis = rare extreme outlier laps |
| Min / Max | — | Fastest and slowest recorded laps |

**Visualisations:**
- **Histogram** — Bin count via `np.histogram(..., bins="auto")`. Reveals the shape of the lap time distribution.
- **Box Plot** — Shows median, IQR (Q1–Q3), whiskers, and outliers. Useful for comparing pace distribution across drivers.

**Interpretation rule:**
- `|skewness| < 0.7` AND `σ < 2.0 sec` → distribution is approximately normal with low variance
- Otherwise → wider spread or asymmetry (variable conditions, safety cars, or driver errors)

---

## 2. Random Variables & KDE

**What it covers:** Formal random variable treatment of lap times, plus a non-parametric density estimate.

| Quantity | Definition | Implementation |
|----------|-----------|----------------|
| E[X] | Expected lap time | `np.mean(arr)` |
| Var(X) | Population variance | `np.var(arr, ddof=0)` |
| PDF (KDE) | Non-parametric density | `scipy.stats.gaussian_kde(arr)`, 250 domain points from (min − 1.5) to (max + 1.5) s |
| Cov(X, Y) | Driver-to-driver covariance | `np.cov(a[:n], b[:n], ddof=0)[0, 1]` |

**KDE:** No distribution assumption is made — the kernel smoother estimates the true density from data.

**Covariance Cov(X, Y):** Measures whether two drivers' lap times move together (shared track conditions, safety car periods, etc.). Formula: Cov(X,Y) = E[(X−μₓ)(Y−μᵧ)].

---

## 3. Correlation & Regression

**What it covers:** Quantifies pace evolution across a race stint.

**Variables:**
- X = Lap Number (predictor)
- Y = Lap Time in seconds (response)

| Metric | Formula | F1 Meaning |
|--------|---------|------------|
| Pearson r | r = Cov(X,Y) / (σₓ · σᵧ) | Linear relationship strength, −1 to +1 |
| p-value | Two-tailed t-test on r | Statistical significance of correlation |
| Slope (β) | β = Σ[(xᵢ−x̄)(yᵢ−ȳ)] / Σ[(xᵢ−x̄)²] | Rate of lap-time change per lap |
| Intercept (α) | α = ȳ − β · x̄ | Baseline predicted lap time |
| Regression equation | LapTime = α + β · LapNumber | Full fitted linear model |

**Interpretation:**
- β > 0 → lap times increasing = **tyre degradation**
- β < 0 → lap times decreasing = **pace improvement** (fuel burn-off, tyre warm-up)

**Visualisation:** Scatter plot of observed laps overlaid with the fitted regression line (200 computed points).

---

## 4. Probability Distributions

**What it covers:** Four probability distributions, each fitted to a different F1 phenomenon.

---

### 4a. Normal Distribution

- **Fitted to:** Driver lap times in a race
- **Parameters:** μ, σ via Maximum Likelihood Estimation (`scipy.stats.norm.fit`)
- **Formula:** f(x) = 1/(σ√2π) · exp(−(x−μ)²/(2σ²))
- **Domain:** 250 points from (min − 1.5) to (max + 1.5) seconds
- **F1 Interpretation:** Under stable conditions (no safety cars, no errors), lap times approximate a normal distribution centred at the driver's mean pace.

---

### 4b. Binomial Distribution

- **Fitted to:** Season-level podium outcomes
- **Parameters:**
  - n = total races in the season
  - p = podiums / total races (empirical success probability)
- **Formula:** P(X=k) = C(n,k) · pᵏ · (1−p)^(n−k)
- **PMF domain:** k = 0, 1, ..., n
- **F1 Interpretation:** Models the probability of achieving exactly k podiums across the season, treating each race as a Bernoulli trial with estimated probability p.

---

### 4c. Poisson Distribution

- **Fitted to:** Pit stop counts per driver per race
- **Parameter:** λ = mean(pit_stop_counts)
- **Formula:** P(X=k) = (λᵏ · e^−λ) / k!
- **PMF domain:** k = 0, 1, ..., 11
- **F1 Interpretation:** Models the number of pit stops as a count process — appropriate because pit stops are discrete, non-negative, and relatively rare.

---

### 4d. Exponential Distribution

- **Fitted to:** Intervals (in race rounds) between mechanical failures / DNFs
- **Parameters:**
  - λ = 1 / mean(failure_intervals) if failures exist; fallback = 1 / mean(lap time delta)
  - Scale = 1/λ (mean of the distribution)
- **Formula:** f(x) = λ · e^(−λx),  x ≥ 0
- **F1 Interpretation:** Models the waiting time between mechanical DNFs. The memoryless property of the exponential distribution reflects that past reliability does not alter the instantaneous failure rate.

---

**Visualisation:** All four curves overlaid on a single chart for direct shape/scale comparison.

---

## 5. Hypothesis Testing

**Global significance level:** α = 0.05

**Decision rule:** Reject H₀ if p-value < 0.05; otherwise fail to reject.

---

### Test 1 — Z-Test: Driver Pace Comparison

| Item | Detail |
|------|--------|
| **H₀** | Mean lap time of selected driver = mean lap time of comparison driver |
| **H₁** | They differ |
| **Statistic** | Z = (μ₁ − μ₂) / (σ_pop / √n₁), where σ_pop = std(comparison driver) |
| **P-value** | 2 · (1 − Φ(\|Z\|)) — two-tailed |
| **Assumption** | Population std dev approximated from comparison driver |
| **Requirement** | Both samples n > 2 |
| **F1 Question** | "Is the selected driver statistically faster or slower than the comparison driver?" |

---

### Test 2 — Welch's t-Test: Team Pit Stop Comparison

| Item | Detail |
|------|--------|
| **H₀** | Mean pit stop time of team 1 = mean pit stop time of team 2 |
| **H₁** | They differ |
| **Statistic** | t = (μ₁ − μ₂) / √(s₁²/n₁ + s₂²/n₂) |
| **Variant** | Welch's — does **not** assume equal variances (appropriate since teams use different equipment) |
| **P-value** | Two-tailed via `scipy.stats.ttest_ind(..., equal_var=False)` |
| **Requirement** | Both groups n > 1 |
| **F1 Question** | "Does one team have a statistically faster pit crew than the other?" |

---

### Test 3 — Chi-Square Goodness-of-Fit: Normality of Lap Times

| Item | Detail |
|------|--------|
| **H₀** | Lap times follow a normal distribution |
| **H₁** | They do not |
| **Procedure** | 1. Bin laps into min(10, max(4, n//5)) bins. 2. Compute expected frequencies under fitted normal CDF. 3. χ² = Σ((Oᵢ − Eᵢ)² / Eᵢ) |
| **Degrees of freedom** | df = bins − 1 − 2 (subtracting 2 for estimated μ and σ) |
| **P-value** | 1 − CDF(χ², df) |
| **Requirement** | n ≥ 12 laps |
| **F1 Question** | "Are this driver's lap times actually normally distributed, or does real-world noise (SC, traffic, errors) break normality?" |

---

### Test 4 — One-Way ANOVA: Multi-Driver Mean Comparison

| Item | Detail |
|------|--------|
| **H₀** | μ₁ = μ₂ = ... = μₖ (all drivers share the same mean lap time) |
| **H₁** | At least one driver's mean differs |
| **Statistic** | F = Between-group variance / Within-group variance |
| **Groups** | Up to 6 drivers with ≥ 3 laps each |
| **P-value** | Upper tail of the F-distribution via `scipy.stats.f_oneway` |
| **Additional output** | Group means (μ) per driver |
| **F1 Question** | "Across all drivers in this race, is there a statistically significant difference in mean pace?" |

---

## Complete Metrics Reference

| Metric | Formula | Data Source | Precision |
|--------|---------|-------------|-----------|
| Count | n | Lap times | Integer |
| Mean | Σ(xᵢ)/n | Lap times | 4 d.p. |
| Variance | Σ(xᵢ−μ)²/n | Lap times | 4 d.p. |
| Std Dev | √variance | Lap times | 4 d.p. |
| Skewness | E[(X−μ)³]/σ³ | Lap times | 4 d.p. |
| Kurtosis | E[(X−μ)⁴]/σ⁴ − 3 | Lap times | 4 d.p. |
| Pearson r | Cov(X,Y)/(σₓσᵧ) | Lap #, lap time | 5 d.p. |
| r p-value | Two-tailed t | — | 6 d.p. |
| Regression slope (β) | Σ(ΔxΔy)/Σ(Δx²) | Lap #, lap time | 6 d.p. |
| Regression intercept (α) | ȳ − β·x̄ | Lap #, lap time | 6 d.p. |
| Covariance | E[(X−μₓ)(Y−μᵧ)] | Driver A & B laps | 4 d.p. |
| Z-statistic | (μ₁−μ₂)/(σ/√n) | Lap times | 5 d.p. |
| Z p-value | 2·(1−Φ(\|Z\|)) | — | 6 d.p. |
| t-statistic | (μ₁−μ₂)/√(s₁²/n₁+s₂²/n₂) | Pit stop times | 5 d.p. |
| t p-value | Welch t-distribution | — | 6 d.p. |
| χ² statistic | Σ((O−E)²/E) | Lap times vs Normal | 5 d.p. |
| χ² p-value | 1 − CDF(χ², df) | — | 6 d.p. |
| F-statistic | Between/Within variance | Multi-driver laps | 5 d.p. |
| F p-value | Upper tail F-dist | — | 6 d.p. |
| Normal μ | Sample mean (MLE) | Lap times | 4 d.p. |
| Normal σ | Sample std dev (MLE) | Lap times | 4 d.p. |
| Binomial n | Total races | Season data | Integer |
| Binomial p | Podiums / races | Season data | 4 d.p. |
| Poisson λ | Mean pit stops | Pit data | 4 d.p. |
| Exponential λ | 1 / mean interval | Failure intervals | 4 d.p. |
| Exponential scale | Mean interval | Failure intervals | 4 d.p. |

---

## Data Flow

```
User Selection (Season → Race → Drivers → Teams)
        ↓
FastAPI POST /analyze
        ↓
F1DataLoader
  ├─ FastF1   → Lap times, pit stop durations, DNF records
  └─ Jolpica  → Season results (podium counts)
        ↓
AnalysisEngine.run()
  ├─ descriptive_statistics()     → shape, spread, moments
  ├─ random_variable_analysis()   → E[X], Var(X), KDE, Cov
  ├─ correlation_regression()     → Pearson r, OLS regression
  ├─ probability_distributions()  → Normal, Binomial, Poisson, Exponential
  └─ hypothesis_testing()         → Z-test, t-test, Chi-square, ANOVA
        ↓
JSON response → React 4-tab UI with Plotly.js charts + formula blocks
```

---

## What Each Statistical Concept Answers in F1

| Concept | F1 Question It Answers |
|---------|------------------------|
| Mean & Std Dev | How fast and how consistent is a driver? |
| Skewness | Are slow outlier laps (SC, errors) pulling the distribution? |
| Kurtosis | Are there rare extreme laps or is the distribution flat? |
| KDE / PDF | What is the actual probability density of a given lap time? |
| Covariance | Do two drivers' laps correlate (shared track conditions)? |
| Pearson r | How strong is tyre/fuel degradation over the stint? |
| Regression slope | How many tenths per lap does pace worsen? |
| Normal dist | What lap time range is expected with what probability? |
| Binomial dist | What is the probability of k podiums over the season? |
| Poisson dist | How likely are 0, 1, or 2 pit stops in a race? |
| Exponential dist | How many races between the next mechanical failure? |
| Z-test | Is the driver meaningfully faster than their rival? |
| Welch's t-test | Does one team's pit crew have a significant speed advantage? |
| Chi-square | Does the normality assumption actually hold for this driver? |
| ANOVA | Across the full grid, who is statistically distinct in pace? |

---

*Generated: 2026-03-09 | Platform: F1 Statistical Analysis Platform | Data: 2018–2025 via FastF1 & Jolpica API*
