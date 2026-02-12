# Glossary

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026  
**Status:** Active Reference  

---

## Purpose

This glossary defines domain-specific terminology, acronyms, and concepts used throughout the Interact platform. It serves as a reference for developers, stakeholders, and AI agents to ensure consistent understanding of terms.

---

## Table of Contents

- [General Platform Terms](#general-platform-terms)
- [Gamification Terms](#gamification-terms)
- [User Roles & Permissions](#user-roles--permissions)
- [Activity & Event Terms](#activity--event-terms)
- [Learning & Development](#learning--development)
- [Analytics & Metrics](#analytics--metrics)
- [Technical Terms](#technical-terms)
- [AI & ML Terms](#ai--ml-terms)
- [Integration Terms](#integration-terms)
- [Business Terms](#business-terms)

---

## General Platform Terms

### Interact
The employee engagement and gamification platform itself. Full name: "Interact Employee Engagement Platform."

### Engagement
The level of emotional and professional commitment an employee has toward their organization. Measured through participation, interaction, and sentiment metrics.

### Participant
A regular user of the platform who participates in activities, earns points, and engages with team members. Also called "employee" or "team member."

### Facilitator
A user role with permissions to create and manage activities for their team or department. Often team leads or managers.

### Administrator (Admin)
A user role with full platform access, including system configuration, user management, and analytics. Typically HR or IT personnel.

### Workspace
The container for a company's instance of Interact. Includes all users, activities, content, and configuration for that organization.

### Dashboard
The main landing page showing personalized insights, activity feed, upcoming events, and key metrics for the logged-in user.

### Feed
A chronological stream of updates including new activities, achievements, recognitions, and team announcements.

---

## Gamification Terms

### Points
The primary virtual currency in Interact. Users earn points by completing activities, achieving goals, and contributing to the community.

**Point Types:**
- **Base Points:** Default points awarded for an activity
- **Bonus Points:** Additional points from multipliers or special conditions
- **Total Points:** Lifetime accumulated points for a user

### Badge
A visual achievement award given to users for reaching specific milestones or completing challenges. Badges appear on user profiles and can be shared.

**Badge Tiers:**
- **Bronze:** Entry-level achievements
- **Silver:** Intermediate achievements  
- **Gold:** Advanced achievements
- **Platinum:** Rare, prestigious achievements

### Level
A user's overall progression rank in the platform, determined by total points earned. Levels unlock new features and privileges.

**Level Progression:**
- Level 1-10: Beginner
- Level 11-25: Intermediate
- Level 26-50: Advanced
- Level 51+: Expert

### Leaderboard
A ranked list of users or teams based on points, activity completion, or other metrics. Can be filtered by time period, department, or location.

**Leaderboard Types:**
- **Global:** All users across the organization
- **Team:** Users within a specific team
- **Department:** Users within a department
- **Period:** Weekly, monthly, quarterly, or all-time

### Streak
A count of consecutive days or weeks a user has completed activities or logged into the platform. Streaks provide bonus multipliers.

### Challenge
A special activity or goal with specific completion criteria, often time-bound. Challenges can be individual or team-based.

**Challenge Types:**
- **Individual:** Solo completion
- **Team:** Collaborative completion
- **Competition:** Users/teams compete for ranking
- **Milestone:** Long-term progressive challenges

### Multiplier
A factor that increases points earned, based on streaks, first-time completion, team participation, or special events.

### Reward
A tangible or intangible benefit earned by accumulating points. Can include gift cards, extra PTO, recognition, or physical prizes.

---

## User Roles & Permissions

### Super Admin
The highest permission level with access to all platform features, including system configuration, user management, and billing. Typically assigned to platform owner.

### Company Admin
Admin role scoped to a specific company/workspace. Can manage users, configure settings, and access analytics within their organization.

### Facilitator
Mid-level role that can create and manage activities, view team analytics, and moderate content within their assigned team or department.

### Team Leader
Similar to Facilitator but focused on managing a specific team. Can create team activities and view team-specific analytics.

### Participant
Standard user role with access to join activities, earn points, view leaderboards, and interact with content. No management capabilities.

### Guest
Limited access role for external users (contractors, partners). Can view specific activities but has restricted participation and no points.

### RBAC (Role-Based Access Control)
The security model that defines what actions each user role can perform in the system.

---

## Activity & Event Terms

### Activity
Any scheduled or on-demand event, task, or initiative that users can participate in to earn points and build engagement.

**Activity Categories:**
- **Team Building:** Social activities to strengthen relationships
- **Wellness:** Health and wellness initiatives
- **Learning:** Educational content and training
- **Social:** Casual interactions and discussions
- **Recognition:** Celebrating achievements and contributions
- **Volunteer:** Community service and giving back

### Event
A time-bound activity with a specific date, time, and location (physical or virtual).

### Recurring Activity
An activity that repeats on a schedule (daily, weekly, monthly).

### Capacity
The maximum number of participants allowed for an activity.

### RSVP
A user's commitment to attend an event. Tracks attendance and sends reminders.

### Check-In
The act of confirming attendance at an activity, typically at or after the event time. Required to earn points for attended activities.

### Waitlist
A queue of users interested in an activity that has reached capacity. Users are auto-enrolled if spots open up.

### Activity Template
A pre-configured activity setup that can be reused to quickly create similar activities.

### Virtual Activity
An activity conducted online (video call, webinar, online game).

### Hybrid Activity
An activity with both in-person and virtual participation options.

---

## Learning & Development

### Learning Path
A structured sequence of courses, modules, or activities designed to develop specific skills or knowledge areas.

### Module
A single unit of learning content within a learning path (video, article, quiz, assignment).

### Skill
A competency or ability tracked in user profiles. Users gain skill points through learning activities and assessments.

### Skill Level
A user's proficiency in a specific skill, typically rated on a scale (1-5 or Beginner/Intermediate/Advanced/Expert).

### Certification
A formal credential earned by completing a learning path or passing an assessment.

### Assessment
A quiz, test, or evaluation used to measure learning outcomes.

### Buddy/Mentor
An experienced employee assigned to guide and support a new employee or someone developing specific skills.

### Onboarding Path
A specialized learning path for new employees covering company culture, policies, and role-specific training.

### Skill Gap
The difference between a user's current skill level and the required level for a role or goal.

---

## Analytics & Metrics

### Engagement Score
A composite metric (0-100) measuring overall user engagement based on activity participation, login frequency, and social interactions.

### Activity Rate
Percentage of users who participated in activities during a given time period.

### Participation Rate
Percentage of invited users who attend or complete a specific activity.

### Completion Rate
Percentage of started activities that users complete.

### MAU (Monthly Active Users)
Count of unique users who logged in and interacted with the platform within the last 30 days.

### DAU (Daily Active Users)
Count of unique users who logged in and interacted with the platform in a single day.

### Retention Rate
Percentage of users who remain active over time (commonly measured at 30, 60, 90 days).

### Churn Rate
Percentage of users who become inactive over a time period.

### NPS (Net Promoter Score)
A measure of user satisfaction based on likelihood to recommend the platform (scale: -100 to +100).

### Pulse Survey
A short, frequent survey used to gauge employee sentiment and engagement levels.

### Heatmap
A visual representation of activity levels across time periods, locations, or departments.

### Trend
The direction and rate of change in a metric over time (increasing, decreasing, stable).

---

## Technical Terms

### SPA (Single Page Application)
The architectural pattern used by Interact where the entire app runs in a single web page with dynamic content updates.

### Component
A reusable UI building block in React. Examples: buttons, cards, forms.

### Hook
A React function that lets components use state and lifecycle features (useState, useEffect, etc.).

### Context
React's way of sharing data across components without prop drilling. Used for auth, theme, etc.

### API (Application Programming Interface)
The interface for the frontend to communicate with the backend, or for external integrations.

### Endpoint
A specific API URL that performs a function (e.g., `/api/activities`, `/api/users/{id}`).

### SDK (Software Development Kit)
A collection of tools and libraries. Interact uses the Base44 SDK for backend operations.

### Middleware
Code that runs between receiving a request and sending a response, often for auth or validation.

### Serverless Function
A backend function that runs on-demand without managing servers. Interact uses Deno functions via Base44.

### SSR (Server-Side Rendering)
Rendering web pages on the server (not currently used; Interact is client-side rendered).

### PWA (Progressive Web App)
A web app that works like a native mobile app with offline support and installability (planned for Q2 2026).

### Bundle
The compiled JavaScript/CSS files sent to the browser. Smaller bundles = faster load times.

### Lazy Loading
Loading code or content only when needed, improving initial load performance.

### CORS (Cross-Origin Resource Sharing)
Security policy that controls which domains can access the API.

### JWT (JSON Web Token)
The authentication token format used to verify user identity.

### OAuth
The protocol used for third-party authentication (Google, Microsoft, etc.).

### Webhook
An HTTP callback that sends real-time data to external systems when events occur.

---

## AI & ML Terms

### Recommendation Engine
The AI system that suggests activities, learning paths, or connections based on user behavior and preferences.

### Collaborative Filtering
An ML technique that recommends items based on similar users' preferences.

### Content-Based Filtering
An ML technique that recommends items similar to those a user has liked before.

### Personalization
Tailoring the user experience based on individual preferences, behavior, and context.

### Sentiment Analysis
AI technique to determine emotional tone of user feedback or comments.

### Natural Language Processing (NLP)
AI that understands and generates human language, used for content generation and analysis.

### Predictive Analytics
Using historical data and ML to forecast future engagement trends or user behavior.

### Training Data
Historical data used to train ML models.

### Model
A trained AI algorithm that makes predictions or decisions.

### Confidence Score
A measure of how certain the AI is about a prediction or recommendation (0-1 or 0-100%).

---

## Integration Terms

### Third-Party Integration
Connection to external platforms (Slack, Microsoft Teams, Google Calendar, etc.).

### Webhook
Automated messages sent to external systems when specific events occur in Interact.

### API Key
A secret token used to authenticate API requests from external systems.

### OAuth Flow
The authentication process for connecting third-party accounts.

### Sync
The process of keeping data consistent between Interact and external systems.

### Calendar Sync
Bidirectional synchronization with Google Calendar, Outlook, etc.

### Slack Integration
Connection allowing activity notifications, reminders, and interactions via Slack.

### Teams Integration
Connection allowing activity notifications and interactions via Microsoft Teams.

### SSO (Single Sign-On)
Authentication method allowing users to log in with existing company credentials (Google, Microsoft, Okta, etc.).

### SAML (Security Assertion Markup Language)
An SSO protocol used by enterprise identity providers.

### Identity Provider (IdP)
An external service that manages user authentication (Okta, Auth0, Azure AD, etc.).

---

## Business Terms

### Freemium
A pricing model with a free tier and paid premium features (planned pricing strategy).

### SaaS (Software as a Service)
The business model: software delivered via the internet on a subscription basis.

### ARR (Annual Recurring Revenue)
The yearly value of subscription contracts.

### MRR (Monthly Recurring Revenue)
The monthly value of subscription contracts.

### Churn
The rate at which customers cancel their subscriptions.

### CAC (Customer Acquisition Cost)
The cost to acquire a new customer (marketing + sales expenses).

### LTV (Lifetime Value)
The total revenue expected from a customer over their entire relationship.

### Seat
A user license in a subscription plan. Companies pay per seat or per user.

### Tenant
A company or organization using the platform. In multi-tenancy, each tenant has isolated data.

### White-Label
A version of the platform rebranded with a customer's logo and colors (planned feature).

### Beta
A pre-release version of the platform tested with selected customers (planned Q2 2026).

### GA (General Availability)
The official public release of the platform or feature.

### SLA (Service Level Agreement)
A commitment to uptime, performance, and support levels (e.g., 99.9% uptime).

### SOC 2
A security compliance framework required by many enterprise customers (planned Q4 2026).

### GDPR (General Data Protection Regulation)
European data privacy law that Interact must comply with.

---

## Acronyms Quick Reference

**Technical:**
- **API:** Application Programming Interface
- **CORS:** Cross-Origin Resource Sharing
- **CSP:** Content Security Policy
- **JWT:** JSON Web Token
- **OAuth:** Open Authorization
- **PWA:** Progressive Web App
- **RBAC:** Role-Based Access Control
- **SDK:** Software Development Kit
- **SPA:** Single Page Application
- **SSO:** Single Sign-On
- **XSS:** Cross-Site Scripting

**Business:**
- **ARR:** Annual Recurring Revenue
- **B2B:** Business-to-Business
- **CAC:** Customer Acquisition Cost
- **GA:** General Availability
- **HR:** Human Resources
- **LTV:** Lifetime Value
- **MRR:** Monthly Recurring Revenue
- **NPS:** Net Promoter Score
- **ROI:** Return on Investment
- **SaaS:** Software as a Service
- **SLA:** Service Level Agreement

**Metrics:**
- **DAU:** Daily Active Users
- **MAU:** Monthly Active Users
- **KPI:** Key Performance Indicator
- **OKR:** Objectives and Key Results

**Compliance:**
- **GDPR:** General Data Protection Regulation
- **PII:** Personally Identifiable Information
- **SOC 2:** Service Organization Control 2
- **WCAG:** Web Content Accessibility Guidelines

---

## Usage Guidelines

### When to Add New Terms

Add terms to this glossary when:
- Introducing new domain concepts
- Using industry-specific jargon
- Creating new features with unique terminology
- Onboarding new team members who may be unfamiliar with terms

### Naming Conventions

**In Code:**
- Use camelCase for variables and functions: `activityScore`, `calculatePoints()`
- Use PascalCase for components and classes: `ActivityCard`, `UserProfile`
- Use UPPER_SNAKE_CASE for constants: `MAX_POINTS`, `DEFAULT_LEVEL`

**In UI:**
- Use Title Case for headings: "Activity Dashboard"
- Use Sentence case for body text: "Complete this activity to earn 50 points"
- Use consistent terminology across all UI elements

**In Documentation:**
- Use the exact terms defined in this glossary
- Capitalize proper nouns (Interact, Base44, React)
- Italicize terms when introducing them for the first time

---

## Related Documentation

- [CONTEXT.md](./CONTEXT.md) - Project context and background
- [ALGORITHMS.md](./ALGORITHMS.md) - Technical algorithms
- [README.md](./README.md) - Project overview
- [PRD.md](./PRD.md) - Product requirements
- [API-CONTRACTS.md](./API-CONTRACTS.md) - API documentation

---

## Glossary Maintenance

**Ownership:** Product and Engineering Teams  
**Update Process:**
1. Propose new terms via pull request
2. Review for clarity and consistency
3. Update related documentation
4. Announce changes to team

**Review Schedule:** Quarterly or when major features are added

---

**Document Owner:** Product & Engineering Teams  
**Last Updated:** January 14, 2026  
**Next Review:** April 2026

---

**End of Glossary**
