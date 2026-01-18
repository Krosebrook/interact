# Lifecycle Intelligence System

**Version:** 1.0  
**Date:** January 2026  
**Status:** Production Ready

## Overview

The Lifecycle Intelligence System is a comprehensive user journey orchestration framework that continuously adapts the platform experience based on user behavior, engagement patterns, and lifecycle state. It ensures users receive value-driven, contextually appropriate interventions without pressure or dark patterns.

---

## Architecture

### Core Components

#### 1. **Lifecycle State Engine** (`functions/lifecycleStateEngine.js`)
Central orchestrator that manages user lifecycle states and transitions.

**Key Functions:**
- `get_or_create_state` - Initialize or retrieve user lifecycle state
- `detect_state_transition` - Evaluate and execute state transitions
- `calculate_churn_risk` - Compute churn probability using behavioral signals
- `save_context_snapshot` - Preserve user context for seamless returns
- `update_personalization_level` - Adjust guidance intensity based on maturity

#### 2. **Intervention Engine** (`functions/interventionEngine.js`)
Delivers state-appropriate interventions with respect for user attention.

**Key Functions:**
- `get_active_interventions` - Fetch eligible interventions for current state
- `record_intervention_shown` - Track intervention delivery for frequency control
- `dismiss_intervention` - Suppress specific interventions permanently
- `track_intervention_action` - Record user interaction with interventions

#### 3. **Frontend Components**
- `LifecycleOverview.jsx` - Visual dashboard of user journey and health
- `InterventionWidget.jsx` - Non-intrusive intervention display
- `LifecycleIntelligenceDashboard.js` - Comprehensive lifecycle analytics page

---

## Lifecycle States

### 7-State Model

| State | Description | Entry Criteria | Characteristics |
|-------|-------------|----------------|-----------------|
| **New** | Just signed up | `days_since_signup: 0` | Onboarding, exploring |
| **Activated** | First meaningful action | `first_meaningful_action: true` | Initial momentum |
| **Engaged** | Regular active user | `sessions_per_week: 2, weeks_active: 2` | Habit formation |
| **Power User** | Advanced, high-value | `unlocked_tiers: 1, sessions_per_week: 3` | Advanced features |
| **At-Risk** | Declining engagement | `engagement_drop: 40%, days_without_activity: 7` | Intervention needed |
| **Dormant** | Inactive 21+ days | `days_without_activity: 21` | Reactivation needed |
| **Returning** | Dormant user re-engaged | `was_dormant: true, session_triggered: true` | Context restoration |

### State Transitions

```mermaid
graph LR
    New --> Activated
    Activated --> Engaged
    Engaged --> PowerUser
    Engaged --> AtRisk
    AtRisk --> Dormant
    AtRisk --> Engaged
    Dormant --> Returning
    Returning --> Engaged
```

**Key Transition Rules:**
- **New → Activated:** First meaningful action (deal saved, goal configured, community joined)
- **Activated → Engaged:** 2+ sessions/week for 2+ weeks
- **Engaged → Power User:** Unlock capability tier
- **Engaged → At-Risk:** 40% engagement decline + 7 days inactivity
- **At-Risk → Dormant:** 21 days without activity
- **Dormant → Returning:** Re-entry session after dormancy

---

## Churn Risk Detection

### Risk Calculation Algorithm

**Baseline Risk:** 50/100

**Risk Reducers:**
- 3+ weekly sessions: **-30 points**
- 1+ weekly sessions: **-15 points**

**Risk Amplifiers:**
- 7+ days inactive: **+20 points**
- 14+ days inactive: **+20 points**
- 21+ days inactive: **+15 points**

**Risk Signals Tracked:**
- `engagement_decline` - Trend over 14 days (0-100)
- `abandoned_flows` - Incomplete user actions
- `ignored_nudges` - Dismissed prompts consecutively
- `missed_habit_loops` - Expected but untriggered loops
- `inactivity_days` - Days since last meaningful activity

**Risk Levels:**
- **Low:** 0-40 (Healthy engagement)
- **Medium:** 41-70 (Monitor closely)
- **High:** 71-100 (Intervention required)

---

## Intervention Playbooks

### Design Principles
1. **Respectful Tone** - Never guilt, pressure, or use countdown timers
2. **Value-First** - Every intervention must deliver utility
3. **Frequency Limits** - Enforce cooldown periods to prevent fatigue
4. **User Control** - Users can dismiss/suppress any intervention

### Playbook by State

#### **At-Risk Users**
**Tone:** Supportive  
**Interventions:**
- Value reminder (weekly): "What changed since you were last active"
- Relevance reset (3 days): "Your feed refreshed based on current interests"
- Simplified prompt (2 days): "One thing to explore today"

**Philosophy:** Re-engage with value, not guilt. Reduce friction, increase relevance.

#### **Dormant Users**
**Tone:** Respectful  
**Interventions:**
- High-signal summary (14 days): "Top 3 things you missed"
- Optional re-entry (30 days): "Welcome back, no pressure—catch up at your pace"

**Philosophy:** Respect their absence. Provide clear value if they return, but never spam.

#### **Returning Users**
**Tone:** Welcoming  
**Interventions:**
- Context restoration (1 day): "Picking up where you left off"
- Resume unfinished (1 day): "You were exploring these..."
- Gentle momentum (7 days): "Keep up with new insights since you left"

**Philosophy:** Celebrate their return. Reduce cognitive load with context awareness.

#### **Engaged Users**
**Tone:** Enabling  
**Interventions:**
- Feature discovery (7 days): "New feature: advanced scenario modeling"
- Habit reinforcement (7 days): "Your weekly digest is ready"

**Philosophy:** Unlock new value. Reinforce positive habits.

#### **Power Users**
**Tone:** Partnership  
**Interventions:**
- Advanced capabilities (14 days): "New advanced features for power users"
- Value metrics (30 days): "Here's the value you've created this month"

**Philosophy:** Treat as partners. Show ROI and unlock premium features.

---

## Personalization Levels

### Adaptive Guidance Intensity

| Level | State Context | Guidance Approach |
|-------|---------------|-------------------|
| **Onboarding** | New users (0-30 days) | Full hand-holding, tooltips, walkthroughs |
| **Learning** | Engaged (30-60 days) | Reduced prompts, encourage exploration |
| **Autonomous** | Engaged (60+ days) | Light guidance, feature highlights only |
| **Expert** | Power users | No guidance, advanced features unlocked |

**Auto-Adjustment Logic:**
- 0-30 days + state=New/Activated → Onboarding
- 30-60 days + state=Engaged → Learning
- 60+ days + state=Engaged → Autonomous
- state=Power User → Expert (regardless of time)

---

## Context Preservation

### Snapshots Saved on State Transition

When transitioning to **At-Risk** or **Dormant**, the system preserves:
- `last_viewed_deals` - Recent deal IDs
- `last_viewed_insights` - Recent insight IDs
- `last_communities_joined` - Recent community IDs
- `saved_at` - Snapshot timestamp

**Restoration Logic:**  
On **Returning** state, interventions surface these snapshots to reduce cognitive load and help users resume seamlessly.

---

## Database Schema

### LifecycleState Entity

```json
{
  "user_email": "string",
  "current_state": "enum[new, activated, engaged, power_user, at_risk, dormant, returning]",
  "state_entered_at": "datetime",
  "previous_state": "enum",
  "state_history": [
    {
      "state": "string",
      "entered_at": "datetime",
      "exited_at": "datetime",
      "duration_days": "number"
    }
  ],
  "churn_risk_score": "number (0-100)",
  "churn_signals": {
    "engagement_decline": "number",
    "abandoned_flows": "number",
    "ignored_nudges": "number",
    "missed_habit_loops": "number",
    "inactivity_days": "number"
  },
  "lifecycle_metrics": {
    "total_days_with_platform": "number",
    "lifetime_value_score": "number",
    "return_rate": "number",
    "feature_adoption": "number",
    "last_meaningful_activity": "datetime",
    "session_count": "number"
  },
  "active_interventions": [
    {
      "intervention_id": "string",
      "intervention_type": "string",
      "triggered_at": "datetime",
      "shown": "boolean",
      "dismissed": "boolean",
      "acted_on": "boolean"
    }
  ],
  "suppressed_interventions": ["string"],
  "personalization_level": "enum[onboarding, learning, autonomous, expert]",
  "context_snapshots": {
    "last_viewed_deals": ["string"],
    "last_viewed_insights": ["string"],
    "last_communities_joined": ["string"],
    "saved_at": "datetime"
  }
}
```

---

## Usage Examples

### Frontend: Display Lifecycle Overview

```jsx
import LifecycleOverview from '../components/lifecycle/LifecycleOverview';

export default function DashboardPage() {
  return (
    <div>
      <h1>My Dashboard</h1>
      <LifecycleOverview />
    </div>
  );
}
```

### Frontend: Show Active Interventions

```jsx
import InterventionWidget from '../components/lifecycle/InterventionWidget';

export default function HomePage() {
  return (
    <div>
      <InterventionWidget />
      {/* Rest of page */}
    </div>
  );
}
```

### Backend: Trigger State Transition Check

```javascript
const response = await base44.functions.invoke('lifecycleStateEngine', {
  action: 'detect_state_transition',
  userEmail: user.email
});

if (response.data.transitioned) {
  console.log(`User transitioned from ${response.data.from} to ${response.data.to}`);
}
```

### Backend: Calculate Churn Risk

```javascript
const riskData = await base44.functions.invoke('lifecycleStateEngine', {
  action: 'calculate_churn_risk',
  userEmail: user.email
});

console.log(`Churn Risk: ${riskData.data.risk_level} (${riskData.data.churn_risk_score}/100)`);
```

---

## Best Practices

### 1. Trigger State Detection on Key Events
- User login
- Completing onboarding steps
- Saving deals/goals
- Joining communities
- Daily/weekly scheduled jobs

### 2. Intervention Frequency Control
- Never show same intervention within cooldown window
- Respect user suppression preferences
- Limit total interventions per session (max 1-2)

### 3. Context Awareness
- Save context before At-Risk/Dormant transitions
- Surface context immediately on Returning state
- Use context to personalize interventions

### 4. Avoid Dark Patterns
- ❌ No countdown timers ("Offer expires in 3 hours!")
- ❌ No guilt messaging ("You haven't logged in for X days")
- ❌ No forced modals blocking critical paths
- ✅ Value-first, optional, dismissible interventions

### 5. Monitor Metrics
- Track intervention effectiveness (acted_on rate)
- Monitor churn risk distribution across cohorts
- Measure state transition velocity
- Analyze suppression patterns (if high, intervention is too aggressive)

---

## Automated Processes

### Recommended Automations

1. **Hourly State Detection**
   - Run `detect_state_transition` for all active users
   - Detect At-Risk → Dormant transitions

2. **Daily Churn Risk Calculation**
   - Compute risk scores for all users
   - Flag high-risk users for review

3. **Weekly Intervention Cleanup**
   - Remove expired interventions from `active_interventions`
   - Archive intervention effectiveness metrics

---

## Future Enhancements

### Planned Features
- **Predictive Churn Models:** ML-based churn prediction using historical patterns
- **A/B Testing Framework:** Test different intervention messages/timing
- **Multi-Channel Interventions:** Email, SMS, push notifications
- **Custom Playbooks:** Allow admins to define custom intervention strategies
- **Analytics Dashboard:** Visual analytics for lifecycle intelligence performance

---

## Support & Troubleshooting

### Common Issues

**User stuck in "New" state despite activity:**
- Check if ActivationState entity exists and `is_activated=true`
- Manually trigger `detect_state_transition` action

**Interventions not showing:**
- Verify user has lifecycle state record
- Check if intervention is suppressed (`suppressed_interventions` array)
- Confirm cooldown period has passed

**Churn risk always 50:**
- Ensure RetentionState entity exists for user
- Verify `last_triggered` timestamps on habit loops

---

## Changelog

### v1.0 (January 2026)
- Initial release
- 7-state lifecycle model
- Intervention playbooks for 5 states
- Churn risk detection algorithm
- Context preservation on dormancy
- Adaptive personalization levels

---

## License & Credits

**Built by:** INTeract Platform Team  
**Powered by:** Base44  
**Design Philosophy:** Partnership over pressure, value over growth hacking