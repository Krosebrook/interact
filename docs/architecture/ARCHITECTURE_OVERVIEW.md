# Architecture Overview (Visual)

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 16, 2026  
**Version:** 1.0.0

## Overview

This document provides visual diagrams of the Interact platform architecture using Mermaid.js.

---

## System Architecture

```mermaid
graph TB
    subgraph "Frontend (React 18 + Vite 6)"
        UI[User Interface]
        Components[React Components]
        Router[React Router]
        State[State Management]
        Query[TanStack Query]
    end
    
    subgraph "Backend (Base44 SDK)"
        Functions[Serverless Functions]
        Auth[Authentication]
        Database[(Database)]
        Storage[(File Storage)]
    end
    
    subgraph "Third-Party Services"
        AI[AI Services<br/>OpenAI, Claude, Gemini]
        Calendar[Google Calendar]
        Slack[Slack/Teams]
        Media[Cloudinary]
    end
    
    UI --> Components
    Components --> Router
    Components --> State
    Components --> Query
    Query --> Functions
    Router --> Components
    
    Functions --> Auth
    Functions --> Database
    Functions --> Storage
    
    Functions --> AI
    Functions --> Calendar
    Functions --> Slack
    Functions --> Media
    
    Auth -.-> UI
```

---

## Application Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend (React)
    participant API as Base44 Functions
    participant DB as Database
    participant AI as AI Services
    
    User->>UI: Access Platform
    UI->>API: Authenticate
    API->>DB: Verify Credentials
    DB-->>API: User Data
    API-->>UI: Auth Token
    
    User->>UI: View Activities
    UI->>API: GET /activities
    API->>DB: Query Activities
    DB-->>API: Activity List
    API-->>UI: Activities Data
    UI-->>User: Display Activities
    
    User->>UI: Request Recommendations
    UI->>API: GET /recommendations
    API->>DB: Get User Preferences
    DB-->>API: User Data
    API->>AI: Generate Recommendations
    AI-->>API: AI Response
    API-->>UI: Recommendations
    UI-->>User: Display Recommendations
```

---

## Data Flow

```mermaid
graph LR
    User[User Actions] --> Frontend[React Frontend]
    Frontend --> Cache[TanStack Query Cache]
    Cache --> API[Base44 API]
    API --> Database[(Database)]
    
    Database --> Entities[Entities:<br/>Users, Activities,<br/>Points, Badges]
    
    Frontend --> External[External APIs]
    External --> Calendar[Calendar Sync]
    External --> Slack[Notifications]
    External --> AI[AI Processing]
    
    style Frontend fill:#61dafb
    style API fill:#ffa500
    style Database fill:#4a90e2
    style External fill:#ff6b6b
```

---

## Component Hierarchy

```mermaid
graph TD
    App[App.jsx] --> Auth[AuthProvider]
    App --> Router[Router]
    App --> Theme[ThemeProvider]
    
    Router --> Pages[Pages]
    Pages --> Dashboard[Dashboard]
    Pages --> Activities[Activities]
    Pages --> Profile[Profile]
    Pages --> Admin[Admin]
    
    Dashboard --> Stats[Statistics]
    Dashboard --> Leaderboard[Leaderboard]
    Dashboard --> Recent[Recent Activity]
    
    Activities --> List[Activity List]
    Activities --> Detail[Activity Detail]
    Activities --> Create[Create Activity]
    
    List --> Card[Activity Card]
    List --> Filter[Filters]
    List --> Search[Search]
    
    style App fill:#61dafb
    style Pages fill:#ffa500
    style Dashboard fill:#4a90e2
    style Activities fill:#4a90e2
```

---

## Authentication Flow

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> Authenticating: Login/Signup
    Authenticating --> Authenticated: Success
    Authenticating --> Unauthenticated: Failure
    Authenticated --> Unauthenticated: Logout
    Authenticated --> Authenticated: Refresh Token
    
    Authenticated --> Dashboard: Navigate
    Dashboard --> Activities: View Activities
    Dashboard --> Profile: View Profile
    Activities --> Dashboard: Go Back
    Profile --> Dashboard: Go Back
```

---

## Gamification System

```mermaid
graph TB
    User[User Actions] --> Points[Award Points]
    Points --> Level[Check Level]
    Level --> LevelUp{Level Up?}
    
    LevelUp -->|Yes| Badges[Award Badge]
    LevelUp -->|No| Continue[Continue]
    
    Badges --> Notification[Notify User]
    Points --> Leaderboard[Update Leaderboard]
    
    Leaderboard --> Rankings[Calculate Rankings]
    Rankings --> Display[Display to Users]
    
    Points --> Rewards{Milestone?}
    Rewards -->|Yes| Unlock[Unlock Rewards]
    Rewards -->|No| Continue
    
    style Points fill:#ffd700
    style Badges fill:#4a90e2
    style Leaderboard fill:#ff6b6b
```

---

## Activity Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Published: Publish
    Published --> Active: Start
    Active --> InProgress: Participants Join
    InProgress --> Completed: End Activity
    Completed --> Archived: Archive
    
    Draft --> Deleted: Delete
    Published --> Deleted: Cancel
    
    InProgress --> Paused: Pause
    Paused --> InProgress: Resume
    
    Completed --> [*]
    Archived --> [*]
    Deleted --> [*]
```

---

## Feature Module Structure

```mermaid
graph TB
    Module[Feature Module] --> Components[Components/]
    Module --> Hooks[Hooks/]
    Module --> Services[Services/]
    Module --> Utils[Utils/]
    
    Components --> UI[UI Components]
    Components --> Forms[Form Components]
    Components --> Layouts[Layout Components]
    
    Hooks --> Data[Data Hooks]
    Hooks --> State[State Hooks]
    
    Services --> API[API Services]
    Services --> Business[Business Logic]
    
    Utils --> Helpers[Helper Functions]
    Utils --> Constants[Constants]
    
    style Module fill:#61dafb
    style Components fill:#ffa500
    style Hooks fill:#4a90e2
    style Services fill:#ff6b6b
```

---

## Deployment Pipeline

```mermaid
graph LR
    Dev[Development] --> Commit[Git Commit]
    Commit --> PR[Pull Request]
    PR --> Tests[Run Tests]
    Tests --> Lint[Lint & Format]
    Lint --> Build[Build]
    Build --> Review[Code Review]
    Review --> Merge[Merge to Main]
    Merge --> Deploy[Deploy]
    
    Deploy --> Staging[Staging Environment]
    Staging --> Verify[Verification]
    Verify --> Production[Production]
    
    Production --> Monitor[Monitoring]
    Monitor --> Rollback{Issues?}
    Rollback -->|Yes| Staging
    Rollback -->|No| Success[Success]
    
    style Tests fill:#61dafb
    style Build fill:#ffa500
    style Production fill:#4a90e2
```

---

## Database Schema (High-Level)

```mermaid
erDiagram
    USERS ||--o{ ACTIVITIES : participates
    USERS ||--o{ POINTS_LOG : earns
    USERS ||--o{ BADGES : receives
    USERS ||--o{ TEAMS : belongs_to
    
    ACTIVITIES ||--o{ POINTS_LOG : awards
    ACTIVITIES ||--o{ CATEGORIES : has
    ACTIVITIES }o--|| TEAMS : organized_by
    
    BADGES ||--o{ BADGE_TYPES : is_type
    
    USERS {
        string id PK
        string email
        string name
        int points
        int level
        timestamp created_at
    }
    
    ACTIVITIES {
        string id PK
        string title
        string description
        timestamp date
        int points
        string status
    }
    
    POINTS_LOG {
        string id PK
        string user_id FK
        string activity_id FK
        int points
        string reason
        timestamp created_at
    }
    
    BADGES {
        string id PK
        string user_id FK
        string badge_type_id FK
        timestamp awarded_at
    }
```

---

## Security Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Browser]
        LocalStorage[Local Storage<br/>Auth Tokens]
    end
    
    subgraph "API Gateway"
        Auth[Authentication]
        RBAC[Authorization<br/>RBAC]
        RateLimit[Rate Limiting]
    end
    
    subgraph "Application Layer"
        Functions[Serverless Functions]
        Validation[Input Validation]
    end
    
    subgraph "Data Layer"
        DB[(Database)]
        Encryption[Encryption at Rest]
    end
    
    Browser --> Auth
    Auth --> LocalStorage
    Auth --> RBAC
    RBAC --> RateLimit
    RateLimit --> Functions
    Functions --> Validation
    Validation --> DB
    DB --> Encryption
    
    style Auth fill:#ff6b6b
    style RBAC fill:#ffa500
    style Encryption fill:#4a90e2
```

---

## AI Integration Flow

```mermaid
graph TB
    User[User Request] --> Frontend[Frontend]
    Frontend --> Cache{Cached?}
    
    Cache -->|Yes| Return[Return Cached]
    Cache -->|No| Functions[Backend Function]
    
    Functions --> Process[Process Request]
    Process --> AI{AI Service}
    
    AI -->|OpenAI| GPT[GPT-4]
    AI -->|Anthropic| Claude[Claude]
    AI -->|Google| Gemini[Gemini]
    
    GPT --> Response[AI Response]
    Claude --> Response
    Gemini --> Response
    
    Response --> Cache2[Cache Result]
    Cache2 --> Frontend2[Return to Frontend]
    Frontend2 --> User2[Display to User]
    
    style AI fill:#61dafb
    style Response fill:#ffa500
```

---

## Testing Strategy

```mermaid
graph TB
    Code[Code Changes] --> Unit[Unit Tests]
    Unit --> Component[Component Tests]
    Component --> Integration[Integration Tests]
    Integration --> E2E[E2E Tests]
    
    E2E --> Coverage{Coverage > 80%?}
    
    Coverage -->|Yes| Pass[Tests Pass]
    Coverage -->|No| Fail[Need More Tests]
    
    Pass --> Deploy[Deploy]
    Fail --> Code
    
    Deploy --> Monitor[Monitor in Production]
    
    style Unit fill:#61dafb
    style Component fill:#ffa500
    style Integration fill:#4a90e2
    style E2E fill:#ff6b6b
```

---

## Documentation Structure

```mermaid
graph TB
    Root[Root /] --> Core[Core Docs]
    Root --> Docs[docs/]
    Root --> Components[components/docs/]
    Root --> ADR[ADR/]
    
    Core --> README[README.md]
    Core --> PRD[PRD.md]
    Core --> Roadmap[FEATURE_ROADMAP.md]
    
    Docs --> Index[index.md<br/>Navigation Hub]
    Docs --> Security[security/]
    Docs --> Guides[Guides]
    
    Security --> GDPR[GDPR_CHECKLIST.md]
    Security --> Incident[INCIDENT_RESPONSE.md]
    
    Components --> Architecture[ARCHITECTURE.md]
    Components --> Database[DATABASE_SCHEMA.md]
    Components --> API[API_REFERENCE.md]
    
    ADR --> ADR001[001-base44-backend.md]
    ADR --> ADR002[002-react-over-vue.md]
    
    style Root fill:#61dafb
    style Docs fill:#ffa500
    style Components fill:#4a90e2
    style ADR fill:#ff6b6b
```

---

## Resources

- **[Complete System Architecture](../components/docs/COMPLETE_SYSTEM_ARCHITECTURE.md)** - Detailed architecture documentation
- **[Database Schema](../components/docs/DATABASE_SCHEMA_TECHNICAL_SPEC.md)** - Complete database design
- **[API Reference](../components/docs/API_REFERENCE.md)** - API documentation
- **[Data Flow](./DATA-FLOW.md)** - Data flow documentation

---

**Last Updated:** January 16, 2026  
**Maintained by:** Architecture Team  
**Questions?** Open an issue with the `documentation` label
