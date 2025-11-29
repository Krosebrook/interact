import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GripVertical, Trash2, Plus, Copy, Settings2, 
  Star, ThumbsUp, MessageSquare, ListChecks, CheckSquare,
  ArrowUpDown, Grid3X3, Sliders, ToggleLeft, Calendar
} from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'rating', label: 'Rating (1-5)', icon: Star, description: '5-star rating scale' },
  { value: 'nps', label: 'NPS (0-10)', icon: ThumbsUp, description: 'Net Promoter Score' },
  { value: 'text', label: 'Text', icon: MessageSquare, description: 'Open-ended response' },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: ListChecks, description: 'Single selection' },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Multiple selections' },
  { value: 'ranking', label: 'Ranking', icon: ArrowUpDown, description: 'Order items by preference' },
  { value: 'matrix', label: 'Matrix', icon: Grid3X3, description: 'Grid of options' },
  { value: 'slider', label: 'Slider', icon: Sliders, description: 'Numeric scale slider' },
  { value: 'yes_no', label: 'Yes/No', icon: ToggleLeft, description: 'Binary choice' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' }
];

export default function QuestionBuilder({ 
  question, 
  index, 
  allQuestions,
  onUpdate, 
  onDelete, 
  onDuplicate,
  onMoveUp,
  onMoveDown
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConditional, setShowConditional] = useState(question.conditional_logic?.enabled || false);

  const handleChange = (field, value) => {
    onUpdate({ ...question, [field]: value });
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[idx] = value;
    handleChange('options', newOptions);
  };

  const addOption = () => {
    handleChange('options', [...(question.options || []), '']);
  };

  const removeOption = (idx) => {
    handleChange('options', question.options.filter((_, i) => i !== idx));
  };

  const handleMatrixRowChange = (idx, value) => {
    const newRows = [...(question.matrix_rows || [])];
    newRows[idx] = value;
    handleChange('matrix_rows', newRows);
  };

  const handleMatrixColChange = (idx, value) => {
    const newCols = [...(question.matrix_columns || [])];
    newCols[idx] = value;
    handleChange('matrix_columns', newCols);
  };

  const TypeIcon = QUESTION_TYPES.find(t => t.value === question.type)?.icon || Star;

  return (
    <Card className="border-l-4 border-l-int-orange">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
          <Badge variant="outline" className="gap-1">
            <TypeIcon className="h-3 w-3" />
            Q{index + 1}
          </Badge>
          <div className="flex-1">
            <Select value={question.type} onValueChange={(v) => handleChange('type', v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onMoveUp?.()} disabled={index === 0}>
              <ArrowUpDown className="h-4 w-4 rotate-180" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDuplicate?.()}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question text */}
        <div>
          <Label>Question</Label>
          <Input
            value={question.text || ''}
            onChange={(e) => handleChange('text', e.target.value)}
            placeholder="Enter your question..."
            className="mt-1"
          />
        </div>

        <div>
          <Label>Description (optional)</Label>
          <Input
            value={question.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Additional context for the question..."
            className="mt-1"
          />
        </div>

        {/* Options for multiple choice, checkbox, ranking */}
        {['multiple_choice', 'checkbox', 'ranking'].includes(question.type) && (
          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-2">
              {(question.options || []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 w-6">{idx + 1}.</span>
                  <Input
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeOption(idx)}>
                    <Trash2 className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" /> Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Matrix configuration */}
        {question.type === 'matrix' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rows (Statements)</Label>
              <div className="space-y-2 mt-2">
                {(question.matrix_rows || []).map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={row}
                      onChange={(e) => handleMatrixRowChange(idx, e.target.value)}
                      placeholder={`Row ${idx + 1}`}
                    />
                    <Button variant="ghost" size="icon" onClick={() => {
                      handleChange('matrix_rows', question.matrix_rows.filter((_, i) => i !== idx));
                    }}>
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => {
                  handleChange('matrix_rows', [...(question.matrix_rows || []), '']);
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Add Row
                </Button>
              </div>
            </div>
            <div>
              <Label>Columns (Scale)</Label>
              <div className="space-y-2 mt-2">
                {(question.matrix_columns || []).map((col, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={col}
                      onChange={(e) => handleMatrixColChange(idx, e.target.value)}
                      placeholder={`Column ${idx + 1}`}
                    />
                    <Button variant="ghost" size="icon" onClick={() => {
                      handleChange('matrix_columns', question.matrix_columns.filter((_, i) => i !== idx));
                    }}>
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => {
                  handleChange('matrix_columns', [...(question.matrix_columns || []), '']);
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Add Column
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Slider configuration */}
        {question.type === 'slider' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Value</Label>
              <Input
                type="number"
                value={question.min_value || 0}
                onChange={(e) => handleChange('min_value', parseInt(e.target.value))}
                className="mt-1"
              />
              <Input
                value={question.min_label || ''}
                onChange={(e) => handleChange('min_label', e.target.value)}
                placeholder="Min label (optional)"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Max Value</Label>
              <Input
                type="number"
                value={question.max_value || 100}
                onChange={(e) => handleChange('max_value', parseInt(e.target.value))}
                className="mt-1"
              />
              <Input
                value={question.max_label || ''}
                onChange={(e) => handleChange('max_label', e.target.value)}
                placeholder="Max label (optional)"
                className="mt-2"
              />
            </div>
          </div>
        )}

        {/* Advanced settings */}
        {showAdvanced && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <Label>Required</Label>
              <Switch
                checked={question.required !== false}
                onCheckedChange={(v) => handleChange('required', v)}
              />
            </div>

            {/* Conditional logic */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Conditional Logic</Label>
                <Switch
                  checked={showConditional}
                  onCheckedChange={(v) => {
                    setShowConditional(v);
                    handleChange('conditional_logic', { 
                      ...question.conditional_logic, 
                      enabled: v 
                    });
                  }}
                />
              </div>
              
              {showConditional && (
                <div className="p-3 bg-slate-50 rounded-lg space-y-3">
                  <p className="text-sm text-slate-600">Show this question only if:</p>
                  {(question.conditional_logic?.conditions || []).map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Select
                        value={cond.question_id || ''}
                        onValueChange={(v) => {
                          const newConds = [...(question.conditional_logic?.conditions || [])];
                          newConds[idx] = { ...newConds[idx], question_id: v };
                          handleChange('conditional_logic', {
                            ...question.conditional_logic,
                            conditions: newConds
                          });
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Question" />
                        </SelectTrigger>
                        <SelectContent>
                          {allQuestions
                            .filter(q => q.id !== question.id && allQuestions.indexOf(q) < index)
                            .map((q, i) => (
                              <SelectItem key={q.id} value={q.id}>Q{i + 1}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={cond.operator || 'equals'}
                        onValueChange={(v) => {
                          const newConds = [...(question.conditional_logic?.conditions || [])];
                          newConds[idx] = { ...newConds[idx], operator: v };
                          handleChange('conditional_logic', {
                            ...question.conditional_logic,
                            conditions: newConds
                          });
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not equals</SelectItem>
                          <SelectItem value="greater_than">Greater than</SelectItem>
                          <SelectItem value="less_than">Less than</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={cond.value || ''}
                        onChange={(e) => {
                          const newConds = [...(question.conditional_logic?.conditions || [])];
                          newConds[idx] = { ...newConds[idx], value: e.target.value };
                          handleChange('conditional_logic', {
                            ...question.conditional_logic,
                            conditions: newConds
                          });
                        }}
                        placeholder="Value"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newConds = question.conditional_logic.conditions.filter((_, i) => i !== idx);
                          handleChange('conditional_logic', {
                            ...question.conditional_logic,
                            conditions: newConds
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleChange('conditional_logic', {
                        ...question.conditional_logic,
                        conditions: [...(question.conditional_logic?.conditions || []), {}]
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Condition
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}