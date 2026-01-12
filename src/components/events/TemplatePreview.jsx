import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Users, 
  ListChecks, 
  MessageSquare, 
  Lightbulb,
  FileText,
  CheckCircle,
  Mail
} from 'lucide-react';

const TIMING_LABELS = {
  '1_week_before': '1 Week Before',
  '3_days_before': '3 Days Before',
  '1_day_before': '1 Day Before',
  '1_hour_before': '1 Hour Before',
  'after_event': 'After Event'
};

export default function TemplatePreview({ template, onCustomize }) {
  if (!template) return null;

  const totalAgendaTime = (template.agenda || []).reduce((sum, item) => sum + (item.duration_minutes || 0), 0);

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="events" data-component="templatepreview">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{template.icon || '📋'}</span>
            <div>
              <CardTitle>{template.name}</CardTitle>
              <p className="text-sm text-slate-500">{template.description}</p>
            </div>
          </div>
          {onCustomize && (
            <Button variant="outline" onClick={onCustomize}>
              Customize
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-slate-500" />
            <p className="text-lg font-bold">{template.default_duration_minutes || 60}</p>
            <p className="text-xs text-slate-500">Minutes</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <ListChecks className="h-5 w-5 mx-auto mb-1 text-slate-500" />
            <p className="text-lg font-bold">{(template.agenda || []).length}</p>
            <p className="text-xs text-slate-500">Agenda Items</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <Lightbulb className="h-5 w-5 mx-auto mb-1 text-slate-500" />
            <p className="text-lg font-bold">{(template.icebreakers || []).length}</p>
            <p className="text-xs text-slate-500">Icebreakers</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <Mail className="h-5 w-5 mx-auto mb-1 text-slate-500" />
            <p className="text-lg font-bold">{(template.communication_schedule || []).length}</p>
            <p className="text-xs text-slate-500">Messages</p>
          </div>
        </div>

        <Tabs defaultValue="agenda">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="icebreakers">Icebreakers</TabsTrigger>
            <TabsTrigger value="comms">Messages</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          {/* Agenda */}
          <TabsContent value="agenda">
            {(template.agenda || []).length > 0 ? (
              <div className="space-y-2">
                {template.agenda.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-int-orange/20 flex items-center justify-center text-sm font-bold text-int-orange">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-slate-500">{item.description}</p>
                      )}
                    </div>
                    <Badge variant="outline">{item.duration_minutes} min</Badge>
                  </div>
                ))}
                <p className="text-sm text-slate-500 text-right">
                  Total: {totalAgendaTime} minutes
                </p>
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No agenda items defined</p>
            )}
          </TabsContent>

          {/* Icebreakers */}
          <TabsContent value="icebreakers">
            {(template.icebreakers || []).length > 0 ? (
              <div className="space-y-3">
                {template.icebreakers.map((item, i) => (
                  <Card key={i} className="p-3 border-l-4 border-l-purple-500">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <Badge className="bg-purple-100 text-purple-700">{item.duration_minutes} min</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No icebreakers defined</p>
            )}
          </TabsContent>

          {/* Communications */}
          <TabsContent value="comms">
            {(template.communication_schedule || []).length > 0 ? (
              <div className="space-y-3">
                {template.communication_schedule.map((item, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{TIMING_LABELS[item.timing] || item.timing}</Badge>
                      <Badge className={
                        item.type === 'reminder' ? 'bg-blue-100 text-blue-700' :
                        item.type === 'preparation' ? 'bg-green-100 text-green-700' :
                        item.type === 'follow_up' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }>
                        {item.type?.replace('_', ' ')}
                      </Badge>
                    </div>
                    {item.subject_template && (
                      <p className="font-medium text-sm">{item.subject_template}</p>
                    )}
                    {item.body_template && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.body_template}</p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No scheduled messages</p>
            )}
          </TabsContent>

          {/* Tips */}
          <TabsContent value="tips">
            {(template.facilitator_tips || []).length > 0 ? (
              <div className="space-y-2">
                {template.facilitator_tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No facilitator tips</p>
            )}

            {template.description_draft && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Description Draft
                </h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{template.description_draft}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}