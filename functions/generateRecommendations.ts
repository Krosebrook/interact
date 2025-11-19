import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch data
        const events = await base44.entities.Event.list('-scheduled_date', 100);
        const activities = await base44.entities.Activity.list();
        const participations = await base44.entities.Participation.list();

        const recommendations = [];
        const now = new Date();

        // Rule 1: Holiday/Seasonal Recommendations
        const holidayRecs = checkHolidayRecommendations(now, activities);
        recommendations.push(...holidayRecs);

        // Rule 2: Variety Analysis
        const recentEvents = events
            .filter(e => new Date(e.scheduled_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))
            .slice(0, 5);

        const varietyRecs = checkVarietyNeeds(recentEvents, activities);
        recommendations.push(...varietyRecs);

        // Rule 3: Low Engagement Activities
        const engagementRecs = checkEngagementPatterns(events, activities, participations);
        recommendations.push(...engagementRecs);

        // Rule 4: Category Gap Analysis
        const gapRecs = checkCategoryGaps(events, activities);
        recommendations.push(...gapRecs);

        // Save recommendations to database
        for (const rec of recommendations.slice(0, 5)) {
            const existing = await base44.asServiceRole.entities.AIRecommendation.filter({
                activity_id: rec.activity_id,
                status: 'pending'
            });

            if (existing.length === 0) {
                await base44.asServiceRole.entities.AIRecommendation.create(rec);
            }
        }

        return Response.json({ 
            success: true, 
            recommendations_generated: recommendations.length,
            recommendations: recommendations.slice(0, 5)
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function checkHolidayRecommendations(currentDate, activities) {
    const recommendations = [];
    const month = currentDate.getMonth();
    const day = currentDate.getDate();

    // Check upcoming holidays (within 2 weeks)
    const holidays = [
        { month: 1, day: 14, name: "Valentine's Day", types: ['social', 'creative'] },
        { month: 2, day: 17, name: "St. Patrick's Day", types: ['social', 'competitive'] },
        { month: 9, day: 31, name: "Halloween", types: ['creative', 'social'] },
        { month: 11, day: 25, name: "Christmas", types: ['social', 'creative'] },
        { month: 0, day: 1, name: "New Year", types: ['social', 'icebreaker'] }
    ];

    for (const holiday of holidays) {
        const holidayDate = new Date(currentDate.getFullYear(), holiday.month, holiday.day);
        const daysUntil = Math.ceil((holidayDate - currentDate) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= 14) {
            const matchingActivities = activities.filter(a => 
                holiday.types.includes(a.type) && a.is_template
            );

            if (matchingActivities.length > 0) {
                const activity = matchingActivities[Math.floor(Math.random() * matchingActivities.length)];
                recommendations.push({
                    recommendation_type: 'rule_based',
                    activity_id: activity.id,
                    reasoning: `Perfect for ${holiday.name} celebration coming up in ${daysUntil} days!`,
                    confidence_score: 0.9,
                    context: {
                        date_context: `${holiday.name} - ${daysUntil} days away`,
                        rule: 'holiday_detection'
                    },
                    status: 'pending'
                });
            }
        }
    }

    // Seasonal recommendations
    const seasons = [
        { months: [11, 0, 1], name: 'Winter', types: ['wellness', 'learning'] },
        { months: [2, 3, 4], name: 'Spring', types: ['creative', 'social'] },
        { months: [5, 6, 7], name: 'Summer', types: ['competitive', 'wellness'] },
        { months: [8, 9, 10], name: 'Fall', types: ['learning', 'creative'] }
    ];

    const currentSeason = seasons.find(s => s.months.includes(month));
    if (currentSeason) {
        const seasonalActivities = activities.filter(a => 
            currentSeason.types.includes(a.type) && a.is_template
        ).sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));

        if (seasonalActivities.length > 0) {
            recommendations.push({
                recommendation_type: 'rule_based',
                activity_id: seasonalActivities[0].id,
                reasoning: `Great ${currentSeason.name} activity to keep energy high during this season`,
                confidence_score: 0.75,
                context: {
                    date_context: `${currentSeason.name} season`,
                    rule: 'seasonal_match'
                },
                status: 'pending'
            });
        }
    }

    return recommendations;
}

function checkVarietyNeeds(recentEvents, activities) {
    const recommendations = [];
    
    if (recentEvents.length < 3) return recommendations;

    // Get types of recent activities
    const recentTypes = recentEvents.map(e => {
        const activity = activities.find(a => a.id === e.activity_id);
        return activity?.type;
    }).filter(Boolean);

    // Count occurrences
    const typeCounts = recentTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    // Find most frequent type
    const mostFrequentType = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])[0];

    if (mostFrequentType && mostFrequentType[1] >= 3) {
        // Suggest different types
        const allTypes = ['icebreaker', 'creative', 'competitive', 'wellness', 'learning', 'social'];
        const underusedTypes = allTypes.filter(t => !typeCounts[t] || typeCounts[t] < 2);

        if (underusedTypes.length > 0) {
            const targetType = underusedTypes[0];
            const suggestedActivities = activities.filter(a => 
                a.type === targetType && a.is_template
            ).sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));

            if (suggestedActivities.length > 0) {
                recommendations.push({
                    recommendation_type: 'rule_based',
                    activity_id: suggestedActivities[0].id,
                    reasoning: `Time for variety! Your last ${mostFrequentType[1]} events were ${mostFrequentType[0]}. Let's try ${targetType}!`,
                    confidence_score: 0.85,
                    context: {
                        recent_activities: recentTypes,
                        rule: 'variety_balance'
                    },
                    status: 'pending'
                });
            }
        }
    }

    return recommendations;
}

function checkEngagementPatterns(events, activities, participations) {
    const recommendations = [];
    
    // Calculate engagement scores per activity
    const activityEngagement = {};
    
    for (const activity of activities) {
        const activityEvents = events.filter(e => e.activity_id === activity.id);
        if (activityEvents.length === 0) continue;

        const activityParticipations = activityEvents.flatMap(e =>
            participations.filter(p => p.event_id === e.id && p.attended)
        );

        const avgAttendance = activityParticipations.length / activityEvents.length;
        const avgEngagement = activityParticipations.filter(p => p.engagement_score).length > 0
            ? activityParticipations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / 
              activityParticipations.filter(p => p.engagement_score).length
            : 0;

        activityEngagement[activity.id] = {
            activity,
            avgAttendance,
            avgEngagement,
            eventsHeld: activityEvents.length
        };
    }

    // Find high-performing activities
    const sortedByEngagement = Object.values(activityEngagement)
        .filter(a => a.eventsHeld >= 2 && a.avgEngagement >= 4)
        .sort((a, b) => b.avgEngagement - a.avgEngagement);

    if (sortedByEngagement.length > 0) {
        const topActivity = sortedByEngagement[0];
        recommendations.push({
            recommendation_type: 'rule_based',
            activity_id: topActivity.activity.id,
            reasoning: `This activity has a ${topActivity.avgEngagement.toFixed(1)}/5 engagement score! People love it.`,
            confidence_score: 0.95,
            context: {
                engagement_metrics: {
                    avg_engagement: topActivity.avgEngagement,
                    avg_attendance: topActivity.avgAttendance,
                    events_held: topActivity.eventsHeld
                },
                rule: 'high_engagement'
            },
            status: 'pending'
        });
    }

    return recommendations;
}

function checkCategoryGaps(events, activities) {
    const recommendations = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentEvents = events.filter(e => new Date(e.scheduled_date) > thirtyDaysAgo);
    
    // Get recent activity types
    const recentTypes = new Set(
        recentEvents.map(e => {
            const activity = activities.find(a => a.id === e.activity_id);
            return activity?.type;
        }).filter(Boolean)
    );

    const allTypes = ['icebreaker', 'creative', 'competitive', 'wellness', 'learning', 'social'];
    const missingTypes = allTypes.filter(t => !recentTypes.has(t));

    if (missingTypes.length > 0) {
        for (const type of missingTypes.slice(0, 2)) {
            const typeActivities = activities.filter(a => 
                a.type === type && a.is_template
            ).sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));

            if (typeActivities.length > 0) {
                recommendations.push({
                    recommendation_type: 'rule_based',
                    activity_id: typeActivities[0].id,
                    reasoning: `Haven't done a ${type} activity in 30+ days. Let's balance it out!`,
                    confidence_score: 0.8,
                    context: {
                        rule: 'category_gap',
                        missing_type: type,
                        days_since_last: '30+'
                    },
                    status: 'pending'
                });
            }
        }
    }

    return recommendations;
}