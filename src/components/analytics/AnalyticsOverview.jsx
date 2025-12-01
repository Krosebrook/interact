import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Star } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export default function AnalyticsOverview({ 
  typeDistribution, 
  monthlyData, 
  activityParticipation,
  recentFeedback 
}) {
  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Types */}
        <Card className="p-6 shadow-md border-0">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Trend */}
        <Card className="p-6 shadow-md border-0">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Event Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="events" 
                stroke="#6366f1" 
                strokeWidth={2}
                name="Events"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Activities */}
      <Card className="p-6 shadow-md border-0">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Top Activities by Participation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityParticipation}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="participants" fill="#6366f1" name="Participants" />
            <Bar dataKey="events" fill="#ec4899" name="Events Held" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Participation Details */}
      <Card className="p-6 shadow-md border-0">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Participation Feedback</h3>
        <div className="space-y-4">
          {recentFeedback.map(p => (
            <div key={p.id} className="border-l-4 border-indigo-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-900">{p.participant_name}</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < (p.engagement_score || 0) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">{p.feedback}</p>
              <p className="text-xs text-slate-400">{p.event?.title}</p>
            </div>
          ))}
          {recentFeedback.length === 0 && (
            <p className="text-slate-500 text-center py-4">No feedback yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}