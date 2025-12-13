/**
 * EXPORT ANALYTICS REPORT
 * Generates PDF or CSV export of engagement analytics
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format = 'pdf', dateRange = 'all' } = await req.json();

    // Fetch analytics data
    const [events, participations, userPoints, activities] = await Promise.all([
      base44.asServiceRole.entities.Event.list(),
      base44.asServiceRole.entities.Participation.list(),
      base44.asServiceRole.entities.UserPoints.list(),
      base44.asServiceRole.entities.Activity.list()
    ]);

    // Calculate metrics
    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const totalParticipants = new Set(participations.map(p => p.participant_email)).size;
    const avgAttendance = participations.length / (completedEvents || 1);
    const totalPoints = userPoints.reduce((sum, u) => sum + (u.total_points || 0), 0);

    // Activity type breakdown
    const typeBreakdown = {};
    events.forEach(event => {
      const activity = activities.find(a => a.id === event.activity_id);
      if (activity) {
        typeBreakdown[activity.type] = (typeBreakdown[activity.type] || 0) + 1;
      }
    });

    // Generate report based on format
    if (format === 'csv') {
      return generateCSV(events, participations, userPoints);
    } else {
      return generatePDF(
        {
          totalEvents,
          completedEvents,
          totalParticipants,
          avgAttendance,
          totalPoints,
          typeBreakdown
        },
        events,
        participations
      );
    }
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateCSV(events, participations, userPoints) {
  // Event summary CSV
  const eventHeaders = 'Event ID,Title,Type,Date,Status,Participants\n';
  const eventRows = events.map(e => {
    const parts = participations.filter(p => p.event_id === e.id);
    return `"${e.id}","${e.title}","${e.event_type || 'other'}","${e.scheduled_date}","${e.status}",${parts.length}`;
  }).join('\n');

  const csv = eventHeaders + eventRows;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="analytics-${Date.now()}.csv"`
    }
  });
}

function generatePDF(metrics, events, participations) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(20, 41, 77); // INT Navy
  doc.text('INTeract Analytics Report', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });

  // Overview Metrics
  yPos += 15;
  doc.setFontSize(16);
  doc.setTextColor(20, 41, 77);
  doc.text('Overview Metrics', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const metricsData = [
    ['Total Events:', metrics.totalEvents],
    ['Completed Events:', metrics.completedEvents],
    ['Total Participants:', metrics.totalParticipants],
    ['Avg. Attendance:', metrics.avgAttendance.toFixed(1)],
    ['Total Points Earned:', metrics.totalPoints.toLocaleString()]
  ];

  metricsData.forEach(([label, value]) => {
    doc.text(label, 25, yPos);
    doc.setFont(undefined, 'bold');
    doc.text(String(value), 80, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 8;
  });

  // Activity Type Breakdown
  yPos += 10;
  doc.setFontSize(16);
  doc.setTextColor(20, 41, 77);
  doc.text('Activity Type Breakdown', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  Object.entries(metrics.typeBreakdown).forEach(([type, count]) => {
    doc.text(`${type}:`, 25, yPos);
    doc.text(String(count), 80, yPos);
    yPos += 7;
  });

  // Recent Events Table
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 15;
  doc.setFontSize(16);
  doc.setTextColor(20, 41, 77);
  doc.text('Recent Events', 20, yPos);

  yPos += 10;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  // Table headers
  doc.setFont(undefined, 'bold');
  doc.text('Event', 20, yPos);
  doc.text('Date', 100, yPos);
  doc.text('Attendance', 150, yPos);
  doc.setFont(undefined, 'normal');
  yPos += 7;

  // Recent 10 events
  const recentEvents = events
    .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))
    .slice(0, 10);

  recentEvents.forEach(event => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    const parts = participations.filter(p => p.event_id === event.id).length;
    const eventTitle = event.title.length > 30 ? event.title.substring(0, 27) + '...' : event.title;
    
    doc.text(eventTitle, 20, yPos);
    doc.text(new Date(event.scheduled_date).toLocaleDateString(), 100, yPos);
    doc.text(String(parts), 150, yPos);
    yPos += 7;
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} - INTeract Analytics`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const pdfBytes = doc.output('arraybuffer');

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="analytics-report-${Date.now()}.pdf"`
    }
  });
}