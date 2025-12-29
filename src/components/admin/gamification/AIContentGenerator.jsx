import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, HelpCircle, Video, Loader2, Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AIContentGenerator() {
  const [activeTab, setActiveTab] = useState('learning-path');

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Learning Content Generator
          </CardTitle>
          <CardDescription>
            Leverage AI to create learning paths, quiz questions, and video scripts
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learning-path" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Learning Paths
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Quiz Questions
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2">
            <Video className="h-4 w-4" />
            Video Scripts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learning-path" className="mt-6">
          <LearningPathGenerator />
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <QuizGenerator />
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          <VideoScriptGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LearningPathGenerator() {
  const [skillGap, setSkillGap] = useState('');
  const [targetLevel, setTargetLevel] = useState('intermediate');
  const [duration, setDuration] = useState('2-4 weeks');
  const [generatedPath, setGeneratedPath] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiContentGenerator', {
        action: 'generate_learning_path',
        context: {
          skill_gap: skillGap,
          target_level: targetLevel,
          duration: duration
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedPath(data.learning_path);
      toast.success('Learning path generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate: ' + error.message);
    }
  });

  const handleGenerate = () => {
    if (!skillGap) {
      toast.error('Please enter a skill gap');
      return;
    }
    generateMutation.mutate();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Learning Path</CardTitle>
          <CardDescription>AI will create a structured learning journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Skill Gap to Address</Label>
            <Input
              value={skillGap}
              onChange={(e) => setSkillGap(e.target.value)}
              placeholder="e.g., Python for Data Science, Leadership Skills..."
            />
          </div>

          <div className="space-y-2">
            <Label>Target Level</Label>
            <Select value={targetLevel} onValueChange={setTargetLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Expected Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                <SelectItem value="1-2 months">1-2 months</SelectItem>
                <SelectItem value="2-3 months">2-3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Learning Path
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Learning Path</CardTitle>
        </CardHeader>
        <CardContent>
          {!generatedPath ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No path generated yet
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{generatedPath.title}</h3>
                <p className="text-sm text-slate-600">{generatedPath.description}</p>
              </div>

              <div className="flex gap-2">
                <Badge>{generatedPath.difficulty_level}</Badge>
                <Badge variant="outline">{generatedPath.estimated_duration}</Badge>
                <Badge variant="outline">{generatedPath.milestones?.length || 0} milestones</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Milestones:</p>
                {generatedPath.milestones?.map((milestone, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-slate-900">{milestone.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{milestone.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(generatedPath, null, 2));
                  toast.success('Copied to clipboard');
                }}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy JSON
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuizGenerator() {
  const [moduleTopic, setModuleTopic] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiContentGenerator', {
        action: 'generate_quiz',
        context: {
          topic: moduleTopic,
          question_count: parseInt(questionCount),
          difficulty: difficulty
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedQuiz(data.questions);
      toast.success(`Generated ${data.questions.length} quiz questions!`);
    },
    onError: (error) => {
      toast.error('Failed to generate quiz: ' + error.message);
    }
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Quiz Questions</CardTitle>
          <CardDescription>Create diverse, engaging quiz questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Module Topic</Label>
            <Input
              value={moduleTopic}
              onChange={(e) => setModuleTopic(e.target.value)}
              placeholder="e.g., JavaScript Async/Await, Team Leadership..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 questions</SelectItem>
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="8">8 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !moduleTopic}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <HelpCircle className="h-4 w-4 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {!generatedQuiz ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No questions generated yet
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {generatedQuiz.map((q, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="font-medium text-slate-900 mb-2">Q{idx + 1}: {q.question}</p>
                  <div className="space-y-1 mb-2">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`text-sm p-2 rounded ${
                          optIdx === q.correct_answer
                            ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                        {optIdx === q.correct_answer && (
                          <Check className="h-3 w-3 inline ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-900">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(generatedQuiz, null, 2));
                toast.success('Copied to clipboard');
              }}>
                <Copy className="h-3 w-3 mr-1" />
                Copy JSON
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VideoScriptGenerator() {
  const [moduleTopic, setModuleTopic] = useState('');
  const [duration, setDuration] = useState('5');
  const [tone, setTone] = useState('professional');
  const [generatedScript, setGeneratedScript] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiContentGenerator', {
        action: 'generate_video_script',
        context: {
          topic: moduleTopic,
          duration_minutes: parseInt(duration),
          tone: tone
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedScript(data.script);
      toast.success('Video script generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate script: ' + error.message);
    }
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Video Script</CardTitle>
          <CardDescription>Create engaging scripts for micro-learning videos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Video Topic</Label>
            <Textarea
              value={moduleTopic}
              onChange={(e) => setModuleTopic(e.target.value)}
              placeholder="Describe what the video should teach..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="7">7 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !moduleTopic}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Generate Script
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Script</CardTitle>
        </CardHeader>
        <CardContent>
          {!generatedScript ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No script generated yet
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">{generatedScript.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{generatedScript.hook}</p>

                <div className="space-y-3">
                  {generatedScript.sections?.map((section, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-purple-700 uppercase mb-1">
                        {section.timestamp} - {section.section}
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{section.script}</p>
                      {section.visuals && (
                        <p className="text-xs text-slate-500 mt-2 italic">
                          💡 Visual: {section.visuals}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {generatedScript.call_to_action && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-900 mb-1">Call to Action:</p>
                    <p className="text-sm text-blue-800">{generatedScript.call_to_action}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(generatedScript, null, 2));
                  toast.success('Copied to clipboard');
                }}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy JSON
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  const text = generatedScript.sections?.map(s => s.script).join('\n\n') || '';
                  navigator.clipboard.writeText(text);
                  toast.success('Script text copied');
                }}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Script
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}