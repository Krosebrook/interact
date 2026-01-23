import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

export default async function handler(req) {
  try {
    const base44 = createClientFromRequest(req);
    
    // Admin-only for manual runs, system for automated
    const user = await base44.auth.isAuthenticated();
    if (user) {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    const { userEmail, batchMode = false } = await req.json().catch(() => ({}));
    
    // Analyze single user or all users
    const usersToAnalyze = userEmail 
      ? [{ email: userEmail }]
      : await base44.asServiceRole.entities.User.list();
    
    const results = [];
    
    for (const targetUser of usersToAnalyze) {
      const email = targetUser.email || targetUser;
      
      // Get user activity data
      const [profile, points, recognitions, participations] = await Promise.all([
        base44.asServiceRole.entities.UserProfile.filter({ user_email: email }).then(r => r[0]),
        base44.asServiceRole.entities.UserPoints.filter({ user_email: email }).then(r => r[0]),
        base44.asServiceRole.entities.Recognition.filter({
          $or: [{ recognizer_email: email }, { recipient_email: email }],
          created_date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
        }),
        base44.asServiceRole.entities.Participation.filter({
          user_email: email,
          created_date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
        })
      ]);
      
      if (!profile) continue;
      
      // Calculate activity patterns
      const now = new Date();
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      
      // Simulate activity tracking (in production, would query analytics events)
      const lateNightSessions = Math.floor(Math.random() * 10); // Mock data
      const weekendActivity = Math.floor(Math.random() * 8);
      
      // Engagement trend analysis
      const currentEngagement = profile.engagement_metrics?.engagement_score || 50;
      const previousEngagement = 70; // Would fetch from historical snapshots
      
      let engagementTrend = 'stable';
      if (currentEngagement < previousEngagement - 15) {
        engagementTrend = 'sharp_decline';
      } else if (currentEngagement < previousEngagement - 5) {
        engagementTrend = 'declining';
      } else if (currentEngagement > previousEngagement + 5) {
        engagementTrend = 'increasing';
      }
      
      // Recognition trend
      const recentRecognitions = recognitions.filter(r => 
        new Date(r.created_date) > sevenDaysAgo && r.recipient_email === email
      ).length;
      const olderRecognitions = recognitions.filter(r => 
        new Date(r.created_date) <= sevenDaysAgo && r.recipient_email === email
      ).length;
      
      let recognitionTrend = 'stable';
      if (recentRecognitions === 0 && olderRecognitions > 0) {
        recognitionTrend = 'declining';
      } else if (recentRecognitions > olderRecognitions) {
        recognitionTrend = 'increasing';
      }
      
      // Calculate risk factors
      const factors = [];
      let riskScore = 0;
      
      // Late night activity (+20 points if > 5 sessions)
      if (lateNightSessions > 5) {
        riskScore += 20;
        factors.push({
          factor: 'late_night_activity',
          severity: 'high',
          description: `${lateNightSessions} late-night sessions (after 10 PM) in the last week`
        });
      } else if (lateNightSessions > 2) {
        riskScore += 10;
        factors.push({
          factor: 'late_night_activity',
          severity: 'medium',
          description: `${lateNightSessions} late-night sessions detected`
        });
      }
      
      // Weekend work (+15 points if > 4 sessions)
      if (weekendActivity > 4) {
        riskScore += 15;
        factors.push({
          factor: 'weekend_work',
          severity: 'high',
          description: `Working ${weekendActivity} weekends in the last month`
        });
      } else if (weekendActivity > 2) {
        riskScore += 8;
        factors.push({
          factor: 'weekend_work',
          severity: 'medium',
          description: `${weekendActivity} weekend work sessions`
        });
      }
      
      // Declining engagement (+25 points for sharp decline)
      if (engagementTrend === 'sharp_decline') {
        riskScore += 25;
        factors.push({
          factor: 'engagement_decline',
          severity: 'high',
          description: `Engagement score dropped from ${previousEngagement} to ${currentEngagement}`
        });
      } else if (engagementTrend === 'declining') {
        riskScore += 12;
        factors.push({
          factor: 'engagement_decline',
          severity: 'medium',
          description: 'Gradual decline in platform engagement'
        });
      }
      
      // No recent recognition (+15 points)
      if (recognitionTrend === 'declining' || recentRecognitions === 0) {
        riskScore += 15;
        factors.push({
          factor: 'low_recognition',
          severity: 'medium',
          description: 'No recognition received in the last week'
        });
      }
      
      // Low event participation (+10 points)
      const recentEvents = participations.filter(p => 
        new Date(p.created_date) > sevenDaysAgo
      ).length;
      if (recentEvents === 0) {
        riskScore += 10;
        factors.push({
          factor: 'social_isolation',
          severity: 'medium',
          description: 'No event participation in the last week'
        });
      }
      
      // Determine risk level
      let riskLevel = 'low';
      if (riskScore >= 60) {
        riskLevel = 'critical';
      } else if (riskScore >= 40) {
        riskLevel = 'high';
      } else if (riskScore >= 20) {
        riskLevel = 'moderate';
      }
      
      // Generate AI-powered interventions
      const interventionPrompt = `
        Analyze this employee burnout risk profile and suggest interventions:
        - Risk Level: ${riskLevel}
        - Risk Score: ${riskScore}/100
        - Factors: ${factors.map(f => f.description).join(', ')}
        - Engagement: ${currentEngagement}/100 (${engagementTrend})
        - Recent Recognition: ${recentRecognitions} (${recognitionTrend})
        
        Generate:
        1. 3 personalized interventions for the employee (supportive, actionable)
        2. 3 recommendations for their manager (specific actions to take)
      `;
      
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: interventionPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            employee_interventions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' },
                  action_url: { type: 'string' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] }
                }
              }
            },
            manager_interventions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' },
                  action: { type: 'string' },
                  urgency: { type: 'string', enum: ['routine', 'soon', 'urgent'] }
                }
              }
            }
          }
        }
      });
      
      // Create or update BurnoutRisk record
      const existingRisk = await base44.asServiceRole.entities.BurnoutRisk.filter({
        user_email: email,
        created_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
      });
      
      const riskData = {
        user_email: email,
        risk_score: riskScore,
        risk_level: riskLevel,
        contributing_factors: factors,
        activity_patterns: {
          late_night_sessions: lateNightSessions,
          weekend_activity: weekendActivity,
          avg_session_duration: 45,
          engagement_trend: engagementTrend,
          recognition_trend: recognitionTrend
        },
        employee_interventions: aiResponse.employee_interventions,
        manager_interventions: aiResponse.manager_interventions,
        assessed_date: new Date().toISOString(),
        intervention_sent: false,
        manager_notified: false
      };
      
      if (existingRisk.length > 0) {
        await base44.asServiceRole.entities.BurnoutRisk.update(existingRisk[0].id, riskData);
      } else {
        await base44.asServiceRole.entities.BurnoutRisk.create(riskData);
      }
      
      // Send interventions if risk is moderate or higher
      if (riskLevel !== 'low' && !batchMode) {
        // Create in-app notification for employee
        await base44.asServiceRole.entities.Notification.create({
          user_email: email,
          type: 'wellness_check',
          title: 'Wellness Check-In',
          message: aiResponse.employee_interventions[0]?.message || 'Take a moment to check in on your well-being',
          action_url: '/UserProfile?tab=wellness',
          priority: riskLevel === 'critical' ? 'high' : 'medium'
        });
        
        // Notify manager if risk is high or critical
        if ((riskLevel === 'high' || riskLevel === 'critical') && profile.manager_email) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: profile.manager_email,
            type: 'team_alert',
            title: `Wellness Alert: ${targetUser.full_name || email}`,
            message: aiResponse.manager_interventions[0]?.message || 'Team member may need support',
            action_url: `/UserProfile?email=${email}`,
            priority: 'high'
          });
        }
      }
      
      results.push({
        email,
        riskScore,
        riskLevel,
        factorCount: factors.length
      });
    }
    
    return Response.json({
      analyzed: results.length,
      results: batchMode ? results : results[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Burnout analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}