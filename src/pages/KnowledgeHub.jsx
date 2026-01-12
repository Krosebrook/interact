import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Search,
  Plus,
  Sparkles,
  ThumbsUp,
  Eye,
  TrendingUp,
  AlertCircle,
  FileText,
  Lightbulb
} from 'lucide-react';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function KnowledgeHub() {
  const { user, loading: userLoading } = useUserData(true);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [newDoc, setNewDoc] = useState({
    title: '',
    content: '',
    category: 'tutorial'
  });

  const isAdmin = user?.role === 'admin';

  // Fetch published documents
  const { data: documents } = useQuery({
    queryKey: ['knowledge-base'],
    queryFn: () => base44.entities.KnowledgeBase.filter({ is_published: true })
  });

  // Fetch recommendations
  const { data: recommendations, refetch: refetchRecommendations } = useQuery({
    queryKey: ['knowledge-recommendations', user?.email],
    queryFn: async () => {
      const result = await base44.functions.invoke('aiContentRecommendations', {
        user_email: user.email
      });
      return result.data || result;
    },
    enabled: !!user?.email
  });

  // Fetch content gaps (admin only)
  const { data: contentGaps } = useQuery({
    queryKey: ['content-gaps'],
    queryFn: () => base44.entities.ContentGap.filter({ status: 'identified' }),
    enabled: isAdmin
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (query) => {
      const result = await base44.functions.invoke('aiKnowledgeSearch', { query });
      return result.data || result;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      // Track search event
      base44.entities.AnalyticsEvent.create({
        user_email: user.email,
        event_type: 'search_performed',
        event_category: 'navigation',
        feature_name: 'Knowledge Search',
        event_data: {
          search_query: searchQuery,
          results_count: data.results?.length || 0
        }
      });
    }
  });

  // Create document mutation
  const createMutation = useMutation({
    mutationFn: async (docData) => {
      const created = await base44.entities.KnowledgeBase.create({
        ...docData,
        author_email: user.email,
        is_published: false
      });
      
      // Index with AI
      await base44.functions.invoke('aiKnowledgeIndexer', {
        document_id: created.id,
        content: docData.content,
        title: docData.title
      });
      
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge-base']);
      setShowCreateDialog(false);
      setNewDoc({ title: '', content: '', category: 'tutorial' });
      toast.success('Document created and indexed successfully');
    }
  });

  // Gap analysis mutation
  const gapAnalysisMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('aiContentGapAnalysis', {});
      return result.data || result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-gaps']);
      toast.success('Content gap analysis complete');
    }
  });

  // Mark document as helpful
  const markHelpfulMutation = useMutation({
    mutationFn: async (docId) => {
      const doc = documents.find(d => d.id === docId);
      return base44.entities.KnowledgeBase.update(docId, {
        helpful_count: (doc.helpful_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge-base']);
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const handleViewDocument = async (doc) => {
    setSelectedDoc(doc);
    setShowDocDialog(true);
    
    // Increment view count
    await base44.entities.KnowledgeBase.update(doc.id, {
      view_count: (doc.view_count || 0) + 1
    });
    queryClient.invalidateQueries(['knowledge-base']);
  };

  if (userLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading Knowledge Hub..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-int-navy">Knowledge Hub</h1>
              <p className="text-slate-600">AI-powered knowledge management</p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          )}
        </div>
      </div>

      {/* Smart Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Smart Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              placeholder="Ask anything... (e.g., How do I set up a team event?)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={searchMutation.isPending}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          {searchMutation.isPending && (
            <div className="mt-4">
              <LoadingSpinner message="Searching knowledge base..." />
            </div>
          )}

          {searchResults && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Found {searchResults.total_found} results
                </p>
                {searchResults.intent && (
                  <Badge variant="outline">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {searchResults.intent}
                  </Badge>
                )}
              </div>

              {searchResults.results?.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={() => handleViewDocument(doc)}
                  onMarkHelpful={() => markHelpfulMutation.mutate(doc.id)}
                  showRelevance
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="search">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="browse">
            <FileText className="h-4 w-4 mr-2" />
            Browse All
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="gaps">
              <AlertCircle className="h-4 w-4 mr-2" />
              Content Gaps
            </TabsTrigger>
          )}
        </TabsList>

        {/* Recommendations */}
        <TabsContent value="search" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recommended for You</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchRecommendations()}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations?.recommendations?.map((rec, idx) => (
                  <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{rec.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{rec.reason}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{rec.category}</Badge>
                          <Badge className={
                            rec.priority === 'high' ? 'bg-red-600' :
                            rec.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                          }>
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDocument(rec.document)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Browse All */}
        <TabsContent value="browse" className="mt-6 space-y-4">
          {documents?.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={() => handleViewDocument(doc)}
              onMarkHelpful={() => markHelpfulMutation.mutate(doc.id)}
            />
          ))}
        </TabsContent>

        {/* Content Gaps (Admin) */}
        {isAdmin && (
          <TabsContent value="gaps" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Content Gap Analysis</CardTitle>
                  <Button
                    onClick={() => gapAnalysisMutation.mutate()}
                    disabled={gapAnalysisMutation.isPending}
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Run Analysis
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {gapAnalysisMutation.isPending && (
                  <LoadingSpinner message="Analyzing content gaps..." />
                )}

                <div className="space-y-4">
                  {contentGaps?.map((gap) => (
                    <div key={gap.id} className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{gap.gap_title}</h4>
                        <Badge className={
                          gap.priority === 'critical' ? 'bg-red-600' :
                          gap.priority === 'high' ? 'bg-orange-600' :
                          gap.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                        }>
                          {gap.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{gap.description}</p>
                      
                      {gap.suggested_topics?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-slate-600 mb-1">Suggested Topics:</p>
                          <div className="flex flex-wrap gap-1">
                            {gap.suggested_topics.map((topic, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-slate-600 mt-2">
                        <span className="font-medium">Evidence:</span> {gap.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Create Document Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                placeholder="Article title"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={newDoc.category}
                onValueChange={(value) => setNewDoc({ ...newDoc, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="hr_policy">HR Policy</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="process">Process</SelectItem>
                  <SelectItem value="best_practice">Best Practice</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newDoc.content}
                onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                placeholder="Write your article content..."
                className="mt-1 h-64"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(newDoc)}
                disabled={createMutation.isPending || !newDoc.title || !newDoc.content}
                className="flex-1"
              >
                {createMutation.isPending ? 'Creating & Indexing...' : 'Create & Index'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedDoc && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDoc.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge>{selectedDoc.category}</Badge>
                  <Badge variant="outline">{selectedDoc.difficulty_level}</Badge>
                  {selectedDoc.tags?.slice(0, 5).map((tag, i) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))}
                </div>

                {selectedDoc.summary && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-700">{selectedDoc.summary}</p>
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedDoc.view_count || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {selectedDoc.helpful_count || 0} helpful
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markHelpfulMutation.mutate(selectedDoc.id)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Mark Helpful
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentCard({ document, onView, onMarkHelpful, showRelevance }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-slate-900 flex-1">{document.title}</h4>
          {showRelevance && document.relevance_score > 0 && (
            <Badge className="bg-purple-600">
              {Math.round(document.relevance_score)} match
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-600 mb-3">{document.summary}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{document.category}</Badge>
          {document.tags?.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {document.view_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            {document.helpful_count || 0}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}