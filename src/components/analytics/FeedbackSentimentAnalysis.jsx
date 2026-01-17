import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, ThumbsUp, Meh, ThumbsDown, TrendingUp } from 'lucide-react';

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444'
};

export default function FeedbackSentimentAnalysis({ participations, events }) {
  const { sentimentData, ratingDistribution, recentFeedback, stats } = useMemo(() => {
    if (!participations.length) return { sentimentData: [], ratingDistribution: [], recentFeedback: [], stats: {} };

    const withFeedback = participations.filter(p => p.feedback_rating || p.feedback);
    
    // Sentiment classification based on rating
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    withFeedback.forEach(p => {
      if (p.feedback_rating >= 4) sentimentCounts.positive++;
      else if (p.feedback_rating >= 3) sentimentCounts.neutral++;
      else sentimentCounts.negative++;
    });

    const sentiment = [
      { name: 'Positive', value: sentimentCounts.positive, color: SENTIMENT_COLORS.positive },
      { name: 'Neutral', value: sentimentCounts.neutral, color: SENTIMENT_COLORS.neutral },
      { name: 'Negative', value: sentimentCounts.negative, color: SENTIMENT_COLORS.negative }
    ];

    // Rating distribution
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    withFeedback.forEach(p => {
      if (p.feedback_rating) {
        ratingCounts[p.feedback_rating]++;
      }
    });

    const distribution = Object.entries(ratingCounts).map(([rating, count]) => ({
      rating: `${rating} ★`,
      count
    }));

    // Recent feedback with event context
    const recent = withFeedback
      .filter(p => p.feedback)
      .sort((a, b) => new Date(b.feedback_submitted_at) - new Date(a.feedback_submitted_at))
      .slice(0, 5)
      .map(p => {
        const event = events.find(e => e.id === p.event_id);
        return {
          ...p,
          eventTitle: event?.title || 'Unknown Event'
        };
      });

    // Calculate stats
    const avgRating = withFeedback.length > 0
      ? (withFeedback.reduce((sum, p) => sum + (p.feedback_rating || 0), 0) / withFeedback.length).toFixed(2)
      : 0;

    const responseRate = participations.length > 0
      ? ((withFeedback.length / participations.length) * 100).toFixed(1)
      : 0;

    return { 
      sentimentData: sentiment, 
      ratingDistribution: distribution,
      recentFeedback: recent,
      stats: {
        totalResponses: withFeedback.length,
        avgRating,
        responseRate,
        positivePercent: withFeedback.length > 0 
          ? ((sentimentCounts.positive / withFeedback.length) * 100).toFixed(1)
          : 0
      }
    };
  }, [participations, events]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="h-5 w-5 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalResponses}</div>
            <p className="text-xs text-slate-600">Total Feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ThumbsUp className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.avgRating}/5</div>
            <p className="text-xs text-slate-600">Average Rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.positivePercent}%</div>
            <p className="text-xs text-slate-600">Positive Feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.responseRate}%</div>
            <p className="text-xs text-slate-600">Response Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Meh className="h-5 w-5 text-slate-600" />
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-amber-500" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="rating" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Recent Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentFeedback.map((feedback, index) => (
              <div 
                key={index}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-slate-900">{feedback.eventTitle}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star}
                            className={star <= feedback.feedback_rating ? 'text-amber-500' : 'text-slate-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feedback.feedback_rating >= 4 ? 'Positive' : feedback.feedback_rating >= 3 ? 'Neutral' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 italic">"{feedback.feedback}"</p>
              </div>
            ))}

            {recentFeedback.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No feedback available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}