import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Users, Zap, ArrowRight, Clock } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProactiveSuggestionsWidget({ 
  userEmail, 
  completedTasks, 
  skillInterests,
  daysSinceStart 
}) {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['proactive-learning', userEmail, completedTasks?.length],
    queryFn: async () => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'proactive_learning_suggestions',
        context: {
          completed_tasks: completedTasks || [],
          skill_interests: skillInterests || [],
          days_since_start: daysSinceStart || 0
        }
      });
      return response.data;
    },
    enabled: !!userEmail,
    staleTime: 30 * 60 * 1000, // Refresh every 30 minutes
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <LoadingSpinner message="Generating personalized suggestions..." />
        </CardContent>
      </Card>
    );
  }

  if (!suggestions?.suggestions) return null;

  const urgentSuggestions = suggestions.suggestions.filter(s => s.urgency === 'immediate');
  const thisWeekSuggestions = suggestions.suggestions.filter(s => s.urgency === 'this_week');

  const typeIcons = {
    learning_path: BookOpen,
    article: Zap,
    exercise: Target,
    mentorship: Users
  };

  const urgencyColors = {
    immediate: 'bg-red-100 text-red-800 border-red-200',
    this_week: 'bg-blue-100 text-blue-800 border-blue-200',
    this_month: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-base">AI Learning Recommendations</p>
            <p className="text-xs font-normal text-slate-500">
              Personalized for your growth journey
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Personalized Message */}
        {suggestions.message && (
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-slate-700 leading-relaxed">{suggestions.message}</p>
          </div>
        )}

        {/* Urgent Suggestions */}
        {urgentSuggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Priority Recommendations
            </h4>
            <div className="space-y-3">
              <AnimatePresence>
                {urgentSuggestions.map((suggestion, idx) => (
                  <SuggestionCard 
                    key={idx} 
                    suggestion={suggestion} 
                    icon={typeIcons[suggestion.type]}
                    urgencyColor={urgencyColors[suggestion.urgency]}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* This Week Suggestions */}
        {thisWeekSuggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">This Week</h4>
            <div className="space-y-3">
              <AnimatePresence>
                {thisWeekSuggestions.map((suggestion, idx) => (
                  <SuggestionCard 
                    key={idx} 
                    suggestion={suggestion} 
                    icon={typeIcons[suggestion.type]}
                    urgencyColor={urgencyColors[suggestion.urgency]}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SuggestionCard({ suggestion, icon: Icon, urgencyColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 transition-all hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
          {Icon && <Icon className="h-5 w-5 text-purple-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h5 className="font-semibold text-slate-900 text-sm">{suggestion.title}</h5>
            <Badge variant="outline" className={`text-xs ${urgencyColor} flex-shrink-0`}>
              <Clock className="h-3 w-3 mr-1" />
              {suggestion.time_commitment}
            </Badge>
          </div>
          
          <p className="text-xs text-slate-600 mb-2 leading-relaxed">
            <strong>Why now:</strong> {suggestion.relevance_reason}
          </p>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 mb-3">
            <p className="text-xs text-emerald-800">
              <strong>You'll gain:</strong> {suggestion.expected_outcome}
            </p>
          </div>

          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Get Started <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}