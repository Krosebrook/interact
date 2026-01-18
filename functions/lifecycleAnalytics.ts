import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Lifecycle Analytics Engine
 * Aggregates and computes analytics for lifecycle intelligence system
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    // STATE DISTRIBUTION
    if (action === 'get_state_distribution') {
      const { dateFrom, dateTo } = await req.json();
      
      const lifecycleStates = await base44.asServiceRole.entities.LifecycleState.list();
      
      const distribution = {
        new: 0,
        activated: 0,
        engaged: 0,
        power_user: 0,
        at_risk: 0,
        dormant: 0,
        returning: 0
      };

      const churnRiskDistribution = {
        low: 0,
        medium: 0,
        high: 0
      };

      lifecycleStates.forEach(state => {
        if (state.current_state) {
          distribution[state.current_state]++;
        }
        
        const risk = state.churn_risk_score || 0;
        if (risk <= 40) churnRiskDistribution.low++;
        else if (risk <= 70) churnRiskDistribution.medium++;
        else churnRiskDistribution.high++;
      });

      const total = lifecycleStates.length;
      const percentages = {};
      Object.keys(distribution).forEach(state => {
        percentages[state] = total > 0 ? (distribution[state] / total) * 100 : 0;
      });

      return Response.json({
        success: true,
        distribution,
        percentages,
        churn_risk_distribution: churnRiskDistribution,
        total_users: total
      });
    }

    // CHURN TRENDS
    if (action === 'get_churn_trends') {
      const { days = 30 } = await req.json();
      
      const lifecycleStates = await base44.asServiceRole.entities.LifecycleState.list();
      
      // Group by week
      const trends = [];
      const now = new Date();
      
      for (let i = days; i >= 0; i -= 7) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - i);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekStates = lifecycleStates.filter(s => {
          const entered = new Date(s.state_entered_at);
          return entered >= weekStart && entered < weekEnd;
        });
        
        const avgRisk = weekStates.length > 0
          ? weekStates.reduce((sum, s) => sum + (s.churn_risk_score || 0), 0) / weekStates.length
          : 0;
        
        const atRiskCount = weekStates.filter(s => s.current_state === 'at_risk').length;
        const dormantCount = weekStates.filter(s => s.current_state === 'dormant').length;
        
        trends.push({
          week_start: weekStart.toISOString().split('T')[0],
          avg_churn_risk: Math.round(avgRisk),
          at_risk_users: atRiskCount,
          dormant_users: dormantCount,
          total_users: weekStates.length
        });
      }

      return Response.json({ success: true, trends });
    }

    // INTERVENTION EFFECTIVENESS
    if (action === 'get_intervention_effectiveness') {
      const lifecycleStates = await base44.asServiceRole.entities.LifecycleState.list();
      
      const interventionStats = {
        total_interventions_shown: 0,
        total_acted_on: 0,
        total_dismissed: 0,
        by_type: {}
      };

      lifecycleStates.forEach(state => {
        const interventions = state.active_interventions || [];
        interventions.forEach(intervention => {
          if (intervention.shown) {
            interventionStats.total_interventions_shown++;
            
            const type = intervention.intervention_type || 'unknown';
            if (!interventionStats.by_type[type]) {
              interventionStats.by_type[type] = {
                shown: 0,
                acted_on: 0,
                dismissed: 0,
                conversion_rate: 0
              };
            }
            
            interventionStats.by_type[type].shown++;
            
            if (intervention.acted_on) {
              interventionStats.total_acted_on++;
              interventionStats.by_type[type].acted_on++;
            }
            if (intervention.dismissed) {
              interventionStats.total_dismissed++;
              interventionStats.by_type[type].dismissed++;
            }
          }
        });
      });

      // Calculate conversion rates
      Object.keys(interventionStats.by_type).forEach(type => {
        const stats = interventionStats.by_type[type];
        stats.conversion_rate = stats.shown > 0 
          ? (stats.acted_on / stats.shown) * 100 
          : 0;
      });

      const overallConversion = interventionStats.total_interventions_shown > 0
        ? (interventionStats.total_acted_on / interventionStats.total_interventions_shown) * 100
        : 0;

      return Response.json({
        success: true,
        overall_conversion_rate: overallConversion,
        ...interventionStats
      });
    }

    // AB TEST SUMMARY
    if (action === 'get_abtest_summary') {
      const tests = await base44.asServiceRole.entities.ABTest.list();
      
      const summary = {
        total_tests: tests.length,
        active_tests: tests.filter(t => t.status === 'active').length,
        completed_tests: tests.filter(t => t.status === 'completed').length,
        by_state: {},
        avg_improvement: 0,
        avg_confidence: 0
      };

      let totalImprovement = 0;
      let totalConfidence = 0;
      let completedCount = 0;

      tests.forEach(test => {
        const state = test.lifecycle_state;
        if (!summary.by_state[state]) {
          summary.by_state[state] = { count: 0, active: 0 };
        }
        summary.by_state[state].count++;
        if (test.status === 'active') summary.by_state[state].active++;

        if (test.results_summary && test.status === 'completed') {
          totalImprovement += test.results_summary.improvement_percentage || 0;
          totalConfidence += test.results_summary.confidence_level || 0;
          completedCount++;
        }
      });

      if (completedCount > 0) {
        summary.avg_improvement = totalImprovement / completedCount;
        summary.avg_confidence = totalConfidence / completedCount;
      }

      return Response.json({ success: true, summary });
    }

    // COHORT ANALYSIS
    if (action === 'get_cohort_analysis') {
      const { cohortType = 'signup_week' } = await req.json();
      
      const lifecycleStates = await base44.asServiceRole.entities.LifecycleState.list();
      const cohorts = {};

      lifecycleStates.forEach(state => {
        const createdDate = new Date(state.created_at);
        let cohortKey;

        if (cohortType === 'signup_week') {
          const weekStart = new Date(createdDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          cohortKey = weekStart.toISOString().split('T')[0];
        } else if (cohortType === 'signup_month') {
          cohortKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!cohorts[cohortKey]) {
          cohorts[cohortKey] = {
            total: 0,
            activated: 0,
            engaged: 0,
            power_user: 0,
            churned: 0,
            avg_days_to_activation: 0,
            activation_rate: 0
          };
        }

        cohorts[cohortKey].total++;
        
        if (state.current_state === 'engaged' || state.current_state === 'power_user') {
          cohorts[cohortKey].engaged++;
        }
        if (state.current_state === 'power_user') {
          cohorts[cohortKey].power_user++;
        }
        if (state.current_state === 'dormant') {
          cohorts[cohortKey].churned++;
        }

        // Check activation
        const hasActivated = state.state_history?.some(h => h.state === 'activated');
        if (hasActivated || state.current_state !== 'new') {
          cohorts[cohortKey].activated++;
        }
      });

      // Calculate rates
      Object.keys(cohorts).forEach(key => {
        const cohort = cohorts[key];
        cohort.activation_rate = cohort.total > 0 ? (cohort.activated / cohort.total) * 100 : 0;
        cohort.engagement_rate = cohort.total > 0 ? (cohort.engaged / cohort.total) * 100 : 0;
        cohort.churn_rate = cohort.total > 0 ? (cohort.churned / cohort.total) * 100 : 0;
      });

      return Response.json({ success: true, cohorts });
    }

    // PERSONALIZATION DISTRIBUTION
    if (action === 'get_personalization_distribution') {
      const lifecycleStates = await base44.asServiceRole.entities.LifecycleState.list();
      
      const distribution = {
        onboarding: 0,
        learning: 0,
        autonomous: 0,
        expert: 0
      };

      lifecycleStates.forEach(state => {
        const level = state.personalization_level || 'onboarding';
        distribution[level]++;
      });

      return Response.json({ success: true, distribution });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Lifecycle analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});