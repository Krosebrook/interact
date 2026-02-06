import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { reportType, reportData, format = 'pdf' } = await req.json();
    
    if (format === 'csv') {
      // Generate CSV
      let csvContent = '';
      
      if (reportType === 'user_progress') {
        csvContent = 'Metric,Value\n';
        csvContent += `Total Points,${reportData.overview.total_points}\n`;
        csvContent += `Current Level,${reportData.overview.current_level}\n`;
        csvContent += `Badges Earned,${reportData.overview.badges_earned}\n`;
        csvContent += `Current Streak,${reportData.overview.current_streak} days\n`;
        csvContent += `Personal Goals Completed,${reportData.goals_summary.personal_goals.completed}\n`;
        csvContent += `Wellness Goals Completed,${reportData.goals_summary.wellness_goals.completed}\n`;
        csvContent += `Events Attended,${reportData.engagement.events_attended}\n`;
        csvContent += `Recognitions Sent,${reportData.engagement.recognitions_sent}\n`;
        csvContent += `Recognitions Received,${reportData.engagement.recognitions_received}\n`;
      } else if (reportType === 'team_report') {
        csvContent = 'Metric,Value\n';
        csvContent += `Team Name,${reportData.team_name}\n`;
        csvContent += `Members,${reportData.member_count}\n`;
        csvContent += `Total Points,${reportData.metrics.total_points}\n`;
        csvContent += `Avg Points/Member,${reportData.metrics.avg_points_per_member}\n`;
        csvContent += `Active Members,${reportData.metrics.active_members}\n`;
        csvContent += `Activity Rate,${reportData.metrics.activity_rate}%\n`;
        csvContent += `Engagement Level,${reportData.ai_insights.engagement_level}\n`;
      }
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}_${Date.now()}.csv"`
        }
      });
    }
    
    // Generate PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(20, 41, 77);
    doc.text('INTeract Report', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    
    let yPos = 45;
    
    if (reportType === 'user_progress') {
      // User Progress Report
      doc.setFontSize(16);
      doc.setTextColor(20, 41, 77);
      doc.text('Personal Progress Report', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.text(`User: ${reportData.user_email}`, 20, yPos);
      yPos += 15;
      
      // Overview
      doc.setFontSize(14);
      doc.text('Overview', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.text(`Total Points: ${reportData.overview.total_points}`, 30, yPos);
      yPos += 6;
      doc.text(`Current Level: ${reportData.overview.current_level}`, 30, yPos);
      yPos += 6;
      doc.text(`Badges Earned: ${reportData.overview.badges_earned}`, 30, yPos);
      yPos += 6;
      doc.text(`Current Streak: ${reportData.overview.current_streak} days`, 30, yPos);
      yPos += 12;
      
      // Goals
      doc.setFontSize(14);
      doc.text('Goals Summary', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.text(`Personal Goals Completed: ${reportData.goals_summary.personal_goals.completed}/${reportData.goals_summary.personal_goals.total}`, 30, yPos);
      yPos += 6;
      doc.text(`Wellness Goals Completed: ${reportData.goals_summary.wellness_goals.completed}/${reportData.goals_summary.wellness_goals.total}`, 30, yPos);
      yPos += 12;
      
      // Engagement
      doc.setFontSize(14);
      doc.text('Engagement', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.text(`Events Attended: ${reportData.engagement.events_attended}`, 30, yPos);
      yPos += 6;
      doc.text(`Recognitions Sent: ${reportData.engagement.recognitions_sent}`, 30, yPos);
      yPos += 6;
      doc.text(`Recognitions Received: ${reportData.engagement.recognitions_received}`, 30, yPos);
      
    } else if (reportType === 'team_report') {
      // Team Report
      doc.setFontSize(16);
      doc.setTextColor(20, 41, 77);
      doc.text(`Team Report: ${reportData.team_name}`, 20, yPos);
      yPos += 15;
      
      doc.setFontSize(14);
      doc.text('Team Metrics', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.text(`Members: ${reportData.member_count}`, 30, yPos);
      yPos += 6;
      doc.text(`Total Points: ${reportData.metrics.total_points}`, 30, yPos);
      yPos += 6;
      doc.text(`Avg Points/Member: ${reportData.metrics.avg_points_per_member}`, 30, yPos);
      yPos += 6;
      doc.text(`Active Members: ${reportData.metrics.active_members} (${Math.round(reportData.metrics.activity_rate)}%)`, 30, yPos);
      yPos += 12;
      
      // AI Insights
      doc.setFontSize(14);
      doc.text('AI Insights', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.text(`Engagement Level: ${reportData.ai_insights.engagement_level.toUpperCase()}`, 30, yPos);
      yPos += 8;
      
      if (reportData.ai_insights.strengths?.length > 0) {
        doc.text('Strengths:', 30, yPos);
        yPos += 6;
        reportData.ai_insights.strengths.forEach(strength => {
          doc.text(`• ${strength}`, 35, yPos);
          yPos += 5;
        });
        yPos += 4;
      }
      
      if (reportData.ai_insights.hr_recommendations?.length > 0) {
        doc.text('HR Recommendations:', 30, yPos);
        yPos += 6;
        reportData.ai_insights.hr_recommendations.slice(0, 3).forEach(rec => {
          doc.text(`• ${rec.action} [${rec.priority}]`, 35, yPos);
          yPos += 5;
        });
      }
    }
    
    const pdfBytes = doc.output('arraybuffer');
    
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reportType}_${Date.now()}.pdf"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});