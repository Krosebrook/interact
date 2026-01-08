# ENTITY ACCESS RULES DOCUMENTATION

**Date:** 2025-12-19  
**Purpose:** Comprehensive RBAC implementation for all 68 entities  
**Compliance:** GDPR, WCAG 2.1 AA, Custom security requirements

---

## ROLE HIERARCHY

```
admin (HR/People Ops)
  ├─ Full access to all entities
  ├─ Can view all user PII
  ├─ Analytics & reporting access
  └─ System configuration

facilitator (Team Leads, Event Organizers)
  ├─ Create/manage events & activities
  ├─ View participant data (limited)
  ├─ Manage teams & channels
  └─ Cannot access: User PII, System configs, Audit logs

participant (Regular Employees)
  ├─ View public content
  ├─ Manage own profile & preferences
  ├─ Participate in events/surveys
  └─ Cannot access: Admin functions, Other users' private data
```

---

## ACCESS RULES BY CATEGORY

### 1️⃣ ADMIN-ONLY ENTITIES

**Full Control (CRUD) by Admin Only**

| Entity | Justification |
|--------|---------------|
| `AuditLog` | Security logs, compliance |
| `UserInvitation` | User management |
| `GamificationConfig` | System configuration |
| `GamificationABTest` | A/B testing, analytics |
| `Integration` | Third-party integrations |
| `TeamsConfig` | Microsoft Teams setup |
| `ProjectDocumentation` | Internal documentation |
| `AnalyticsSnapshot` | Aggregated analytics |
| `AIInsight` | System-generated insights |
| `FeedbackAnalysis` | Aggregated feedback |
| `SkillTrendAnalysis` | Company-wide skill trends |
| `UserRole` | Role definitions (DO NOT MODIFY per instructions) |
| `UserRoleAssignment` | Role assignments |
| `Badge` | Badge library management |
| `Reward` | Reward catalog |
| `AchievementTier` | Tier system configuration |
| `EventManager` | AI agent data |
| `GamificationAssistant` | AI agent data |
| `RewardManager` | AI agent data |

**Access Pattern:**
```json
{
  "permissions": {
    "read": {
      "rules": {
        "role": "admin"
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

---

### 2️⃣ FACILITATOR + ADMIN ENTITIES

**Create/Manage by Facilitators & Admins**

| Entity | Read Access | Write Access |
|--------|-------------|--------------|
| `Activity` | Public | Admin, Facilitator |
| `Event` | Public | Admin, Facilitator |
| `ActivityModule` | Public | Admin, Facilitator |
| `EventSeries` | Public | Admin, Facilitator |
| `BulkEventSchedule` | Admin, Facilitator | Admin, Facilitator |
| `EventTemplate` | Public/Creator | Admin, Facilitator |
| `Poll` | Public | Admin, Facilitator |
| `TimeSlotPoll` | Public | Admin, Facilitator |
| `Announcement` | Public | Admin, Facilitator |
| `Team` | Public | Admin, Facilitator, Team Leader |
| `TeamChallenge` | Public | Admin, Facilitator |
| `Channel` | Public channels only | Admin, Facilitator |
| `RegistrationForm` | Public | Admin, Facilitator |
| `EventPreparationTask` | Assigned user, Admins, Facilitators | Admin, Facilitator |
| `ReminderSchedule` | Admin, Facilitator | Admin, Facilitator |
| `EventRecording` | Public | Admin, Facilitator |

**Example: Activity**
```json
{
  "permissions": {
    "read": {
      "rules": {}  // Public read
    },
    "write": {
      "rules": {
        "role": {
          "$in": ["admin", "facilitator"]
        }
      }
    }
  }
}
```

---

### 3️⃣ USER-OWNED ENTITIES

**Users Can Only Access Their Own Records**

| Entity | Read Rule | Write Rule | Use Case |
|--------|-----------|------------|----------|
| `UserProfile` | Admin OR self | Admin OR self | Profile management |
| `UserPreferences` | Self only | Self only | Settings |
| `UserOnboarding` | Admin OR self | Self creates, both update | Tutorial progress |
| `Notification` | Self only | Public create | User notifications |
| `EventBookmark` | Self only | Self only | Saved events |
| `ActivityFavorite` | Self only | Self only | Favorite activities |
| `ActivityPreference` | Self only | Self only | Activity preferences |
| `UserInventory` | Admin OR self | Public create, self updates | Point store items |
| `UserAvatar` | Public read | Self only | Avatar customization |
| `PersonalChallenge` | Admin OR self | Admin OR self | Personal goals |
| `SkillTracking` | Admin OR self | Admin OR self | Skill development |

**Example: Notification**
```json
{
  "permissions": {
    "read": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "write": {
      "rules": {}  // Anyone can create notifications for others
    },
    "update": {
      "rules": {
        "user_email": "{{user.email}}"  // Only mark own as read
      }
    },
    "delete": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    }
  }
}
```

---

### 4️⃣ POINTS & GAMIFICATION ENTITIES

**Read Public, Write Restricted**

| Entity | Read Access | Create | Update |
|--------|-------------|--------|--------|
| `UserPoints` | Public (leaderboard) | Admin | Admin |
| `PointsLedger` | Self OR Admin | Admin | Admin |
| `BadgeAward` | Public | Admin | Admin |
| `RewardRedemption` | Self OR Admin | Public | Admin |
| `StoreTransaction` | Self OR Admin | Public | Admin |

**Example: UserPoints**
```json
{
  "permissions": {
    "read": {
      "rules": {}  // Public for leaderboards
    },
    "write": {
      "rules": {
        "role": "admin"  // Only admin can create/update points
      }
    }
  }
}
```

**Example: PointsLedger**
```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          {
            "user_email": "{{user.email}}"  // Users see their own transactions
          },
          {
            "role": "admin"  // Admin sees all
          }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"  // Only admin records transactions
      }
    }
  }
}
```

---

### 5️⃣ PRIVACY-CONTROLLED ENTITIES

**Visibility-Based Access**

| Entity | Access Logic |
|--------|--------------|
| `Recognition` | Public + approved OR private (sender/recipient) OR admin |
| `SocialShare` | Visibility-based (public/team_only) |
| `Milestone` | Public celebrated OR self OR admin |

**Example: Recognition**
```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          {
            "status": "approved",
            "visibility": "public"  // Public recognitions
          },
          {
            "status": "approved",
            "visibility": "private",
            "$or": [
              {
                "sender_email": "{{user.email}}"  // Private: sender can see
              },
              {
                "recipient_email": "{{user.email}}"  // Private: recipient can see
              }
            ]
          },
          {
            "role": "admin"  // Admin sees all (moderation)
          }
        ]
      }
    },
    "write": {
      "rules": {}  // Anyone can create recognition
    },
    "update": {
      "rules": {
        "$or": [
          {
            "role": "admin"  // Admin can moderate
          },
          {
            "sender_email": "{{user.email}}",
            "status": "pending"  // Sender can edit while pending
          }
        ]
      }
    }
  }
}
```

---

### 6️⃣ PARTICIPATION & RSVP ENTITIES

**Event-Based Access**

| Entity | Read Access | Write Access |
|--------|-------------|--------------|
| `Participation` | Admin OR self | Admin, Facilitator, OR self |
| `RegistrationSubmission` | User OR Admin, Facilitator | Public create |

**Example: Participation**
```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          {
            "role": "admin"  // Admin sees all participations
          },
          {
            "participant_email": "{{user.email}}"  // Users see their own
          }
        ]
      }
    },
    "write": {
      "rules": {
        "$or": [
          {
            "role": {
              "$in": ["admin", "facilitator"]  // Facilitators mark attendance
            }
          },
          {
            "participant_email": "{{user.email}}"  // Users RSVP themselves
          }
        ]
      }
    }
  }
}
```

---

### 7️⃣ TEAM & CHANNEL ENTITIES

**Membership-Based Access**

| Entity | Read Access | Write/Delete Access |
|--------|-------------|---------------------|
| `TeamMembership` | Public | Public create, self/admin delete |
| `TeamInvitation` | Invitee OR Inviter OR Admin | Public create, invitee/admin update |
| `TeamMessage` | Public | Public create, sender/admin delete |
| `ChannelMessage` | Public | Public create, sender/admin delete |

**Logic:**
- All employees can see teams/channels
- Users manage their own memberships
- Admins moderate content

---

### 8️⃣ SURVEY ENTITIES (SPECIAL PRIVACY)

**Anonymization-First**

| Entity | Read Access | Write Access |
|--------|-------------|--------------|
| `Survey` | Active/closed OR Admin | Admin only |
| `SurveyResponse` | Admin only (aggregated) | Public create, self update |

**Example: SurveyResponse**
```json
{
  "permissions": {
    "read": {
      "rules": {
        "role": "admin"  // ONLY admin (via aggregation function)
      }
    },
    "write": {
      "rules": {}  // Anyone can submit
    },
    "update": {
      "rules": {
        "respondent_email": "{{user.email}}"  // Can update own draft
      }
    }
  }
}
```

**CRITICAL:** Individual survey responses NEVER exposed to frontend. Use `aggregateSurveyResults` function.

---

### 9️⃣ STORE & REWARDS

| Entity | Read | Create | Update |
|--------|------|--------|--------|
| `StoreItem` | Public | Admin | Admin |
| `StoreTransaction` | Self OR Admin | Public | Admin |
| `UserInventory` | Self OR Admin | Public | Self |

---

### 🔟 PUBLIC READ, PUBLIC WRITE

**Collaborative Content**

| Entity | Reasoning |
|--------|-----------|
| `EventMedia` | Event participants upload photos |
| `EventMessage` | Event participants chat |
| `EventBookmark` | Users bookmark events |
| `Asset` | General file uploads |
| `LeaderboardSnapshot` | Public leaderboards |

**Delete Protection:**
```json
{
  "delete": {
    "rules": {
      "$or": [
        {
          "created_by": "{{user.email}}"  // Creator can delete
        },
        {
          "role": "admin"  // Admin can moderate
        }
      ]
    }
  }
}
```

---

## SECURITY PATTERNS EXPLAINED

### Pattern 1: Self-or-Admin
```json
{
  "read": {
    "rules": {
      "$or": [
        {
          "user_email": "{{user.email}}"
        },
        {
          "role": "admin"
        }
      ]
    }
  }
}
```
**Used for:** Personal data (points ledger, inventory, profile)

### Pattern 2: Role-Based
```json
{
  "write": {
    "rules": {
      "role": {
        "$in": ["admin", "facilitator"]
      }
    }
  }
}
```
**Used for:** Content creation (events, activities, polls)

### Pattern 3: Visibility-Based
```json
{
  "read": {
    "rules": {
      "$or": [
        {
          "visibility": "public"
        },
        {
          "sender_email": "{{user.email}}"
        }
      ]
    }
  }
}
```
**Used for:** User-controlled privacy (recognition, social shares)

### Pattern 4: Status-Based
```json
{
  "read": {
    "rules": {
      "$or": [
        {
          "status": "approved",
          "visibility": "public"
        },
        {
          "role": "admin"
        }
      ]
    }
  }
}
```
**Used for:** Moderated content (recognition awaiting approval)

### Pattern 5: Public Read, Restricted Write
```json
{
  "read": {
    "rules": {}  // Everyone can read
  },
  "write": {
    "rules": {
      "role": "admin"  // Only admin can create/edit
    }
  }
}
```
**Used for:** Reference data (badges, rewards, tiers)

---

## COMPLETE ENTITY ACCESS MATRIX

| Entity | Read | Create | Update | Delete |
|--------|------|--------|--------|--------|
| **ADMIN-ONLY** |
| AuditLog | Admin | Admin | Admin | Admin |
| UserInvitation | Admin | Admin | Admin | Admin |
| GamificationConfig | Public | Admin | Admin | Admin |
| GamificationABTest | Admin | Admin | Admin | Admin |
| Integration | Admin | Admin | Admin | Admin |
| TeamsConfig | Admin | Admin | Admin | Admin |
| ProjectDocumentation | Admin | Admin | Admin | Admin |
| AnalyticsSnapshot | Admin | Admin | Admin | Admin |
| AIInsight | Admin | Admin | Admin | Admin |
| FeedbackAnalysis | Admin | Admin | Admin | Admin |
| SkillTrendAnalysis | Admin | Admin | Admin | Admin |
| UserRole | Admin | Admin | Admin | - |
| UserRoleAssignment | Admin | Admin | Admin | - |
| EventManager | Admin, Fac | Admin | Admin | Admin |
| GamificationAssistant | Admin | Admin | Admin | Admin |
| RewardManager | Admin | Admin | Admin | Admin |
| **FACILITATOR + ADMIN** |
| Activity | Public | Admin, Fac | Admin, Fac | Admin |
| Event | Public | Admin, Fac | Admin, Fac | Admin |
| ActivityModule | Public | Admin, Fac | Admin, Fac | Admin |
| EventSeries | Public | Admin, Fac | Admin, Fac | Admin |
| BulkEventSchedule | Admin, Fac | Admin, Fac | Admin, Fac | Admin |
| Poll | Public | Admin, Fac | Creator, Admin | Admin |
| TimeSlotPoll | Public | Admin, Fac | Public vote | Admin |
| Announcement | Public | Admin, Fac | Admin, Fac | Admin |
| Team | Public | Admin, Fac | Admin, Leader | Admin |
| TeamChallenge | Public | Admin, Fac | Admin, Fac | Admin |
| Channel | Public only | Admin, Fac | Admin, Fac | Admin |
| RegistrationForm | Public | Admin, Fac | Admin, Fac | Admin |
| EventPreparationTask | Assigned, Admin, Fac | Admin, Fac | Assigned, Admin, Fac | Admin |
| ReminderSchedule | Admin, Fac | Admin, Fac | Admin, Fac | Admin |
| EventRecording | Public | Admin, Fac | Admin, Fac | Admin |
| EventTemplate | Public/Creator | Admin, Fac | Creator, Admin | Admin |
| **USER-OWNED** |
| UserProfile | Admin, Self | Public | Admin, Self | Admin |
| UserPreferences | Self | Self | Self | Self |
| UserOnboarding | Admin, Self | Public | Admin, Self | Admin |
| Notification | Self | Public | Self | Self |
| EventBookmark | Self | Self | Self | Self |
| ActivityFavorite | Self | Self | Self | Self |
| ActivityPreference | Self | Self | Self | Self |
| UserInventory | Admin, Self | Public | Self | Admin |
| UserAvatar | Public | Self | Self | Self |
| PersonalChallenge | Admin, Self | Admin, Self | Admin, Self | Admin |
| SkillTracking | Admin, Self | Admin, Self | Admin, Self | Admin |
| **GAMIFICATION** |
| UserPoints | Public | Admin | Admin | Admin |
| PointsLedger | Admin, Self | Admin | Admin | Admin |
| Badge | Public | Admin | Admin | Admin |
| BadgeAward | Public | Admin | Admin | Admin |
| Reward | Public | Admin | Admin | Admin |
| RewardRedemption | Admin, Self | Public | Admin | Admin |
| AchievementTier | Public | Admin | Admin | Admin |
| LeaderboardSnapshot | Public | Admin | Admin | Admin |
| **PRIVACY-CONTROLLED** |
| Recognition | Visibility rules | Public | Admin, Sender (pending) | Admin |
| SocialShare | Visibility rules | Public | Self, Admin | Self, Admin |
| Milestone | Public celebrated, Self, Admin | Admin | Admin, Self | Admin |
| Survey | Active/closed, Admin | Admin | Admin | Admin |
| SurveyResponse | Admin (aggregated) | Public | Self | - |
| **COLLABORATIVE** |
| Participation | Admin, Self | Admin, Fac, Self | Admin, Fac, Self | Admin |
| RegistrationSubmission | User, Admin, Fac | Public | - | Admin |
| TeamMembership | Public | Public | - | Admin, Self |
| TeamInvitation | Invitee, Inviter, Admin | Public | Invitee, Admin | Admin |
| TeamMessage | Public | Public | - | Sender, Admin |
| ChannelMessage | Public | Public | Sender | Sender, Admin |
| EventMessage | Public | Public | - | Sender, Admin |
| EventMedia | Public | Public | - | Uploader, Admin |
| Asset | Public | Public | - | Creator, Admin |
| UserFollow | Public | Self | - | Self |
| **STORE** |
| StoreItem | Public | Admin | Admin | Admin |
| StoreTransaction | Admin, Self | Public | Admin | Admin |

---

## GDPR COMPLIANCE NOTES

### Data Minimization (Article 5.1(c))

**Implemented:**
- ✅ Participation records only visible to participant (unless admin)
- ✅ Survey responses aggregated only (threshold: 5)
- ✅ PointsLedger private (self + admin only)
- ✅ UserProfile respects privacy_settings

### Right to Access (Article 15)

**Status:** ⚠️ Partial
- Users can view their own: Profile, Points, Participations, Recognitions
- **Missing:** Data export functionality
- **Recommendation:** Add "Download My Data" feature

### Right to Erasure (Article 17)

**Status:** ⚠️ Not Implemented
- No deletion flow
- **Recommendation:** Implement soft delete with anonymization

---

## BACKEND FUNCTION SECURITY

**All backend functions MUST:**
1. Authenticate user via `base44.auth.me()`
2. Check permissions before operations
3. Use `base44.asServiceRole` ONLY when necessary
4. Validate webhook signatures (Teams, Stripe)

**Example Pattern:**
```javascript
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check role for sensitive operations
  if (operation === 'delete' && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Proceed with operation
});
```

---

## TESTING ACCESS RULES

### Test Cases

**Test 1: Participant Cannot Edit Events**
```javascript
// As participant user
await base44.entities.Event.update(eventId, { title: 'Hacked' });
// Expected: 403 Forbidden
```

**Test 2: Users Can Only See Their Own Points Ledger**
```javascript
// As user A
await base44.entities.PointsLedger.filter({ user_email: 'userB@company.com' });
// Expected: Empty array (filtered by permission)
```

**Test 3: Private Recognition Not Visible**
```javascript
// As unrelated user
await base44.entities.Recognition.filter({ visibility: 'private' });
// Expected: Empty array (only sender/recipient/admin can see)
```

**Test 4: Admin Can Access Everything**
```javascript
// As admin
await base44.entities.SurveyResponse.list();
// Expected: All responses (for aggregation)
```

---

## MIGRATION NOTES

**Current State:** All entities set to "Public" (full access)

**After Applying Access Rules:**
- Existing frontend code may encounter permission errors
- Use `asServiceRole` in backend functions where needed
- Update queries to respect new access patterns
- Test all pages as different role types

**Breaking Changes:**
1. Non-admins cannot list all UserPoints (still can see leaderboard)
2. Users cannot see other users' Participation records
3. Survey responses become admin-only (use aggregation function)
4. Private recognitions hidden from public feed

---

**End of Entity Access Rules Documentation**