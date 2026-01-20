import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Beaker, Plus, Play, Pause, BarChart3 } from 'lucide-react';
import ABTestCreator from '../components/lifecycle/ABTestCreator';
import ABTestResults from '../components/lifecycle/ABTestResults';
import ABTestMetricsDashboard from '../components/abtesting/ABTestMetricsDashboard';
import AIPredictions from '../components/lifecycle/AIPredictions';
import AITestSuggestions from '../components/lifecycle/AITestSuggestions';
import AIAnomalyDetection from '../components/lifecycle/AIAnomalyDetection';

export default function ABTestingDashboard() {
  const queryClient = useQueryClient();
  const [showCreator, setShowCreator] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const { data: tests, isLoading } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      return await base44.entities.ABTest.list('-created_date');
    },
    initialData: []
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ testId, status }) => {
      return await base44.entities.ABTest.update(testId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ab-tests']);
    }
  });

  const getStatusBadge = (status) => {
    const badges = {
      draft: <Badge variant="outline">Draft</Badge>,
      active: <Badge className="bg-green-600 text-white">Active</Badge>,
      paused: <Badge className="bg-yellow-600 text-white">Paused</Badge>,
      completed: <Badge className="bg-slate-600 text-white">Completed</Badge>
    };
    return badges[status] || badges.draft;
  };

  const activeTests = tests.filter(t => t.status === 'active');
  const completedTests = tests.filter(t => t.status === 'completed');
  const draftTests = tests.filter(t => t.status === 'draft');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Beaker className="w-8 h-8 text-purple-600" />
            A/B Testing Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Optimize lifecycle interventions with data-driven experiments</p>
        </div>
        <Button onClick={() => setShowCreator(!showCreator)}>
          <Plus className="w-4 h-4 mr-2" />
          New Test
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Active Tests</p>
            <p className="text-3xl font-bold text-green-600">{activeTests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-slate-900">{completedTests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Drafts</p>
            <p className="text-3xl font-bold text-slate-500">{draftTests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Tests</p>
            <p className="text-3xl font-bold text-purple-600">{tests.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Creator */}
      {showCreator && (
        <ABTestCreator onTestCreated={() => setShowCreator(false)} />
      )}

      {/* Test List */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="active">Active Tests</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <ABTestMetricsDashboard />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeTests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No active tests. Create one to get started.
              </CardContent>
            </Card>
          ) : (
            activeTests.map(test => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {test.test_name}
                        {getStatusBadge(test.status)}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{test.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {test.lifecycle_state}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {test.variants?.length || 0} variants
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ testId: test.id, status: 'paused' })}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedTest(selectedTest === test.id ? null : test.id)}
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Results
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {selectedTest === test.id && (
                  <CardContent>
                    <ABTestResults testId={test.id} />
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTests.map(test => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {test.test_name}
                      {getStatusBadge(test.status)}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{test.description}</p>
                    {test.results_summary && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-900">
                          <strong>Winner:</strong> {test.results_summary.winning_variant} • 
                          <strong> Improvement:</strong> {test.results_summary.improvement_percentage?.toFixed(1)}% • 
                          <strong> Confidence:</strong> {test.results_summary.confidence_level}%
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTest(selectedTest === test.id ? null : test.id)}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    View Results
                  </Button>
                </div>
              </CardHeader>
              {selectedTest === test.id && (
                <CardContent>
                  <ABTestResults testId={test.id} />
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {draftTests.map(test => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {test.test_name}
                      {getStatusBadge(test.status)}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{test.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ testId: test.id, status: 'active' })}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Test
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}