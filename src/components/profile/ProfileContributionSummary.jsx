import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Heart, Star, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfileContributionSummary({ 
  recognitionsReceived = [], 
  recognitionsGiven = [],
  participations = []
}) {
  const totalRecognitions = recognitionsReceived.length + recognitionsGiven.length;
  
  const avgRating = (() => {
    const ratings = participations.filter(p => p.feedback_rating).map(p => p.feedback_rating);
    return ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '0';
  })();

  const topCategories = (() => {
    const categories = recognitionsReceived.reduce((acc, rec) => {
      acc[rec.category] = (acc[rec.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);
  })();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Engagement Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{totalRecognitions}</div>
              <div className="text-xs text-slate-500 mt-1">Total Recognitions</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{avgRating}</div>
              <div className="text-xs text-slate-500 mt-1">Avg Event Rating</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{recognitionsGiven.length}</div>
              <div className="text-xs text-slate-500 mt-1">Given</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{recognitionsReceived.length}</div>
              <div className="text-xs text-slate-500 mt-1">Received</div>
            </div>
          </div>

          {topCategories.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-slate-700 mb-2">Top Recognition Areas:</p>
              <div className="flex flex-wrap gap-2">
                {topCategories.map(cat => (
                  <Badge key={cat} variant="outline" className="capitalize">
                    {cat.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Recognition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-600" />
            Latest Recognition
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recognitionsReceived.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No recognitions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recognitionsReceived.slice(0, 3).map(rec => (
                <div key={rec.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-amber-100 text-amber-700 capitalize">
                      {rec.category.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(rec.created_date), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 italic line-clamp-2">"{rec.message}"</p>
                  <p className="text-xs text-slate-500 mt-2">— {rec.sender_name}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}