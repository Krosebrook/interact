import type { Base44Client } from './types.ts';

/**
 * Validates if a user has active roles that prevent deletion/suspension
 * Checks:
 * - Team leadership roles
 * - Event facilitation assignments
 */
export async function validateUserStatus(
  base44: Base44Client,
  userEmail: string
): Promise<{ canProceed: boolean; blockers: string[] }> {
  const blockers: string[] = [];

  try {
    // Check if user is a team leader
    const leaderTeams = await base44.asServiceRole.entities.Team.filter({
      leader_email: userEmail
    });

    if (leaderTeams.length > 0) {
      blockers.push(
        `User is leader of ${leaderTeams.length} team(s): ${leaderTeams.map(t => t.team_name).join(', ')}`
      );
    }

    // Check if user is facilitating upcoming events
    const facilitatedEvents = await base44.asServiceRole.entities.Event.filter({
      facilitator_email: userEmail,
      status: { $in: ['scheduled', 'in_progress'] }
    });

    if (facilitatedEvents.length > 0) {
      blockers.push(
        `User is facilitating ${facilitatedEvents.length} upcoming event(s)`
      );
    }

    return {
      canProceed: blockers.length === 0,
      blockers
    };
  } catch (error) {
    console.error('validateUserStatus error:', error);
    throw new Error(`Failed to validate user status: ${error.message}`);
  }
}