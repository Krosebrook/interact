import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import type {
  Base44Client,
  UserPoints,
  Participation,
  Badge,
  BadgeAward,
  Team,
  PointsConfig,
  ActionType,
  PointsHistoryEntry,
} from './lib/types.ts';
import { getErrorMessage } from './lib/types.ts';

/**
 * REFACTORED POINTS AWARDING SYSTEM
 * Handles points, levels, badges, streaks, and team updates
 *
 * Input: { participationId, actionType }
 * Output: { success, pointsAwarded, newTotal, newLevel, badgesEarned }
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const POINTS_CONFIG: Record<ActionType, PointsConfig> = {
  attendance: { points: 10, field: 'events_attended', reason: 'Event attendance' },
  activity_completion: { points: 15, field: 'activities_completed', reason: 'Activity completed' },
  feedback: { points: 5, field: 'feedback_submitted', reason: 'Feedback submitted' },
  high_engagement: { points: 5, field: null, reason: 'High engagement bonus' },
  recognition_sent: { points: 5, field: null, reason: 'Recognition sent' },
  recognition_received: { points: 10, field: 'peer_recognitions', reason: 'Recognition received' }
};

const POINTS_PER_LEVEL = 100;

interface AwardPointsPayload {
  participationId?: string;
  actionType: ActionType;
  userEmail?: string;
}

interface AwardPointsResponse {
  success: boolean;
  pointsAwarded: number;
  newTotal: number;
  newLevel?: number;
  badgesEarned?: Badge[];
  message?: string;
  alreadyAwarded?: boolean;
}

interface PointsUpdate extends Partial<UserPoints> {
  points_history: PointsHistoryEntry[];
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req: Request): Promise<Response> => {
  const base44 = createClientFromRequest(req) as Base44Client;

  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { participationId, actionType, userEmail: targetEmail }: AwardPointsPayload = await req.json();

    // Validate action type
    const config = POINTS_CONFIG[actionType];
    if (!config) {
      return Response.json({ error: 'Invalid action type' }, { status: 400 });
    }

    // Handle direct user award (for recognition)
    if (targetEmail && !participationId) {
      return await awardDirectPoints(base44, targetEmail, actionType, config);
    }

    // Handle participation-based award
    if (!participationId) {
      return Response.json({ error: 'participationId or userEmail required' }, { status: 400 });
    }

    const participation = await getParticipation(base44, participationId);
    if (!participation) {
      return Response.json({ error: 'Participation not found' }, { status: 404 });
    }

    // Check for duplicate awards
    if (isDuplicateAward(participation, actionType)) {
      return Response.json({ message: 'Points already awarded', alreadyAwarded: true });
    }

    // Get or create user points
    const userPoints = await getOrCreateUserPoints(base44, participation.participant_email);

    // Calculate points (with engagement check)
    const pointsToAward = calculatePoints(config, participation, actionType);
    if (pointsToAward === 0) {
      return Response.json({ message: 'No points to award' });
    }

    // Build updates
    const updates = buildPointsUpdate(userPoints, pointsToAward, config, actionType, participation);

    // Apply updates
    await applyUpdates(base44, participationId, userPoints.id, updates, actionType);

    // Update team if applicable
    if (userPoints.team_id) {
      await updateTeamPoints(base44, userPoints.team_id, pointsToAward);
    }

    // Check for level up and notify
    const oldLevel = userPoints.level || 1;
    const newLevel = Math.floor(updates.total_points! / POINTS_PER_LEVEL) + 1;

    if (newLevel > oldLevel) {
      await createNotification(base44, participation.participant_email, 'level_up_alerts',
        '🚀 Level Up!', `You've reached Level ${newLevel}!`);
      updates.level = newLevel;
    }

    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, updates);

    // Check and award badges
    const badges = await checkAndAwardBadges(base44, userPoints, updates);

    const response: AwardPointsResponse = {
      success: true,
      pointsAwarded: pointsToAward,
      newTotal: updates.total_points!,
      newLevel: newLevel,
      badgesEarned: badges
    };

    return Response.json(response);

  } catch (error: unknown) {
    console.error('Award points error:', error);
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getParticipation(base44: Base44Client, participationId: string): Promise<Participation | null> {
  const records = await base44.asServiceRole.entities.Participation.filter({ id: participationId }) as Participation[];
  return records[0] || null;
}

function isDuplicateAward(participation: Participation, actionType: ActionType): boolean {
  const checks: Record<string, keyof Participation> = {
    attendance: 'points_awarded',
    activity_completion: 'activity_completed',
    feedback: 'feedback_submitted'
  };
  const field = checks[actionType];
  return field ? !!participation[field] : false;
}

async function getOrCreateUserPoints(base44: Base44Client, userEmail: string): Promise<UserPoints> {
  const records = await base44.asServiceRole.entities.UserPoints.filter({ user_email: userEmail }) as UserPoints[];

  if (records.length > 0) return records[0];

  return base44.asServiceRole.entities.UserPoints.create({
    user_email: userEmail,
    total_points: 0,
    available_points: 0,
    lifetime_points: 0,
    events_attended: 0,
    activities_completed: 0,
    feedback_submitted: 0,
    badges_earned: [],
    level: 1,
    streak_days: 0
  }) as Promise<UserPoints>;
}

function calculatePoints(config: PointsConfig, participation: Participation, actionType: ActionType): number {
  if (actionType === 'high_engagement' && (participation.engagement_score || 0) < 4) {
    return 0;
  }
  return config.points;
}

function buildPointsUpdate(
  userPoints: UserPoints,
  pointsToAward: number,
  config: PointsConfig,
  actionType: ActionType,
  participation: Participation
): PointsUpdate {
  const history = userPoints.points_history || [];

  const updates: PointsUpdate = {
    total_points: (userPoints.total_points || 0) + pointsToAward,
    available_points: (userPoints.available_points || 0) + pointsToAward,
    lifetime_points: (userPoints.lifetime_points || 0) + pointsToAward,
    points_history: [...history.slice(-49), {
      amount: pointsToAward,
      reason: config.reason,
      source: actionType,
      event_id: participation.event_id,
      timestamp: new Date().toISOString()
    }]
  };

  if (config.field) {
    const fieldKey = config.field as keyof UserPoints;
    const currentValue = (userPoints[fieldKey] as number) || 0;
    (updates as Record<string, unknown>)[config.field] = currentValue + 1;
  }

  if (actionType === 'attendance') {
    updates.last_activity_date = new Date().toISOString().split('T')[0];
  }

  return updates;
}

async function applyUpdates(
  base44: Base44Client,
  participationId: string,
  userPointsId: string,
  updates: PointsUpdate,
  actionType: ActionType
): Promise<void> {
  const participationUpdate: Partial<Participation> = {};
  if (actionType === 'attendance') participationUpdate.points_awarded = true;
  if (actionType === 'activity_completion') participationUpdate.activity_completed = true;
  if (actionType === 'feedback') participationUpdate.feedback_submitted = true;

  if (Object.keys(participationUpdate).length > 0) {
    await base44.asServiceRole.entities.Participation.update(participationId, participationUpdate);
  }
}

async function updateTeamPoints(base44: Base44Client, teamId: string, points: number): Promise<void> {
  try {
    const teams = await base44.asServiceRole.entities.Team.filter({ id: teamId }) as Team[];
    if (teams.length > 0) {
      const team = teams[0];
      await base44.asServiceRole.entities.Team.update(team.id, {
        total_points: (team.total_points || 0) + points
      });
    }
  } catch (e: unknown) {
    console.error('Team points update failed:', e);
  }
}

async function awardDirectPoints(
  base44: Base44Client,
  userEmail: string,
  actionType: ActionType,
  config: PointsConfig
): Promise<Response> {
  const userPoints = await getOrCreateUserPoints(base44, userEmail);
  const pointsToAward = config.points;

  const history = userPoints.points_history || [];
  const updates: Partial<UserPoints> = {
    total_points: (userPoints.total_points || 0) + pointsToAward,
    available_points: (userPoints.available_points || 0) + pointsToAward,
    lifetime_points: (userPoints.lifetime_points || 0) + pointsToAward,
    points_history: [...history.slice(-49), {
      amount: pointsToAward,
      reason: config.reason,
      source: actionType,
      timestamp: new Date().toISOString()
    }]
  };

  if (config.field) {
    const fieldKey = config.field as keyof UserPoints;
    const currentValue = (userPoints[fieldKey] as number) || 0;
    (updates as Record<string, unknown>)[config.field] = currentValue + 1;
  }

  await base44.asServiceRole.entities.UserPoints.update(userPoints.id, updates);

  return Response.json({
    success: true,
    pointsAwarded: pointsToAward,
    newTotal: updates.total_points
  });
}

async function createNotification(
  base44: Base44Client,
  userEmail: string,
  type: string,
  title: string,
  message: string
): Promise<void> {
  try {
    await base44.asServiceRole.entities.Notification.create({
      user_email: userEmail,
      type,
      title,
      message,
      is_read: false
    });
  } catch (e: unknown) {
    console.error('Notification failed:', e);
  }
}

async function checkAndAwardBadges(
  base44: Base44Client,
  userPoints: UserPoints,
  stats: PointsUpdate
): Promise<Badge[]> {
  try {
    const allBadges = await base44.asServiceRole.entities.Badge.list() as Badge[];
    const earned = userPoints.badges_earned || [];
    const awarded: Badge[] = [];

    for (const badge of allBadges) {
      if (earned.includes(badge.id) || badge.is_manual_award) continue;

      const { type, threshold } = badge.award_criteria || {};
      if (!type || type === 'manual') continue;

      const valueMap: Record<string, number | undefined> = {
        events_attended: stats.events_attended,
        feedback_submitted: stats.feedback_submitted,
        activities_completed: stats.activities_completed,
        points_total: stats.total_points,
        streak_days: stats.streak_days
      };

      if (valueMap[type] !== undefined && valueMap[type]! >= threshold) {
        earned.push(badge.id);
        awarded.push(badge);

        await base44.asServiceRole.entities.BadgeAward.create({
          badge_id: badge.id,
          user_email: userPoints.user_email,
          award_type: 'automatic',
          points_awarded: badge.points_value || 0
        });

        await createNotification(base44, userPoints.user_email, 'badge_alerts',
          '🎉 New Badge!', `You earned "${badge.badge_name}"!`);
      }
    }

    if (awarded.length > 0) {
      await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
        badges_earned: earned
      });
    }

    return awarded;
  } catch (e: unknown) {
    console.error('Badge check failed:', e);
    return [];
  }
}
