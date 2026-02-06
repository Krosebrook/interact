import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { dateRange, metrics } = await req.json();
    
    // Generate comprehensive CSV report
    const csvContent = `Analytics Report
Generated: ${new Date().toISOString()}
Date Range: Last ${dateRange} days

GAMIFICATION METRICS
Total Points Distributed,${metrics.gamification.totalPoints}
Average Points per User,${metrics.gamification.avgPoints}
Total Badges Awarded,${metrics.gamification.totalBadges}

Tier Distribution
${metrics.gamification.tierDistribution.map(t => `${t.tier},${t.count}`).join('\n')}

EVENT METRICS
Participation Rate,${metrics.events.participationRate}%
Average Feedback Rating,${metrics.events.avgFeedbackRating}/5.0
Proposal Approval Rate,${metrics.events.proposalApprovalRate}%

RECOGNITION METRICS
Total Recognitions,${metrics.recognition.totalRecognitions}

Top Categories
${metrics.recognition.categoryUsage.map(c => `${c.name},${c.count}`).join('\n')}`;
    
    // Upload to storage
    const encoder = new TextEncoder();
    const data = encoder.encode(csvContent);
    const blob = new Blob([data], { type: 'text/csv' });
    const file = new File([blob], 'analytics-report.csv', { type: 'text/csv' });
    
    const uploadResponse = await base44.integrations.Core.UploadFile({ file });
    
    return Response.json({
      success: true,
      downloadUrl: uploadResponse.file_url,
      filename: 'analytics-report.csv'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});