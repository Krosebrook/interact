import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Users, Clock, Lock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

/**
 * SurveyCard - Display survey preview with CTA
 */
export default function SurveyCard({ survey, onTakeSurvey, isCompleted = false }) {
  const daysUntilClose = survey.end_date 
    ? Math.ceil((new Date(survey.end_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className={`hover:shadow-lg transition-all ${isCompleted ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{survey.title}</CardTitle>
            <p className="text-sm text-slate-600 line-clamp-2">{survey.description}</p>
          </div>
          {survey.is_anonymous && (
            <Badge variant="outline" className="border-purple-200 text-purple-700 whitespace-nowrap ml-2">
              <Lock className="h-3 w-3 mr-1" />
              Anonymous
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {survey.questions?.length || 0} questions
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {survey.response_count || 0} responses
          </div>
          {daysUntilClose !== null && daysUntilClose > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {daysUntilClose} days left
            </div>
          )}
        </div>

        {survey.end_date && (
          <p className="text-xs text-slate-500">
            Closes: {format(new Date(survey.end_date), 'MMMM d, yyyy')}
          </p>
        )}

        {isCompleted ? (
          <Badge className="w-full justify-center bg-green-100 text-green-700">
            ✓ Completed
          </Badge>
        ) : (
          <Button
            onClick={onTakeSurvey}
            className="w-full bg-int-orange hover:bg-int-orange/90 text-white"
          >
            Take Survey
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}