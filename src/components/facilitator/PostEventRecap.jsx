import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Download,
  Send,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function PostEventRecap({ eventId }) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['facilitator-recap', eventId],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateFacilitatorGuide', {
        eventId,
        guideType: 'post_event'
      });
      return response.data.guide;
    },
    staleTime: 5 * 60 * 1000
  });

  const sendToTeamsMutation = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('sendTeamsNotification', {
        eventId,
        notificationType: 'recap'
      });
    },
    onSuccess: () => {
      toast.success('Recap sent to Teams!');
    }
  });

  const downloadRecap = () => {
    if (!data) return;
    
    const recapText = `
EVENT RECAP SUMMARY

${data.executive_summary}

KEY HIGHLIGHTS:
${data.key_highlights?.map(h => `• ${h}`).join('\n')}

PARTICIPATION INSIGHTS:
${data.participation_insights}

WHAT WENT WELL:
${data.what_went_well?.map(w => `• ${w}`).join('\n')}

AREAS FOR IMPROVEMENT:
${data.areas_for_improvement?.map(a => `• ${a}`).join('\n')}

RECOMMENDATIONS FOR NEXT TIME:
${data.recommendations?.map(r => `• ${r}`).join('\n')}
    `.trim();

    const blob = new Blob([recapText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-recap-${eventId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('Recap downloaded!');
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-0 shadow-lg" data-b44-sync="true" data-feature="facilitator" data-component="posteventrecap">
        <div className="flex items-center gap-3 text-indigo-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>AI is analyzing the event and generating recap...</span>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold">AI-Generated Recap</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadRecap}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              onClick={() => sendToTeamsMutation.mutate()}
              disabled={sendToTeamsMutation.isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="h-4 w-4 mr-1" />
              Send to Teams
            </Button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600 rounded-r-lg mb-4">
          <h4 className="font-semibold text-indigo-900 mb-2">Executive Summary</h4>
          <p className="text-indigo-700">{data.executive_summary}</p>
        </div>
      </Card>

      {/* Key Highlights */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h4 className="font-bold text-lg">Key Highlights</h4>
        </div>
        <ul className="space-y-2">
          {data.key_highlights?.map((highlight, i) => (
            <li key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
              <span className="text-emerald-600">✨</span>
              <span className="text-slate-700">{highlight}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Participation Insights */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-blue-600">Insights</Badge>
        </div>
        <p className="text-slate-700 leading-relaxed">{data.participation_insights}</p>
      </Card>

      {/* What Went Well */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h4 className="font-bold text-lg">What Went Well</h4>
        </div>
        <ul className="space-y-2">
          {data.what_went_well?.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Areas for Improvement */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <h4 className="font-bold text-lg">Areas for Improvement</h4>
        </div>
        <ul className="space-y-2">
          {data.areas_for_improvement?.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <h4 className="font-bold text-lg">Recommendations for Next Time</h4>
        </div>
        <ul className="space-y-2">
          {data.recommendations?.map((rec, i) => (
            <li key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-900">💡 {rec}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}