# Error Codes

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 14, 2026

## HTTP Status Codes

### 2xx Success
- `200 OK` - Request succeeded
- `201 Created` - Resource created
- `204 No Content` - Success with no response body

### 4xx Client Errors
- `400 Bad Request` - Invalid request format
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation failed
- `429 Too Many Requests` - Rate limit exceeded

### 5xx Server Errors
- `500 Internal Server Error` - Unexpected server error
- `502 Bad Gateway` - Upstream service error
- `503 Service Unavailable` - Service temporarily down

## Application Error Codes

### Authentication (AUTH_xxx)
- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `AUTH_003` - Token invalid
- `AUTH_004` - Session timeout

### Authorization (AUTHZ_xxx)
- `AUTHZ_001` - Insufficient permissions
- `AUTHZ_002` - Resource access denied
- `AUTHZ_003` - Role mismatch

### Validation (VAL_xxx)
- `VAL_001` - Required field missing
- `VAL_002` - Invalid format
- `VAL_003` - Value out of range
- `VAL_004` - Unique constraint violation

### Business Logic (BIZ_xxx)
- `BIZ_001` - Activity capacity reached
- `BIZ_002` - Already joined activity
- `BIZ_003` - Activity not available
- `BIZ_004` - Insufficient points

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VAL_001",
    "message": "Email is required",
    "field": "email",
    "details": {
      "constraint": "required"
    }
  }
}
```

**Document Owner:** API Team  
**Last Updated:** January 14, 2026
