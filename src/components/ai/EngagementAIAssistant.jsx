/**
 * AI Assistant for Engagement
 * Suggests challenges, drafts recognition, provides engagement nudges
 */

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Lightbulb, MessageSquare, Target } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../common/LoadingSpinner';

export default function EngagementAIAssistant() {
  const [activeTab, setActiveTab] = useState('challenges');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const generateChallengeSuggestions = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateChallengeSuggestions', {});
      setSuggestions(response.data.suggestions);
      setActiveTab('challenges');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const generateRecognitionDraft = async (userId) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateRecognitionDraft', {
        user_id: userId
      });
      setSuggestions(response.data.draft);
      setActiveTab('recognition');
    } catch (error) {
      toast.error('Failed to generate recognition draft');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementNudges = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getEngagementNudges', {});
      setSuggestions(response.data.nudges);
      setActiveTab('nudges');
    } catch (error) {
      toast.error('Failed to fetch nudges');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-int-navy to-int-orange text-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6" />
            <div>
              <h3 className="font-bold">AI Engagement Assistant</h3>
              <p className="text-sm opacity-90">Powered by machine learning to boost participation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={generateChallengeSuggestions}
          className="h-24 flex-col gap-2"
          disabled={loading}
        >
          <Target className="h-5 w-5" />
          Generate Challenge Ideas
        </Button>
        <Button
          onClick={() => generateRecognitionDraft('current')}
          className="h-24 flex-col gap-2"
          variant="outline"
          disabled={loading}
        >
          <MessageSquare className="h-5 w-5" />
          Draft Recognition
        </Button>
        <Button
          onClick={getEngagementNudges}
          className="h-24 flex-col gap-2"
          variant="outline"
          disabled={loading}
        >
          <Lightbulb className="h-5 w-5" />
          Engagement Nudges
        </Button>
      </div>

      {loading && <LoadingSpinner message="Generating AI suggestions..." />}

      {/* Challenge Suggestions */}
      {activeTab === 'challenges' && suggestions && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Suggested Challenges</h3>
          {suggestions.map((challenge, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="font-bold text-int-orange">{challenge.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{challenge.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-600">Estimated Participants</p>
                      <p className="font-bold text-int-navy">{challenge.estimated_participants}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-600">Expected Engagement Lift</p>
                      <p className="font-bold text-green-600">+{challenge.engagement_lift}%</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-600">Best Time to Launch</p>
                      <p className="font-bold">{challenge.best_launch_day}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Why:</strong> {challenge.rationale}
                  </p>

                  <Button size="sm" className="w-full">
                    Create Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recognition Drafts */}
      {activeTab === 'recognition' && suggestions && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">AI-Drafted Recognition</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Suggested Message</label>
                  <textarea
                    value={suggestions.message || ''}
                    onChange={(e) => setSuggestions({ ...suggestions, message: e.target.value })}
                    className="w-full h-24 p-3 border rounded-lg text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium block mb-2">Category</label>
                    <select className="w-full p-2 border rounded-lg text-sm">
                      <option>{suggestions.category}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Visibility</label>
                    <select className="w-full p-2 border rounded-lg text-sm">
                      <option>public</option>
                      <option>team_only</option>
                      <option>private</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-900">
                    <strong>Tip:</strong> This message aligns with company values: {suggestions.values.join(', ')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Regenerate
                  </Button>
                  <Button size="sm" className="flex-1">
                    Send Recognition
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Engagement Nudges */}
      {activeTab === 'nudges' && suggestions && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Personalized Engagement Nudges</h3>
          {suggestions.map((nudge, idx) => (
            <Card key={idx} className={nudge.priority === 'high' ? 'border-red-200 bg-red-50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold">{nudge.user_name}</p>
                    <p className="text-sm text-slate-600 mt-1">{nudge.message}</p>
                    <div className="flex gap-2 mt-3">
                      {nudge.suggested_actions.map((action, i) => (
                        <Button key={i} size="sm" variant="outline" className="text-xs">
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {nudge.priority === 'high' && (
                    <span className="px-2 py-1 bg-red-200 text-red-900 text-xs font-medium rounded-full whitespace-nowrap ml-2">
                      High Risk
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}