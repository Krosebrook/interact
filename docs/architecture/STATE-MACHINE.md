# State Machines

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  

---

## Overview

This document describes state machines used in the Interact platform for managing complex state transitions.

---

## Activity State Machine

### States

- `draft` - Activity being created
- `scheduled` - Activity planned for future
- `active` - Activity currently running
- `completed` - Activity finished
- `cancelled` - Activity cancelled

### Transitions

```
draft → scheduled (when scheduled)
draft → cancelled (if discarded)
scheduled → active (at start time)
scheduled → cancelled (before start)
active → completed (at end time)
active → cancelled (emergency stop)
```

### State Diagram

```
     ┌─────┐
     │draft│
     └──┬──┘
        │
   ┌────▼────┐
   │scheduled│◄────┐
   └────┬────┘     │ (reschedule)
        │          │
    ┌───▼───┐      │
    │active │──────┘
    └───┬───┘
        │
   ┌────▼────┐
   │completed│
   └─────────┘
   
   (cancelled state reachable from any state)
```

---

## Challenge State Machine

### States

- `upcoming` - Challenge announced but not started
- `active` - Challenge in progress
- `completed` - Challenge ended
- `archived` - Challenge historical

### Transitions

```
upcoming → active (at start date)
active → completed (at end date)
completed → archived (after 30 days)
```

---

## User Engagement State Machine

### States

- `new` - Just joined (< 7 days)
- `active` - Regular participation
- `at_risk` - Declining engagement
- `inactive` - No activity for 30+ days
- `churned` - Marked as departed

### Transitions

Based on engagement score and activity:

```
new → active (after first week with 3+ activities)
active → at_risk (engagement score drops below 40)
at_risk → inactive (no activity for 30 days)
inactive → churned (admin marks as departed)

at_risk → active (engagement recovers)
inactive → active (returns with activity)
```

---

## Related Documentation

- [DATA-FLOW.md](./DATA-FLOW.md)
- [ALGORITHMS.md](./ALGORITHMS.md)

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026
