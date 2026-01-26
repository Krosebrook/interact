import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { reportId, format = 'json' } = await req.json();
    
    // Fetch report configuration
    const report = await base44.entities.AnalyticsReport.get(reportId);
    const { filters, widgets } = report.config;
    
    // Build filter query
    const dateFilter = filters?.date_range ? {
      created_date: {
        $gte: filters.date_range.start,
        $lte: filters.date_range.end
      }
    } : {};
    
    const departmentFilter = filters?.department ? { department: filters.department } : {};
    const teamFilter = filters?.team_id ? { team_id: filters.team_id } : {};
    
    // Fetch data for each widget
    const widgetData = await Promise.all(
      widgets.map(async (widget) => {
        const entityName = widget.entity;
        const filter = { ...dateFilter, ...departmentFilter, ...teamFilter };
        
        const data = await base44.asServiceRole.entities[entityName].filter(filter);
        
        // Calculate metric
        let value;
        switch (widget.metric) {
          case 'count':
            value = data.length;
            break;
          case 'average':
            value = data.reduce((sum, item) => sum + (item[widget.field] || 0), 0) / data.length;
            break;
          case 'sum':
            value = data.reduce((sum, item) => sum + (item[widget.field] || 0), 0);
            break;
          default:
            value = data.length;
        }
        
        return {
          widgetId: widget.id,
          type: widget.type,
          value: Math.round(value * 100) / 100,
          data: widget.chart_type ? data : undefined
        };
      })
    );
    
    // Update last generated timestamp
    await base44.entities.AnalyticsReport.update(reportId, {
      last_generated: new Date().toISOString()
    });
    
    const reportData = {
      reportName: report.report_name,
      reportType: report.report_type,
      filters,
      widgets: widgetData,
      generatedAt: new Date().toISOString(),
      generatedBy: user.email
    };
    
    // Format response based on requested format
    if (format === 'csv') {
      const csv = convertToCSV(widgetData);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${report.report_name}.csv"`
        }
      });
    }
    
    return Response.json(reportData);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function convertToCSV(data) {
  const headers = ['Widget', 'Type', 'Value'];
  const rows = data.map(widget => [
    widget.widgetId,
    widget.type,
    widget.value
  ]);
  
  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
}