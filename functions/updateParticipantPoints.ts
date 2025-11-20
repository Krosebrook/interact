import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Point values
const POINTS = {
  ATTENDANCE: 10,
  SUBMISSION: 15,
  FEEDBACK: 20,
  HIGH_ENGAGEMENT: 10, // Bonus for 4+ rating
  FIRST_EVENT: 50
};

// Badge definitions
const BADGES = {
  FIRST_TIMER: { id: 'first_timer', name: 'First Timer', description: 'Attended first event', emoji: '🎉' },
  FEEDBACK_CHAMPION: { id: 'feedback_champion', name: 'Feedback Champion', description: '10+ feedback submissions', emoji: '💬' },
  CONSISTENT_3: { id: 'consistent_3', name: '3-Event Streak', description: '3 events in a row', emoji: '🔥' },
  CONSISTENT_5: { id: 'consistent_5', name: '5-Event Streak', description: '5 events in a row', emoji: '⚡' },
  TOP_SCORER: { id: 'top_scorer', name: 'Top Scorer', description: '100+ points', emoji: '🏆' },
  SUPER_SCORER: { id: 'super_scorer', name: 'Super Scorer', description: '500+ points', emoji: '👑' },
  ENGAGEMENT_MASTER: { id: 'engagement_master', name: 'Engagement Master', description: 'Avg 4.5+ rating', emoji: '⭐' },
  TEAM_PLAYER: { id: 'team_player', name: 'Team Player', description: '5+ events attended', emoji: '🤝' },
  VETERAN: { id: 'veteran', name: 'Veteran', description: '20+ events attended', emoji: '🎖️' }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { participationId } = await req.json();

        // Get participation data
        const participations = await base44.asServiceRole.entities.Participation.filter({ 
            id: participationId 
        });
        
        if (participations.length === 0) {
            return Response.json({ error: 'Participation not found' }, { status: 404 });
        }

        const participation = participations[0];

        // Get or create participant profile
        let profiles = await base44.asServiceRole.entities.ParticipantProfile.filter({ 
            participant_email: participation.participant_email 
        });
        
        let profile;
        if (profiles.length === 0) {
            // Create new profile
            profile = await base44.asServiceRole.entities.ParticipantProfile.create({
                participant_email: participation.participant_email,
                participant_name: participation.participant_name,
                total_points: 0,
                events_attended: 0,
                feedback_count: 0,
                badges: [],
                streak_count: 0
            });
        } else {
            profile = profiles[0];
        }

        // Calculate points to award
        let pointsToAdd = 0;
        const newBadges = [...profile.badges];

        // Points for attendance
        if (participation.attended) {
            pointsToAdd += POINTS.ATTENDANCE;
        }

        // Points for submission
        if (participation.submission) {
            pointsToAdd += POINTS.SUBMISSION;
        }

        // Points for feedback
        if (participation.feedback) {
            pointsToAdd += POINTS.FEEDBACK;
        }

        // Bonus for high engagement
        if (participation.engagement_score >= 4) {
            pointsToAdd += POINTS.HIGH_ENGAGEMENT;
        }

        // Update events attended
        const newEventsAttended = profile.events_attended + (participation.attended ? 1 : 0);
        const newFeedbackCount = profile.feedback_count + (participation.feedback ? 1 : 0);
        const newTotalPoints = profile.total_points + pointsToAdd;

        // Check for first event
        if (newEventsAttended === 1 && !profile.badges.includes(BADGES.FIRST_TIMER.id)) {
            pointsToAdd += POINTS.FIRST_EVENT;
            newBadges.push(BADGES.FIRST_TIMER.id);
        }

        // Check for badge eligibility
        if (newFeedbackCount >= 10 && !newBadges.includes(BADGES.FEEDBACK_CHAMPION.id)) {
            newBadges.push(BADGES.FEEDBACK_CHAMPION.id);
        }

        if (newEventsAttended >= 5 && !newBadges.includes(BADGES.TEAM_PLAYER.id)) {
            newBadges.push(BADGES.TEAM_PLAYER.id);
        }

        if (newEventsAttended >= 20 && !newBadges.includes(BADGES.VETERAN.id)) {
            newBadges.push(BADGES.VETERAN.id);
        }

        if (newTotalPoints >= 100 && !newBadges.includes(BADGES.TOP_SCORER.id)) {
            newBadges.push(BADGES.TOP_SCORER.id);
        }

        if (newTotalPoints >= 500 && !newBadges.includes(BADGES.SUPER_SCORER.id)) {
            newBadges.push(BADGES.SUPER_SCORER.id);
        }

        // Calculate average engagement
        const allParticipations = await base44.asServiceRole.entities.Participation.filter({
            participant_email: participation.participant_email
        });
        
        const withScores = allParticipations.filter(p => p.engagement_score);
        const avgEngagement = withScores.length > 0
            ? withScores.reduce((sum, p) => sum + p.engagement_score, 0) / withScores.length
            : 0;

        if (avgEngagement >= 4.5 && !newBadges.includes(BADGES.ENGAGEMENT_MASTER.id)) {
            newBadges.push(BADGES.ENGAGEMENT_MASTER.id);
        }

        // Update profile
        const updatedProfile = await base44.asServiceRole.entities.ParticipantProfile.update(
            profile.id,
            {
                total_points: newTotalPoints,
                events_attended: newEventsAttended,
                feedback_count: newFeedbackCount,
                avg_engagement: avgEngagement,
                badges: newBadges,
                last_event_date: new Date().toISOString()
            }
        );

        // Return what was earned
        const earnedBadges = newBadges.filter(b => !profile.badges.includes(b));

        return Response.json({
            success: true,
            points_earned: pointsToAdd,
            new_total: newTotalPoints,
            badges_earned: earnedBadges.map(id => BADGES[id.toUpperCase().replace(/-/g, '_')]),
            profile: updatedProfile
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});