import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, TrendingUp, Clock, Loader2 } from 'lucide-react';

export default function TimeSlotSuggestions({ onSelectTime }) {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['time-suggestions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeOptimalTimes');
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50" data-b44-sync="true" data-feature="events" data-component="timeslotsuggestions">
        <div className="flex items-center gap-2 text-indigo-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Analyzing optimal times...</span>
        </div>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <span className="font-semibold text-sm text-purple-900">Suggested Times (Best Attendance)</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.slice(0, 5).map((slot, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelectTime(slot)}
            className="bg-white hover:bg-purple-100 border-purple-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            {slot.day} {slot.time}
            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              {slot.avg_attendance}% avg
            </Badge>
          </Button>
        ))}
      </div>
      
      <p className="text-xs text-purple-700 mt-2">
        Based on historical attendance data from past events
      </p>
    </Card>
  );
}