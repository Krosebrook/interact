# System Integration Guide: Segmentation, A/B Testing & Automation

## System Architecture

### Core Components

1. **User Segmentation Engine** (`segmentationEngine.js`)
   - Complex AND/OR criteria evaluation
   - Dynamic segment recalculation
   - Campaign triggering
   - Legacy criteria support

2. **A/B Test Engine** (`abTestEngine.js`)
   - Bayesian & Frequentist analysis
   - Multi-variate testing (MVT)
   - Anomaly detection
   - Variant assignment

3. **Auto Test Manager** (`autoTestManager.js`)
   - Automated test pause/resume
   - Campaign enrollment
   - Winner rollout automation

4. **Anomaly Alerts** (`anomalyAlerts.js`)
   - Real-time anomaly monitoring
   - Multi-channel alerts (Email/Slack)
   - Admin notifications

5. **Outbox Monitor** (`outboxMonitor.js`)
   - Real-time queue monitoring
   - Health alerts
   - Manual retry capabilities

6. **AB Test Analytics** (`abTestAnalytics.js`)
   - Aggregate metrics dashboard
   - Historical trends
   - Performance visualization

## Integration Flows

### Flow 1: Segment → A/B Test → Campaign

```
1. Admin creates segment with complex criteria
   ↓
2. Segment auto-recalculates daily (automation)
   ↓
3. Admin creates A/B test using segment
   ↓
4. Test assigns users based on segment criteria
   ↓
5. Anomaly detection monitors test (every 6h)
   ↓
6. Test auto-pauses when significance reached
   ↓
7. Winning variant users enrolled in campaign
   ↓
8. Campaign delivers via outbox queue
```

### Flow 2: Anomaly Detection → Alert → Investigation

```
1. A/B test runs normally
   ↓
2. Performance spike/drop occurs
   ↓
3. Anomaly detection identifies outlier (3σ)
   ↓
4. Alert sent via Email + Slack
   ↓
5. Admin investigates via ABTestResults
   ↓
6. Manual pause or continue decision
```

### Flow 3: Outbox Queue → Delivery → Reconciliation

```
1. Campaign triggers outbox entry
   ↓
2. Dispatcher processes queue hourly
   ↓
3. Integration delivers message
   ↓
4. Status updated (sent/failed/dead_letter)
   ↓
5. If failed: automatic retry with backoff
   ↓
6. If dead_letter: alert admin
   ↓
7. Admin manually retries or investigates
```

## Automated Workflows

### Scheduled Automations

| Name | Function | Frequency | Purpose |
|------|----------|-----------|---------|
| Auto-Manage A/B Tests | `autoTestManager` | Hourly | Pause tests, enroll winners |
| Check A/B Test Anomalies | `anomalyAlerts` | 6 hours | Detect & alert anomalies |
| Recalculate Dynamic Segments | `segmentationEngine` | Daily 2am | Update segment counts |
| Outbox Health Alerts | `outboxMonitor` | Hourly | Monitor queue health |

### Entity Automations

Currently none - all triggered by scheduled jobs or manual actions.

## API Integration Points

### Creating Segments

```javascript
// Simple segment (legacy format)
const segment = await base44.entities.UserSegment.create({
  segment_name: 'at_risk_users',
  display_name: 'At-Risk Users',
  description: 'Users with high churn risk',
  criteria: {
    lifecycle_states: ['at_risk'],
    churn_risk_min: 70
  }
});

// Complex segment (new format)
const complexSegment = await base44.entities.UserSegment.create({
  segment_name: 'high_value_at_risk',
  display_name: 'High-Value At-Risk Users',
  criteria: {
    logic_operator: 'AND',
    conditions: [
      {
        field: 'lifecycle_state',
        operator: 'equals',
        value: 'at_risk'
      },
      {
        field: 'churn_risk',
        operator: 'greater_than',
        value: 70
      }
    ],
    condition_groups: [
      {
        group_operator: 'OR',
        conditions: [
          {
            field: 'session_frequency',
            operator: 'greater_than',
            value: 3
          },
          {
            field: 'points_balance',
            operator: 'greater_than',
            value: 1000
          }
        ]
      }
    ]
  },
  is_dynamic: true,
  auto_recalculate_frequency: 'daily'
});
```

### Using Segments in A/B Tests

```javascript
// Create test with segment
const test = await base44.entities.ABTest.create({
  test_name: 'retention_messaging_v3',
  description: 'Test retention messaging for high-value users',
  segment_id: complexSegment.id,
  lifecycle_state: 'at_risk',
  variants: [
    {
      variant_id: 'control',
      name: 'Control',
      message: 'Standard message',
      surface: 'email',
      traffic_allocation: 50
    },
    {
      variant_id: 'treatment_a',
      name: 'Personalized',
      message: 'Personalized high-value message',
      surface: 'email',
      traffic_allocation: 50
    }
  ],
  success_metrics: {
    primary_metric: 'churn_reduction'
  }
});

// Segment criteria automatically applied to target_criteria
// No manual configuration needed
```

### Triggering Campaigns

```javascript
// Manual campaign trigger
const response = await base44.functions.invoke('segmentationEngine', {
  action: 'trigger_segment_campaign',
  segmentId: segment.id,
  campaignType: 'retention',
  channel: 'email',
  subject: 'We value your engagement!',
  message: 'Your personalized retention message...'
});

// Response
{
  success: true,
  target_users: 127,
  sent_count: 127,
  errors: []
}
```

### Monitoring Outbox

```javascript
// Get real-time stats
const response = await base44.functions.invoke('outboxMonitor', {
  action: 'get_stats',
  status_filter: 'all'
});

// Manual retry
const retry = await base44.functions.invoke('outboxMonitor', {
  action: 'retry_item',
  itemId: 'failed_item_123'
});
```

## UI Components Integration

### Navigation

Updated admin navigation to include:
- **User Segments** page (after AI Coaching)
- **ABTesting Dashboard** with new Analytics tab
- **Integrations Admin** with Real-Time Monitor tab

### Component Tree

```
ABTestingDashboard
├── ABTestMetricsDashboard (new analytics)
├── ABTestCreator (enhanced with segment selector)
├── ABTestResults (enhanced with Bayesian/MVT panels)
│   ├── BayesianAnalysisPanel
│   ├── MVTInteractionPanel
│   └── AnomalyDetectionPanel
└── Test List (active/completed/draft)

UserSegmentation
├── AdvancedSegmentBuilder
│   └── Condition builder with AND/OR logic
├── SegmentCampaignTrigger
└── Segment cards (with campaign trigger)

IntegrationsAdmin
├── Real-Time Monitor (new tab)
│   ├── OutboxMonitor
│   ├── OutboxItemDetail
│   └── OutboxTrendsChart
├── Integrations (existing)
└── Setup (existing)
```

## Data Model Changes

### UserSegment Entity
**New fields:**
- `criteria.logic_operator` (AND/OR)
- `criteria.conditions[]` (array of condition objects)
- `criteria.condition_groups[]` (nested groups)
- `display_name` (user-friendly name)
- `user_emails[]` (cached for small segments)
- `is_dynamic` (auto-recalculate flag)
- `auto_recalculate_frequency` (hourly/daily/weekly)
- `tags[]` (organization)

### ABTest Entity
**Enhanced fields:**
- `segment_id` (linked segment)
- `results_summary.bayesian_probability` (from Bayesian analysis)
- `results_summary.anomalies_detected` (count)
- `results_summary.auto_paused` (boolean)
- `results_summary.pause_reason` (significance/anomalies/end_date)

### IntegrationOutbox Entity
**No changes** - existing schema sufficient for monitoring

## Error Handling

### Segment Evaluation Errors
- **Missing lifecycle data**: Skip user, continue evaluation
- **Invalid condition**: Log warning, treat as false
- **Empty result**: Return empty array, don't fail

### Campaign Trigger Errors
- **Email bounce**: Log error, continue to next user
- **Rate limit**: Pause, wait, resume
- **Integration down**: Queue in outbox for retry

### Test Management Errors
- **No assignments**: Return empty results, don't fail
- **Invalid test ID**: Return 404 with clear message
- **Missing segment**: Use manual criteria fallback

### Outbox Monitor Errors
- **No data**: Show "No items" state
- **Provider timeout**: Mark as failed, retry later
- **Invalid response**: Truncate, store what we can

## Performance Considerations

### Segment Recalculation
- **Batch size**: 1000 users per batch
- **Timeout**: 50s for safety
- **Caching**: Store user_emails if < 1000
- **Schedule**: Off-peak hours (2am)

### Anomaly Detection
- **Min samples**: 10 per day for outlier detection
- **Min duration**: 3 days for trend detection
- **Cache**: Results cached 30s on frontend

### Outbox Monitoring
- **Auto-refresh**: 10s interval
- **Pagination**: 50 items per page
- **Historical**: 24h of hourly buckets

## Testing Strategy

### Unit Tests
```javascript
// Test segment evaluation
const users = await evaluateSegmentCriteria(base44, {
  logic_operator: 'AND',
  conditions: [
    { field: 'lifecycle_state', operator: 'equals', value: 'engaged' },
    { field: 'churn_risk', operator: 'greater_than', value: 50 }
  ]
});
// Verify correct users returned
```

### Integration Tests
```javascript
// Full flow: segment → test → campaign
const segment = await base44.entities.UserSegment.create({...});
const test = await base44.entities.ABTest.create({ segment_id: segment.id });
// Simulate test completion
await base44.functions.invoke('autoTestManager', { action: 'auto_manage_tests' });
// Verify campaign triggered
```

### Smoke Tests
1. Create empty segment (0 users)
2. Trigger campaign on empty segment (should error)
3. Create test with non-existent segment
4. Manually retry dead-letter outbox item
5. Simulate anomaly with unusual data

## Migration Notes

### Backwards Compatibility
- Old segments with simple criteria still work
- Converted on-the-fly by `findMatchingUsersLegacy()`
- No data migration required
- New segments use complex format

### Deployment Checklist
- [x] Update UserSegment entity schema
- [x] Deploy new backend functions
- [x] Create scheduled automations
- [x] Test segment recalculation
- [x] Verify A/B test integration
- [x] Confirm alert delivery
- [x] Update admin navigation

## Monitoring & Alerting

### Key Metrics
- Segment recalculation time (< 30s per segment)
- Campaign delivery rate (> 95%)
- Test auto-pause accuracy
- Anomaly false positive rate (< 5%)
- Outbox throughput (items/hour)

### Alert Thresholds
- Dead-letter rate > 5%: Critical
- Queue > 100 items: Warning
- Anomaly z-score > 4: Critical
- Test confidence > 95%: Auto-pause

### Dashboard URLs
- Segments: `/UserSegmentation`
- A/B Tests: `/ABTestingDashboard`
- Analytics: `/ABTestingDashboard?tab=dashboard`
- Outbox: `/IntegrationsAdmin?tab=monitor`

## Security & Compliance

### Access Control
- All admin-only functions verify `user.role === 'admin'`
- Segment data filtered by permissions
- Campaign logs audited
- User emails protected (not exposed to frontend)

### Data Privacy
- Segments don't store PII (only emails)
- Campaign messages logged without content
- User can opt-out via preferences
- GDPR: Right to be forgotten removes from segments

### Rate Limiting
- Max 1000 emails per campaign
- 24h cooldown between campaigns to same segment
- Outbox throttling per integration
- Anomaly alert consolidation (1/hour max)

## Troubleshooting

### "Segment shows 0 users after creation"
→ Criteria too restrictive or no lifecycle data. Broaden criteria or wait for users to enter states.

### "Campaign not sending"
→ Check RESEND_API_KEY secret, verify user emails exist, check outbox queue status.

### "Test not auto-pausing"
→ Confidence < 95% or sample size not reached. Check Bayesian probability in results.

### "Too many anomaly alerts"
→ High test variance or external events. Review z-score thresholds, consider pausing test.

### "Outbox items stuck in queue"
→ Dispatcher may be down. Check automation status, manually trigger `dispatchOutbox`.

## Next Steps

1. Test all flows end-to-end
2. Monitor automation execution logs
3. Validate alert delivery
4. Review segment recalculation performance
5. Set up Slack webhook for real-time alerts (optional)