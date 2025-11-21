import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import RecurrenceSettings from '../components/events/RecurrenceSettings';
import EventTasksManager from '../components/events/EventTasksManager';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

export default function EventWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState({
    purpose: '',
    target_audience: '',
    title: '',
    description: '',
    activity_id: '',
    event_format: 'online',
    location: '',
    scheduled_date: '',
    duration_minutes: 30,
    max_participants: null,
    custom_instructions: '',
    meeting_link: '',
    facilitator_name: '',
    facilitator_email: '',
    notification_settings: {
      send_reminder_24h: true,
      send_reminder_1h: false,
      send_recap: true,
      channels: ['teams']
    }
  });
  const [recurrenceSettings, setRecurrenceSettings] = useState({
    enabled: false,
    frequency: 'weekly',
    occurrences: 4
  });
  const [preparationTasks, setPreparationTasks] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          base44.auth.redirectToLogin();
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list()
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const generateAISuggestions = async () => {
    if (!eventData.purpose || !eventData.target_audience) {
      toast.error('Please provide event purpose and target audience');
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert event planner. Based on the following information, suggest optimal event settings:

Event Purpose: ${eventData.purpose}
Target Audience: ${eventData.target_audience}

Please suggest:
1. The best activity type from: icebreaker, creative, competitive, wellness, learning, social
2. Optimal duration in minutes (15, 30, 45, 60, or 90)
3. A compelling event title
4. A brief event description (2-3 sentences)
5. Whether this should be online, offline, or hybrid (for a B2B company)
6. Key preparation tasks needed (2-4 tasks)

Provide practical, actionable suggestions.`,
        response_json_schema: {
          type: "object",
          properties: {
            activity_type: { type: "string" },
            duration_minutes: { type: "number" },
            title: { type: "string" },
            description: { type: "string" },
            event_format: { type: "string", enum: ["online", "offline", "hybrid"] },
            reasoning: { type: "string" },
            preparation_tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAiSuggestions(response);
      toast.success('AI suggestions generated! 🎉');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const applySuggestions = () => {
    if (!aiSuggestions) return;

    setEventData(prev => ({
      ...prev,
      title: aiSuggestions.title,
      description: aiSuggestions.description,
      duration_minutes: aiSuggestions.duration_minutes,
      event_format: aiSuggestions.event_format
    }));

    // Find matching activity
    const matchingActivity = activities.find(a => 
      a.type === aiSuggestions.activity_type
    );
    if (matchingActivity) {
      setEventData(prev => ({ ...prev, activity_id: matchingActivity.id }));
    }

    toast.success('Suggestions applied!');
  };

  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      const events = [];
      const recurringSeriesId = recurrenceSettings.enabled 
        ? `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        : null;

      const createSingleEvent = async (scheduleDate, occurrenceNum = 1, totalOccurrences = 1) => {
        const magicLink = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const event = await base44.entities.Event.create({
          ...data,
          scheduled_date: scheduleDate,
          magic_link: magicLink,
          status: 'scheduled',
          is_recurring: recurrenceSettings.enabled,
          recurring_series_id: recurringSeriesId,
          recurrence_pattern: recurrenceSettings.enabled ? {
            frequency: recurrenceSettings.frequency,
            occurrence_number: occurrenceNum,
            total_occurrences: totalOccurrences
          } : null
        });

        // Create preparation tasks for this event
        for (const task of preparationTasks) {
          await base44.entities.EventPreparationTask.create({
            event_id: event.id,
            ...task
          });
        }

        // Send Teams announcement
        try {
          await base44.functions.invoke('sendTeamsNotification', {
            eventId: event.id,
            notificationType: 'announcement'
          });
        } catch (error) {
          console.error('Failed to send Teams notification:', error);
        }

        return event;
      };

      if (recurrenceSettings.enabled) {
        const baseDate = new Date(data.scheduled_date);
        const occurrences = recurrenceSettings.occurrences || 4;

        for (let i = 0; i < occurrences; i++) {
          let nextDate;
          switch (recurrenceSettings.frequency) {
            case 'daily':
              nextDate = addDays(baseDate, i);
              break;
            case 'weekly':
              nextDate = addWeeks(baseDate, i);
              break;
            case 'biweekly':
              nextDate = addWeeks(baseDate, i * 2);
              break;
            case 'monthly':
              nextDate = addMonths(baseDate, i);
              break;
            default:
              nextDate = addWeeks(baseDate, i);
          }

          const event = await createSingleEvent(
            nextDate.toISOString(),
            i + 1,
            occurrences
          );
          events.push(event);
        }
      } else {
        const event = await createSingleEvent(data.scheduled_date);
        events.push(event);
      }

      return events;
    },
    onSuccess: (events) => {
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['event-preparation-tasks']);
      toast.success(
        recurrenceSettings.enabled 
          ? `${events.length} recurring events created! 🎉`
          : 'Event created successfully! 🎉'
      );
      navigate(createPageUrl('Calendar'));
    }
  });

  const handleNext = () => {
    // Validation
    if (currentStep === 1 && (!eventData.purpose || !eventData.target_audience)) {
      toast.error('Please provide event purpose and target audience');
      return;
    }
    if (currentStep === 2 && !eventData.activity_id) {
      toast.error('Please select an activity');
      return;
    }
    if (currentStep === 3 && !eventData.scheduled_date) {
      toast.error('Please set a date and time');
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const selectedActivity = activities.find(a => a.id === eventData.activity_id);
    createEventMutation.mutate({
      ...eventData,
      title: eventData.title || selectedActivity?.title || 'Untitled Event'
    });
  };

  const steps = [
    { number: 1, title: 'Event Details' },
    { number: 2, title: 'Activity Selection' },
    { number: 3, title: 'Schedule & Format' },
    { number: 4, title: 'Preparation Tasks' },
    { number: 5, title: 'Notifications' }
  ];

  const progress = (currentStep / 5) * 100;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Event</h1>
        <p className="text-slate-600">Follow the wizard to set up your event with AI assistance</p>
      </div>

      {/* Progress Bar */}
      <Card className="p-6">
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center ${
                currentStep >= step.number ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  currentStep > step.number
                    ? 'bg-indigo-600 text-white'
                    : currentStep === step.number
                    ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > step.number ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span className="text-xs font-medium hidden md:block">{step.title}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Event Purpose & Audience</h2>
            <div>
              <Label>What's the purpose of this event?</Label>
              <Textarea
                value={eventData.purpose}
                onChange={(e) => setEventData(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="e.g., Team building to improve cross-department collaboration"
                rows={3}
              />
            </div>
            <div>
              <Label>Who is the target audience?</Label>
              <Textarea
                value={eventData.target_audience}
                onChange={(e) => setEventData(prev => ({ ...prev, target_audience: e.target.value }))}
                placeholder="e.g., Sales and marketing teams, 20-30 people, mix of remote and office"
                rows={3}
              />
            </div>
            <Button
              onClick={generateAISuggestions}
              disabled={isGeneratingSuggestions}
              variant="outline"
              className="w-full"
            >
              {isGeneratingSuggestions ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating AI Suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Suggestions
                </>
              )}
            </Button>

            {aiSuggestions && (
              <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  AI Recommendations
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {aiSuggestions.title}</p>
                  <p><strong>Description:</strong> {aiSuggestions.description}</p>
                  <p><strong>Duration:</strong> {aiSuggestions.duration_minutes} minutes</p>
                  <p><strong>Format:</strong> {aiSuggestions.event_format}</p>
                  <p className="text-slate-600 italic">{aiSuggestions.reasoning}</p>
                </div>
                <Button onClick={applySuggestions} className="w-full mt-4" size="sm">
                  Apply These Suggestions
                </Button>
              </Card>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Select Activity</h2>
            <div>
              <Label>Choose Activity</Label>
              <Select
                value={eventData.activity_id}
                onValueChange={(value) => {
                  const activity = activities.find(a => a.id === value);
                  setEventData(prev => ({
                    ...prev,
                    activity_id: value,
                    title: activity?.title || prev.title
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an activity..." />
                </SelectTrigger>
                <SelectContent>
                  {activities
                    .filter(a => aiSuggestions ? a.type === aiSuggestions.activity_type : true)
                    .map(activity => (
                      <SelectItem key={activity.id} value={activity.id}>
                        {activity.title} ({activity.type} • {activity.duration})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Event Title (Optional Override)</Label>
              <Input
                value={eventData.title}
                onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Leave empty to use activity title"
              />
            </div>
            <div>
              <Label>Event Description (Optional)</Label>
              <Textarea
                value={eventData.description}
                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional context..."
                rows={3}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Schedule & Format</h2>
            
            <div>
              <Label>Event Format</Label>
              <Select
                value={eventData.event_format}
                onValueChange={(value) => setEventData(prev => ({ ...prev, event_format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">In-Person (Offline)</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(eventData.event_format === 'offline' || eventData.event_format === 'hybrid') && (
              <div>
                <Label>Physical Location</Label>
                <Input
                  value={eventData.location}
                  onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Conference Room A, Building 2"
                />
              </div>
            )}

            {(eventData.event_format === 'online' || eventData.event_format === 'hybrid') && (
              <div>
                <Label>Meeting Link (Optional)</Label>
                <Input
                  type="url"
                  value={eventData.meeting_link}
                  onChange={(e) => setEventData(prev => ({ ...prev, meeting_link: e.target.value }))}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={eventData.scheduled_date}
                  onChange={(e) => setEventData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={eventData.duration_minutes}
                  onChange={(e) => setEventData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label>Max Participants (Optional)</Label>
              <Input
                type="number"
                value={eventData.max_participants || ''}
                onChange={(e) => setEventData(prev => ({ 
                  ...prev, 
                  max_participants: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <RecurrenceSettings
              recurrenceData={recurrenceSettings}
              onChange={setRecurrenceSettings}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Preparation Tasks</h2>
            <p className="text-slate-600 mb-4">
              Assign tasks to team members to ensure everything is ready for the event.
            </p>
            {aiSuggestions?.preparation_tasks && preparationTasks.length === 0 && (
              <Card className="p-4 bg-indigo-50 border-indigo-200 mb-4">
                <h3 className="font-semibold mb-2">AI Suggested Tasks:</h3>
                <div className="space-y-2">
                  {aiSuggestions.preparation_tasks.map((task, i) => (
                    <div key={i} className="text-sm">
                      <strong>{task.title}</strong>: {task.description}
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <EventTasksManager
              tasks={preparationTasks}
              onChange={setPreparationTasks}
              availableUsers={allUsers}
              aiSuggestions={aiSuggestions?.preparation_tasks}
            />
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Notification Settings</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">24-hour Reminder</h4>
                  <p className="text-sm text-slate-600">Send a reminder 24 hours before the event</p>
                </div>
                <input
                  type="checkbox"
                  checked={eventData.notification_settings.send_reminder_24h}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    notification_settings: {
                      ...prev.notification_settings,
                      send_reminder_24h: e.target.checked
                    }
                  }))}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">1-hour Reminder</h4>
                  <p className="text-sm text-slate-600">Send a reminder 1 hour before the event</p>
                </div>
                <input
                  type="checkbox"
                  checked={eventData.notification_settings.send_reminder_1h}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    notification_settings: {
                      ...prev.notification_settings,
                      send_reminder_1h: e.target.checked
                    }
                  }))}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Post-Event Recap</h4>
                  <p className="text-sm text-slate-600">Send a summary after the event</p>
                </div>
                <input
                  type="checkbox"
                  checked={eventData.notification_settings.send_recap}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    notification_settings: {
                      ...prev.notification_settings,
                      send_recap: e.target.checked
                    }
                  }))}
                  className="w-5 h-5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Facilitator Name (Optional)</Label>
                <Input
                  value={eventData.facilitator_name}
                  onChange={(e) => setEventData(prev => ({ ...prev, facilitator_name: e.target.value }))}
                  placeholder="Who's running this?"
                />
              </div>
              <div>
                <Label>Facilitator Email (Optional)</Label>
                <Input
                  type="email"
                  value={eventData.facilitator_email}
                  onChange={(e) => setEventData(prev => ({ ...prev, facilitator_email: e.target.value }))}
                  placeholder="facilitator@example.com"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < 5 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createEventMutation.isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {createEventMutation.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}