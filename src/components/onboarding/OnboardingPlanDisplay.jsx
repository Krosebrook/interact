import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, BookOpen, Award, ChevronDown, ChevronUp } from 'lucide-react';

export default function OnboardingPlanDisplay({ plan }) {
  const [expandedWeek, setExpandedWeek] = useState(1);

  if (!plan) return null;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-int-orange/10 to-int-gold/10 border-int-orange/30">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-int-navy mb-2">Welcome Message</h3>
          <p className="text-slate-700 leading-relaxed">{plan.welcome_message}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {plan.weeks.map((week) => (
          <Card key={week.week_number} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedWeek(expandedWeek === week.week_number ? null : week.week_number)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {week.week_number}
                  </div>
                  <div>
                    <CardTitle className="text-base">{week.title}</CardTitle>
                    <p className="text-sm text-slate-600 mt-0.5">{week.focus}</p>
                  </div>
                </div>
                {expandedWeek === week.week_number ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </CardHeader>

            {expandedWeek === week.week_number && (
              <CardContent className="space-y-4 border-t pt-4">
                {/* Tasks */}
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Tasks & Goals
                  </h4>
                  <ul className="space-y-1.5">
                    {week.tasks.map((task, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outcomes */}
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-600" />
                    Expected Outcomes
                  </h4>
                  <ul className="space-y-1.5">
                    {week.outcomes.map((outcome, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    Resources
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {week.resources.map((resource, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Success Metrics */}
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-int-orange" />
                    Success Metrics
                  </h4>
                  <ul className="space-y-1.5">
                    {week.success_metrics.map((metric, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-int-orange mt-0.5">→</span>
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}