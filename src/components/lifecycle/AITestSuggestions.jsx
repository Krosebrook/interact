import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function AITestSuggestions({ onCreateTest }) {
  const [expandedId, setExpandedId] = useState(null);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['ai-test-suggestions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('abTestAIAnalyzer', {
        action: 'suggest_tests'
      });
      return response.data.suggested_tests || [];
    },
    refetchInterval: 600000,
    initialData: []
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading suggestions...</div>;
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          AI Test Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, idx) => {
          const isExpanded = expandedId === idx;
          return (
            <div key={idx} className="border rounded-lg overflow-hidden bg-white">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900">{suggestion.test_name}</h4>
                      <Badge className={
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-slate-100 text-slate-800'
                      }>
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{suggestion.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedId(isExpanded ? null : idx)}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{suggestion.lifecycle_state}</Badge>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-600">Impact: {suggestion.expected_impact}</span>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3 pt-3 border-t">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Reasoning</p>
                      <p className="text-sm text-slate-600">{suggestion.reasoning}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Suggested Variants ({suggestion.variants?.length || 0})
                      </p>
                      <div className="space-y-2">
                        {suggestion.variants?.map((variant, vIdx) => (
                          <div key={vIdx} className="bg-slate-50 rounded p-3 text-sm">
                            <p className="font-medium text-slate-800">{variant.name}</p>
                            <p className="text-slate-600 mt-1">{variant.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => onCreateTest?.(suggestion)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create This Test
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}