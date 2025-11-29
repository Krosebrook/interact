import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Repeat, Bell, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
];

export default function SurveyScheduler({ scheduling, targeting, onSchedulingChange, onTargetingChange }) {
  const handleSchedulingUpdate = (field, value) => {
    onSchedulingChange({ ...scheduling, [field]: value });
  };

  const handleRecurrenceUpdate = (field, value) => {
    onSchedulingChange({
      ...scheduling,
      recurrence: { ...scheduling?.recurrence, [field]: value }
    });
  };

  const handleTargetingUpdate = (field, value) => {
    onTargetingChange({ ...targeting, [field]: value });
  };

  const isRecurring = scheduling?.type === 'recurring';

  return (
    <div className="space-y-6">
      {/* Schedule Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-int-orange" />
            Schedule Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={!isRecurring ? 'default' : 'outline'}
              onClick={() => handleSchedulingUpdate('type', 'once')}
              className={!isRecurring ? 'bg-int-orange hover:bg-[#C46322]' : ''}
            >
              One-time Survey
            </Button>
            <Button
              variant={isRecurring ? 'default' : 'outline'}
              onClick={() => handleSchedulingUpdate('type', 'recurring')}
              className={isRecurring ? 'bg-int-orange hover:bg-[#C46322]' : ''}
            >
              <Repeat className="h-4 w-4 mr-2" />
              Recurring Survey
            </Button>
          </div>

          {/* Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start mt-1">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {scheduling?.start_date 
                      ? format(new Date(scheduling.start_date), 'PPP')
                      : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduling?.start_date ? new Date(scheduling.start_date) : undefined}
                    onSelect={(date) => handleSchedulingUpdate('start_date', date?.toISOString())}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date {isRecurring ? '' : '(optional)'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start mt-1">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {scheduling?.end_date 
                      ? format(new Date(scheduling.end_date), 'PPP')
                      : 'No end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduling?.end_date ? new Date(scheduling.end_date) : undefined}
                    onSelect={(date) => handleSchedulingUpdate('end_date', date?.toISOString())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label>Survey Open Duration (hours)</Label>
            <Input
              type="number"
              value={scheduling?.duration_hours || 72}
              onChange={(e) => handleSchedulingUpdate('duration_hours', parseInt(e.target.value))}
              min={1}
              max={168}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">How long the survey stays open for responses</p>
          </div>
        </CardContent>
      </Card>

      {/* Recurrence Settings */}
      {isRecurring && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Repeat className="h-5 w-5 text-int-orange" />
              Recurrence Pattern
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequency</Label>
                <Select
                  value={scheduling?.recurrence?.frequency || 'weekly'}
                  onValueChange={(v) => handleRecurrenceUpdate('frequency', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(scheduling?.recurrence?.frequency === 'weekly' || scheduling?.recurrence?.frequency === 'biweekly') && (
                <div>
                  <Label>Day of Week</Label>
                  <Select
                    value={String(scheduling?.recurrence?.day_of_week ?? 1)}
                    onValueChange={(v) => handleRecurrenceUpdate('day_of_week', parseInt(v))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={String(day.value)}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scheduling?.recurrence?.frequency === 'monthly' && (
                <div>
                  <Label>Day of Month</Label>
                  <Input
                    type="number"
                    value={scheduling?.recurrence?.day_of_month || 1}
                    onChange={(e) => handleRecurrenceUpdate('day_of_month', parseInt(e.target.value))}
                    min={1}
                    max={28}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Send Time</Label>
                <Input
                  type="time"
                  value={scheduling?.recurrence?.time || '09:00'}
                  onChange={(e) => handleRecurrenceUpdate('time', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Timezone</Label>
                <Select
                  value={scheduling?.recurrence?.timezone || 'UTC'}
                  onValueChange={(v) => handleRecurrenceUpdate('timezone', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-int-orange" />
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[12, 24, 48].map(hours => {
              const isSelected = scheduling?.reminder_hours?.includes(hours);
              return (
                <Button
                  key={hours}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const current = scheduling?.reminder_hours || [];
                    const updated = isSelected 
                      ? current.filter(h => h !== hours)
                      : [...current, hours].sort((a, b) => a - b);
                    handleSchedulingUpdate('reminder_hours', updated);
                  }}
                  className={isSelected ? 'bg-int-orange hover:bg-[#C46322]' : ''}
                >
                  {hours}h before deadline
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Targeting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-int-orange" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Who should receive this survey?</Label>
            <Select
              value={targeting?.target_type || 'all'}
              onValueChange={(v) => handleTargetingUpdate('target_type', v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="teams">Specific Teams</SelectItem>
                <SelectItem value="roles">Specific Roles</SelectItem>
                <SelectItem value="individuals">Selected Individuals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targeting?.target_type === 'teams' && (
            <div>
              <Label>Select Teams</Label>
              <p className="text-sm text-slate-500 mt-1">
                Team selection will be available after saving the survey
              </p>
            </div>
          )}

          {targeting?.target_type === 'individuals' && (
            <div>
              <Label>Enter Email Addresses</Label>
              <Input
                placeholder="email1@company.com, email2@company.com"
                value={targeting?.user_emails?.join(', ') || ''}
                onChange={(e) => handleTargetingUpdate('user_emails', 
                  e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                )}
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}