import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useGamificationTrigger } from '../hooks/useGamificationTrigger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';

/**
 * SurveyForm - Participant survey response interface
 * Supports multiple question types with validation
 */
export default function SurveyForm({ survey, userEmail, onComplete }) {
  const queryClient = useQueryClient();
  const { trigger } = useGamificationTrigger();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [startTime] = useState(Date.now());

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const responsesArray = survey.questions.map(q => ({
        question_id: q.id,
        answer: responses[q.id] || null
      }));

      return base44.entities.SurveyResponse.create({
        survey_id: survey.id,
        respondent_email: survey.is_anonymous ? `hashed_${userEmail}` : userEmail,
        is_anonymous: survey.is_anonymous,
        responses: responsesArray,
        completion_status: 'completed',
        time_taken_seconds: Math.floor((Date.now() - startTime) / 1000)
      });
    },
    onSuccess: async (response) => {
      // Update survey response count
      await base44.entities.Survey.update(survey.id, {
        response_count: (survey.response_count || 0) + 1
      });
      
      queryClient.invalidateQueries(['surveys']);
      queryClient.invalidateQueries(['survey-responses']);
      toast.success('Survey submitted! Thank you for your feedback.');
      
      // Trigger gamification rule
      await trigger('survey_completed', userEmail, {
        survey_id: survey.id,
        survey_type: survey.survey_type,
        reference_id: response.id
      });
      
      onComplete?.();
    },
    onError: () => {
      toast.error('Failed to submit survey');
    }
  });

  const handleAnswerChange = (value) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const answer = responses[currentQuestion.id];
    return answer !== undefined && answer !== null && answer !== '';
  };

  const handleNext = () => {
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate();
  };

  const renderQuestion = () => {
    const answer = responses[currentQuestion.id];

    switch (currentQuestion.question_type) {
      case 'rating':
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>{currentQuestion.scale_min || 1}</span>
              <span>{currentQuestion.scale_max || 5}</span>
            </div>
            <Slider
              value={[answer || currentQuestion.scale_min || 1]}
              onValueChange={([value]) => handleAnswerChange(value)}
              min={currentQuestion.scale_min || 1}
              max={currentQuestion.scale_max || 5}
              step={1}
              className="w-full"
            />
            <div className="text-center text-2xl font-bold text-int-orange">
              {answer || currentQuestion.scale_min || 1}
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <RadioGroup value={answer} onValueChange={handleAnswerChange}>
            <div className="space-y-3">
              {currentQuestion.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'yes_no':
        return (
          <RadioGroup value={answer?.toString()} onValueChange={(v) => handleAnswerChange(v === 'true')}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="true" id="yes" />
                <Label htmlFor="yes" className="flex-1 cursor-pointer text-center font-medium">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="false" id="no" />
                <Label htmlFor="no" className="flex-1 cursor-pointer text-center font-medium">
                  No
                </Label>
              </div>
            </div>
          </RadioGroup>
        );

      case 'text':
        return (
          <Textarea
            placeholder="Your answer..."
            value={answer || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={6}
            className="resize-none"
          />
        );

      default:
        return <p className="text-slate-500">Unsupported question type</p>;
    }
  };

  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>{survey.title}</CardTitle>
            <span className="text-sm text-slate-500">
              {currentQuestionIndex + 1} of {survey.questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question */}
        <div>
          <h3 className="text-lg font-medium mb-1">
            {currentQuestion.question_text}
            {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {currentQuestion.description && (
            <p className="text-sm text-slate-600">{currentQuestion.description}</p>
          )}
        </div>

        {/* Answer Input */}
        <div className="min-h-[200px]">
          {renderQuestion()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitMutation.isLoading}
              className="bg-int-orange hover:bg-int-orange/90 text-white"
            >
              {submitMutation.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Survey
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-int-navy hover:bg-int-navy/90 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Anonymous Notice */}
        {survey.is_anonymous && (
          <p className="text-xs text-center text-slate-500 pt-2">
            🔒 Your responses are anonymous and will only be shown in aggregate form
          </p>
        )}
      </CardContent>
    </Card>
  );
}