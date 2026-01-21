import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { format, metrics, date_range } = await req.json();

    const data = await gatherAnalyticsData(base44, metrics, date_range);

    if (format === 'csv') {
      return generateCSV(data);
    } else if (format === 'pdf') {
      return generatePDF(data);
    }

    return Response.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function gatherAnalyticsData(base44, metrics, date_range) {
  const data = {};

  try {
    if (metrics.includes('engagement')) {
      const participations = await base44.entities.Participation.list('-created_date', 500);
      data.engagement = {
        total: participations.length,
        by_status: participations.reduce((acc, p) => {
          const status = p.attendance_status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        avg_engagement: participations.filter(p => p.engagement_score).length > 0
          ? participations.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / participations.filter(p => p.engagement_score).length
          : 0
      };
    }

    if (metrics.includes('lifecycle')) {
      const states = await base44.entities.LifecycleState.list('-updated_date', 500);
      const validStates = states.filter(s => s.lifecycle_state);
      data.lifecycle = {
        distribution: validStates.reduce((acc, s) => {
          acc[s.lifecycle_state] = (acc[s.lifecycle_state] || 0) + 1;
          return acc;
        }, {}),
        avg_churn_risk: validStates.length > 0 
          ? (validStates.reduce((sum, s) => sum + (s.churn_risk || 0), 0) / validStates.length).toFixed(3)
          : 0,
        total_users: validStates.length
      };
    }

    if (metrics.includes('recognition')) {
      const recognition = await base44.entities.Recognition.list('-created_date', 500);
      data.recognition = {
        total: recognition.length,
        top_givers: getTopUsers(recognition, 'giver_email'),
        top_receivers: getTopUsers(recognition, 'recipient_email'),
        avg_per_user: recognition.length > 0 
          ? (recognition.length / new Set(recognition.map(r => r.giver_email)).size).toFixed(2)
          : 0
      };
    }

    if (metrics.includes('abtest')) {
      const tests = await base44.entities.ABTest.list();
      data.abtest = {
        total: tests.length,
        active: tests.filter(t => t.status === 'active').length,
        completed: tests.filter(t => t.status === 'completed').length,
        draft: tests.filter(t => t.status === 'draft').length
      };
    }
  } catch (error) {
    console.error('Error gathering analytics data:', error);
    throw new Error(`Failed to gather ${Object.keys(data).join(', ')} metrics: ${error.message}`);
  }

  return data;
}

function getTopUsers(records, field) {
  const counts = records.reduce((acc, r) => {
    acc[r[field]] = (acc[r[field]] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([email, count]) => ({ email, count }));
}

function generateCSV(data) {
  let csv = 'Metric,Value\n';
  
  Object.entries(data).forEach(([category, values]) => {
    csv += `\n${category.toUpperCase()}\n`;
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, val]) => {
        csv += `${key},${JSON.stringify(val)}\n`;
      });
    }
  });

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=analytics-export.csv'
    }
  });
}

function generatePDF(data) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Analytics Report', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);

  let y = 45;

  Object.entries(data).forEach(([category, values]) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.text(category.toUpperCase(), 20, y);
    y += 10;

    doc.setFontSize(10);
    Object.entries(values).forEach(([key, val]) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${key}: ${JSON.stringify(val)}`, 25, y);
      y += 7;
    });
    y += 5;
  });

  const pdfBytes = doc.output('arraybuffer');

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=analytics-report.pdf'
    }
  });
}