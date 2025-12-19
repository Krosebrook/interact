/**
 * WEBHOOK VALIDATION UTILITIES
 * Security layer for external webhook integrations
 */

/**
 * Validate Slack webhook URL
 * Prevents SSRF attacks
 */
export function validateSlackWebhook(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Webhook URL must be a string');
  }

  if (!url.startsWith('https://hooks.slack.com/services/')) {
    throw new Error('Invalid Slack webhook URL. Must be from hooks.slack.com');
  }

  return true;
}

/**
 * Validate Microsoft Teams webhook URL
 * Prevents SSRF attacks
 */
export function validateTeamsWebhook(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Webhook URL must be a string');
  }

  const validDomains = [
    'https://outlook.office.com/webhook/',
    'https://outlook.office365.com/webhook/'
  ];

  if (!validDomains.some(domain => url.startsWith(domain))) {
    throw new Error('Invalid Teams webhook URL. Must be from outlook.office.com or outlook.office365.com');
  }

  return true;
}

/**
 * Verify Stripe webhook signature
 * CRITICAL: Always verify before processing Stripe webhooks
 */
export async function verifyStripeSignature(req, stripe, webhookSecret) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  
  if (!sig) {
    throw new Error('Missing Stripe signature header');
  }

  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      webhookSecret
    );
    return event;
  } catch (err) {
    throw new Error(`Stripe signature verification failed: ${err.message}`);
  }
}

/**
 * Sanitize event data for external notifications
 * Removes PII and sensitive information
 */
export function sanitizeForExternalNotification(event, participations = []) {
  return {
    title: event.title || 'Team Event',
    event_type: event.event_type,
    date: event.scheduled_date,
    duration: event.duration_minutes,
    format: event.event_format,
    location: event.event_format === 'offline' ? event.location : null,
    participant_count: participations.length,
    max_participants: event.max_participants,
    // EXCLUDE:
    // - magic_link (sensitive)
    // - participant names/emails (PII)
    // - engagement_score (sensitive)
    // - feedback (sensitive)
    // - facilitator_email (PII)
  };
}

/**
 * Sanitize user data for external notifications
 * Only includes public-safe information
 */
export function sanitizeUserForNotification(user) {
  return {
    name: user.full_name || 'Team Member',
    // EXCLUDE:
    // - email (PII)
    // - role (sensitive)
    // - any profile data
  };
}

/**
 * Rate limiting helper
 * Prevents webhook spam
 */
const rateLimitMap = new Map();

export function checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    // Window expired, reset
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  record.count++;
  rateLimitMap.set(key, record);
  return true;
}

/**
 * Clean old rate limit entries (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime + 60000) {
      rateLimitMap.delete(key);
    }
  }
}