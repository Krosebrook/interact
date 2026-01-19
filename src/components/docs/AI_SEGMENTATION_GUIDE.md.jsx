# AI-Driven Segmentation Guide

## Overview
Automated segment discovery, growth predictions, and intelligent campaign triggering powered by AI.

## Features

### 1. AI Segment Suggestions
Analyzes behavior patterns, campaign performance, and A/B test results to recommend high-value segments.

**How it works:**
- Aggregates lifecycle states, campaign logs, and test insights
- Generates 3-5 segment recommendations with criteria
- Provides confidence scores and predicted sizes
- Includes campaign recommendations (channel, timing, tone)

**Usage:**
```javascript
// Backend
const response = await base44.functions.invoke('aiSegmentationEngine', {
  action: 'suggest_segments'
});

// Returns
{
  success: true,
  suggestions: [
    {
      segment_name: "high_risk_power_users",
      display_name: "At-Risk Power Users",
      description: "Engaged users showing churn signals",
      criteria: { logic_operator: "AND", conditions: [...] },
      predicted_size: 87,
      confidence: 85,
      campaign_recommendations: {
        channel: "email",
        timing: "immediate",
        message_tone: "supportive"
      },
      reasoning: "Historical data shows..."
    }
  ]
}
```

**Data Sources:**
- LifecycleState: User state distribution
- InterventionDeliveryLog: Campaign conversion rates
- ABTest: Test winners and improvements

### 2. Segment Predictions
Forecasts growth, churn, and size changes over 7, 14, and 30 days.

**How it works:**
- Analyzes segment criteria and current size
- Reviews recent state transitions (30-day window)
- Generates predictions with confidence scores
- Identifies impact factors (positive/negative/neutral)
- Provides actionable recommendations

**Usage:**
```javascript
const response = await base44.functions.invoke('aiSegmentationEngine', {
  action: 'predict_segment_metrics',
  segmentId: 'segment_123'
});

// Returns
{
  success: true,
  predictions: {
    predicted_growth: { 7_days: 12, 14_days: 28, 30_days: 45 },
    predicted_churn: { 7_days: 5, 14_days: 8, 30_days: 15 },
    predicted_size: { 7_days: 107, 14_days: 120, 30_days: 130 },
    confidence: 78,
    factors: [
      {
        factor: "Seasonal engagement spike",
        impact: "positive",
        description: "Q1 typically sees increased activity"
      }
    ],
    recommendations: [
      "Launch re-engagement campaign in 14 days",
      "Monitor churn closely in week 2-3"
    ]
  }
}
```

### 3. High-Potential Segment Identification
Automatically identifies segments with best campaign potential.

**Scoring Algorithm:**
```
score = (conversion_rate * user_count) / campaign_count
```

**Eligibility Criteria:**
- User count > 10 (minimum viable size)
- Conversion rate > 15% OR never campaigned
- Sorted by score, top 5 returned

**Usage:**
```javascript
const response = await base44.functions.invoke('aiSegmentationEngine', {
  action: 'identify_high_potential'
});

// Returns
{
  success: true,
  high_potential_segments: [
    {
      segment_id: "seg_123",
      segment_name: "engaged_dormant",
      user_count: 67,
      conversion_rate: 22.5,
      campaign_count: 3,
      auto_campaign_eligible: true,
      reason: "High historical conversion rate"
    }
  ]
}
```

### 4. Auto-Triggered Campaigns
Automatically triggers campaigns for high-potential segments.

**Safety Features:**
- Dry run mode (default: true)
- Minimum conversion rate threshold (default: 15%)
- Minimum segment size (default: 20)
- AI-generated personalized messages

**Usage:**
```javascript
// Preview mode
const preview = await base44.functions.invoke('aiSegmentationEngine', {
  action: 'auto_trigger_campaigns',
  minConversionRate: 15,
  minSegmentSize: 20,
  dryRun: true
});

// Live mode (requires explicit false)
const live = await base44.functions.invoke('aiSegmentationEngine', {
  action: 'auto_trigger_campaigns',
  minConversionRate: 15,
  minSegmentSize: 20,
  dryRun: false
});

// Returns
{
  success: true,
  triggered_campaigns: [
    {
      segment_id: "seg_123",
      segment_name: "engaged_dormant",
      result: { sent_count: 67 }
    }
  ],
  count: 3
}
```

## UI Components

### AISegmentSuggestions.jsx
- Displays AI-generated segment recommendations
- One-click segment creation
- Expandable details (reasoning, campaign recommendations)
- Regenerate button for fresh analysis

### SegmentPredictions.jsx
- Shows 30-day growth/churn forecasts
- Line chart visualization
- Impact factors breakdown
- Actionable recommendations

### AutoCampaignManager.jsx
- Lists high-potential segments
- Dry run toggle for safety
- One-click bulk campaign triggering
- Eligibility indicators

### UserSegmentation.jsx
- Main page with 3 tabs:
  1. My Segments (with predictions panel)
  2. AI Suggestions
  3. Auto-Campaigns

## Automation Workflow

### Scheduled Automation (Recommended)
```javascript
// Run every 6 hours
{
  automation_type: 'scheduled',
  name: 'Auto-Trigger High-Potential Campaigns',
  function_name: 'aiSegmentationEngine',
  function_args: {
    action: 'auto_trigger_campaigns',
    minConversionRate: 15,
    minSegmentSize: 20,
    dryRun: false
  },
  repeat_interval: 6,
  repeat_unit: 'hours'
}
```

### Safety Guardrails
1. **Dry Run Default**: Prevents accidental mass campaigns
2. **Minimum Thresholds**: Requires proven conversion or sufficient size
3. **AI Message Generation**: Personalized per segment
4. **Campaign Metadata**: Tracks auto-triggered flag
5. **Error Handling**: Fails gracefully, continues to next segment

## Performance Considerations

### API Call Limits
- AI suggestions: ~500 tokens per call (3-5 suggestions)
- Predictions: ~300 tokens per segment
- Message generation: ~100 tokens per message

### Caching Strategy
- Suggestions: 5-minute stale time
- Predictions: 5-minute stale time
- High-potential: 1-minute auto-refresh

### Data Volume
- Suggestions analyze: last 100 lifecycle states, 200 campaigns, all completed tests
- Predictions analyze: last 500 lifecycle states (30-day window)
- Efficient aggregation prevents timeout

## Best Practices

### 1. Start with Dry Run
Always preview auto-campaigns before enabling live mode:
```javascript
// Step 1: Preview
dryRun: true

// Step 2: Review eligible_segments

// Step 3: Enable live
dryRun: false
```

### 2. Monitor Campaign Performance
Track auto-triggered campaigns:
```javascript
await base44.entities.InterventionDeliveryLog.filter({
  metadata: { auto_triggered: true }
});
```

### 3. Tune Thresholds
Adjust based on your data:
- High volume: Lower minSegmentSize to 10
- Conservative: Raise minConversionRate to 20%
- Aggressive: Lower to 10%

### 4. Review AI Suggestions Weekly
Fresh suggestions capture evolving patterns:
- Click "Regenerate" in AI Suggestions tab
- Review confidence scores (>70% recommended)
- Create segments that align with business goals

### 5. Use Predictions for Planning
30-day forecasts inform:
- Campaign timing (before predicted churn)
- Resource allocation (for growth spikes)
- Intervention urgency (high churn segments)

## Troubleshooting

### "No suggestions available"
- Ensure sufficient data: min 50 lifecycle states, 20 campaigns
- Check API key: OpenAI or similar configured
- Regenerate after new campaigns/tests complete

### "Prediction confidence low"
- Limited historical data for segment
- High volatility in state transitions
- Use as directional guidance only

### "Auto-campaign not triggering"
- Verify segments meet eligibility criteria
- Check dry_run setting (must be false)
- Review minConversionRate/minSegmentSize thresholds
- Ensure campaign engine secrets configured

### "AI message generic"
- Low confidence in segment characterization
- Manually refine in campaign trigger UI
- Provide more context in segment description

## Future Enhancements

1. **Multi-touch Campaigns**: Sequence multiple touchpoints
2. **Sentiment Analysis**: Optimize message tone by user mood
3. **Lookalike Segments**: Find similar high-performing users
4. **Churn Intervention**: Auto-trigger retention campaigns
5. **Budget Optimization**: Allocate spend by predicted ROI