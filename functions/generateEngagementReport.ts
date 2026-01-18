import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate User Engagement Report in Google Docs
 * Creates a formatted engagement report with lifecycle intelligence data
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportType = 'full', dateRange = '30' } = await req.json();

    // Get Google Docs access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledocs');

    // Fetch analytics data
    const [stateDistribution, churnTrends, interventionData, abtestData] = await Promise.all([
      base44.asServiceRole.functions.invoke('lifecycleAnalytics', {
        action: 'get_state_distribution'
      }),
      base44.asServiceRole.functions.invoke('lifecycleAnalytics', {
        action: 'get_churn_trends',
        days: parseInt(dateRange)
      }),
      base44.asServiceRole.functions.invoke('lifecycleAnalytics', {
        action: 'get_intervention_effectiveness'
      }),
      base44.asServiceRole.functions.invoke('lifecycleAnalytics', {
        action: 'get_abtest_summary'
      })
    ]);

    const stateData = stateDistribution.data;
    const churnData = churnTrends.data;
    const interventions = interventionData.data;
    const abtests = abtestData.data;

    // Create Google Doc
    const createDocResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `User Engagement Report - ${new Date().toISOString().split('T')[0]}`
      })
    });

    if (!createDocResponse.ok) {
      throw new Error(`Failed to create document: ${await createDocResponse.text()}`);
    }

    const doc = await createDocResponse.json();
    const documentId = doc.documentId;

    // Build content requests
    const requests = [
      // Title
      {
        insertText: {
          location: { index: 1 },
          text: `User Engagement Report\n${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}\n\n`
        }
      },
      // Executive Summary
      {
        insertText: {
          location: { index: 1 },
          text: `Executive Summary\n\nThis report provides insights into user engagement, lifecycle distribution, churn risk, and intervention effectiveness for the past ${dateRange} days.\n\n`
        }
      },
      // Key Metrics
      {
        insertText: {
          location: { index: 1 },
          text: `Key Metrics\n\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• Total Users: ${stateData.total_users}\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• At-Risk Users: ${stateData.distribution.at_risk} (${stateData.percentages.at_risk.toFixed(1)}%)\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• Dormant Users: ${stateData.distribution.dormant} (${stateData.percentages.dormant.toFixed(1)}%)\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• Power Users: ${stateData.distribution.power_user} (${stateData.percentages.power_user.toFixed(1)}%)\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• Intervention Conversion Rate: ${interventions.overall_conversion_rate.toFixed(1)}%\n\n`
        }
      },
      // Lifecycle State Distribution
      {
        insertText: {
          location: { index: 1 },
          text: `Lifecycle State Distribution\n\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: Object.entries(stateData.distribution)
            .map(([state, count]) => {
              const percentage = stateData.percentages[state];
              return `• ${state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${count} users (${percentage.toFixed(1)}%)`;
            })
            .join('\n') + '\n\n'
        }
      },
      // Churn Risk Analysis
      {
        insertText: {
          location: { index: 1 },
          text: `Churn Risk Analysis\n\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• Low Risk: ${stateData.churn_risk_distribution.low} users\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• Medium Risk: ${stateData.churn_risk_distribution.medium} users\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• High Risk: ${stateData.churn_risk_distribution.high} users\n\n`
        }
      },
      // Intervention Performance
      {
        insertText: {
          location: { index: 1 },
          text: `Intervention Performance\n\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Total Interventions Shown: ${interventions.total_interventions_shown}\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Acted On: ${interventions.total_acted_on}\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `Dismissed: ${interventions.total_dismissed}\n\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `By Type:\n` + Object.entries(interventions.by_type)
            .map(([type, stats]) => 
              `• ${type.replace(/_/g, ' ')}: ${stats.conversion_rate.toFixed(1)}% conversion (${stats.acted_on}/${stats.shown})`
            )
            .join('\n') + '\n\n'
        }
      },
      // A/B Testing Summary
      {
        insertText: {
          location: { index: 1 },
          text: `A/B Testing Summary\n\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• Total Tests: ${abtests.summary.total_tests}\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• Active Tests: ${abtests.summary.active_tests}\n`
        }
      },
      {
        insertText: {
          location: { index: 1 },
          text: `• Completed Tests: ${abtests.summary.completed_tests}\n`
        }
      }
    ];

    if (abtests.summary.completed_tests > 0) {
      requests.push({
        insertText: {
          location: { index: 1 },
          text: `• Average Improvement: +${abtests.summary.avg_improvement.toFixed(1)}%\n`
        }
      });
      requests.push({
        insertText: {
          location: { index: 1 },
          text: `• Average Confidence: ${abtests.summary.avg_confidence.toFixed(0)}%\n\n`
        }
      });
    } else {
      requests.push({
        insertText: {
          location: { index: 1 },
          text: '\n'
        }
      });
    }

    // Recommendations
    requests.push({
      insertText: {
        location: { index: 1 },
        text: `Recommendations\n\n`
      }
    });

    const recommendations = [];
    if (stateData.percentages.at_risk > 15) {
      recommendations.push('• High proportion of at-risk users detected. Consider increasing intervention frequency.');
    }
    if (stateData.percentages.dormant > 20) {
      recommendations.push('• Significant dormant user segment. Launch re-engagement campaigns.');
    }
    if (interventions.overall_conversion_rate < 10) {
      recommendations.push('• Low intervention conversion rate. Review messaging and timing strategies.');
    }
    if (stateData.percentages.power_user < 10) {
      recommendations.push('• Limited power user adoption. Focus on tier progression and value delivery.');
    }
    if (abtests.summary.active_tests === 0) {
      recommendations.push('• No active A/B tests. Launch experiments to optimize engagement strategies.');
    }

    if (recommendations.length > 0) {
      requests.push({
        insertText: {
          location: { index: 1 },
          text: recommendations.join('\n') + '\n\n'
        }
      });
    }

    // Apply formatting
    await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: requests.reverse() })
    });

    // Apply text styling
    const styleRequests = [
      // Title styling
      {
        updateParagraphStyle: {
          range: { startIndex: 1, endIndex: 25 },
          paragraphStyle: {
            namedStyleType: 'HEADING_1',
            alignment: 'CENTER'
          },
          fields: 'namedStyleType,alignment'
        }
      },
      // Section headings
      {
        updateTextStyle: {
          range: { startIndex: 1, endIndex: 1000 },
          textStyle: {
            bold: true,
            fontSize: { magnitude: 14, unit: 'PT' }
          },
          fields: 'bold,fontSize'
        }
      }
    ];

    await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: styleRequests })
    });

    const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    return Response.json({
      success: true,
      documentId,
      documentUrl: docUrl,
      message: 'Engagement report created successfully'
    });

  } catch (error) {
    console.error('Generate engagement report error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});