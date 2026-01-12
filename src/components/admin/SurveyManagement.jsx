import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Calendar, Users, BarChart3, Lock } from 'lucide-react';
import { format } from 'date-fns';
import SurveyResults from '../surveys/SurveyResults';

const QUESTION_TYPES = [
  { value: 'rating', label: 'Rating Scale' },
  { value: 'scale', label: 'Numeric Scale' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'yes_no', label: 'Yes/No' },
  { value: 'text', label: 'Text Response' }
];

/**
 * SurveyManagement - Admin interface for creating and managing surveys
 */
export default function SurveyManagement() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['all-surveys'],
    queryFn: () => base44.entities.Survey.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (surveyId) => base44.entities.Survey.delete(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-surveys']);
      toast.success('Survey deleted');
    }
  });

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="admin" data-component="surveymanagement">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-int-navy">Survey Management</h2>
          <p className="text-slate-600">Create and manage pulse surveys</p>
        </div>
        <Button
          onClick={() => {
            setSelectedSurvey(null);
            setShowCreateDialog(true);
          }}
          className="bg-int-orange hover:bg-int-orange/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Survey
        </Button>
      </div>

      {/* Survey List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {surveys.map(survey => (
          <Card key={survey.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{survey.title}</CardTitle>
                <Badge className={
                  survey.status === 'active' ? 'bg-green-600' :
                  survey.status === 'draft' ? 'bg-slate-400' :
                  'bg-slate-600'
                }>
                  {survey.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4" />
                {survey.response_count || 0} responses
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BarChart3 className="h-4 w-4" />
                {survey.questions?.length || 0} questions
              </div>
              {survey.is_anonymous && (
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Lock className="h-4 w-4" />
                  Anonymous (min {survey.anonymization_threshold} responses)
                </div>
              )}
              {survey.end_date && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  Closes: {format(new Date(survey.end_date), 'MMM d')}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSurvey(survey);
                    setShowResults(true);
                  }}
                  className="flex-1"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Results
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSurvey(survey);
                    setShowCreateDialog(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(survey.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <SurveyBuilder
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        survey={selectedSurvey}
        onSuccess={() => setShowCreateDialog(false)}
      />

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSurvey?.title} - Results</DialogTitle>
          </DialogHeader>
          {selectedSurvey && <SurveyResults survey={selectedSurvey} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * SurveyBuilder - Create/edit survey dialog
 */
function SurveyBuilder({ open, onOpenChange, survey, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(survey || {
    title: '',
    description: '',
    survey_type: 'pulse',
    questions: [],
    is_anonymous: true,
    anonymization_threshold: 5,
    status: 'draft'
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    id: Date.now().toString(),
    question_text: '',
    question_type: 'rating',
    required: false,
    scale_min: 1,
    scale_max: 5,
    options: []
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (survey?.id) {
        return base44.entities.Survey.update(survey.id, formData);
      }
      return base44.entities.Survey.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-surveys']);
      toast.success(survey ? 'Survey updated!' : 'Survey created!');
      onSuccess?.();
    }
  });

  const addQuestion = () => {
    if (!currentQuestion.question_text) {
      toast.error('Question text is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, id: Date.now().toString() }]
    }));

    setCurrentQuestion({
      id: Date.now().toString(),
      question_text: '',
      question_type: 'rating',
      required: false,
      scale_min: 1,
      scale_max: 5,
      options: []
    });
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{survey ? 'Edit Survey' : 'Create New Survey'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label>Survey Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Weekly Pulse Check"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Share your thoughts on team dynamics..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Survey Type</Label>
                <Select
                  value={formData.survey_type}
                  onValueChange={(v) => setFormData({ ...formData, survey_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pulse">Pulse Survey</SelectItem>
                    <SelectItem value="engagement">Engagement Survey</SelectItem>
                    <SelectItem value="wellness">Wellness Check</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Anonymous</Label>
                <Switch
                  checked={formData.is_anonymous}
                  onCheckedChange={(v) => setFormData({ ...formData, is_anonymous: v })}
                />
              </div>
            </div>

            {formData.is_anonymous && (
              <div>
                <Label>Anonymization Threshold</Label>
                <Input
                  type="number"
                  value={formData.anonymization_threshold}
                  onChange={(e) => setFormData({ ...formData, anonymization_threshold: parseInt(e.target.value) })}
                  min={3}
                  max={20}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Results will only show after this many responses (WCAG privacy protection)
                </p>
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Questions ({formData.questions.length})</h3>
            
            {formData.questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-50 rounded-lg p-3 mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{idx + 1}. {q.question_text}</p>
                  <p className="text-sm text-slate-600">{q.question_type} {q.required && '(required)'}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeQuestion(q.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Add Question Form */}
            <Card className="mt-4">
              <CardContent className="pt-4 space-y-3">
                <Input
                  placeholder="Question text"
                  value={currentQuestion.question_text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={currentQuestion.question_type}
                    onValueChange={(v) => setCurrentQuestion({ ...currentQuestion, question_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={currentQuestion.required}
                      onCheckedChange={(v) => setCurrentQuestion({ ...currentQuestion, required: v })}
                    />
                    <Label className="text-sm">Required</Label>
                  </div>
                </div>

                {(currentQuestion.question_type === 'rating' || currentQuestion.question_type === 'scale') && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={currentQuestion.scale_min}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, scale_min: parseInt(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={currentQuestion.scale_max}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, scale_max: parseInt(e.target.value) })}
                    />
                  </div>
                )}

                {currentQuestion.question_type === 'multiple_choice' && (
                  <div>
                    <Label className="text-sm">Options (comma-separated)</Label>
                    <Input
                      placeholder="Option 1, Option 2, Option 3"
                      onChange={(e) => setCurrentQuestion({ 
                        ...currentQuestion, 
                        options: e.target.value.split(',').map(o => o.trim()).filter(Boolean)
                      })}
                    />
                  </div>
                )}

                <Button onClick={addQuestion} size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!formData.title || formData.questions.length === 0 || saveMutation.isLoading}
              className="bg-int-orange hover:bg-int-orange/90"
            >
              {survey ? 'Update' : 'Create'} Survey
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}