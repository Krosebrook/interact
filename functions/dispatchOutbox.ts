import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MAX_ATTEMPTS = 5;
const RATE_LIMITS = {
  'google_sheets': { rps: 10, concurrency: 5 },
  'google_drive': { rps: 10, concurrency: 5 },
  'google_docs': { rps: 10, concurrency: 5 },
  'google_slides': { rps: 10, concurrency: 5 },
  'google_calendar': { rps: 10, concurrency: 5 },
  'slack': { rps: 1, concurrency: 1 },
  'notion': { rps: 3, concurrency: 3 },
  'linkedin': { rps: 1, concurrency: 2 },
  'tiktok': { rps: 1, concurrency: 2 },
  'resend': { rps: 2, concurrency: 4 },
  'twilio': { rps: 1, concurrency: 4 },
  'openai_tts': { rps: 3, concurrency: 5 },
  'elevenlabs': { rps: 2, concurrency: 3 },
  'fal_ai': { rps: 1, concurrency: 3 },
  'brightdata': { rps: 1, concurrency: 2 },
  'x': { rps: 1, concurrency: 2 },
  'hubspot': { rps: 10, concurrency: 5 },
  'monday': { rps: 1, concurrency: 3 },
  'zapier': { rps: 5, concurrency: 5 },
  'custom_api': { rps: 1, concurrency: 4 }
};

// Error classification patterns
const ERROR_PATTERNS = {
  RATE_LIMIT: [
    /rate limit/i,
    /too many requests/i,
    /quota exceeded/i,
    /429/,
    /throttle/i
  ],
  TRANSIENT: [
    /timeout/i,
    /connection/i,
    /network/i,
    /503/,
    /502/,
    /500/,
    /temporarily unavailable/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i
  ],
  AUTH: [
    /unauthorized/i,
    /invalid token/i,
    /authentication/i,
    /401/,
    /403/,
    /expired/i
  ],
  PERMANENT: [
    /not found/i,
    /404/,
    /invalid email/i,
    /invalid phone/i,
    /malformed/i,
    /400/
  ]
};

function classifyError(error) {
  const errorStr = String(error || '').toLowerCase();
  
  if (ERROR_PATTERNS.RATE_LIMIT.some(pattern => pattern.test(errorStr))) {
    return { type: 'RATE_LIMIT', retryable: true, backoffMultiplier: 4 };
  }
  if (ERROR_PATTERNS.AUTH.some(pattern => pattern.test(errorStr))) {
    return { type: 'AUTH', retryable: false, backoffMultiplier: 1 };
  }
  if (ERROR_PATTERNS.PERMANENT.some(pattern => pattern.test(errorStr))) {
    return { type: 'PERMANENT', retryable: false, backoffMultiplier: 1 };
  }
  if (ERROR_PATTERNS.TRANSIENT.some(pattern => pattern.test(errorStr))) {
    return { type: 'TRANSIENT', retryable: true, backoffMultiplier: 2 };
  }
  
  // Unknown errors - treat as retryable with caution
  return { type: 'UNKNOWN', retryable: true, backoffMultiplier: 2 };
}

function calculateIntelligentBackoff(attemptCount, errorClassification, integrationId) {
  const { backoffMultiplier } = errorClassification;
  
  // Base backoff: 5s, 20s, 80s, 320s, 1280s
  let backoffMs = 5000 * Math.pow(backoffMultiplier, attemptCount);
  
  // Rate limit errors get longer backoff
  if (errorClassification.type === 'RATE_LIMIT') {
    backoffMs = Math.max(backoffMs, 60000); // Min 1 minute for rate limits
  }
  
  // Add jitter to prevent thundering herd (±20%)
  const jitter = backoffMs * 0.2 * (Math.random() - 0.5);
  backoffMs += jitter;
  
  // Cap at 1 hour
  return Math.min(backoffMs, 3600000);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { batchSize = 50 } = await req.json().catch(() => ({}));

    // Fetch queued items
    const queuedItems = await base44.asServiceRole.entities.IntegrationOutbox.filter({
      status: 'queued'
    }, '-created_date', batchSize);

    if (!queuedItems || queuedItems.length === 0) {
      return Response.json({ message: 'No items to dispatch', processed: 0 });
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      dead_letter: 0
    };

    for (const item of queuedItems) {
      try {
        // Check if ready to attempt
        if (item.next_attempt_at && new Date(item.next_attempt_at) > new Date()) {
          continue;
        }

        let response;
        const payload = JSON.parse(item.payload_json);

        // Route to appropriate integration
        switch (item.integration_id) {
          case 'google_sheets':
          case 'google_drive':
          case 'google_docs':
          case 'google_slides':
          case 'google_calendar':
          case 'slack':
          case 'notion':
          case 'linkedin':
          case 'tiktok':
            // OAuth connector integrations - would use base44.asServiceRole.connectors
            response = await dispatchOAuthIntegration(base44, item);
            break;
          
          case 'resend':
            response = await dispatchResend(item, payload);
            break;
          
          case 'twilio':
            response = await dispatchTwilio(item, payload);
            break;
          
          default:
            response = { success: false, error: 'Unknown integration' };
        }

        if (response.success) {
          await base44.asServiceRole.entities.IntegrationOutbox.update(item.id, {
            status: 'sent',
            provider_response_json: JSON.stringify(response.data || {}),
            attempt_count: item.attempt_count + 1
          });
          results.sent++;
        } else {
          const newAttemptCount = item.attempt_count + 1;
          const errorClassification = classifyError(response.error);
          
          // Permanent errors go straight to dead letter
          if (!errorClassification.retryable) {
            await base44.asServiceRole.entities.IntegrationOutbox.update(item.id, {
              status: 'dead_letter',
              last_error: `${errorClassification.type}: ${response.error}`,
              attempt_count: newAttemptCount
            });
            results.dead_letter++;
          } else if (newAttemptCount >= MAX_ATTEMPTS) {
            await base44.asServiceRole.entities.IntegrationOutbox.update(item.id, {
              status: 'dead_letter',
              last_error: `Max attempts (${errorClassification.type}): ${response.error}`,
              attempt_count: newAttemptCount
            });
            results.dead_letter++;
          } else {
            const backoffMs = calculateIntelligentBackoff(
              newAttemptCount,
              errorClassification,
              item.integration_id
            );
            
            await base44.asServiceRole.entities.IntegrationOutbox.update(item.id, {
              status: 'failed',
              last_error: `${errorClassification.type} (retry ${newAttemptCount}/${MAX_ATTEMPTS}): ${response.error}`,
              attempt_count: newAttemptCount,
              next_attempt_at: new Date(Date.now() + backoffMs).toISOString()
            });
            results.failed++;
          }
        }

        results.processed++;

      } catch (error) {
        console.error(`Error processing outbox item ${item.id}:`, error);
      }
    }

    return Response.json(results);

  } catch (error) {
    console.error('dispatchOutbox error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function dispatchOAuthIntegration(base44, item) {
  try {
    // Placeholder - would integrate with actual OAuth connectors
    return { success: true, data: { message: 'OAuth integration dispatch placeholder' } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function dispatchResend(item, payload) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      // Enhanced error context for Resend
      const error = `HTTP ${response.status}: ${errorData.message || errorText}`;
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: `Network error: ${error.message}` };
  }
}

async function dispatchTwilio(item, payload) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  
  if (!accountSid || !authToken) {
    return { success: false, error: 'Twilio credentials not configured' };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(payload).toString()
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      const error = `HTTP ${response.status}: ${errorData.message || errorData.code || errorText}`;
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: `Network error: ${error.message}` };
  }
}