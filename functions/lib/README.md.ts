# Deno Functions Library

Shared utilities for all Deno backend functions.

## Files

### `middleware.js`
Core middleware for authentication, validation, and error handling.

**Key Exports:**
- `createHandler(name, handler, options)` - Wrapper that adds auth, logging, error handling
- `withAuth(req)` - Authenticate request, returns `{ user, base44 }`
- `requireRole(...roles)` - Role-based authorization
- `validatePayload(payload, schema)` - Input validation
- `handleError(error)` - Standardized error responses
- `successResponse(data)` - Standardized success responses
- `ApiException` - Custom exception class

### `types.js`
JSDoc type definitions and constants.

**Constants:**
- `API_ERROR_CODES` - Standardized error codes
- `USER_ROLES` - User role constants
- `NOTIFICATION_TYPES` - Notification type constants

## Usage Example

```javascript
import {
  createHandler,
  validatePayload,
  successResponse,
  ApiException
} from './lib/middleware.js';
import { API_ERROR_CODES } from './lib/types.js';

const payloadSchema = {
  eventId: { required: true, type: 'string' },
  points: { required: true, type: 'number', min: 1, max: 100 }
};

async function handleMyFunction(req, { user, base44 }) {
  const body = await req.json();
  const payload = validatePayload(body, payloadSchema);
  
  // Business logic here
  const result = await base44.entities.MyEntity.create(payload);
  
  return successResponse({ success: true, data: result });
}

export default Deno.serve(
  createHandler('myFunction', handleMyFunction, {
    requireAuth: true,
    roles: ['admin'],
    method: 'POST'
  })
);
```

## Validation Schema Options

```javascript
{
  fieldName: {
    required: boolean,       // Field is required
    type: 'string' | 'number' | 'boolean' | 'array' | 'object',
    minLength: number,       // String min length
    maxLength: number,       // String max length
    min: number,             // Number min value
    max: number,             // Number max value
    pattern: RegExp,         // Regex pattern
    enum: string[],          // Allowed values
    default: any,            // Default value if not provided
    custom: (value) => bool, // Custom validation function
    customMessage: string    // Custom error message
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error |
| `SERVICE_UNAVAILABLE` | 502/503 | External service error |

## Response Format

### Success
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "eventId": "eventId is required"
    },
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
``