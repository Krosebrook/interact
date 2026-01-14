/**
 * URL Validation Utility
 * Prevents hardcoded fallback URLs and ensures environment-driven configuration
 */

export function getAppUrl() {
  const appUrl = Deno.env.get('APP_URL');
  
  if (!appUrl) {
    throw new Error(
      'APP_URL environment variable not set. ' +
      'Please configure this in your deployment settings.'
    );
  }

  // Validate URL format
  try {
    new URL(appUrl);
  } catch {
    throw new Error(`Invalid APP_URL format: ${appUrl}`);
  }

  return appUrl;
}

export function buildMagicLink(eventId, basePath = 'ParticipantEvent') {
  const appUrl = getAppUrl();
  return `${appUrl}/${basePath}?event=${eventId}`;
}

export function getSecureUrlForNotification(eventId, channel = 'email') {
  const appUrl = getAppUrl();
  
  switch (channel) {
    case 'teams':
    case 'slack':
      return `${appUrl}/ParticipantEvent?event=${eventId}`;
    case 'email':
      return `${appUrl}/ParticipantEvent?event=${eventId}`;
    default:
      return `${appUrl}/ParticipantEvent?event=${eventId}`;
  }
}