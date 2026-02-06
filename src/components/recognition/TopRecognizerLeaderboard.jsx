import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function TopRecognizerLeaderboard({ period = '30' }) {
  const { data: topRecognizers = [], isLoading } = useQuery({
    queryKey: ['topRecognizers', period],
    queryFn: async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
      
      const recognitions = await base44.entities.Recognition.filter({ 
        status: 'approved' 
      });
      
      const recentRecognitions = recognitions.filter(r => 
        new Date(r.created_date) >= cutoffDate
      );
      
      const senderCounts = recentRecognitions.reduce((acc, r) => {
        if (!acc[r.sender_email]) {
          acc[r.sender_email] = {
            email: r.sender_email,
            name: r.sender_name,
            count: 0,
            total_points_given: 0
          };
        }
        acc[r.sender_email].count++;
        acc[r.sender_email].total_points_given += (r.points_awarded || 10);
        return acc;
      }, {});
      
      return Object.values(senderCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
    staleTime: 5 * 60 * 1000
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-int-gold" />
          <CardTitle>Top Recognizers</CardTitle>
        </div>
        <CardDescription>Last {period} days - Most recognition given</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topRecognizers.map((recognizer, index) => (
            <div
              key={recognizer.email}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                index === 0 ? 'bg-gradient-to-r from-int-gold/20 to-int-gold/5 border-2 border-int-gold/30' :
                index === 1 ? 'bg-slate-100 border border-slate-200' :
                index === 2 ? 'bg-amber-50 border border-amber-200' :
                'bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-int-gold text-white' :
                  index === 1 ? 'bg-slate-400 text-white' :
                  index === 2 ? 'bg-amber-600 text-white' :
                  'bg-slate-300 text-slate-700'
                }`}>
                  {index === 0 ? <Trophy className="h-5 w-5" /> : index + 1}
                </div>
                <div>
                  <p className="font-semibold text-sm">{recognizer.name}</p>
                  <p className="text-xs text-slate-500">{recognizer.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-int-orange" />
                  <span className="font-bold text-int-orange">{recognizer.count}</span>
                </div>
                <p className="text-xs text-slate-500">{recognizer.total_points_given} pts given</p>
              </div>
            </div>
          ))}
          
          {topRecognizers.length === 0 && (
            <p className="text-center text-slate-500 py-8">No recognitions yet. Be the first!</p>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Consistent Recognition Bonus
          </p>
          <p className="text-xs text-blue-700">
            Give 5+ recognitions this week to earn a 50-point bonus! 🎉
          </p>
        </div>
      </CardContent>
    </Card>
  );
}