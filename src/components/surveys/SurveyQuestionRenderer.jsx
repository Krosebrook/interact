import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Star, ThumbsUp, ThumbsDown, Calendar as CalendarIcon, GripVertical } from 'lucide-react';
import { format } from 'date-fns';

export default function SurveyQuestionRenderer({ question, value, onChange, index }) {
  const renderRating = () => {
    const rating = value?.numeric_value || 0;
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange({ numeric_value: star, value: String(star) })}
            className={`p-2 rounded-full transition-all ${
              star <= rating 
                ? 'text-amber-400 scale-110' 
                : 'text-slate-300 hover:text-amber-200'
            }`}
          >
            <Star className={`h-8 w-8 ${star <= rating ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    );
  };

  const renderNPS = () => {
    const score = value?.numeric_value;
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Not at all likely</span>
          <span>Extremely likely</span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => onChange({ numeric_value: num, value: String(num) })}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                score === num
                  ? num <= 6 
                    ? 'bg-red-500 text-white' 
                    : num <= 8 
                    ? 'bg-yellow-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 pt-1">
          <span className="text-red-400">Detractors (0-6)</span>
          <span className="text-yellow-500">Passives (7-8)</span>
          <span className="text-green-500">Promoters (9-10)</span>
        </div>
      </div>
    );
  };

  const renderText = () => (
    <Textarea
      value={value?.value || ''}
      onChange={(e) => onChange({ value: e.target.value })}
      placeholder="Type your answer here..."
      className="min-h-[100px]"
    />
  );

  const renderMultipleChoice = () => (
    <RadioGroup
      value={value?.value || ''}
      onValueChange={(v) => onChange({ value: v, selected_options: [v] })}
      className="space-y-3"
    >
      {(question.options || []).map((option, idx) => (
        <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
          <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
          <Label htmlFor={`${question.id}-${idx}`} className="flex-1 cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );

  const renderCheckbox = () => {
    const selected = value?.selected_options || [];
    return (
      <div className="space-y-3">
        {(question.options || []).map((option, idx) => (
          <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
            <Checkbox
              id={`${question.id}-${idx}`}
              checked={selected.includes(option)}
              onCheckedChange={(checked) => {
                const newSelected = checked
                  ? [...selected, option]
                  : selected.filter(o => o !== option);
                onChange({ selected_options: newSelected, value: newSelected.join(', ') });
              }}
            />
            <Label htmlFor={`${question.id}-${idx}`} className="flex-1 cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  const renderRanking = () => {
    const ranking = value?.ranking || [...(question.options || [])];
    
    const moveItem = (fromIndex, toIndex) => {
      const newRanking = [...ranking];
      const [removed] = newRanking.splice(fromIndex, 1);
      newRanking.splice(toIndex, 0, removed);
      onChange({ ranking: newRanking, value: newRanking.join(' > ') });
    };

    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-500 mb-3">Drag to reorder by preference (top = most preferred)</p>
        {ranking.map((item, idx) => (
          <div
            key={item}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border"
          >
            <span className="w-6 h-6 flex items-center justify-center bg-int-orange text-white rounded-full text-sm font-medium">
              {idx + 1}
            </span>
            <GripVertical className="h-5 w-5 text-slate-400" />
            <span className="flex-1">{item}</span>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => idx > 0 && moveItem(idx, idx - 1)}
                disabled={idx === 0}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => idx < ranking.length - 1 && moveItem(idx, idx + 1)}
                disabled={idx === ranking.length - 1}
              >
                ↓
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMatrix = () => {
    const matrixAnswers = value?.matrix_answers || {};
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left"></th>
              {(question.matrix_columns || []).map((col, idx) => (
                <th key={idx} className="p-2 text-center text-sm font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(question.matrix_rows || []).map((row, rowIdx) => (
              <tr key={rowIdx} className="border-t">
                <td className="p-3 text-sm">{row}</td>
                {(question.matrix_columns || []).map((col, colIdx) => (
                  <td key={colIdx} className="p-2 text-center">
                    <RadioGroup
                      value={matrixAnswers[row] || ''}
                      onValueChange={(v) => {
                        const newAnswers = { ...matrixAnswers, [row]: v };
                        onChange({ matrix_answers: newAnswers });
                      }}
                    >
                      <RadioGroupItem value={col} className="mx-auto" />
                    </RadioGroup>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSlider = () => {
    const min = question.min_value ?? 0;
    const max = question.max_value ?? 100;
    const current = value?.numeric_value ?? Math.round((min + max) / 2);

    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-slate-500">
          <span>{question.min_label || min}</span>
          <span>{question.max_label || max}</span>
        </div>
        <Slider
          value={[current]}
          min={min}
          max={max}
          step={1}
          onValueChange={([v]) => onChange({ numeric_value: v, value: String(v) })}
        />
        <div className="text-center text-2xl font-bold text-int-orange">
          {current}
        </div>
      </div>
    );
  };

  const renderYesNo = () => (
    <div className="flex gap-4 justify-center">
      <Button
        type="button"
        variant={value?.value === 'yes' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onChange({ value: 'yes' })}
        className={`px-8 ${value?.value === 'yes' ? 'bg-green-500 hover:bg-green-600' : ''}`}
      >
        <ThumbsUp className="h-5 w-5 mr-2" />
        Yes
      </Button>
      <Button
        type="button"
        variant={value?.value === 'no' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onChange({ value: 'no' })}
        className={`px-8 ${value?.value === 'no' ? 'bg-red-500 hover:bg-red-600' : ''}`}
      >
        <ThumbsDown className="h-5 w-5 mr-2" />
        No
      </Button>
    </div>
  );

  const renderDate = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <CalendarIcon className="h-4 w-4 mr-2" />
          {value?.value ? format(new Date(value.value), 'PPP') : 'Select a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value?.value ? new Date(value.value) : undefined}
          onSelect={(date) => onChange({ value: date?.toISOString() })}
        />
      </PopoverContent>
    </Popover>
  );

  const renderers = {
    rating: renderRating,
    nps: renderNPS,
    text: renderText,
    multiple_choice: renderMultipleChoice,
    checkbox: renderCheckbox,
    ranking: renderRanking,
    matrix: renderMatrix,
    slider: renderSlider,
    yes_no: renderYesNo,
    date: renderDate
  };

  const renderer = renderers[question.type] || renderText;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">
          {index + 1}. {question.text}
          {question.required !== false && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {question.description && (
          <p className="text-slate-500 text-sm mt-1">{question.description}</p>
        )}
      </div>
      {renderer()}
    </div>
  );
}