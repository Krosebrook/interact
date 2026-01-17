import AIAdminDashboard from '../components/admin/AIAdminDashboard';
import AICoachingAssistant from '../components/admin/AICoachingAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, BarChart3 } from 'lucide-react';

export default function AIAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-int-navy flex items-center gap-3">
          <Brain className="h-8 w-8 text-int-orange" />
          AI Admin Intelligence
        </h1>
        <p className="text-slate-600 mt-1">Analytics, coaching, and proactive engagement management</p>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="coaching">
            <Brain className="h-4 w-4 mr-2" />
            AI Coaching
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <AIAdminDashboard />
        </TabsContent>

        <TabsContent value="coaching" className="mt-6">
          <AICoachingAssistant />
        </TabsContent>
      </Tabs>
    </div>
  );
}