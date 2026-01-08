# Data Mapping & Flow Documentation

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Active  

---

## Overview

This document maps all personal data flows within the Interact platform, tracking data from collection through storage, processing, and deletion. This mapping is required for GDPR compliance (Article 30 - Records of Processing Activities) and helps identify security and privacy risks.

---

## Data Collection Points

### 1. User Registration

**Data Collected:**
- Email address (required)
- Full name (required)
- Password (hashed before storage)
- Company/Organization name (optional)
- Department (optional)
- Role (optional)

**Collection Method:** Web form  
**Lawful Basis:** Contract (necessary to provide service)  
**Consent:** Implicit consent by account creation  
**Retention:** Account lifetime + 1 year  

**Data Flow:**
```
User Browser → HTTPS → Base44 API → Database (encrypted at rest)
```

### 2. Profile Management

**Data Collected:**
- Profile photo
- Bio/About me
- Preferences (theme, notifications)
- Social links
- Skills/interests

**Collection Method:** Profile settings form, image upload  
**Lawful Basis:** Contract + Consent  
**Retention:** Account lifetime  

**Data Flow:**
```
User Browser → HTTPS → Base44 API → Cloudinary (images) / Database (metadata)
```

### 3. Activity Participation

**Data Collected:**
- Activity registrations
- Participation status
- Feedback/ratings
- Comments
- Check-ins

**Collection Method:** Activity pages, forms  
**Lawful Basis:** Contract (core platform functionality)  
**Retention:** Account lifetime + 1 year (for analytics)  

**Data Flow:**
```
User Browser → HTTPS → Base44 API → Database
                                  → Analytics (anonymized)
```

### 4. Gamification Data

**Data Collected:**
- Points earned
- Badges awarded
- Leaderboard rankings
- Achievements
- Streaks

**Collection Method:** Automated (system-generated)  
**Lawful Basis:** Contract  
**Retention:** Account lifetime  

**Data Flow:**
```
Activity Completion → Base44 Functions → Database → Leaderboard Display
```

### 5. Analytics & Usage Data

**Data Collected:**
- Page views
- Feature usage
- Session duration
- Click patterns
- Error events

**Collection Method:** Automated (frontend tracking)  
**Lawful Basis:** Legitimate interest (platform improvement)  
**Retention:** 2 years (anonymized after 90 days)  

**Data Flow:**
```
User Browser → Analytics Events → Base44 Functions → Database (anonymized)
```

### 6. Integration Data

**Data Collected:**
- Calendar events (Google Calendar)
- Slack/Teams messages (opt-in)
- Connected account tokens (encrypted)

**Collection Method:** OAuth flow, user authorization  
**Lawful Basis:** Consent (explicit opt-in)  
**Retention:** Until disconnected by user  

**Data Flow:**
```
User Authorization → OAuth Provider → Base44 API → Database (tokens encrypted)
Third-party API ←→ Base44 Functions (on-demand)
```

---

## Data Storage

### Primary Database (Base44 Managed)

**Location:** [To be confirmed - likely AWS or similar]  
**Encryption:** At rest and in transit  
**Backup:** Automated, encrypted backups  
**Access Control:** Role-based, least privilege  

**Tables/Collections:**
- users
- activities
- participations
- points_transactions
- badges
- notifications
- analytics_events
- integrations
- sessions

### File Storage (Cloudinary)

**Location:** Global CDN (US/EU regions)  
**Content:** Profile photos, activity images, uploaded files  
**Encryption:** HTTPS in transit  
**Access Control:** Signed URLs, expiring links  
**Retention:** Until explicitly deleted  

### Session Storage (Base44)

**Location:** Same as primary database  
**Content:** Session tokens, temporary auth data  
**Encryption:** Encrypted at rest and in transit  
**Retention:** 30 days or until logout  

### Cache Layer (If applicable)

**Location:** [TBD - likely Redis or similar]  
**Content:** Non-sensitive, frequently accessed data  
**Retention:** Short-term (minutes to hours)  

---

## Data Processing Activities

### 1. AI-Powered Recommendations

**Purpose:** Suggest relevant activities to users  
**Data Used:**
- Historical participation patterns (pseudonymized)
- Team demographics (aggregated)
- Activity preferences
- Time patterns

**Processors:**
- OpenAI (GPT-4)
- Anthropic (Claude)
- Google (Gemini)

**Data Shared:** Pseudonymized activity data, no direct PII  
**Safeguards:**
- Data minimization (only necessary fields)
- Pseudonymization (user IDs replaced)
- No retention by AI providers (per contracts)
- Standard Contractual Clauses (to be implemented)

**Data Flow:**
```
Database → Base44 Function → Pseudonymize → AI API → Response → Cache → User
```

### 2. Leaderboard Calculation

**Purpose:** Display user rankings  
**Data Used:**
- Points earned
- Activity completion count
- User name and avatar

**Processing:** Automated, real-time  
**Public Display:** Opt-in (users can hide from leaderboards)  

**Data Flow:**
```
Points Update → Trigger → Recalculate Rankings → Update Leaderboard → Display
```

### 3. Email Notifications

**Purpose:** Activity reminders, announcements, engagement  
**Data Used:**
- Email address
- User name
- Notification preferences
- Activity details

**Processor:** [Email service TBD - e.g., SendGrid, AWS SES]  
**Frequency:** Based on user preferences  
**Opt-out:** Available in notification settings  

**Data Flow:**
```
Trigger Event → Base44 Function → Email Service → User Inbox
                                              ↓
                                   Delivery Log (90 days)
```

### 4. Reporting & Analytics

**Purpose:** Platform usage insights for admins  
**Data Used:**
- Aggregated participation stats
- Anonymized user behavior
- Engagement metrics
- Activity effectiveness

**Access:** Admin role only  
**Anonymization:** After 90 days, individual user data aggregated  

**Data Flow:**
```
User Actions → Analytics Events → Aggregation → Dashboard Display (Admin)
```

---

## Data Sharing (Third Parties)

### Third-Party Services

| Service | Purpose | Data Shared | Data Protection |
|---------|---------|-------------|-----------------|
| **Base44** | Backend platform | All user data | DPA required, encryption |
| **Cloudinary** | Image hosting | Images, metadata | DPA required, CDN security |
| **OpenAI** | AI recommendations | Pseudonymized activity data | DPA required, no retention |
| **Anthropic** | AI recommendations | Pseudonymized activity data | DPA required, no retention |
| **Google** | AI analytics | Pseudonymized activity data | DPA required, no retention |
| **Vercel** | Frontend hosting | None (static site) | HTTPS only |
| **Google Calendar** | Calendar sync (opt-in) | Event titles, times | OAuth, user consent |
| **Slack** | Notifications (opt-in) | User name, messages | OAuth, user consent |
| **Microsoft Teams** | Notifications (opt-in) | User name, messages | OAuth, user consent |

**International Transfers:**
- Most services have US presence (requires SCCs)
- Some have EU infrastructure options (to be evaluated)

**Action Items:**
- [ ] Obtain Data Processing Agreements from all services
- [ ] Implement Standard Contractual Clauses
- [ ] Verify data residency options
- [ ] Document transfer safeguards

### Data Recipients (Internal)

**Admin Users:**
- Can view: User lists, activity participation, aggregate analytics
- Cannot view: Passwords, private messages (if any), deleted accounts

**Facilitators:**
- Can view: Activity participants, feedback
- Cannot view: Other teams' data, admin analytics

**Team Leaders:**
- Can view: Own team members, own team activities
- Cannot view: Other teams, org-wide data

**Regular Users:**
- Can view: Own profile, own participation, public leaderboards
- Cannot view: Other users' private data

---

## Data Deletion

### User-Initiated Deletion

**Account Deletion:**
1. User clicks "Delete Account" in settings
2. Confirmation dialog (30-day grace period offered)
3. Account marked for deletion
4. After grace period:
   - User profile deleted
   - Participation history anonymized (for analytics)
   - Points/badges deleted
   - Images deleted from Cloudinary
   - Integration tokens revoked
   - Sessions invalidated

**Soft Delete vs. Hard Delete:**
- Soft delete: Account deactivated, data retained (not GDPR compliant)
- Hard delete: Data permanently deleted (GDPR compliant)
- **Current:** Soft delete implemented
- **Required:** Hard delete with anonymization

**Data Retention After Deletion:**
- Anonymized analytics: 2 years
- Backup retention: 30 days
- Legal hold data: Per legal requirement

### Automated Deletion

**Inactive Accounts:**
- Definition: No login for 3 years
- Process: Email warning at 2.5 years, auto-delete at 3 years
- **Status:** Not yet implemented

**Session Data:**
- Automatic expiration: 30 days or logout
- Cleanup process: Weekly automated job

**Temporary Files:**
- Exports: 7 days
- Logs: 90 days
- Cache: 24 hours

---

## Data Retention Schedule

| Data Type | Retention Period | Deletion Method | Exceptions |
|-----------|------------------|-----------------|------------|
| **User Profile** | Account lifetime + 1 year | Hard delete | Legal hold |
| **Activity Participation** | Account lifetime + 1 year | Hard delete / Anonymize | Analytics (anonymized) |
| **Gamification Data** | Account lifetime | Hard delete | None |
| **Images** | Account lifetime | Delete from Cloudinary | None |
| **Session Data** | 30 days or logout | Auto-expire | None |
| **Analytics (identified)** | 90 days | Anonymize | None |
| **Analytics (anonymous)** | 2 years | Hard delete | None |
| **Logs** | 90 days | Hard delete | Security incidents |
| **Backups** | 30 days | Encrypted deletion | None |
| **Email Delivery Logs** | 90 days | Auto-delete | None |

**Action Items:**
- [ ] Implement automated retention policy enforcement
- [ ] Create data deletion jobs
- [ ] Document exceptions process
- [ ] Regular retention audits

---

## Data Access Controls

### Role-Based Access

**System Administrators:**
- Full database access (production: read-only preferred)
- User management
- Configuration changes
- Audit log access

**Engineering Team:**
- Development environment: Full access
- Staging environment: Full access
- Production: Read-only via admin panel, no direct DB access
- Deployment via CI/CD only

**Product/Customer Success:**
- Admin panel: User support functions
- Reports: Aggregated analytics only
- No direct database access
- No access to passwords, tokens

### Access Logging

**Audit Trail:**
- Database access logged
- Admin actions logged
- Data exports logged
- User authentication logged

**Retention:** 1 year  
**Review:** Monthly for anomalies  

---

## Data Breach Procedures

See [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) for full procedures.

**Quick Summary:**
1. **Detect:** Monitoring alerts, user reports
2. **Assess:** Determine scope and severity
3. **Contain:** Isolate affected systems
4. **Investigate:** Root cause analysis
5. **Notify:** 
   - Supervisory authority (72 hours if high risk)
   - Affected users (without undue delay if high risk)
6. **Remediate:** Fix vulnerability, restore security
7. **Document:** Incident report and lessons learned

---

## Privacy Impact Assessment

### High-Risk Processing Activities

**AI Recommendations:**
- **Risk:** Automated decision-making
- **Impact:** Medium (affects activity suggestions)
- **Mitigation:** Human oversight, explainability, user control

**Wellness Integration (Planned Q3 2025):**
- **Risk:** Health data processing
- **Impact:** High (special category data)
- **Mitigation:** Explicit consent, encryption, limited access

**Leaderboards:**
- **Risk:** Public display of performance
- **Impact:** Low (opt-in, gaming context)
- **Mitigation:** Opt-out available, no sensitive data

**Action Items:**
- [ ] Conduct full Data Protection Impact Assessment
- [ ] Review AI recommendations for bias and fairness
- [ ] Plan wellness integration with privacy-first approach

---

## International Data Transfers

### Current Transfers

**United States:**
- OpenAI (AI processing)
- Anthropic (AI processing)
- Google (AI processing)
- Cloudinary (image hosting - US/EU regions)
- Vercel (hosting - configurable regions)

**Safeguards Needed:**
- [ ] Standard Contractual Clauses (SCCs)
- [ ] Supplementary measures (encryption, pseudonymization)
- [ ] Transfer Impact Assessment
- [ ] Data Processing Agreements

**EU/EEA:**
- Base44 (if EU infrastructure available)
- Cloudinary (EU CDN nodes)

### Future Considerations
- Evaluate EU-only infrastructure options
- Consider data residency requirements by customer
- Multi-region deployment for enterprise customers

---

## Compliance Checklist

**Data Mapping Completed:**
- [x] Collection points identified
- [x] Storage locations documented
- [x] Processing activities mapped
- [x] Third-party sharing documented
- [x] Deletion procedures outlined
- [x] Retention schedule defined
- [x] Access controls documented

**Action Items for Full Compliance:**
- [ ] Implement hard delete functionality
- [ ] Automate retention policy enforcement
- [ ] Obtain all Data Processing Agreements
- [ ] Conduct Data Protection Impact Assessment
- [ ] Implement transfer safeguards (SCCs)
- [ ] Regular data mapping updates (quarterly)

---

## Document Maintenance

**Owner:** Engineering Lead  
**Review Frequency:** Quarterly or after significant changes  
**Next Review:** April 7, 2026  
**Update Triggers:**
- New data collection points
- New third-party integrations
- New processing activities
- Infrastructure changes
- Regulatory changes

---

## References

- [GDPR Article 30 - Records of Processing](https://gdpr-info.eu/art-30-gdpr/)
- [ICO Data Mapping Guidance](https://ico.org.uk/)
- [EDPB Guidelines on Data Processing](https://edpb.europa.eu/)

---

**Approval:**
- [ ] Engineering Lead
- [ ] Data Protection Officer (if appointed)
- [ ] Legal Counsel

**Version History:**
- 2026-01-07: v1.0 - Initial document created
