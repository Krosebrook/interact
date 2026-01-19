# Advanced A/B Testing Analytics

## Overview
The A/B Testing system now supports sophisticated statistical methods including Bayesian analysis, multi-variate testing (MVT), and automated anomaly detection for faster, more reliable experimentation.

## Features

### 1. Bayesian Statistics

#### What It Solves
Traditional frequentist testing requires large sample sizes and fixed horizons. Bayesian analysis allows:
- **Faster decisions** with smaller samples
- **Continuous monitoring** without inflating false positives
- **Probability statements** that are easier to interpret

#### How It Works
- Uses Beta-Binomial conjugate priors for conversion rates
- Prior: Beta(1, 1) - uniform prior (no assumptions)
- Posterior updates continuously as data arrives
- Monte Carlo simulation (10,000 samples) calculates probability each variant is best

#### Key Metrics
- **Expected Conversion Rate**: Posterior mean (most likely true rate)
- **95% Credible Interval**: Range containing true rate with 95% probability
- **Probability to be Best**: Likelihood this variant is truly superior (not p-value!)

#### When to Use
- Early in test (< 100 samples per variant) for directional signals
- Need to make decisions before reaching frequentist significance
- Want probabilistic statements ("90% likely variant A is best")

#### Interpretation
- **> 95% probability**: Strong evidence to roll out
- **80-95%**: Moderate evidence, consider extending test
- **< 80%**: Inconclusive, needs more data

### 2. Multi-Variate Testing (MVT)

#### What It Solves
Traditional A/B testing assumes variants are independent. MVT detects:
- **Synergistic effects**: Variants that work better together
- **Antagonistic effects**: Variants that interfere with each other
- **Optimal combinations**: Which strategies should be bundled

#### How It Works
- Calculates expected additive effect: `(Variant A + Variant B) / 2`
- Compares to actual combined performance
- Interaction effect = Actual - Expected
- Requires 3+ variants to detect interactions

#### Key Metrics
- **Expected Combined**: Baseline if variants don't interact
- **Actual Combined**: Observed performance
- **Interaction Effect**: Deviation from additivity
  - **> +5%**: Positive synergy (bundle these!)
  - **< -5%**: Negative synergy (avoid combining)
  - **-5% to +5%**: Neutral (variants are independent)

#### When to Use
- Testing 3+ variants simultaneously
- Evaluating multi-feature rollouts
- Optimizing intervention bundles

#### Example
```
Variant A: +10% conversion
Variant B: +12% conversion
Expected Combined: 11%
Actual Combined: 16%
→ Interaction Effect: +5% (positive synergy!)
```

### 3. Anomaly Detection

#### What It Solves
A/B tests can be invalidated by:
- Implementation bugs causing sudden drops
- External events causing unusual spikes
- Gradual drift indicating sample bias

Automated monitoring catches these issues in real-time.

#### Detection Methods

**Outlier Detection (3σ rule)**
- Calculates mean and standard deviation of daily conversion rates
- Flags days with z-score > 3 (99.7% confidence outlier)
- Requires minimum 10 samples per day to avoid false positives

**Trend Detection**
- Monitors 5-day rolling windows
- Detects sustained monotonic trends (all increasing or all decreasing)
- Alerts if cumulative change > 20% over 5 days

#### Severity Levels
- **Critical**: z-score > 4 OR trend change > 50%
  - Immediate investigation required
  - Consider pausing test
- **Warning**: z-score 3-4 OR trend change 20-50%
  - Monitor closely
  - May indicate early signal

#### When to Investigate
- **Performance drop**: Check for implementation bugs, server issues
- **Performance spike**: Verify sample bias, external campaigns
- **Sustained trend**: Look for seasonality, competitive changes

### 4. Analysis Methods

#### Frequentist (Traditional)
- **Use when**: Large samples, fixed test horizon, need regulatory approval
- **Confidence**: 95% = probability of seeing this result if no true difference exists
- **Decision rule**: Confidence > 95% AND improvement > MDE

#### Bayesian (Modern)
- **Use when**: Small samples, continuous monitoring, need speed
- **Confidence**: 95% = probability variant is truly best
- **Decision rule**: Probability > 90% (or 95% for critical decisions)

#### Recommendation
Start with Bayesian for early signals, validate with frequentist before final rollout.

## UI Usage

### Dashboard
1. Create test with start/end dates (default 30 days)
2. Configure variants with traffic allocation
3. Monitor real-time results in ABTestingDashboard

### Analysis Tabs
- **Bayesian**: Expected rates, credible intervals, probability to win
- **Frequentist**: Confidence levels, statistical significance
- **MVT**: Interaction effects (auto-shown for 3+ variants)
- **Anomalies**: Outliers and sustained trends

### Actions
- **Refresh**: Updates analysis with latest data
- **Export**: Download detailed results (coming soon)
- **Pause/Resume**: Control test status

## Best Practices

### Sample Size Planning
- **Minimum**: 30 samples per variant (Bayesian), 100 per variant (frequentist)
- **Optimal**: 1000+ samples for high-confidence decisions
- **Rule of thumb**: Plan for 2-4 weeks runtime

### Variant Design
- **Control**: Always include baseline (no intervention)
- **Treatments**: Test 1-2 hypotheses, not 10
- **Traffic**: Equal split unless power analysis suggests otherwise

### Statistical Rigor
- **Pre-register**: Define success metrics before test starts
- **No peeking**: Use Bayesian if you must monitor early
- **Multiple testing**: Adjust significance for secondary metrics (Bonferroni)
- **Segment analysis**: Only if pre-specified (avoid data dredging)

### Anomaly Response
1. **Verify**: Check if anomaly is data issue or real effect
2. **Investigate**: Look for external causes (campaigns, bugs, events)
3. **Decide**: Pause test if critical, monitor if warning
4. **Document**: Record incident for post-test analysis

## API Reference

### Analyze Test Results
```javascript
const response = await base44.functions.invoke('abTestEngine', {
  action: 'analyze_test_results',
  testId: 'test_123',
  method: 'bayesian' // or 'frequentist'
});

// Response structure
{
  success: true,
  variant_results: {
    control: { conversion_rate: 5.2, total_assigned: 520, ... },
    treatment_a: { conversion_rate: 7.1, total_assigned: 512, ... }
  },
  winning_variant: 'treatment_a',
  confidence_level: 95,
  improvement_percentage: 36.5,
  bayesian_analysis: {
    control: {
      expected_conversion: 5.18,
      credible_interval: [4.1, 6.3],
      probability_to_be_best: 12.3
    },
    treatment_a: {
      expected_conversion: 7.09,
      credible_interval: [5.9, 8.4],
      probability_to_be_best: 87.7
    }
  },
  mvt_analysis: {
    interactions: [
      {
        variant_a: 'control',
        variant_b: 'treatment_a',
        interaction_effect: 2.1,
        synergy: 'positive'
      }
    ],
    has_significant_interactions: false
  },
  anomalies: [
    {
      variant_id: 'treatment_a',
      date: '2026-01-15',
      type: 'spike',
      severity: 'warning',
      z_score: 3.2,
      conversion_rate: 12.4
    }
  ]
}
```

## Performance Optimizations

### Caching Strategy
- Results cached for 30 seconds (staleTime)
- Invalidate on manual refresh
- Background refetch every 10 seconds for active tests

### Lazy Loading
- Advanced panels only render when data present
- Charts/visualizations load on-demand
- Historical data paginated (50 records per page)

### Edge Cases Handled
- **No data**: Shows "analyzing..." state
- **Single variant**: Disables MVT panel
- **< 3 days data**: Skips trend detection
- **< 10 samples/day**: Skips outlier detection for that day
- **Division by zero**: Handles zero intervention_shown gracefully

## Smoke Tests

### Test 1: Bayesian Analysis
```javascript
// Create test with 2 variants
const test = await base44.entities.ABTest.create({...});

// Assign 50 users to each variant
for (let i = 0; i < 100; i++) {
  await base44.functions.invoke('abTestEngine', {
    action: 'assign_user_to_test',
    testId: test.id,
    userEmail: `user${i}@test.com`
  });
}

// Analyze (should show Bayesian stats)
const results = await base44.functions.invoke('abTestEngine', {
  action: 'analyze_test_results',
  testId: test.id,
  method: 'bayesian'
});

// Verify
assert(results.bayesian_analysis.control.probability_to_be_best > 0);
assert(results.bayesian_analysis.treatment_a.probability_to_be_best > 0);
```

### Test 2: MVT Interaction
```javascript
// Create test with 3 variants
const test = await base44.entities.ABTest.create({
  variants: [
    { variant_id: 'control', traffic_allocation: 33 },
    { variant_id: 'treatment_a', traffic_allocation: 33 },
    { variant_id: 'treatment_b', traffic_allocation: 34 }
  ]
});

// Run test...

// Analyze (should show MVT panel)
const results = await base44.functions.invoke('abTestEngine', {
  action: 'analyze_test_results',
  testId: test.id
});

// Verify
assert(results.mvt_analysis != null);
assert(results.mvt_analysis.interactions.length > 0);
```

### Test 3: Anomaly Detection
```javascript
// Simulate anomaly by creating unusual conversion spike
const test = await base44.entities.ABTest.create({...});

// Normal days (5% conversion)
for (let day = 0; day < 5; day++) {
  // ... assign users, ~5% conversion
}

// Spike day (20% conversion)
// ... assign users, ~20% conversion

// Analyze
const results = await base44.functions.invoke('abTestEngine', {
  action: 'analyze_test_results',
  testId: test.id
});

// Verify anomaly detected
assert(results.anomalies.length > 0);
assert(results.anomalies[0].type === 'spike');
```

## Troubleshooting

### "Low Confidence" Warning
- **Cause**: Insufficient sample size
- **Fix**: Wait for more data or increase traffic allocation

### "No Bayesian Analysis"
- **Cause**: Less than 10 samples per variant
- **Fix**: Normal - Bayesian needs minimum data to be meaningful

### "MVT Panel Not Showing"
- **Cause**: Less than 3 variants in test
- **Fix**: Expected - MVT requires 3+ variants

### "Many Anomalies Detected"
- **Cause**: High variance, external events, or bugs
- **Fix**: Investigate logs, check implementation, review external campaigns

## References
- Bayesian A/B Testing: https://www.evanmiller.org/bayesian-ab-testing.html
- MVT Design: https://www.optimizely.com/optimization-glossary/multivariate-test/
- Anomaly Detection: https://en.wikipedia.org/wiki/Anomaly_detection
- Beta Distribution: https://en.wikipedia.org/wiki/Beta_distribution