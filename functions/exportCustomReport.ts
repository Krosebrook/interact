import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { reportConfig, reportData } = await req.json();
    
    // Generate CSV content
    let csvContent = `Custom Report - ${reportConfig.reportType.toUpperCase()}\n`;
    csvContent += `Generated: ${new Date().toISOString()}\n`;
    csvContent += `Date Range: ${reportConfig.dateRange} days\n`;
    csvContent += `Department: ${reportConfig.department}\n`;
    csvContent += `User Segment: ${reportConfig.userSegment}\n`;
    csvContent += `Tier: ${reportConfig.tier}\n\n`;
    
    // Summary metrics
    csvContent += `SUMMARY METRICS\n`;
    reportData.summary.forEach(metric => {
      csvContent += `${metric.label},${metric.value}${metric.change ? ` (${metric.change > 0 ? '+' : ''}${metric.change}%)` : ''}\n`;
    });
    csvContent += `\n`;
    
    // Key insights
    if (reportData.insights) {
      csvContent += `KEY INSIGHTS\n`;
      reportData.insights.forEach(insight => {
        csvContent += `"${insight}"\n`;
      });
      csvContent += `\n`;
    }
    
    // Raw data table
    if (reportData.tableData) {
      csvContent += `DETAILED DATA\n`;
      csvContent += reportData.tableData.headers.join(',') + '\n';
      reportData.tableData.rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
    }
    
    // Upload to storage
    const encoder = new TextEncoder();
    const data = encoder.encode(csvContent);
    const blob = new Blob([data], { type: 'text/csv' });
    const filename = `${reportConfig.reportType}_report_${Date.now()}.csv`;
    const file = new File([blob], filename, { type: 'text/csv' });
    
    const uploadResponse = await base44.integrations.Core.UploadFile({ file });
    
    return Response.json({
      success: true,
      downloadUrl: uploadResponse.file_url,
      filename
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});