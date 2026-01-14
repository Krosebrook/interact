# Testing Guide

**Scope:** Unit tests, integration tests, smoke tests, and manual testing procedures.

---

## Test Structure

```
functions/tests/
  ├── gamification.test.js      # Smoke tests for points, badges, leaderboards
  ├── eventOwnership.test.js     # Event authorization checks
  ├── stripeWebhook.test.js      # Payment idempotency
  └── surveyAnonymization.test.js # Privacy compliance

pages/__tests__/
  ├── Dashboard.test.js
  ├── Leaderboards.test.js
  └── Recognition.test.js

components/__tests__/
  ├── LeaderboardPaginated.test.js
  ├── FormWithRecovery.test.js
  └── LeaderboardCache.test.js
```

---

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test File

```bash
npm test -- gamification.test.js
npm test -- --testPathPattern="edge"
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage Report

```bash
npm test -- --coverage
```

Expected coverage:
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

---

## Gamification Smoke Tests

**File:** `functions/tests/gamification.test.js`  
**Purpose:** Critical path validation for points, leaderboards, badges, redemption.

### Points System Tests

```javascript
test('Awards points correctly for recognition given', async () => {
  const result = await awardPointsForAction('user1@test.com', 'recognition_given', 10);
  assertEquals(result.success, true);
  assertEquals(result.pointsAwarded, 10);
});

test('Prevents negative points', async () => {
  const result = await awardPointsForAction('user1@test.com', 'invalid', -5);
  assertEquals(result.success, false);
});

test('Calculates tier correctly', async () => {
  const tier = calculateTier(5000);
  assertEquals(tier, 'platinum');
});
```

**Running:**
```bash
npm test -- gamification.test.js --testNamePattern="Points System"
```

### Leaderboard Ranking Tests

```javascript
test('Calculates ranks correctly', async () => {
  const snapshots = [
    { user_email: 'alice@test.com', points: 500 },
    { user_email: 'bob@test.com', points: 400 }
  ];

  const ranked = calculateRanks(snapshots);
  assertEquals(ranked[0].rank, 1);
  assertEquals(ranked[1].rank, 2);
});

test('Handles ties in ranking', async () => {
  // Tie = same rank
  const snapshots = [
    { points: 500 },
    { points: 500 }, // Tie
    { points: 400 }
  ];

  const ranked = calculateRanks(snapshots);
  assertEquals(ranked[0].rank, 1);
  assertEquals(ranked[1].rank, 1);
  assertEquals(ranked[2].rank, 3);
});
```

### Badge Unlocking Tests

```javascript
test('Unlocks badge on first event attendance', async () => {
  const result = await checkBadgeUnlock('user1@test.com', {
    events_attended: 1,
    badges: []
  });
  
  assertEquals(result.badgeUnlocked, true);
  assertEquals(result.badge.id, 'first-event');
});

test('Does not re-unlock already earned badge', async () => {
  const result = await checkBadgeUnlock('user1@test.com', {
    events_attended: 10,
    badges: ['team-player'] // Already earned
  });

  assertEquals(result.badgeUnlocked, false);
});
```

### Reward Redemption Tests

```javascript
test('Prevents double redemption', async () => {
  const result1 = await validateRedemption('user1@test.com', 'item_123', 100);
  assertEquals(result1.allowed, true);
  
  // Second attempt should fail
  const result2 = await validateRedemption('user1@test.com', 'item_123', 100);
  assertEquals(result2.allowed, false);
});

test('Prevents redemption without sufficient points', async () => {
  const result = await validateRedemption('user1@test.com', 'expensive', 5000);
  assertEquals(result.allowed, false);
  assertEquals(result.reason, 'Insufficient points');
});
```

---

## Event Ownership Tests

**File:** `functions/tests/eventOwnership.test.js`  
**Purpose:** Verify only admins/facilitators can modify events.

```javascript
test('Admin can cancel event', async () => {
  const user = { role: 'admin' };
  const event = { id: 'event_123', facilitator_email: 'other@test.com' };
  
  const result = await validateEventCancellation(user, event);
  assertEquals(result.allowed, true);
});

test('Non-facilitator cannot cancel event', async () => {
  const user = { role: 'user', user_type: 'participant' };
  const event = { id: 'event_123', facilitator_email: 'facilitator@test.com' };
  
  const result = await validateEventCancellation(user, event);
  assertEquals(result.allowed, false);
});

test('Facilitator can cancel own event', async () => {
  const user = { email: 'facilitator@test.com', user_type: 'facilitator' };
  const event = { id: 'event_123', facilitator_email: 'facilitator@test.com' };
  
  const result = await validateEventCancellation(user, event);
  assertEquals(result.allowed, true);
});
```

---

## Stripe Webhook Tests

**File:** `functions/tests/stripeWebhook.test.js`  
**Purpose:** Verify idempotency key prevents double-charging.

```javascript
test('Processes successful payment', async () => {
  const event = {
    type: 'charge.succeeded',
    data: { object: { id: 'ch_123', amount: 1000 } }
  };

  const result = await handleStripeEvent(event);
  assertEquals(result.status, 'processed');
  assertEquals(result.idempotencyKey, 'ch_123');
});

test('Prevents duplicate charge with idempotency key', async () => {
  const event = {
    type: 'charge.succeeded',
    data: { object: { id: 'ch_123' } }
  };

  // First call
  const result1 = await handleStripeEvent(event);
  assertEquals(result1.status, 'processed');

  // Second call with same event
  const result2 = await handleStripeEvent(event);
  assertEquals(result2.status, 'duplicate');
  assertEquals(result2.idempotencyKey, 'ch_123');
});
```

---

## Survey Anonymization Tests

**File:** `functions/tests/surveyAnonymization.test.js`  
**Purpose:** Verify responses stay anonymous until 5+ responses.

```javascript
test('Hides individual responses with < 5 replies', async () => {
  const responses = [
    { respondent_email: 'alice@test.com', response: 4 }
  ];

  const data = aggregateSurveyResults(responses);
  assertEquals(data.individual_responses, undefined);
  assertEquals(data.aggregate_score, 4);
});

test('Shows individual responses with 5+ replies', async () => {
  const responses = [
    { respondent_email: 'alice@test.com', response: 4 },
    { respondent_email: 'bob@test.com', response: 5 },
    { respondent_email: 'charlie@test.com', response: 3 },
    { respondent_email: 'diana@test.com', response: 5 },
    { respondent_email: 'eve@test.com', response: 4 }
  ];

  const data = aggregateSurveyResults(responses);
  assertEquals(data.individual_responses.length, 5);
  assertEquals(data.average_score, 4.2);
});

test('Hashes respondent emails when showing responses', async () => {
  const responses = [...5+ responses...];
  const data = aggregateSurveyResults(responses, { hashEmails: true });
  
  // Should show responses but not actual emails
  assertEquals(data.individual_responses[0].respondent_email, 'hash_abc123');
});
```

---

## Integration Tests

### Test: Give Recognition + Award Points + Update Leaderboard

```javascript
test('Integration: Recognition → Points → Leaderboard', async () => {
  const user1 = await createTestUser('user1@test.com');
  const user2 = await createTestUser('user2@test.com');

  // User1 gives recognition to User2
  const recognition = await base44.entities.Recognition.create({
    sender_email: user1.email,
    recipient_email: user2.email,
    message: 'Great work!',
    category: 'teamwork'
  });

  // Points should be awarded
  const points = await base44.entities.UserPoints.filter({
    user_email: user2.email
  });
  assertEquals(points[0].total_points, 5); // Recognition award

  // Leaderboard should update
  const leaderboard = await base44.entities.LeaderboardSnapshot.filter({
    user_email: user2.email
  });
  assertExists(leaderboard[0]);
  assertEquals(leaderboard[0].points >= 5, true);
});
```

---

## Manual Testing Checklist

### Gamification Features

- [ ] **Points Awarded**
  - [ ] Give recognition → +10 points
  - [ ] Attend event → +10 points
  - [ ] Lead event → +25 points
  - [ ] Points appear immediately

- [ ] **Tiers**
  - [ ] Bronze starts at 0 points
  - [ ] Silver at 1,000 points
  - [ ] Gold at 3,000 points
  - [ ] Platinum at 5,000 points
  - [ ] Tier displays correctly in profile

- [ ] **Badges**
  - [ ] First event badge unlocks after 1 attendance
  - [ ] Team player badge unlocks at 10 events
  - [ ] Badge appears on profile
  - [ ] Notification sent when badge earned

- [ ] **Leaderboards**
  - [ ] Weekly leaderboard shows top 10
  - [ ] Ranks calculate correctly
  - [ ] Ties handled properly (same rank)
  - [ ] User can find themselves
  - [ ] Percentile shown
  - [ ] Updates within 5 minutes

- [ ] **Caching**
  - [ ] First load: leaderboard takes 2s
  - [ ] Second load: instant (cached)
  - [ ] After 5+ min: auto-refreshes
  - [ ] Manual refresh works
  - [ ] Cache busted on logout

- [ ] **Lazy Loading**
  - [ ] Leaderboard loads 20 entries initially
  - [ ] Scrolling bottom loads next 20
  - [ ] No loading jank
  - [ ] Memory usage stable

- [ ] **Real-time Updates**
  - [ ] Open leaderboard in 2 tabs
  - [ ] Award points in one tab
  - [ ] Second tab updates within 1s
  - [ ] No page refresh needed

### Edge Cases

- [ ] **Offline Mode**
  - [ ] Go offline
  - [ ] UI shows "Offline" indicator
  - [ ] Can view cached data
  - [ ] Form submits queue
  - [ ] Go online
  - [ ] Queued actions send

- [ ] **Session Timeout**
  - [ ] Start filling event form
  - [ ] Wait 8+ hours
  - [ ] Try to submit
  - [ ] Prompted to login
  - [ ] Form data recovered after login

- [ ] **Double-Click Buttons**
  - [ ] Double-click "Give Recognition"
  - [ ] Only 1 recognition created
  - [ ] Button disabled after first click

- [ ] **Slow Network**
  - [ ] Simulate 3G in DevTools
  - [ ] Load leaderboard
  - [ ] Takes ~5s, no timeout
  - [ ] Data eventually loads

- [ ] **Concurrent Requests**
  - [ ] Rapidly open/close modals
  - [ ] Award points to multiple users
  - [ ] No race conditions
  - [ ] All actions complete

---

## Coverage Goals

### By Feature

| Feature | Unit | Integration | Manual |
|---------|------|-------------|--------|
| Points | 95% | Yes | Yes |
| Leaderboard | 90% | Yes | Yes |
| Badges | 95% | Yes | Yes |
| Redemption | 95% | Yes | Yes |
| Cache | 85% | Yes | Yes |
| Real-time | 80% | Yes | Yes |

### Critical Paths (100% coverage)

- [x] Event cancellation
- [x] Points award
- [x] Redemption idempotency
- [x] Event ownership check
- [x] Survey anonymization

---

## CI/CD Test Pipeline

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run integration tests
        run: npm test -- --testPathPattern="integration"
      
      - name: Check coverage
        run: npm test -- --coverage --coverageThreshold='{"global":{"branches":75}}'
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Performance Testing

### Leaderboard Load Time

```bash
# Simulate 1000 users on leaderboard
npm test -- --testNamePattern="performance" --leaderboard-size=1000
```

**Target:** < 2s load time (cached), < 5s first-load

### Points Calculation

```bash
# 100,000 point transactions
npm test -- performance.test.js --transaction-count=100000
```

**Target:** < 1s calculation

---

## Debugging Failing Tests

### Step 1: Run Test in Isolation

```bash
npm test -- gamification.test.js --testNamePattern="Prevents double redemption"
```

### Step 2: Enable Debug Output

```bash
DEBUG=* npm test -- gamification.test.js
```

### Step 3: Use Debugger

```bash
node --inspect-brk node_modules/.bin/jest --runInBand gamification.test.js
```

Then open `chrome://inspect` in Chrome.

### Step 4: Check Test Isolation

```javascript
// Ensure each test clears state
beforeEach(() => {
  // Clear cache
  queryClient.clear();
  // Reset mocks
  jest.clearAllMocks();
});
```

---

## Test Best Practices

### ✅ DO

- Name tests clearly: `'prevents double redemption'` not `'test 5'`
- Test behavior, not implementation: focus on outcomes
- Use beforeEach/afterEach for setup/cleanup
- Mock external services (Stripe, email)
- Test edge cases: zero, negative, max values
- Isolate tests: no dependencies between tests

### ❌ DON'T

- Test implementation details
- Write brittle tests that break on refactors
- Forget to clean up (unsubscribe, clear timers)
- Use `setTimeout` for timing (use `jest.useFakeTimers`)
- Test third-party libraries
- Skip error cases

---

**Last Updated:** January 14, 2026  
**Maintainer:** QA Team