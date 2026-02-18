import { useState } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, MessageCircle, FileText } from 'lucide-react';
import AIIcebreakerGenerator from '../components/facilitator/AIIcebreakerGenerator';
import AIDiscussionPrompts from '../components/facilitator/AIDiscussionPrompts';
import AIEventSummarizer from '../components/facilitator/AIEventSummarizer';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function FacilitatorAITools() {
  const { user, isChecking } = useAuth();
  const [activeTab, setActiveTab] = useState('icebreakers');

  if (isChecking) return <LoadingSpinner />;

  if (user?.role !== 'admin' && user?.user_type !== 'facilitator') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">Facilitator access required</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-int-navy flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-int-orange to-purple-500 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          AI Facilitator Tools
        </h1>
        <p className="text-slate-600 mt-2">AI-powered assistance for event planning and management</p>
      </div>

      {/* Tools Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="icebreakers">
            <Sparkles className="h-4 w-4 mr-2" />
            Icebreakers
          </TabsTrigger>
          <TabsTrigger value="prompts">
            <MessageCircle className="h-4 w-4 mr-2" />
            Discussion Prompts
          </TabsTrigger>
          <TabsTrigger value="summary">
            <FileText className="h-4 w-4 mr-2" />
            Event Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="icebreakers" className="mt-6">
          <AIIcebreakerGenerator />
        </TabsContent>

        <TabsContent value="prompts" className="mt-6">
          <AIDiscussionPrompts />
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <AIEventSummarizer />
        </TabsContent>
      </Tabs>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-purple-900 mb-3">💡 Facilitator Tips</h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li>• Use icebreakers at the beginning to energize participants</li>
            <li>• Generate discussion prompts before the event for better preparation</li>
            <li>• Create summaries immediately after events while details are fresh</li>
            <li>• Copy AI suggestions and adapt them to your team's unique culture</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}