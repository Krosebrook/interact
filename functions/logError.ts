import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { redactPII } from './lib/aiGovernance.ts';

/**
 * LOG ERROR ENDPOINT
 * Receives client-side errors from ErrorBoundary
 * Logs with PII redaction and rate limiting
 */

const ERROR_RATE_LIMIT = 10; // Max 10 errors per user per minute
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Optional authentication (allow anonymous error reporting but tag as such)
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      user = { email: 'anonymous', role: 'anonymous' };
    }

    const { error, errorInfo, componentStack, userAgent, url } = await req.json();

    // Rate limiting per user
    const now = Date.now();
    const rateLimitKey = user.email;
    const rateLimitEntry = rateLimitCache.get(rateLimitKey);

    if (rateLimitEntry) {
      if (now < rateLimitEntry.resetAt) {
        if (rateLimitEntry.count >= ERROR_RATE_LIMIT) {
          return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }
        rateLimitEntry.count++;
      } else {
        rateLimitCache.set(rateLimitKey, { count: 1, resetAt: now + 60000 });
      }
    } else {
      rateLimitCache.set(rateLimitKey, { count: 1, resetAt: now + 60000 });
    }

    // Clean up old rate limit entries
    if (rateLimitCache.size > 1000) {
      for (const [key, entry] of rateLimitCache.entries()) {
        if (now > entry.resetAt) {
          rateLimitCache.delete(key);
        }
      }
    }

    // Redact PII from error details
    const sanitizedError = {
      message: redactPII(error?.message || 'Unknown error'),
      name: error?.name,
      stack: redactPII((error?.stack || '').substring(0, 2000)) // Limit stack trace size
    };

    const sanitizedComponentStack = redactPII((componentStack || '').substring(0, 1000));
    const sanitizedUrl = url?.replace(/([?&])(token|key|secret|password)=[^&]*/gi, '$1$2=[REDACTED]');

    // Log to AuditLog entity
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user.email,
      action: 'client_error',
      target_entity: 'ErrorBoundary',
      target_id: 'frontend',
      severity: 'high',
      details: {
        error: sanitizedError,
        componentStack: sanitizedComponentStack,
        userAgent: userAgent?.substring(0, 200),
        url: sanitizedUrl,
        timestamp: new Date().toISOString()
      }
    });

    // Also create a dedicated error log entry (if you have an ErrorLog entity)
    // await base44.asServiceRole.entities.ErrorLog.create({ ... });

    return Response.json({ success: true });

  } catch (logError) {
    console.error('Error logging failed:', logError);
    return Response.json({ error: 'Failed to log error' }, { status: 500 });
  }
});