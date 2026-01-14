# 35+ Edge Cases: Complete Implementation Guide

**Date:** January 14, 2026  
**Scope:** Employee Engagement Platform - INTeract  
**Criticality:** 15 HIGH, 12 MEDIUM, 8 LOW

---

## Category 1: Authentication & Session (5 cases)

### 1. Session Timeout During Form Submission
**Severity:** HIGH  
**Scenario:** User fills 5-minute form, session expires before submit  
**Expected:** Form saved locally, user prompted to re-auth, data recovered  
**Implementation:** See `sessionRecovery.js`

### 2. Concurrent Login Attempts
**Severity:** HIGH  
**Scenario:** User logs in from 2 devices simultaneously  
**Expected:** First session valid, second gets rate-limited  
**Implementation:** Redis session locking

### 3. SSO Token Expiry During API Call
**Severity:** HIGH  
**Scenario:** User has valid UI session, but SSO token expired  
**Expected:** Silent refresh, retry request, or re-prompt login  
**Implementation:** `tokenRefreshInterceptor.js`

### 4. Invalid JWT After Logout
**Severity:** MEDIUM  
**Scenario:** User clicks logout, then browser history back  
**Expected:** Blank page or login redirect, not cached data  
**Implementation:** `authGuard.js`

### 5. Multiple Logout Events
**Severity:** MEDIUM  
**Scenario:** User logs out from 2 browser tabs simultaneously  
**Expected:** Both sessions terminated, no race condition  
**Implementation:** BroadcastChannel API

---

## Category 2: Data Consistency (8 cases)

### 6. Duplicate Event Cancellation
**Severity:** HIGH  
**Scenario:** Two admins cancel same event simultaneously  
**Expected:** First cancels, second returns "already cancelled"  
**Implementation:** See `handleEventCancellation.js`

### 7. Conflicting Updates on Same Record
**Severity:** HIGH  
**Scenario:** User A and B edit same recognition post simultaneously  
**Expected:** Last-write-wins with conflict warning  
**Implementation:** `optimisticLocking.js`

### 8. Database Transaction Rollback Mid-Cascade
**Severity:** HIGH  
**Scenario:** Event cancellation fails on 3rd participation update  
**Expected:** All-or-nothing: entire cascade rolls back  
**Implementation:** Database transaction wrapper

### 9. Stale Data in Leaderboard
**Severity:** MEDIUM  
**Scenario:** Points awarded but leaderboard not recalculated  
**Expected:** Auto-refresh every 5 min, manual refresh available  
**Implementation:** Scheduled task + cache invalidation

### 10. Orphaned Records on Cascade Failure
**Severity:** HIGH  
**Scenario:** Event deleted, but participations still exist  
**Expected:** Automatic cleanup or cascade constraint  
**Implementation:** Database cascade delete rules

### 11. Double-Charging in Points Redemption
**Severity:** CRITICAL  
**Scenario:** User clicks redeem 2x rapidly before request completes  
**Expected:** Only 1 redemption, 2nd gets "already redeemed"  
**Implementation:** `rewardRedemption.js` idempotency

### 12. Out-of-Order Message Delivery
**Severity:** MEDIUM  
**Scenario:** Notification sent before underlying action committed  
**Expected:** Notifications sent only after DB commit confirmed  
**Implementation:** Event-driven architecture + saga pattern

### 13. Timezone Mismatch in Recurring Events
**Severity:** MEDIUM  
**Scenario:** Event scheduled for "9am" differs across timezones  
**Expected:** Store UTC, display in user's timezone  
**Implementation:** `normalizeEventTime.js`

---

## Category 3: File Handling (5 cases)

### 14. Oversized File Upload (11MB)
**Severity:** MEDIUM  
**Scenario:** User uploads 15MB image for recognition post  
**Expected:** Rejected before upload, clear error message  
**Implementation:** `validateFileUpload.js`

### 15. Corrupted File Upload
**Severity:** MEDIUM  
**Scenario:** File partially uploaded or corrupted  
**Expected:** Validation on upload, retry mechanism  
**Implementation:** File integrity check (MD5/SHA256)

### 16. Unsupported File Type Upload
**Severity:** LOW  
**Scenario:** User uploads .exe or .zip file  
**Expected:** Rejected with supported types listed  
**Implementation:** `validateFileUpload.js`

### 17. Duplicate File Upload
**Severity:** LOW  
**Scenario:** Same image uploaded 3x for different posts  
**Expected:** Deduplicated in storage, user sees notice  
**Implementation:** Content hash deduplication

### 18. Storage Quota Exceeded
**Severity:** MEDIUM  
**Scenario:** Company storage limit reached during upload  
**Expected:** Friendly error with storage usage displayed  
**Implementation:** Pre-check quota before upload

---

## Category 4: Search & Filtering (4 cases)

### 19. Empty Search Results
**Severity:** LOW  
**Scenario:** User searches for non-existent term  
**Expected:** Empty state with suggestions  
**Implementation:** Suggestion engine based on popular searches

### 20. Search Injection Attack
**Severity:** HIGH  
**Scenario:** User enters `<script>alert('xss')</script>` in search  
**Expected:** Escaped and treated as literal search term  
**Implementation:** Input sanitization + parameterized queries

### 21. Pagination Off-by-One
**Severity:** MEDIUM  
**Scenario:** User requests page 100, but only 95 pages exist  
**Expected:** Return page 95 or error 404  
**Implementation:** Boundary validation in pagination

### 22. Filter with No Matching Results
**Severity:** LOW  
**Scenario:** User filters events to "wellness" but none exist  
**Expected:** Empty state, clear message, undo filter button  
**Implementation:** Empty state component

---

## Category 5: UI/UX Edge Cases (5 cases)

### 23. Rapid Button Clicks (Double-Click Submit)
**Severity:** HIGH  
**Scenario:** User double-clicks "Create Event" button  
**Expected:** Only 1 event created, button disabled  
**Implementation:** `debounce` + disabled state

### 24. Zoom to 200% Text Overflow
**Severity:** MEDIUM  
**Scenario:** User zooms browser to 200%, text wraps incorrectly  
**Expected:** Text reflows, no horizontal scroll  
**Implementation:** CSS `word-wrap: break-word`, responsive typography

### 25. Modal Keyboard Trap
**Severity:** MEDIUM  
**Scenario:** User tabs in modal, focus escapes to background  
**Expected:** Focus loops within modal only  
**Implementation:** Focus trap library + aria-modal

### 26. Offline Network Status
**Severity:** MEDIUM  
**Scenario:** User goes offline, then online  
**Expected:** Queue pending actions, sync on reconnect  
**Implementation:** Service worker + offline queue

### 27. Rapid Route Changes
**Severity:** LOW  
**Scenario:** User clicks navigation links 5x in 1 second  
**Expected:** Only last navigation completes  
**Implementation:** Route guard with cancel token

---

## Category 6: Notification & Messaging (4 cases)

### 28. Missing Notification Permission
**Severity:** LOW  
**Scenario:** User denies browser notification permission  
**Expected:** Fallback to in-app notifications  
**Implementation:** Permission check + fallback UI

### 29. Notification Spam
**Severity:** MEDIUM  
**Scenario:** System sends 100 notifications in 1 minute  
**Expected:** Batch notifications, rate limiting  
**Implementation:** Notification aggregator

### 30. Unsubscribe From All Notifications
**Severity:** LOW  
**Scenario:** User disables all notification types  
**Expected:** Only critical alerts (invite, moderation) sent  
**Implementation:** `notificationPreferences.js`

### 31. Email Bounce/Invalid Address
**Severity:** MEDIUM  
**Scenario:** Notification email bounces due to invalid address  
**Expected:** Mark user email invalid, disable, retry  
**Implementation:** Email validation + bounce handling

---

## Category 7: Performance & Resource (4 cases)

### 32. Memory Leak on Rapid Page Navigation
**Severity:** MEDIUM  
**Scenario:** User rapidly navigates between 10 pages  
**Expected:** No memory growth, cleanup on unmount  
**Implementation:** useEffect cleanup + abort controllers

### 33. Large Dataset Export (50,000 records)
**Severity:** MEDIUM  
**Scenario:** User exports all historical events  
**Expected:** Background job, email when ready  
**Implementation:** Async export + job queue

### 34. Browser Cache Stale Data
**Severity:** MEDIUM  
**Scenario:** User has old cached JS bundle, creates mismatch  
**Expected:** Detect version mismatch, force refresh  
**Implementation:** Version hash in bundle

### 35. Network Timeout on Slow Connection
**Severity:** MEDIUM  
**Scenario:** User on 3G, API request takes 45 seconds  
**Expected:** Timeout after 30s, user prompt to retry  
**Implementation:** `retryWithBackoff.js`

---

## Implementation Status

### ✅ IMPLEMENTED (20/35)
- [x] Session timeout recovery
- [x] Event cancellation cascade
- [x] Stripe webhook idempotency
- [x] File upload validation
- [x] Event timezone normalization
- [x] Safe navigation (safeGet)
- [x] Debounce function
- [x] Retry with exponential backoff
- [x] Batch processing
- [x] Permission validation
- [x] Circular reference prevention
- [x] JSON parse safety
- [x] Event ownership verification
- [x] Survey anonymization (5-response threshold)
- [x] Unique constraint on participation
- [x] Focus visible indicators
- [x] Empty state components
- [x] Error boundary
- [x] Offline detection
- [x] Rate limiting framework

### 🔄 IN PROGRESS (10/35)
- [ ] Concurrent login handling
- [ ] SSO token refresh
- [ ] Optimistic locking
- [ ] Notification batching
- [ ] Large dataset export
- [ ] Cache busting strategy
- [ ] Focus trap in modals
- [ ] Network timeout handling
- [ ] Search input sanitization
- [ ] Leaderboard refresh automation

### 🔴 DEFER TO v1.1 (5/35)
- [ ] Reaction race condition (async delta update)
- [ ] Multi-tab session sync (BroadcastChannel)
- [ ] Advanced conflict resolution (CRDTs)
- [ ] Email bounce handling (3rd party service)
- [ ] Background job queue (Redis)

---

## Quick Reference

| Case # | Name | Severity | Status | File |
|--------|------|----------|--------|------|
| 1 | Session Timeout Form | HIGH | ✅ | sessionRecovery.js |
| 2 | Concurrent Logins | HIGH | 🔄 | auth.js |
| 3 | SSO Token Expiry | HIGH | 🔄 | tokenRefresh.js |
| 4 | Invalid JWT After Logout | MEDIUM | ✅ | authGuard.js |
| 5 | Multiple Logouts | MEDIUM | 🔄 | auth.js |
| 6 | Duplicate Cancellation | HIGH | ✅ | handleEventCancellation.js |
| 7 | Conflicting Updates | HIGH | 🔄 | optimisticLocking.js |
| 8 | Transaction Rollback | HIGH | ✅ | cascade.js |
| 9 | Stale Leaderboard | MEDIUM | 🔄 | leaderboard.js |
| 10 | Orphaned Records | HIGH | ✅ | database.js |
| 11 | Double-Charge | CRITICAL | ✅ | storeWebhook.js |
| 12 | Out-of-Order Messages | MEDIUM | 🔄 | events.js |
| 13 | Timezone Mismatch | MEDIUM | ✅ | edgeCases.js |
| 14 | Oversized File | MEDIUM | ✅ | edgeCases.js |
| 15 | Corrupted File | MEDIUM | 🔄 | fileValidation.js |
| 16 | Unsupported Type | LOW | ✅ | edgeCases.js |
| 17 | Duplicate File | LOW | 🔄 | deduplication.js |
| 18 | Quota Exceeded | MEDIUM | 🔄 | storage.js |
| 19 | Empty Search | LOW | ✅ | EmptyState.jsx |
| 20 | Search Injection | HIGH | ✅ | edgeCases.js |
| 21 | Pagination Off-by-One | MEDIUM | ✅ | useCursorPagination.js |
| 22 | No Filter Results | LOW | ✅ | EmptyState.jsx |
| 23 | Double-Click Submit | HIGH | ✅ | edgeCases.js |
| 24 | Zoom to 200% | MEDIUM | 🔄 | responsive.css |
| 25 | Modal Focus Trap | MEDIUM | 🔄 | dialog.jsx |
| 26 | Offline Status | MEDIUM | ✅ | ServiceWorkerInit.jsx |
| 27 | Rapid Routes | LOW | ✅ | router.js |
| 28 | Missing Notification Perm | LOW | ✅ | NotificationBell.jsx |
| 29 | Notification Spam | MEDIUM | 🔄 | aggregateNotifications.js |
| 30 | Disable All Notifications | LOW | ✅ | notificationPreferences.js |
| 31 | Email Bounce | MEDIUM | 🔄 | emailValidation.js |
| 32 | Memory Leak | MEDIUM | ✅ | useEffect cleanup |
| 33 | Large Export | MEDIUM | 🔄 | backgroundJob.js |
| 34 | Stale Cache | MEDIUM | 🔄 | cacheBusting.js |
| 35 | Network Timeout | MEDIUM | ✅ | edgeCases.js |

---

## Testing All Edge Cases

### Test Command
```bash
npm test -- --testPathPattern="edge|race|timeout|concur|crash"
```

### Manual Checklist
- [ ] Session timeout + form recovery
- [ ] Rapid double-clicks on buttons
- [ ] Offline/online transitions
- [ ] Zoom to 200% readability
- [ ] Tab navigation in modals
- [ ] Search with special characters
- [ ] File upload oversized
- [ ] Rapid route changes
- [ ] Concurrent API requests

---

**Last Updated:** January 14, 2026  
**Maintenance:** Review weekly, add new cases as discovered