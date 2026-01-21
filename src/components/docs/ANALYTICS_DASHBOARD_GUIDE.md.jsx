# Analytics Dashboard - User Guide

## Overview
The Customizable Analytics Dashboard provides a flexible, widget-based interface for exploring engagement metrics, lifecycle data, and performance insights.

## Features

### 1. Drag-and-Drop Widgets
Users can customize their dashboard layout by dragging widgets to reorder them. Widget preferences are saved in browser localStorage.

**Available Widgets:**
- **Engagement Score**: Average engagement score across all users
- **Lifecycle Distribution**: Pie chart showing user lifecycle states
- **Churn Risk**: Count of users at high risk of churning (>60% risk)
- **Recognition Stats**: Total peer recognition given
- **Active Tests**: Number of currently running A/B tests
- **Engagement Trend**: 30-day line chart of participation activity

### 2. Data Explorer
Interactive scatter plot for exploring correlations between metrics:
- X/Y axis metric selection
- Automatic correlation coefficient calculation
- Visual interpretation of correlation strength

**Correlation Interpretation:**
- **|r| > 0.7**: Strong correlation
- **|r| > 0.4**: Moderate correlation
- **|r| < 0.4**: Weak correlation

### 3. Export Functionality
Export analytics data in multiple formats:

**CSV Export:**
- Category-grouped metrics
- Machine-readable format
- Opens in Excel/Google Sheets

**PDF Export:**
- Formatted report with charts
- Professional layout
- Ready for presentations

## Technical Architecture

### Backend Functions

#### `exportAnalytics`
**Endpoint:** `functions/exportAnalytics.js`
**Auth:** Admin only
**Parameters:**
```json
{
  "format": "csv" | "pdf",
  "metrics": ["engagement", "lifecycle", "recognition", "abtest"],
  "date_range": "last_30_days"
}
```

**Data Sources:**
- Participation entity (engagement metrics)
- LifecycleState entity (user states)
- Recognition entity (peer recognition)
- ABTest entity (experimentation data)

### Frontend Components

#### `CustomizableAnalyticsDashboard`
**Location:** `pages/CustomizableAnalyticsDashboard.jsx`
**Features:**
- Widget customization dialog
- Drag-and-drop layout
- Export buttons
- Tabbed interface (Dashboard / Data Explorer)

#### `WidgetLibrary`
**Location:** `components/analytics/WidgetLibrary.jsx`
**Exports:**
- Individual widget components
- `AVAILABLE_WIDGETS` configuration object

#### `DataExplorationPanel`
**Location:** `components/analytics/DataExplorationPanel.jsx`
**Features:**
- Metric selection dropdowns
- Scatter plot visualization
- Correlation calculation

## Usage Examples

### Adding Widgets to Dashboard
1. Click "Customize" button
2. Check desired widgets in dialog
3. Widgets appear immediately
4. Drag to reorder

### Exporting Reports
```javascript
// CSV Export
await base44.functions.invoke('exportAnalytics', {
  format: 'csv',
  metrics: ['engagement', 'lifecycle'],
  date_range: 'last_30_days'
});

// PDF Export
await base44.functions.invoke('exportAnalytics', {
  format: 'pdf',
  metrics: ['engagement', 'lifecycle', 'recognition', 'abtest'],
  date_range: 'last_30_days'
});
```

### Exploring Correlations
1. Navigate to "Data Explorer" tab
2. Select X-axis metric (e.g., "Engagement Score")
3. Select Y-axis metric (e.g., "Churn Risk")
4. View scatter plot and correlation coefficient
5. Interpret relationship strength and direction

## Performance Considerations

- **Widget queries**: Each widget makes independent API calls with caching
- **Export operations**: Processed server-side to avoid browser memory issues
- **Data limits**: Dashboard queries limited to 100-500 records for performance
- **localStorage**: Widget preferences < 1KB, no expiration

## Permissions

**View Dashboard:**
- All authenticated users can view their own metrics
- Admins see organization-wide data

**Export Reports:**
- Admin role required
- Exports include aggregated data only (no PII)

## Troubleshooting

### Widgets Not Loading
- Check browser console for API errors
- Verify entities exist (LifecycleState, Participation, etc.)
- Ensure user has proper permissions

### Export Fails
- Verify admin role
- Check function deployment status
- Review function logs for errors

### Correlation Shows NaN
- Requires at least 2 data points
- Check that selected metrics have valid numeric values
- Filter out null/undefined values in data

## Future Enhancements
- Custom date range selection
- Scheduled report emails
- Widget annotations and notes
- Real-time data updates
- Dashboard templates