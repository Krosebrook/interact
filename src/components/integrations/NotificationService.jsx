/**
 * Notification Service
 * Centralized service for sending notifications across all channels
 */

import { base44 } from '@/api/base44Client';

const APP_BASE_URL = window.location.origin;

/**
 * Send notification to Slack
 */
export async function sendSlackNotification(type, data) {
  try {
    const response = await base44.functions.invoke('slackNotifications', {
      type,
      data: {
        ...data,
        eventUrl: data.eventUrl || `${APP_BASE_URL}/Calendar`,
        dashboardUrl: data.dashboardUrl || `${APP_BASE_URL}/GamificationDashboard`,
        challengeUrl: data.challengeUrl || `${APP_BASE_URL}/TeamCompetition`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Slack notification failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notification to Microsoft Teams
 */
export async function sendTeamsNotification(type, data) {
  try {
    const response = await base44.functions.invoke('teamsNotifications', {
      type,
      data: {
        ...data,
        eventUrl: data.eventUrl || `${APP_BASE_URL}/Calendar`,
        leaderboardUrl: data.leaderboardUrl || `${APP_BASE_URL}/GamificationDashboard`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Teams notification failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send gamification email
 */
export async function sendGamificationEmail(type, data, recipientEmail) {
  try {
    const response = await base44.functions.invoke('gamificationEmails', {
      type,
      data: {
        ...data,
        dashboardUrl: `${APP_BASE_URL}/GamificationDashboard`,
        badgesUrl: `${APP_BASE_URL}/GamificationDashboard?tab=badges`,
        challengeUrl: `${APP_BASE_URL}/TeamCompetition`,
        unsubscribeUrl: `${APP_BASE_URL}/UserProfile`
      },
      recipientEmail
    });
    return response.data;
  } catch (error) {
    console.error('Email notification failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get calendar URLs for an event
 */
export async function getCalendarUrls(event) {
  try {
    const response = await base44.functions.invoke('googleCalendarSync', {
      action: 'getCalendarUrls',
      event: {
        id: event.id,
        title: event.title,
        description: event.custom_instructions || event.description,
        scheduledDate: event.scheduled_date,
        durationMinutes: event.duration_minutes || 30,
        location: event.location,
        meetingLink: event.meeting_link,
        facilitatorName: event.facilitator_name,
        pointsAwarded: event.points_awarded || 10
      }
    });
    return response.data;
  } catch (error) {
    console.error('Calendar sync failed:', error);
    return null;
  }
}

/**
 * Download ICS file for an event
 */
export async function downloadICSFile(event) {
  try {
    const response = await base44.functions.invoke('googleCalendarSync', {
      action: 'generateICS',
      event: {
        id: event.id,
        title: event.title,
        description: event.custom_instructions || event.description,
        scheduledDate: event.scheduled_date,
        durationMinutes: event.duration_minutes || 30,
        location: event.location,
        meetingLink: event.meeting_link,
        facilitatorName: event.facilitator_name,
        pointsAwarded: event.points_awarded || 10
      }
    });
    
    // Create blob and download
    const blob = new Blob([response.data], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('ICS download failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify all channels about an achievement
 */
export async function notifyAchievement(achievementData, channels = ['email']) {
  const results = {};
  
  if (channels.includes('email')) {
    results.email = await sendGamificationEmail('badgeEarned', achievementData, achievementData.userEmail);
  }
  
  if (channels.includes('slack')) {
    results.slack = await sendSlackNotification('achievement', achievementData);
  }
  
  if (channels.includes('teams')) {
    // Map to appropriate Teams notification type
    results.teams = await sendTeamsNotification('leaderboardUpdate', {
      topUsers: [{ name: achievementData.userName, points: achievementData.totalPoints }]
    });
  }
  
  return results;
}

/**
 * Notify all channels about a level up
 */
export async function notifyLevelUp(levelUpData, channels = ['email']) {
  const results = {};
  
  if (channels.includes('email')) {
    results.email = await sendGamificationEmail('levelUp', levelUpData, levelUpData.userEmail);
  }
  
  if (channels.includes('slack')) {
    results.slack = await sendSlackNotification('levelUp', levelUpData);
  }
  
  return results;
}

/**
 * Notify all channels about a challenge result
 */
export async function notifyChallengeWon(challengeData, channels = ['email', 'slack', 'teams']) {
  const results = {};
  
  if (channels.includes('email')) {
    // Send to all team members
    for (const memberEmail of challengeData.teamMemberEmails || []) {
      await sendGamificationEmail('challengeWon', challengeData, memberEmail);
    }
    results.email = { success: true };
  }
  
  if (channels.includes('slack')) {
    results.slack = await sendSlackNotification('challengeWon', challengeData);
  }
  
  if (channels.includes('teams')) {
    results.teams = await sendTeamsNotification('challengeAnnouncement', {
      ...challengeData,
      challengeName: `🏆 ${challengeData.challengeName} - Winner: ${challengeData.teamName}`
    });
  }
  
  return results;
}

/**
 * Notify about an upcoming event
 */
export async function notifyEventReminder(eventData, channels = ['slack', 'teams']) {
  const results = {};
  
  if (channels.includes('slack')) {
    results.slack = await sendSlackNotification('eventReminder', eventData);
  }
  
  if (channels.includes('teams')) {
    results.teams = await sendTeamsNotification('eventReminder', eventData);
  }
  
  return results;
}

/**
 * Notify about a new scheduled event
 */
export async function notifyEventScheduled(eventData, channels = ['teams']) {
  const results = {};
  
  if (channels.includes('teams')) {
    results.teams = await sendTeamsNotification('eventScheduled', eventData);
  }
  
  if (channels.includes('slack')) {
    results.slack = await sendSlackNotification('eventReminder', {
      ...eventData,
      timeUntil: 'upcoming'
    });
  }
  
  return results;
}

export default {
  sendSlackNotification,
  sendTeamsNotification,
  sendGamificationEmail,
  getCalendarUrls,
  downloadICSFile,
  notifyAchievement,
  notifyLevelUp,
  notifyChallengeWon,
  notifyEventReminder,
  notifyEventScheduled
};