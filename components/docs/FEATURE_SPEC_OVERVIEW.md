# Interconnected Features - System Overview
## Employee Engagement Platform - Intinc

---

## Executive Summary

This document provides a comprehensive overview of how the three core engagement modules (Pulse Surveys, Peer Recognition, and Point Store) work together to create a cohesive employee engagement experience. Each module reinforces the others through shared points economy and cross-feature integrations.

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EMPLOYEE ENGAGEMENT PLATFORM                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  PULSE SURVEYS  │    │   RECOGNITION   │    │   POINT STORE   │         │
│  │                 │    │                 │    │                 │         │
│  │ • Create        │    │ • Give Shoutout │    │ • Browse Items  │         │
│  │ • Respond       │◄──►│ • Award Points  │◄──►│ • Purchase      │         │
│  │ • Analyze       │    │ • Moderate      │    │ • Customize     │         │
│  │                 │    │ • React/Comment │    │ • Power-Ups     │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           └──────────────────────┼──────────────────────┘                   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         POINTS ECONOMY                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │  │   EARN      │  │   TRACK     │  │   SPEND     │  │   COMPETE   │  │ │
│  │  │             │  │             │  │             │  │             │  │ │
│  │  │ Surveys     │  │ UserPoints  │  │ Store       │  │ Leaderboard │  │ │
│  │  │ Recognition │  │ History     │  │ Power-Ups   │  │ Challenges  │  │ │
│  │  │ Events      │  │ Level/XP    │  │ Donations   │  │ Teams       │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         INTEGRATION LAYER                              │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │ │
│  │  │  Slack  │  │  Teams  │  │ Calendar│  │  Email  │  │ Stripe  │     │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Between Modules

### 2.1 Points Flow

```
                    EARNING POINTS
                    ══════════════

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   SURVEYS    │         │  RECOGNITION │         │    EVENTS    │
│              │         │              │         │              │
│ Complete     │         │ Give: +5     │         │ Attend: +10  │
│ Survey: +10  │         │ Receive: +10 │         │ Facilitate:  │
│              │         │ + Bonus pts  │         │ +25          │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │      UserPoints       │
                    │                       │
                    │  total_points: 2450   │
                    │  available_points:    │
                    │  2200                 │
                    │  level: 12            │
                    │  xp: 450/1000         │
                    └───────────┬───────────┘
                                │
                                ▼
                    SPENDING POINTS
                    ═══════════════

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    STORE     │         │  RECOGNITION │         │   REWARDS    │
│              │         │              │         │              │
│ Avatar Items │         │ Bonus Points │         │ Gift Cards   │
│ Power-Ups    │         │ to Others    │         │ Experiences  │
│ Themes       │         │              │         │ Donations    │
└──────────────┘         └──────────────┘         └──────────────┘
```

### 2.2 Recognition-Store Connection

```
RECOGNITION AWARDED
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  Sender: Sarah                      Recipient: Alex              │
│  ┌───────────────┐                  ┌───────────────┐           │
│  │ Gives 25 pts  │─────────────────►│ Receives 25   │           │
│  │ from daily    │                  │ + 10 base     │           │
│  │ allowance     │                  │ = 35 points   │           │
│  │               │                  │               │           │
│  │ Also earns    │                  │ Can spend in  │           │
│  │ 5 pts for     │                  │ Point Store   │           │
│  │ giving        │                  │               │           │
│  └───────────────┘                  └───────────────┘           │
│                                                                   │
│  If Alex has 2X Point Boost (from Store):                        │
│  Base: 35 × 2 = 70 points!                                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 Survey-Recognition Connection

```
SURVEY INSIGHTS
       │
       ├─── Low Recognition Score ───► Prompt HR to 
       │                               encourage recognition
       │
       ├─── Team Sentiment Low ───────► Suggest team-wide
       │                               recognition campaign
       │
       └─── Specific Feedback ────────► (Anonymized) Surface
                                       themes for recognition
                                       tag creation
```

---

## 3. Complete Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORE ENTITIES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐                       │
│  │    User    │────►│ UserPoints │────►│ UserAvatar │                       │
│  │            │     │            │     │            │                       │
│  │ email      │     │ total_pts  │     │ equipped   │                       │
│  │ full_name  │     │ level      │     │ items      │                       │
│  │ role       │     │ xp         │     │ power_ups  │                       │
│  └─────┬──────┘     └────────────┘     └────────────┘                       │
│        │                                                                     │
│        │         SURVEYS                    RECOGNITION                      │
│        │         ════════                   ═══════════                      │
│        │                                                                     │
│        │    ┌────────────┐              ┌────────────┐                      │
│        ├───►│   Survey   │              │Recognition │◄────┐                │
│        │    │            │              │            │     │                │
│        │    │ questions  │              │ sender     │     │                │
│        │    │ settings   │              │ recipients │     │                │
│        │    │ recurrence │              │ message    │     │                │
│        │    └─────┬──────┘              │ tags       │     │                │
│        │          │                     │ points     │     │                │
│        │          ▼                     │ status     │     │                │
│        │    ┌────────────┐              └────────────┘     │                │
│        │    │  Survey    │                    │            │                │
│        ├───►│ Invitation │              ┌─────┴─────┐      │                │
│        │    │            │              ▼           ▼      │                │
│        │    │ status     │        ┌──────────┐ ┌──────┐   │                │
│        │    │ sent_at    │        │ Comments │ │React-│   │                │
│        │    └────────────┘        │          │ │ions  │   │                │
│        │                          └──────────┘ └──────┘   │                │
│        │    ┌────────────┐                                │                │
│        │    │  Survey    │              ┌─────────────┐   │                │
│        │    │  Response  │              │ Recognition │   │                │
│        │    │ (ANONYMOUS)│              │    Tag      │───┘                │
│        │    │            │              │             │                     │
│        │    │ NO user_id │              │ name        │                     │
│        │    │ answers    │              │ type        │                     │
│        │    └────────────┘              │ usage_count │                     │
│        │                                └─────────────┘                     │
│        │                                                                     │
│        │         POINT STORE                                                │
│        │         ═══════════                                                │
│        │                                                                     │
│        │    ┌────────────┐         ┌────────────┐                          │
│        ├───►│ StoreItem  │◄────────│  Store     │◄────────┐                │
│        │    │            │         │ Transaction│         │                │
│        │    │ name       │         │            │         │                │
│        │    │ category   │         │ type       │         │                │
│        │    │ pricing    │         │ points     │         │                │
│        │    │ effects    │         │ stripe_id  │         │                │
│        │    └─────┬──────┘         │ status     │         │                │
│        │          │                └────────────┘         │                │
│        │          ▼                                       │                │
│        │    ┌────────────┐                                │                │
│        └───►│   User     │────────────────────────────────┘                │
│             │ Inventory  │                                                  │
│             │            │                                                  │
│             │ items      │                                                  │
│             │ equipped   │                                                  │
│             │ expires_at │                                                  │
│             └────────────┘                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Architecture

### 4.1 Backend Functions Required

| Function | Purpose | Trigger |
|----------|---------|---------|
| **Surveys** | | |
| `createSurvey` | Create survey with validation | HR action |
| `sendSurveyInvitations` | Send invites to audience | Scheduled/Manual |
| `submitSurveyResponse` | Anonymous response handling | User submit |
| `aggregateSurveyResults` | Compute stats (if threshold met) | On access |
| `sendSurveyReminders` | Reminder to non-responders | Cron (daily) |
| **Recognition** | | |
| `createRecognition` | Submit with moderation | User action |
| `moderateRecognition` | AI + HR review | Post-submit |
| `approveRecognition` | Publish + notify | Admin action |
| `awardRecognitionPoints` | Points to both parties | Post-approve |
| `rotateFeatureRecognition` | Select featured | Cron (weekly) |
| **Point Store** | | |
| `purchaseWithPoints` | Deduct points, add inventory | User action |
| `createStoreCheckout` | Stripe checkout session | User action |
| `storeWebhook` | Handle Stripe events | Stripe webhook |
| `activatePowerUp` | Apply power-up effects | User action |
| `expirePowerUps` | Remove expired power-ups | Cron (hourly) |
| `syncInventory` | Verify inventory integrity | Cron (daily) |

### 4.2 Cron Jobs

```
┌──────────────────────────────────────────────────────────────────┐
│                        SCHEDULED JOBS                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  EVERY HOUR                                                       │
│  ├── expirePowerUps()     - Remove expired power-ups             │
│  └── processRecurringSurveys() - Check if survey should send    │
│                                                                   │
│  EVERY DAY (9 AM)                                                │
│  ├── sendSurveyReminders() - Nudge non-responders               │
│  ├── resetDailyRecognitionLimits() - Reset daily allowances     │
│  └── calculateDailyStats() - Aggregate analytics                │
│                                                                   │
│  EVERY WEEK (MONDAY 8 AM)                                        │
│  ├── rotateFeatureRecognition() - Select new featured           │
│  ├── sendWeeklyDigest() - Recognition summary email             │
│  └── generateHRReport() - Engagement metrics                    │
│                                                                   │
│  EVERY MONTH (1ST)                                               │
│  ├── archiveOldSurveys() - Archive surveys > 90 days            │
│  └── resetMonthlyStats() - Reset monthly counters               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Security & Privacy Matrix

| Feature | Privacy Concern | Mitigation |
|---------|-----------------|------------|
| **Surveys** | Response attribution | No user ID in responses; separate invitation tracking |
| | Small group identification | Minimum 5 responses before results shown |
| | Text PII leakage | AI scans text for names/emails before storage |
| | Timestamp correlation | Randomize response timestamps ±1 hour |
| **Recognition** | Inappropriate content | Moderation queue + AI filtering |
| | Favoritism patterns | Analytics flag unusual patterns |
| | Points manipulation | Server-side validation; daily limits |
| | Harassment via recognition | Reject negative messages; report button |
| **Store** | Payment fraud | Stripe handles PCI compliance |
| | Points exploitation | Server-side balance checks; rate limits |
| | Inventory manipulation | All purchases server-validated |
| | Price tampering | Prices only from server/Stripe |

---

## 6. Technology Recommendations

### 6.1 Frontend Stack (Current)
- **React 18** - Component library
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **TanStack Query** - Data fetching/caching
- **React Hook Form** - Form handling

### 6.2 Backend Stack (Base44)
- **Deno** - Backend functions runtime
- **Base44 Entities** - Database
- **Base44 SDK** - Auth & data access

### 6.3 Integrations
- **Stripe** - Payment processing
- **OpenAI** - Sentiment analysis, PII detection
- **Slack/Teams** - Notifications
- **SendGrid/Resend** - Email delivery

### 6.4 Recommended Additions
| Need | Recommendation |
|------|----------------|
| Real-time updates | WebSocket/SSE for live feed |
| Image processing | Cloudinary (already integrated) |
| Search | Built-in entity filtering (sufficient for scale) |
| Analytics | Custom dashboard + export to BI tools |

---

## 7. Scalability Considerations

### 7.1 Performance Optimization

```
CACHING STRATEGY
════════════════

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Static Data   │     │  User-Specific  │     │   Real-Time     │
│                 │     │                 │     │                 │
│ Store Items     │     │ User Balance    │     │ Recognition     │
│ Survey Template │     │ Inventory       │     │ Feed            │
│ Tags            │     │ Power-Ups       │     │ Survey Progress │
│                 │     │                 │     │                 │
│ Cache: 1 hour   │     │ Cache: 1 min    │     │ Cache: None     │
│ staleTime: 30m  │     │ staleTime: 30s  │     │ refetchInterval │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 7.2 Database Indexing

```javascript
// Recommended indexes for performance
const indexes = {
  Survey: ['status', 'created_date'],
  SurveyResponse: ['survey_id', 'created_date'],
  SurveyInvitation: ['survey_id', 'user_email', 'status'],
  Recognition: ['status', 'created_date', 'sender_email', 'recipient_emails'],
  StoreItem: ['category', 'is_available', 'rarity'],
  UserInventory: ['user_email', 'item_category'],
  StoreTransaction: ['user_email', 'status', 'created_date']
};
```

### 7.3 Rate Limits

| Action | Limit | Window |
|--------|-------|--------|
| Survey submissions | 1 per survey | Forever |
| Recognition given | 5 | Per day |
| Store purchases | 10 | Per day |
| Recognition reactions | 50 | Per hour |
| API calls (general) | 1000 | Per hour |

---

## 8. Implementation Phases

### Phase 1: Foundation ✅ COMPLETE
- [x] Create all entities (30+ entities defined)
- [x] Build backend functions (20+ functions)
- [x] Implement points system integration
- [x] User authentication (Base44 built-in)

### Phase 2: Activities & Events ✅ COMPLETE
- [x] Activity library (15+ templates)
- [x] Event scheduling system
- [x] Event templates (30+ pre-built)
- [x] Facilitator tools

### Phase 3: Gamification ✅ COMPLETE
- [x] Points economy
- [x] Badge system (10 badges, 5 rarities)
- [x] Leaderboards (individual + team)
- [x] Team challenges

### Phase 4: Channels ✅ COMPLETE
- [x] Channel creation (public/private)
- [x] Real-time messaging
- [x] Reactions & member management

### Phase 5: Surveys 📋 SPECIFIED
- [ ] Survey builder UI
- [ ] Anonymous response handling
- [ ] Results dashboard (threshold-gated)

### Phase 6: Point Store 📋 SPECIFIED
- [ ] Store UI
- [ ] Points purchase flow
- [x] Stripe integration (keys configured)
- [ ] Avatar customization

### Phase 7: Polish 🔄 IN PROGRESS
- [x] Mobile responsive design
- [x] Analytics dashboards
- [ ] Performance optimization
- [ ] Final testing

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Survey Response Rate | >70% | Responses / Invitations |
| Recognition Adoption | >80% | Users giving recognition monthly |
| Store Engagement | >50% | Users purchasing monthly |
| Points Velocity | 1:3 | Earn:Spend ratio |
| Time to Recognition | <24h | Recognition after achievement |
| NPS Score | >50 | From pulse surveys |