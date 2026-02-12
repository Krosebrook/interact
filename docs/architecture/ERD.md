# Entity Relationship Diagram

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  

---

## Overview

This document provides a high-level Entity Relationship Diagram (ERD) for the Interact platform's data model.

**Note:** For complete schema details, see [components/docs/DATABASE_SCHEMA_TECHNICAL_SPEC.md](./components/docs/DATABASE_SCHEMA_TECHNICAL_SPEC.md)

---

## Core Entities

### User
- Primary entity for all users
- Has one profile
- Has many activities (created, participated)
- Has many achievements (badges, points)
- Has one gamification record
- Has many learning enrollments

### Activity
- Created by one user
- Has many participants (users)
- Has many facilitators (users)
- Belongs to one category
- Can have many check-ins
- Can have many comments

### Badge
- Can be earned by many users
- Has specific criteria
- Has a rarity level

### Challenge
- Can have many participants
- Can be individual or team-based
- Has start and end dates
- Has rewards

### Learning Path
- Contains many modules
- Has many enrollments
- Requires specific skill levels
- Awards badges on completion

### Team
- Has many members (users)
- Has many activities
- Has aggregate metrics

---

## Relationship Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     ├──────────────┐
     │ creates      │ participates
     │              │
┌────▼────┐    ┌───▼──────┐
│Activity │    │ Activity │
└────┬────┘    └──────────┘
     │
     │ has
     │
┌────▼──────┐
│  Comments │
└───────────┘

┌──────────┐       ┌─────────┐
│   User   │──earns──│  Badge  │
└──────────┘       └─────────┘

┌──────────┐       ┌──────────────┐
│   User   │──joins──│  Challenge  │
└──────────┘       └──────────────┘

┌──────────┐       ┌──────────────┐
│   User   │──enrolls─│Learning Path│
└──────────┘       └──────────────┘

┌──────────┐       ┌──────┐
│   User   │──belongs─│ Team │
└──────────┘       └──────┘
```

---

## Key Relationships

### One-to-Many
- User → Activities (created)
- User → Comments
- Activity → Check-ins
- Learning Path → Modules

### Many-to-Many
- Users ↔ Activities (participation)
- Users ↔ Badges (earned)
- Users ↔ Challenges (participation)
- Users ↔ Learning Paths (enrollment)
- Users ↔ Teams (membership)

### One-to-One
- User ↔ UserProfile
- User ↔ GamificationRecord

---

## Indexes

### Primary Indexes
- All entities have `id` primary key (UUID)

### Foreign Key Indexes
- `activity.createdBy` → `user.id`
- `badge_award.userId` → `user.id`
- `badge_award.badgeId` → `badge.id`
- `enrollment.userId` → `user.id`
- `enrollment.pathId` → `learning_path.id`

### Performance Indexes
- `activity.startDate` (for queries by date)
- `user.email` (for authentication)
- `user.role` (for permission checks)
- `activity.status` (for filtering)

---

## Data Integrity

### Constraints
- Email must be unique
- Activity capacity cannot be negative
- Points cannot be negative
- Dates must be valid timestamps

### Cascade Rules
- Delete user → soft delete (mark as deleted)
- Delete activity → delete check-ins, comments
- Delete badge → keep awards (historical)

---

## Related Documentation

- [components/docs/DATABASE_SCHEMA_TECHNICAL_SPEC.md](./components/docs/DATABASE_SCHEMA_TECHNICAL_SPEC.md) - Complete schema
- [SCHEMAS.md](./SCHEMAS.md) - TypeScript schemas
- [DATA-FLOW.md](./DATA-FLOW.md) - Data flow patterns

---

**Document Owner:** Engineering Team  
**Last Updated:** January 14, 2026
