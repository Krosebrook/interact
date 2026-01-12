import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Daily aggregation job to summarize analytics events
 * Should be run as scheduled task at midnight
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const events = await base44.asServiceRole.entities.AnalyticsEvent.filter({
      created_date: {
        $gte: yesterday.toISOString(),
        $lte: endOfYesterday.toISOString()
      }
    });

    const featureUsage = {};
    
    events.forEach(event => {
      if (event.event_type !== 'feature_use') return;
      
      const feature = event.feature_name;
      if (!featureUsage[feature]) {
        featureUsage[feature] = {
          users: new Set(),
          total: 0,
          successCount: 0,
          durations: []
        };
      }
      
      featureUsage[feature].users.add(event.user_email);
      featureUsage[feature].total += 1;
      
      if (event.event_data?.success !== false) {
        featureUsage[feature].successCount += 1;
      }
      
      if (event.event_data?.duration_seconds) {
        featureUsage[feature].durations.push(event.event_data.duration_seconds);
      }
    });

    const aggregations = [];
    const dateStr = yesterday.toISOString().split('T')[0];

    for (const [feature, data] of Object.entries(featureUsage)) {
      const avgDuration = data.durations.length > 0
        ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length
        : 0;
      
      aggregations.push({
        date: dateStr,
        feature_name: feature,
        total_users: data.users.size,
        total_events: data.total,
        avg_duration_seconds: avgDuration,
        success_rate: (data.successCount / data.total) * 100
      });
    }

    for (const agg of aggregations) {
      await base44.asServiceRole.entities.FeatureUsage.create(agg);
    }

    return Response.json({
      success: true,
      date: dateStr,
      features_processed: aggregations.length,
      total_events: events.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});