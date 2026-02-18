import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, MessageCircle, FileText } from 'lucide-react';
import AIIcebreakerGenerator from './AIIcebreakerGenerator';
import AIDiscussionPrompts from './AIDiscussionPrompts';
import AIEventSummarizer from './AIEventSummarizer';

export default function EventAIAssistant({ eventId, eventType, eventTitle }) {
  return (
    <Tabs defaultValue="icebreakers" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="icebreakers">
          <Sparkles className="h-4 w-4 mr-2" />
          Icebreakers
        </TabsTrigger>
        <TabsTrigger value="prompts">
          <MessageCircle className="h-4 w-4 mr-2" />
          Prompts
        </TabsTrigger>
        <TabsTrigger value="summary">
          <FileText className="h-4 w-4 mr-2" />
          Summary
        </TabsTrigger>
      </TabsList>

      <TabsContent value="icebreakers" className="mt-4">
        <AIIcebreakerGenerator eventId={eventId} eventType={eventType} />
      </TabsContent>

      <TabsContent value="prompts" className="mt-4">
        <AIDiscussionPrompts eventId={eventId} eventType={eventType} />
      </TabsContent>

      <TabsContent value="summary" className="mt-4">
        <AIEventSummarizer eventId={eventId} eventTitle={eventTitle} />
      </TabsContent>
    </Tabs>
  );
}