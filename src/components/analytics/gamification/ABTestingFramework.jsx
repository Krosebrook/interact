import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FlaskConical, Plus, Play, Pause, CheckCircle, XCircle, 
  BarChart3, TrendingUp, Users, Target, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ELEMENT_TYPES = [
  { value: 'badge', label: 'Badge' },
  { value: 'challenge', label: 'Challenge' },
  { value: 'points_multiplier', label: 'Points Multiplier' },
  { value: 'reward', label: 'Reward' },
  { value: 'leaderboard', label: 'Leaderboard' },
  { value: 'notification', label: 'Notification' },
  { value: 'ui_element', label: 'UI Element' }
];

const TARGET_METRICS = [
  { value: 'engagement_rate', label: 'Engagement Rate' },
  { value: 'completion_rate', label: 'Completion Rate' },
  { value: 'points_earned', label: 'Points Earned' },
  { value: 'retention', label: 'Retention' },
  { value: 'badge_claims', label: 'Badge Claims' },
  { value: 'challenge_participation', label: 'Challenge Participation' }
];

const STATUS_STYLES = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-700', icon: AlertCircle },
  running: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Play },
  paused: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Pause },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
  archived: { bg: 'bg-slate-100', text: 'text-slate-500', icon: XCircle }
};

export default function ABTestingFramework() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const queryClient = useQueryClient();

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => base44.entities.GamificationABTest.list('-created_date', 50)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GamificationABTest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ab-tests']);
      setCreateDialogOpen(false);
      toast.success('A/B Test created successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GamificationABTest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ab-tests']);
      toast.success('Test updated');
    }
  });

  const runningTests = tests.filter(t => t.status === 'running');
  const completedTests = tests.filter(t => t.status === 'completed');

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-int-orange" />
          A/B Testing Framework
        </CardTitle>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-int-orange hover:bg-int-orange/90">
              <Plus className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
            </DialogHeader>
            <CreateTestForm 
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-int-navy">{tests.length}</p>
            <p className="text-xs text-slate-500">Total Tests</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{runningTests.length}</p>
            <p className="text-xs text-slate-500">Running</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{completedTests.length}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {completedTests.filter(t => t.results?.winner).length}
            </p>
            <p className="text-xs text-slate-500">With Winner</p>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="active">Active Tests</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <TestsList 
              tests={tests.filter(t => t.status === 'running' || t.status === 'draft')}
              onSelect={setSelectedTest}
              onStatusChange={(id, status) => updateMutation.mutate({ id, data: { status } })}
            />
          </TabsContent>

          <TabsContent value="completed">
            <TestsList 
              tests={completedTests}
              onSelect={setSelectedTest}
              showResults
            />
          </TabsContent>

          <TabsContent value="all">
            <TestsList 
              tests={tests}
              onSelect={setSelectedTest}
              onStatusChange={(id, status) => updateMutation.mutate({ id, data: { status } })}
            />
          </TabsContent>
        </Tabs>

        {/* Test Detail Dialog */}
        <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTest?.test_name}</DialogTitle>
            </DialogHeader>
            {selectedTest && <TestDetail test={selectedTest} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function CreateTestForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    test_name: '',
    test_description: '',
    element_type: 'challenge',
    target_metric: 'engagement_rate',
    sample_size_target: 100,
    variant_a: { name: 'Control', description: '', config: {} },
    variant_b: { name: 'Variant B', description: '', config: {} }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: 'draft',
      start_date: new Date().toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Test Name</Label>
          <Input 
            value={formData.test_name}
            onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
            placeholder="e.g., Badge Icon Color Test"
            required
          />
        </div>

        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea 
            value={formData.test_description}
            onChange={(e) => setFormData({ ...formData, test_description: e.target.value })}
            placeholder="What hypothesis are you testing?"
          />
        </div>

        <div>
          <Label>Element Type</Label>
          <Select 
            value={formData.element_type}
            onValueChange={(v) => setFormData({ ...formData, element_type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ELEMENT_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Target Metric</Label>
          <Select 
            value={formData.target_metric}
            onValueChange={(v) => setFormData({ ...formData, target_metric: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_METRICS.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Sample Size (per variant)</Label>
          <Input 
            type="number"
            value={formData.sample_size_target}
            onChange={(e) => setFormData({ ...formData, sample_size_target: parseInt(e.target.value) })}
            min={10}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="space-y-3">
          <h4 className="font-medium">Variant A (Control)</h4>
          <Input 
            placeholder="Variant name"
            value={formData.variant_a.name}
            onChange={(e) => setFormData({ 
              ...formData, 
              variant_a: { ...formData.variant_a, name: e.target.value }
            })}
          />
          <Textarea 
            placeholder="Describe this variant..."
            value={formData.variant_a.description}
            onChange={(e) => setFormData({ 
              ...formData, 
              variant_a: { ...formData.variant_a, description: e.target.value }
            })}
          />
        </div>
        <div className="space-y-3">
          <h4 className="font-medium">Variant B</h4>
          <Input 
            placeholder="Variant name"
            value={formData.variant_b.name}
            onChange={(e) => setFormData({ 
              ...formData, 
              variant_b: { ...formData.variant_b, name: e.target.value }
            })}
          />
          <Textarea 
            placeholder="Describe this variant..."
            value={formData.variant_b.description}
            onChange={(e) => setFormData({ 
              ...formData, 
              variant_b: { ...formData.variant_b, description: e.target.value }
            })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isLoading || !formData.test_name}>
          {isLoading ? 'Creating...' : 'Create Test'}
        </Button>
      </div>
    </form>
  );
}

function TestsList({ tests, onSelect, onStatusChange, showResults = false }) {
  if (tests.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <FlaskConical className="h-12 w-12 mx-auto mb-2 text-slate-300" />
        <p>No tests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tests.map(test => {
        const StatusIcon = STATUS_STYLES[test.status]?.icon || AlertCircle;
        
        return (
          <div 
            key={test.id}
            className="p-4 border rounded-lg hover:border-int-orange/50 transition-colors cursor-pointer"
            onClick={() => onSelect(test)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{test.test_name}</h4>
                  <Badge className={`${STATUS_STYLES[test.status]?.bg} ${STATUS_STYLES[test.status]?.text}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {test.status}
                  </Badge>
                  <Badge variant="outline">{test.element_type}</Badge>
                </div>
                <p className="text-sm text-slate-500 mb-2">{test.test_description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span><Target className="h-3 w-3 inline mr-1" />{test.target_metric}</span>
                  <span><Users className="h-3 w-3 inline mr-1" />{test.sample_size_target} users/variant</span>
                  {test.start_date && (
                    <span>Started: {format(new Date(test.start_date), 'MMM dd, yyyy')}</span>
                  )}
                </div>
              </div>
              
              {onStatusChange && test.status !== 'completed' && (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {test.status === 'draft' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onStatusChange(test.id, 'running')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {test.status === 'running' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onStatusChange(test.id, 'paused')}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onStatusChange(test.id, 'completed')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        End
                      </Button>
                    </>
                  )}
                  {test.status === 'paused' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onStatusChange(test.id, 'running')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>
              )}
            </div>

            {showResults && test.results && (
              <div className="mt-3 pt-3 border-t">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Winner:</span>
                    <span className="ml-2 font-medium text-emerald-600">{test.results.winner || 'TBD'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Lift:</span>
                    <span className="ml-2 font-medium">
                      {test.results.lift_percentage ? `${test.results.lift_percentage}%` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Significance:</span>
                    <span className="ml-2 font-medium">
                      {test.results.statistical_significance 
                        ? `${(test.results.statistical_significance * 100).toFixed(0)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TestDetail({ test }) {
  const results = test.results || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Variant A */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            Variant A: {test.variant_a?.name || 'Control'}
          </h4>
          <p className="text-sm text-blue-700 mb-3">{test.variant_a?.description}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Users:</span>
              <span className="font-medium">{results.variant_a_users || 0}</span>
            </div>
            {results.variant_a_metrics && Object.entries(results.variant_a_metrics).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Variant B */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">
            Variant B: {test.variant_b?.name || 'Variant'}
          </h4>
          <p className="text-sm text-purple-700 mb-3">{test.variant_b?.description}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Users:</span>
              <span className="font-medium">{results.variant_b_users || 0}</span>
            </div>
            {results.variant_b_metrics && Object.entries(results.variant_b_metrics).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {results.winner && (
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <h4 className="font-medium text-emerald-800">Test Results</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-emerald-700">Winner</p>
              <p className="text-lg font-bold text-emerald-800">{results.winner}</p>
            </div>
            <div>
              <p className="text-sm text-emerald-700">Lift</p>
              <p className="text-lg font-bold text-emerald-800">
                {results.lift_percentage ? `+${results.lift_percentage}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-emerald-700">Confidence</p>
              <p className="text-lg font-bold text-emerald-800">
                {results.statistical_significance 
                  ? `${(results.statistical_significance * 100).toFixed(0)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500">Element Type:</span>
          <span className="ml-2 capitalize">{test.element_type}</span>
        </div>
        <div>
          <span className="text-slate-500">Target Metric:</span>
          <span className="ml-2 capitalize">{test.target_metric?.replace(/_/g, ' ')}</span>
        </div>
        <div>
          <span className="text-slate-500">Sample Size Target:</span>
          <span className="ml-2">{test.sample_size_target} per variant</span>
        </div>
        <div>
          <span className="text-slate-500">Status:</span>
          <Badge className={`ml-2 ${STATUS_STYLES[test.status]?.bg} ${STATUS_STYLES[test.status]?.text}`}>
            {test.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}