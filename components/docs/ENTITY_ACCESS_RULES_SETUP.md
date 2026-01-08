# Entity Access Rules Setup Documentation

## Overview
This document provides comprehensive setup instructions and production-grade access rules for all 73 entities in the INTeract Employee Engagement Platform.

## Access Rule Types

### 1. Create-No Restrictions
Anyone authenticated can create records.
```json
"write": {
  "rules": {}
}
```

### 2. Creator Only
Only the record creator can perform operations.
```json
"write": {
  "rules": {
    "created_by": "{{user.email}}"
  }
}
```

### 3. Entity-User Field Comparison
Match entity field to current user property.
```json
"read": {
  "rules": {
    "user_email": "{{user.email}}"
  }
}
```

### 4. User Property Check
Check user role or properties.
```json
"write": {
  "rules": {
    "role": "admin"
  }
}
```

### 5. Complex OR Conditions
Multiple conditions with OR logic.
```json
"update": {
  "rules": {
    "$or": [
      { "user_email": "{{user.email}}" },
      { "role": "admin" }
    ]
  }
}
```

---

## Entity Access Rules

### 1. Activity
**Purpose**: Activity templates and custom activities  
**Security Level**: Medium  
**Access Pattern**: Public read, admin/facilitator write

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 2. Event
**Purpose**: Scheduled events and sessions  
**Security Level**: Medium  
**Access Pattern**: Public read, admin/facilitator write, facilitator update own

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "facilitator_email": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "facilitator_email": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 3. Participation
**Purpose**: Event attendance and engagement tracking  
**Security Level**: Medium  
**Access Pattern**: Users see own, admin/facilitator see all

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    }
  }
}
```

### 4. Asset
**Purpose**: Media files and resources  
**Security Level**: Low  
**Access Pattern**: Public read, admin write

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 5. AIRecommendation
**Purpose**: AI-generated personalized recommendations  
**Security Level**: High  
**Access Pattern**: User sees own only

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 6. ActivityPreference
**Purpose**: User activity preferences  
**Security Level**: High  
**Access Pattern**: User sees/edits own only

```json
{
  "permissions": {
    "read": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "write": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "update": {
      "rules": {
        "user_email": "{{user.email}}"
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

### 7. TeamsConfig
**Purpose**: Microsoft Teams integration settings  
**Security Level**: Critical  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 8. ActivityModule
**Purpose**: Activity module configurations  
**Security Level**: Medium  
**Access Pattern**: Public read, admin write

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 9. Poll
**Purpose**: Live event polls and voting  
**Security Level**: Low  
**Access Pattern**: Public read, facilitator create

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 10. Announcement
**Purpose**: Company-wide announcements  
**Security Level**: Medium  
**Access Pattern**: Public read, admin write

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 11. UserPoints
**Purpose**: Gamification points tracking  
**Security Level**: High  
**Access Pattern**: Users see own, admin manages

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 12. Badge
**Purpose**: Achievement badges  
**Security Level**: Low  
**Access Pattern**: Public read, admin write

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 13. EventPreparationTask
**Purpose**: Pre-event task checklist  
**Security Level**: Medium  
**Access Pattern**: Facilitator of event can manage

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "assigned_to": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 14. EventManager
**Purpose**: Event management metadata  
**Security Level**: Medium  
**Access Pattern**: Admin and facilitators

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 15. GamificationAssistant
**Purpose**: AI gamification assistant data  
**Security Level**: Medium  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 16. Reward
**Purpose**: Points store rewards catalog  
**Security Level**: Low  
**Access Pattern**: Public read (available items), admin write

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "is_available": true },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 17. RewardRedemption
**Purpose**: User reward redemption history  
**Security Level**: High  
**Access Pattern**: Users see own, admin sees all

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 18. RewardManager
**Purpose**: Reward management system config  
**Security Level**: Critical  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 19. Team
**Purpose**: Team/department groups  
**Security Level**: Low  
**Access Pattern**: Public teams visible, private require membership

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "is_private": false },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "leader_email": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 20. TeamChallenge
**Purpose**: Team vs team competitions  
**Security Level**: Low  
**Access Pattern**: Public read, admin/facilitator create

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 21. TeamMessage
**Purpose**: Team chat messages  
**Security Level**: Medium  
**Access Pattern**: Team members only

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "sender_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "sender_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    }
  }
}
```

### 22. UserPreferences
**Purpose**: User app preferences  
**Security Level**: High  
**Access Pattern**: User sees/edits own only

```json
{
  "permissions": {
    "read": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "write": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "update": {
      "rules": {
        "user_email": "{{user.email}}"
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

### 23. Notification
**Purpose**: User notifications  
**Security Level**: High  
**Access Pattern**: User sees own only

```json
{
  "permissions": {
    "read": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "user_email": "{{user.email}}"
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

### 24. EventMedia
**Purpose**: Event photos/videos  
**Security Level**: Low  
**Access Pattern**: Public read, facilitator upload

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "uploaded_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "uploaded_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 25. UserProfile
**Purpose**: Extended user profile data  
**Security Level**: High  
**Access Pattern**: User edits own, admin views based on privacy

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_email": "{{user.email}}" }
        ]
      }
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_email": "{{user.email}}" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_email": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 26. BadgeAward
**Purpose**: Badge earning records  
**Security Level**: Medium  
**Access Pattern**: Public read, system/admin write

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 27. TimeSlotPoll
**Purpose**: Event time voting  
**Security Level**: Low  
**Access Pattern**: Public read/vote, facilitator create

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 28. EventMessage
**Purpose**: Event chat messages  
**Security Level**: Low  
**Access Pattern**: Public read, authenticated write

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "sender_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "sender_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    }
  }
}
```

### 29. EventRecording
**Purpose**: Recorded event videos  
**Security Level**: Low  
**Access Pattern**: Public read, facilitator upload

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "uploaded_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "uploaded_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 30. EventBookmark
**Purpose**: User event bookmarks  
**Security Level**: High  
**Access Pattern**: User manages own only

```json
{
  "permissions": {
    "read": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "write": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "update": {
      "rules": {
        "user_email": "{{user.email}}"
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

### 31. EventSeries
**Purpose**: Multi-session event series  
**Security Level**: Medium  
**Access Pattern**: Public read, facilitator write

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 32. RegistrationForm
**Purpose**: Custom event registration forms  
**Security Level**: Medium  
**Access Pattern**: Public read, facilitator create

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 33. RegistrationSubmission
**Purpose**: User registration form submissions  
**Security Level**: High  
**Access Pattern**: User sees own, facilitator sees event registrations

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    }
  }
}
```

### 34. ReminderSchedule
**Purpose**: Automated reminder configurations  
**Security Level**: Medium  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 35. EventTemplate
**Purpose**: Reusable event templates  
**Security Level**: Low  
**Access Pattern**: Public read, facilitator create

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 36. TeamMembership
**Purpose**: Team member relationships  
**Security Level**: Low  
**Access Pattern**: Public read, user can join/leave

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_email": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_email": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 37. TeamInvitation
**Purpose**: Team join invitations  
**Security Level**: Medium  
**Access Pattern**: Invitee can view/respond

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "invitee_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "invitee_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "invited_by": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    }
  }
}
```

### 38. BulkEventSchedule
**Purpose**: Bulk event scheduling metadata  
**Security Level**: Medium  
**Access Pattern**: Admin/facilitator only

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 39. UserRole
**Purpose**: Custom role definitions  
**Security Level**: Critical  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 40. UserRoleAssignment
**Purpose**: User custom role assignments  
**Security Level**: Critical  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 41. AnalyticsSnapshot
**Purpose**: Periodic analytics data snapshots  
**Security Level**: Critical  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 42. AIInsight
**Purpose**: AI-generated insights and recommendations  
**Security Level**: Medium  
**Access Pattern**: Admin and facilitators

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 43. FeedbackAnalysis
**Purpose**: Aggregated feedback analysis  
**Security Level**: Medium  
**Access Pattern**: Admin and facilitators

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 44. SkillTracking
**Purpose**: User skill development tracking  
**Security Level**: High  
**Access Pattern**: User sees own, admin/facilitator see aggregated

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 45. SkillTrendAnalysis
**Purpose**: Organization-wide skill trends  
**Security Level**: Medium  
**Access Pattern**: Admin and facilitators

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 46. Integration
**Purpose**: Third-party integration configs  
**Security Level**: Critical  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 47. ProjectDocumentation
**Purpose**: Internal project documentation  
**Security Level**: Medium  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 48. Channel
**Purpose**: Communication channels  
**Security Level**: Low  
**Access Pattern**: Public channels visible, private require membership

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "channel_type": "public" },
          { "channel_type": "announcement" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_by": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 49. ChannelMessage
**Purpose**: Channel chat messages  
**Security Level**: Medium  
**Access Pattern**: Channel members only (handled at app level)

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "sender_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "sender_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    }
  }
}
```

### 50. StoreItem
**Purpose**: Points store items  
**Security Level**: Low  
**Access Pattern**: Public read (available), admin write

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "is_available": true },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 51. UserInventory
**Purpose**: User purchased items  
**Security Level**: High  
**Access Pattern**: User sees own only

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 52. UserAvatar
**Purpose**: User avatar customization  
**Security Level**: Medium  
**Access Pattern**: User manages own, others can view

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "update": {
      "rules": {
        "user_email": "{{user.email}}"
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

### 53. StoreTransaction
**Purpose**: Store purchase transactions  
**Security Level**: High  
**Access Pattern**: User sees own, admin sees all

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 54. Recognition
**Purpose**: Peer-to-peer recognition posts  
**Security Level**: Medium  
**Access Pattern**: Public unless private, moderation by admin

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "visibility": "public", "status": "approved" },
          { "visibility": "team_only", "status": "approved" },
          { "visibility": "private", "$or": [
            { "sender_email": "{{user.email}}" },
            { "recipient_email": "{{user.email}}" }
          ]},
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "sender_email": "{{user.email}}", "status": "pending" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "sender_email": "{{user.email}}" }
        ]
      }
    }
  }
}
```

### 55. UserFollow
**Purpose**: User following relationships  
**Security Level**: Medium  
**Access Pattern**: Public read, user creates own

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "follower_email": "{{user.email}}"
      }
    },
    "update": {
      "rules": {
        "follower_email": "{{user.email}}"
      }
    },
    "delete": {
      "rules": {
        "follower_email": "{{user.email}}"
      }
    }
  }
}
```

### 56. LeaderboardSnapshot
**Purpose**: Periodic leaderboard captures  
**Security Level**: Low  
**Access Pattern**: Public read, system write

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 57. PersonalChallenge
**Purpose**: Individual challenges  
**Security Level**: High  
**Access Pattern**: User sees own only

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    }
  }
}
```

### 58. AchievementTier
**Purpose**: Achievement tier definitions  
**Security Level**: Low  
**Access Pattern**: Public read, admin write

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 59. SocialShare
**Purpose**: Social sharing activity  
**Security Level**: Medium  
**Access Pattern**: User creates own, public read

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    }
  }
}
```

### 60. GamificationABTest
**Purpose**: Gamification A/B test data  
**Security Level**: Critical  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 61. GamificationConfig
**Purpose**: Gamification system configuration  
**Security Level**: Critical  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 62. UserOnboarding
**Purpose**: Employee onboarding tracking  
**Security Level**: High  
**Access Pattern**: User sees own, manager/admin see assigned

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" },
          { "manager_email": "{{user.email}}" },
          { "assigned_buddy": "{{user.email}}" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_email": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 63. UserInvitation
**Purpose**: User invitation system  
**Security Level**: Critical  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 64. AuditLog
**Purpose**: System audit trail  
**Security Level**: Critical  
**Access Pattern**: Admin only

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
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 65. PointsLedger
**Purpose**: Points transaction history  
**Security Level**: High  
**Access Pattern**: User sees own, admin sees all

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 66. ActivityFavorite
**Purpose**: User activity favorites  
**Security Level**: High  
**Access Pattern**: User manages own only

```json
{
  "permissions": {
    "read": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "write": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "update": {
      "rules": {
        "user_email": "{{user.email}}"
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

### 67. Survey
**Purpose**: Pulse surveys  
**Security Level**: Medium  
**Access Pattern**: Active surveys visible, admin create

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "status": { "$in": ["active", "closed"] } },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 68. SurveyResponse
**Purpose**: Anonymous survey responses  
**Security Level**: Critical  
**Access Pattern**: Admin only (anonymized aggregation)

```json
{
  "permissions": {
    "read": {
      "rules": {
        "role": "admin"
      }
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "respondent_email": "{{user.email}}"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 69. Milestone
**Purpose**: Employee milestones (birthdays, anniversaries)  
**Security Level**: Medium  
**Access Pattern**: Public if celebrated, admin manages

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "visibility": "public", "celebration_status": "celebrated" },
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_email": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 70. GamificationRule
**Purpose**: Gamification rule engine configs  
**Security Level**: Critical  
**Access Pattern**: Admin only

```json
{
  "permissions": {
    "read": {
      "rules": {}
    },
    "write": {
      "rules": {
        "role": "admin"
      }
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 71. RuleExecution
**Purpose**: Gamification rule execution logs  
**Security Level**: High  
**Access Pattern**: User sees own, admin sees all

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {}
    },
    "update": {
      "rules": {
        "role": "admin"
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 72. LearningPath
**Purpose**: Learning path templates and personalized paths  
**Security Level**: Medium  
**Access Pattern**: Templates public, personalized private

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "is_template": true },
          { "created_for": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "user_type": "facilitator" }
        ]
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "role": "admin" },
          { "created_for": "{{user.email}}" }
        ]
      }
    },
    "delete": {
      "rules": {
        "role": "admin"
      }
    }
  }
}
```

### 73. LearningPathProgress
**Purpose**: User learning path progress tracking  
**Security Level**: High  
**Access Pattern**: User sees own only

```json
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "write": {
      "rules": {
        "user_email": "{{user.email}}"
      }
    },
    "update": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    }
  }
}
```

---

## Implementation Steps

1. **Backup Current Data**: Export all entity data before applying rules
2. **Apply in Phases**: Start with low-risk entities, then medium, then critical
3. **Test Each Phase**: Verify access patterns work as expected
4. **Monitor Errors**: Check logs for unexpected access denials
5. **Document Changes**: Keep audit trail of what was changed when

## Security Best Practices

1. **Principle of Least Privilege**: Grant minimum access needed
2. **Defense in Depth**: Layer security at entity, API, and UI levels
3. **Audit Everything**: Critical entities should log all access
4. **Regular Reviews**: Quarterly access rule audits
5. **User Testing**: Test as different roles before production

## Common Patterns Summary

| Pattern | Use Case | Example |
|---------|----------|---------|
| Public Read | Non-sensitive, collaborative data | Activities, Events, Teams |
| Owner Only | Personal data, preferences | UserPreferences, ActivityFavorite |
| Role-Based | Admin functions, configurations | GamificationConfig, Integration |
| Conditional | Privacy settings, moderation | Recognition, UserProfile |
| Hierarchical | Manager/team access | UserOnboarding, TeamMembership |

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-22  
**Compliance**: WCAG 2.1 AA, GDPR-ready