import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Error Logging Endpoint
 * Logs client-side errors for monitoring and debugging
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const { error, errorInfo, componentStack, userAgent, url } = await req.json();

    // Create audit log entry for the error
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user?.email || 'anonymous',
      action: 'client_error',
      target_entity: 'ErrorBoundary',
      target_id: url || 'unknown',
      details: {
        error: error?.toString() || 'Unknown error',
        errorInfo,
        componentStack,
        userAgent,
        url,
        timestamp: new Date().toISOString()
      }
    });

    console.error('Client error logged:', {
      user: user?.email,
      error,
      url
    });

    return Response.json({ success: true, logged: true });

  } catch (logError) {
    console.error('Failed to log error:', logError);
    return Response.json({ 
      success: false, 
      error: 'Failed to log error' 
    }, { status: 500 });
  }
});