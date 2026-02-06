import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, TrendingUp, Clock } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AISchedulingSuggestions({ activityType, duration, onSelectTime }) {
  const [suggestions, setSuggestions] = useState(null);
  
  const getSuggestions = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('suggestOptimalEventTime', {
        activityType,
        duration: duration || 60,
        teamId: null
      });
      return response.data.recommendations;
    },
    onSuccess: (data) => {
      setSuggestions(data);
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-int-orange" />
          AI Scheduling Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestions ? (
          <Button
            onClick={() => getSuggestions.mutate()}
            disabled={getSuggestions.isPending}
            className="w-full"
          >
            {getSuggestions.isPending ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get AI Time Suggestions
              </>
            )}
          </Button>
        ) : (
          <>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-int-orange/10 to-int-orange/5 border-2 border-int-orange/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-int-orange" />
                  <p className="font-semibold text-sm">Best Time</p>
                  <Badge className="bg-int-orange">
                    {Math.round(suggestions.primary_recommendation.expected_attendance_rate)}% expected
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-slate-900 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-semibold">
                    {suggestions.primary_recommendation.day_name}s at {suggestions.primary_recommendation.time_slot}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">{suggestions.primary_recommendation.reasoning}</p>
                <Button
                  size="sm"
                  onClick={() => onSelectTime?.(suggestions.primary_recommendation)}
                  className="w-full bg-int-orange hover:bg-int-orange-dark"
                >
                  Use This Time
                </Button>
              </div>
              
              {suggestions.alternative_slots?.map((slot, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">
                        {slot.day_name}s at {slot.time_slot}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {Math.round(slot.expected_attendance_rate)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{slot.reasoning}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectTime?.(slot)}
                    className="w-full"
                  >
                    Use Alternative
                  </Button>
                </div>
              ))}
            </div>
            
            {suggestions.general_insights?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900 mb-2">💡 Insights</p>
                <ul className="space-y-1">
                  {suggestions.general_insights.map((insight, i) => (
                    <li key={i} className="text-xs text-blue-700">• {insight}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuggestions(null)}
              className="w-full"
            >
              Get New Suggestions
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}