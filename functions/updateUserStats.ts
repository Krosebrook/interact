import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
        
        // Calculate points
        let points = 0;
        if (participation.attended) points += 10; // Base attendance
        if (participation.submission) points += 15; // Submitted activity
        if (participation.engagement_score >= 4) points += 10; // High engagement
        if (participation.feedback) points += 5; // Provided feedback

        // Update participation with points
        await base44.asServiceRole.entities.Participation.update(participationId, {
            points_earned: points
        });

        // Get or create user stats
        const existingStats = await base44.asServiceRole.entities.UserStats.filter({
            user_email: participation.participant_email
        });

        let userStats;
        if (existingStats.length > 0) {
            userStats = existingStats[0];
            
            // Update stats
            const newTotalPoints = (userStats.total_points || 0) + points;
            const newEventsAttended = participation.attended 
                ? (userStats.events_attended || 0) + 1 
                : userStats.events_attended;
            const newFeedbackCount = participation.feedback 
                ? (userStats.feedback_count || 0) + 1 
                : userStats.feedback_count;

            // Calculate streak
            const lastEventDate = userStats.last_event_date ? new Date(userStats.last_event_date) : null;
            const currentEventDate = new Date();
            let newStreak = userStats.current_streak || 0;
            
            if (lastEventDate) {
                const daysDiff = Math.floor((currentEventDate - lastEventDate) / (1000 * 60 * 60 * 24));
                if (daysDiff <= 7) {
                    newStreak += 1;
                } else {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            const newBestStreak = Math.max(newStreak, userStats.best_streak || 0);

            // Determine rank
            let rank = "Newcomer";
            if (newTotalPoints >= 500) rank = "Legend";
            else if (newTotalPoints >= 300) rank = "Champion";
            else if (newTotalPoints >= 150) rank = "Enthusiast";
            else if (newTotalPoints >= 50) rank = "Regular";

            userStats = await base44.asServiceRole.entities.UserStats.update(userStats.id, {
                total_points: newTotalPoints,
                events_attended: newEventsAttended,
                feedback_count: newFeedbackCount,
                current_streak: newStreak,
                best_streak: newBestStreak,
                last_event_date: currentEventDate.toISOString().split('T')[0],
                rank
            });
        } else {
            // Create new stats
            userStats = await base44.asServiceRole.entities.UserStats.create({
                user_email: participation.participant_email,
                user_name: participation.participant_name,
                total_points: points,
                events_attended: participation.attended ? 1 : 0,
                feedback_count: participation.feedback ? 1 : 0,
                current_streak: 1,
                best_streak: 1,
                last_event_date: new Date().toISOString().split('T')[0],
                rank: "Newcomer",
                badges_earned: []
            });
        }

        // Check for new badges
        const newBadges = await checkAndAwardBadges(base44, userStats);

        return Response.json({
            success: true,
            points_earned: points,
            total_points: userStats.total_points,
            new_badges: newBadges,
            rank: userStats.rank
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndAwardBadges(base44, userStats) {
    const allBadges = await base44.asServiceRole.entities.Badge.list();
    const earnedBadges = userStats.badges_earned || [];
    const newBadges = [];

    for (const badge of allBadges) {
        if (earnedBadges.includes(badge.badge_id)) continue;

        let shouldAward = false;

        switch (badge.criteria_type) {
            case 'events_attended':
                shouldAward = userStats.events_attended >= badge.criteria_value;
                break;
            case 'points_total':
                shouldAward = userStats.total_points >= badge.criteria_value;
                break;
            case 'feedback_count':
                shouldAward = userStats.feedback_count >= badge.criteria_value;
                break;
            case 'streak':
                shouldAward = userStats.best_streak >= badge.criteria_value;
                break;
        }

        if (shouldAward) {
            earnedBadges.push(badge.badge_id);
            newBadges.push(badge);
        }
    }

    if (newBadges.length > 0) {
        await base44.asServiceRole.entities.UserStats.update(userStats.id, {
            badges_earned: earnedBadges
        });
    }

    return newBadges;
}