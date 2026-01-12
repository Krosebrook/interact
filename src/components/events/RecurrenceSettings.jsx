import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RepeatIcon } from 'lucide-react';

export default function RecurrenceSettings({ recurrenceData, onChange, disabled }) {
  const handleChange = (field, value) => {
    onChange({ ...recurrenceData, [field]: value });
  };

  return (
    <Card className="p-4 border-2 border-dashed border-indigo-200 bg-indigo-50/50" data-b44-sync="true" data-feature="events" data-component="recurrencesettings">
      <div className="flex items-center gap-2 mb-4">
        <RepeatIcon className="h-4 w-4 text-indigo-600" />
        <Label className="text-base font-semibold">Recurring Event</Label>
        <Switch
          checked={recurrenceData?.enabled || false}
          onCheckedChange={(checked) => handleChange('enabled', checked)}
          disabled={disabled}
        />
      </div>

      {recurrenceData?.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Frequency</Label>
              <Select
                value={recurrenceData?.frequency || 'weekly'}
                onValueChange={(value) => handleChange('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Occurrences</Label>
              <Input
                type="number"
                min="1"
                max="52"
                value={recurrenceData?.occurrences || 4}
                onChange={(e) => handleChange('occurrences', parseInt(e.target.value))}
                placeholder="Number of events"
              />
            </div>
          </div>

          <p className="text-xs text-slate-600">
            This will create {recurrenceData?.occurrences || 4} events automatically
          </p>
        </div>
      )}
    </Card>
  );
}