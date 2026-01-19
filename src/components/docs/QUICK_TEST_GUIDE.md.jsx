# Quick Test Guide: Verifying New Features

## 1. User Segmentation

### Create a Simple Segment
1. Navigate to **User Segments** (admin sidebar)
2. Click **New Segment**
3. Fill in:
   - Segment Name: `test_engaged_users`
   - Display Name: `Test Engaged Users`
   - Description: `Testing segmentation system`
4. Add condition:
   - Field: `lifecycle_state`
   - Operator: `equals`
   - Value: `engaged`
5. Click **Create**
6. Verify: User count appears (may be 0 if no engaged users)

### Test Segment Recalculation
1. Click **Refresh** icon on segment card
2. Watch user count update
3. Check "Last Calculated" timestamp changes

### Test Campaign Trigger (Optional - will send real emails!)
1. Click **Send** icon on segment
2. Select channel: `notification` (safest for testing)
3. Enter message: `Test notification`
4. Click **Send to X Users**
5. Check Notifications entity for created records

## 2. A/B Testing with Segments

### Create Test with Segment
1. Go to **ABTesting Dashboard**
2. Click **New Test**
3. Enter test details
4. Toggle **Using Segment** button
5. Select your test segment from dropdown
6. Notice: ✓ Test will use segment criteria automatically
7. Add variants and create test

### Verify Bayesian Analysis
1. Create test with 2+ variants
2. Start test (change status to 'active')
3. Click **View Results** on test
4. Switch to **Bayesian** tab
5. You should see:
   - Expected conversion rates
   - Credible intervals
   - Probability to be best

**Note**: Need real assignment data for meaningful results

## 3. Anomaly Detection

### Simulate Detection (Dev Only)
**Warning**: Requires database manipulation

1. Create test with some assignments
2. Manually create unusual conversion rates in data
3. Run analysis
4. Check **Anomaly Detection** panel for alerts

### Test Anomaly Alerts
1. Dashboard → Code → Functions → `anomalyAlerts`
2. Test with:
```json
{
  "action": "check_all_active_tests"
}
```
3. Check response for detected anomalies
4. If critical anomalies found, verify email sent

## 4. Outbox Monitoring

### View Real-Time Monitor
1. Go to **Integrations Admin**
2. Click **Real-Time Monitor** tab
3. Verify you see:
   - 4 status cards (Queued, Sent, Failed, Dead Letter)
   - Auto-refresh every 10s
   - Recent items list

### Test Manual Retry
1. Find a 'failed' or 'dead_letter' item
2. Click **Retry** button
3. Item should reset to 'queued' status
4. Verify status updates in list

### Check Trends
1. Look for **Outbox Trends (24h)** chart
2. Should show hourly buckets
3. Lines for queued/sent/failed

## 5. Automated Workflows

### Verify Automations Created
1. Dashboard → Code → Automations
2. Confirm these exist and are active:
   - Auto-Manage A/B Tests (hourly)
   - Check A/B Test Anomalies (6-hourly)
   - Recalculate Dynamic Segments (daily 2am)
   - Outbox Health Alerts (hourly)

### Test Manual Trigger
1. Select an automation
2. Click **Run Now** (if available)
3. Check execution logs
4. Verify expected behavior

## 6. Analytics Dashboard

### View Metrics
1. **ABTesting Dashboard** → **Dashboard** tab
2. Should see:
   - 4 summary cards
   - Conversion rates bar chart
   - Assignment trends line chart
   - Anomaly trends (if any)

**Note**: Charts require historical data to display

## 7. End-to-End Test Flow

### Complete Workflow (30 minutes)

1. **Create Segment**
   - Segment: At-risk users with churn > 70
   - Verify count calculation

2. **Create A/B Test**
   - Use segment as target criteria
   - 2 variants: Control vs Treatment
   - Set to active

3. **Monitor Test**
   - Check assignments (should be 0 initially)
   - View results (empty but shouldn't error)

4. **Trigger Campaign**
   - Use segment to send test notification
   - Verify delivery in Notification entity

5. **Check Outbox**
   - Go to Integrations Admin → Monitor
   - See campaign items processing

6. **Review Analytics**
   - Dashboard tab shows new test
   - Metrics update (may be 0)

## 8. Validation Checks

### Data Integrity
- [ ] Segments calculate without errors
- [ ] Tests link to segments correctly
- [ ] Campaign logs created in InterventionDeliveryLog
- [ ] Outbox items have idempotency_key

### UI/UX
- [ ] No console errors in browser
- [ ] Loading states show appropriately
- [ ] Error messages are user-friendly
- [ ] Mobile responsive (test on phone)

### Security
- [ ] Non-admin users can't access segmentation
- [ ] API endpoints require authentication
- [ ] Segment data not exposed inappropriately

### Performance
- [ ] Pages load < 3s
- [ ] Segment recalculation < 10s
- [ ] Real-time updates work smoothly

## 9. Rollback Plan

### If Issues Found
1. Pause problematic automations
2. Revert entity schema if needed
3. Disable new UI tabs
4. Use legacy segment format

### Quick Disable
```javascript
// Pause automation via Dashboard → Automations
// Or manually update:
await base44.entities.UserSegment.update(segmentId, {
  is_active: false,
  is_dynamic: false
});
```

## 10. Next Steps

### After Validation
1. Monitor first 24h of automation executions
2. Collect admin feedback on UI
3. Review alert accuracy (false positives)
4. Optimize slow queries if found
5. Add additional condition fields based on usage

### Future Enhancements
- AI-powered segment recommendations
- Predictive segment modeling
- Campaign A/B testing
- Multi-channel orchestration
- Advanced MVT analysis