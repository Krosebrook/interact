# Advanced Reporting Suite Guide
**Version:** 1.0  
**Last Updated:** February 6, 2026

---

## 📊 Reporting System Overview

### 1. User Progress Reports
**Function:** `functions/generateUserProgressReport.js`  
**Component:** `components/reports/UserProgressReportCard.jsx`

**Included Metrics:**
- **Overview**: Total points, level, badges, current/longest streak
- **Goals Summary**: Personal & wellness goals (total, completed, in-progress, completion rate)
- **Engagement**: Events attended, recognitions sent/received, participation rate
- **Achievements**: Recent badges earned, completed goals with points

**Access Control:**
- Users can view their own reports
- Admins can view any user's report
- 403 Forbidden if unauthorized

**Export Formats:**
- PDF: Formatted document with headers, sections, metrics
- CSV: Raw data in spreadsheet format

---

### 2. Team Analytics Reports
**Function:** `functions/generateTeamReport.js`  
**Page:** `pages/AdvancedReportingSuite.js`

**Team Metrics:**
- Total/average points per member
- Active member count (7-day activity window)
- Badge distribution
- Recognition flow
- Event participation rates
- Wellness completion rates

**AI-Generated Insights:**
1. **Engagement Level**: Low/Medium/High classification
2. **Engagement Score**: 0-100 numerical rating
3. **Strengths**: What the team excels at
4. **Concerns**: Potential issues with severity ratings
5. **HR Recommendations**: Prioritized intervention actions
6. **Celebrations**: Achievements to recognize publicly

**Example AI Analysis:**
```json
{
  "engagement_level": "high",
  "engagement_score": 78,
  "strengths": [
    "High recognition activity (2x company average)",
    "100% wellness challenge participation"
  ],
  "concerns": [
    {
      "issue": "3 members inactive for 14+ days",
      "severity": "medium",
      "affected_members": 3
    }
  ],
  "hr_recommendations": [
    {
      "action": "Schedule 1:1 check-ins with inactive members",
      "priority": "high",
      "expected_impact": "Re-engage 60% of inactive members"
    }
  ]
}
```

---

### 3. Customizable Analytics Dashboard
**Component:** `components/analytics/CustomizableDashboard.jsx`

**Available Widgets:**
- Points Trend (line chart)
- Badge Distribution (bar chart)
- Challenge Participation (bar chart)
- Engagement Metrics (line chart)
- Wellness Activity (line chart)
- Recognition Flow (bar chart)

**Features:**
- Add/remove widgets on the fly
- Drag-and-drop layout (future)
- Real-time data updates
- Responsive grid layout

**Usage:**
```javascript
<CustomizableDashboard userEmail={user.email} />
```

---

## 🔄 Export Functionality

### Export Report Function
**Function:** `functions/exportReport.js`

**Supported Formats:**
1. **PDF**
   - Professional formatted document
   - Company branding
   - Charts and tables
   - Generated timestamp
   
2. **CSV**
   - Spreadsheet-ready data
   - All metrics in rows
   - Easy for further analysis

**Usage:**
```javascript
const exportReport = async (type, format) => {
  const response = await base44.functions.invoke('exportReport', {
    reportType: 'user_progress',  // or 'team_report'
    reportData: reportData,
    format: 'pdf'  // or 'csv'
  });
  
  // Download file
  const blob = new Blob([response.data]);
  // ... download logic
};
```

---

## 📱 Report Access Points

### For Users:
1. **Gamification Dashboard → Analytics Tab**
   - View personal progress card
   - Export personal reports

2. **User Profile**
   - Quick progress summary
   - Download achievement history

### For Admins:
1. **Advanced Reporting Suite** (`pages/AdvancedReportingSuite.js`)
   - Gamification analytics overview
   - Team-level reports with AI insights
   - Export all reports

2. **Team Dashboard**
   - Individual team analytics
   - HR intervention recommendations

---

## 🎯 HR Intervention Workflow

**Based on Team Report AI Insights:**

1. **Low Engagement Team** (Score < 40)
   - **Recommendations**: Team-building events, recognition campaigns
   - **Priority**: High
   - **Expected Impact**: 20-30% engagement boost

2. **Inactive Members Detected**
   - **Recommendations**: 1:1 check-ins, personalized challenges
   - **Priority**: Medium-High
   - **Expected Impact**: 60% re-engagement rate

3. **Low Wellness Participation**
   - **Recommendations**: Simplified challenges, team-based incentives
   - **Priority**: Medium
   - **Expected Impact**: 40% participation increase

---

## 📈 Report Scheduling (Future)

**Automated Reports:**
- Weekly team digests (every Monday)
- Monthly executive summaries
- Quarterly performance reviews
- Real-time alerts for concerning trends

**Configuration:**
```javascript
{
  "schedule": "weekly",
  "recipients": ["hr@company.com", "manager@company.com"],
  "report_type": "team_report",
  "auto_export": true,
  "format": "pdf"
}
```

---

## 🔐 Security & Privacy

**Data Access:**
- User reports: Self + Admin only
- Team reports: Admin only
- Anonymized data for company-wide analytics
- No PII in exported reports

**Export Limits:**
- Max 1 export per user per 5 minutes
- Reports auto-expire after 30 days
- Audit logged for compliance

---

**Last Updated:** February 6, 2026  
**Admin Panel:** Advanced Reporting Suite  
**Export Formats:** PDF, CSV