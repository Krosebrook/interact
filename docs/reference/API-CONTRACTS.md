# API Contracts

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026

## Overview

API endpoint specifications and contracts for the Interact platform. Complete documentation at [components/docs/API_REFERENCE.md](../../components/docs/API_REFERENCE.md).

## Base URL

- **Production:** `https://api.interact.app`
- **Staging:** `https://staging-api.interact.app`
- **Development:** `http://localhost:3000`

## Authentication

All requests require Bearer token:
```
Authorization: Bearer <jwt_token>
```

## Core Endpoints

### Activities
- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity
- `GET /api/activities/:id` - Get activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Users
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `GET /api/users/:id/gamification` - Get gamification data

### Gamification
- `GET /api/badges` - List badges
- `POST /api/badges/award` - Award badge
- `GET /api/leaderboard` - Get leaderboard

## Related Documentation

- [components/docs/API_REFERENCE.md](../../components/docs/API_REFERENCE.md)
- [SCHEMAS.md](./SCHEMAS.md)
- [AUTH.md](../security/AUTH.md)

**Document Owner:** API Team  
**Last Updated:** January 14, 2026
