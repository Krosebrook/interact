import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, Download, ExternalLink, Sparkles } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function GoogleDriveContentPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [enrichedContent, setEnrichedContent] = useState(null);

  const searchMutation = useMutation({
    mutationFn: async (query) => {
      const response = await base44.functions.invoke('googleDriveContentSearch', {
        query,
        maxResults: 10,
        fileType: 'all'
      });
      return response.data;
    },
    onSuccess: (data) => setSearchResults(data)
  });

  const enrichMutation = useMutation({
    mutationFn: async (query) => {
      const response = await base44.functions.invoke('aiDocumentContentEnricher', {
        searchQuery: query,
        contentType: 'company-information'
      });
      return response.data;
    },
    onSuccess: (data) => setEnrichedContent(data)
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const handleEnrich = () => {
    if (searchQuery.trim()) {
      enrichMutation.mutate(searchQuery);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('spreadsheet')) return '📊';
    if (mimeType?.includes('document')) return '📄';
    if (mimeType?.includes('pdf')) return '📕';
    return '📎';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Google Drive Content Search</h2>
        <p className="text-slate-600">Search company documents to enrich coaching, policies, and resources</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Documents</CardTitle>
          <CardDescription>Find documents in Google Drive related to policies, procedures, or training</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search company documents (e.g., 'performance management', 'onboarding')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={searchMutation.isPending}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleEnrich}
              disabled={!searchQuery.trim() || enrichMutation.isPending}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Analyze
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search Results</TabsTrigger>
          <TabsTrigger value="enriched">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          {searchMutation.isPending && <LoadingSpinner message="Searching Google Drive..." />}

          {searchResults && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Found {searchResults.filesFound} documents
              </p>
              
              {searchResults.results.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.results.map(file => (
                    <Card key={file.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-2xl">{getFileIcon(file.type)}</span>
                            <div className="flex-1">
                              <CardTitle className="text-base">{file.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {file.type.split('vnd.google-apps.').pop() || file.type.split('/').pop()}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <a 
                            href={file.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-int-orange hover:text-int-orange/80 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 max-h-32 overflow-y-auto">
                          {file.content}
                          {file.fullContent.length > 1000 && '...'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-slate-600 text-center">No documents found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!searchResults && !searchMutation.isPending && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-600 text-center">Enter a search query and click Search</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="enriched">
          {enrichMutation.isPending && <LoadingSpinner message="Analyzing documents with AI..." />}

          {enrichedContent && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis Results</CardTitle>
                  <CardDescription>Key information extracted from company documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrichedContent.analysis?.summary && (
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <p className="text-sm text-slate-700">{enrichedContent.analysis.summary}</p>
                    </div>
                  )}

                  {enrichedContent.analysis?.key_policies?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Key Policies</h4>
                      <ul className="space-y-1">
                        {enrichedContent.analysis.key_policies.map((policy, idx) => (
                          <li key={idx} className="text-sm flex items-start">
                            <span className="mr-2">•</span>
                            {policy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {enrichedContent.analysis?.values?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Core Values</h4>
                      <div className="flex flex-wrap gap-2">
                        {enrichedContent.analysis.values.map((value, idx) => (
                          <Badge key={idx} className="bg-int-orange/10 text-int-orange">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {enrichedContent.analysis?.best_practices?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Best Practices</h4>
                      <ul className="space-y-1">
                        {enrichedContent.analysis.best_practices.map((practice, idx) => (
                          <li key={idx} className="text-sm flex items-start">
                            <span className="mr-2">✓</span>
                            {practice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {enrichedContent.sourceDocuments?.length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2 text-sm">Source Documents</h4>
                      <ul className="space-y-1">
                        {enrichedContent.sourceDocuments.map((doc, idx) => (
                          <li key={idx} className="text-sm">
                            <a 
                              href={doc.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-int-orange hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              {doc.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {!enrichedContent && !enrichMutation.isPending && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-600 text-center">Search documents and click "AI Analyze" to extract insights</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}