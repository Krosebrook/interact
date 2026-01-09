import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Loader2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const AVAILABLE_DOCS = [
  { value: 'ARCHITECTURE.md', label: 'Architecture Overview', category: 'Technical' },
  { value: 'PRD_MASTER.md', label: 'Product Requirements', category: 'Product' },
  { value: 'API_REFERENCE.md', label: 'API Reference', category: 'Technical' },
  { value: 'SECURITY.md', label: 'Security Documentation', category: 'Technical' },
  { value: 'FEATURE_SPECS.md', label: 'Feature Specifications', category: 'Product' },
  { value: 'ONBOARDING_SPEC.md', label: 'Onboarding System', category: 'Product' },
  { value: 'GAMIFICATION_ADMIN_GUIDE.md', label: 'Gamification Guide', category: 'Admin' },
  { value: 'AI_FEATURES_DOCUMENTATION.md', label: 'AI Features', category: 'Technical' },
  { value: 'DATABASE_SCHEMA_TECHNICAL_SPEC.md', label: 'Database Schema', category: 'Technical' },
  { value: 'DEPLOYMENT_GUIDE.md', label: 'Deployment Guide', category: 'Operations' },
  { value: 'QUICK_START_GUIDE.md', label: 'Quick Start Guide', category: 'Getting Started' },
  { value: 'USER_FLOWS.md', label: 'User Flows', category: 'Product' },
];

export default function DocSummarizer() {
  const [selectedDoc, setSelectedDoc] = useState('');
  const [summary, setSummary] = useState(null);
  const [fullContent, setFullContent] = useState('');
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);

  const summarizeMutation = useMutation({
    mutationFn: async (docName) => {
      // Fetch the documentation file content
      const response = await fetch(`/components/docs/${docName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch documentation');
      }
      const content = await response.text();
      setFullContent(content);

      // Generate AI summary
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize the following documentation in a concise, structured format. Include:
1. **Purpose** (1-2 sentences)
2. **Key Points** (3-5 bullet points)
3. **Target Audience** (who should read this)
4. **Quick Takeaways** (2-3 actionable insights)

Keep the summary under 200 words and make it scannable.

Documentation Content:
${content}`,
        response_json_schema: {
          type: 'object',
          properties: {
            purpose: { type: 'string' },
            key_points: { type: 'array', items: { type: 'string' } },
            target_audience: { type: 'string' },
            quick_takeaways: { type: 'array', items: { type: 'string' } },
            estimated_read_time: { type: 'string' }
          }
        }
      });

      return aiResponse;
    },
    onSuccess: (data) => {
      setSummary(data);
      toast.success('Summary generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate summary: ' + error.message);
    }
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedDocInfo = AVAILABLE_DOCS.find(doc => doc.value === selectedDoc);

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Documentation Summarizer
          </CardTitle>
          <CardDescription>
            Get concise, AI-generated overviews of lengthy documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedDoc} onValueChange={setSelectedDoc}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a document to summarize..." />
              </SelectTrigger>
              <SelectContent>
                {['Technical', 'Product', 'Admin', 'Operations', 'Getting Started'].map(category => (
                  <React.Fragment key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
                      {category}
                    </div>
                    {AVAILABLE_DOCS
                      .filter(doc => doc.category === category)
                      .map(doc => (
                        <SelectItem key={doc.value} value={doc.value}>
                          {doc.label}
                        </SelectItem>
                      ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => summarizeMutation.mutate(selectedDoc)}
              disabled={!selectedDoc || summarizeMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {summarizeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Summarize
                </>
              )}
            </Button>
          </div>

          {selectedDocInfo && (
            <div className="flex gap-2">
              <Badge variant="outline">{selectedDocInfo.category}</Badge>
              <Badge variant="outline">
                <FileText className="h-3 w-3 mr-1" />
                {selectedDocInfo.value}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  Summary: {selectedDocInfo?.label}
                </CardTitle>
                {summary.estimated_read_time && (
                  <CardDescription>
                    Full doc read time: {summary.estimated_read_time}
                  </CardDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(JSON.stringify(summary, null, 2))}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Purpose */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">📋 Purpose</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{summary.purpose}</p>
            </div>

            {/* Key Points */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">🔑 Key Points</h3>
              <ul className="space-y-1.5">
                {summary.key_points?.map((point, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target Audience */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">👥 Target Audience</h3>
              <p className="text-sm text-slate-600">{summary.target_audience}</p>
            </div>

            {/* Quick Takeaways */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">💡 Quick Takeaways</h3>
              <div className="space-y-2">
                {summary.quick_takeaways?.map((takeaway, idx) => (
                  <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-900">{takeaway}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle Full Content */}
            {fullContent && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowFull(!showFull)}
                  className="w-full"
                >
                  {showFull ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Full Documentation
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Full Documentation
                    </>
                  )}
                </Button>

                {showFull && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-[600px] overflow-y-auto">
                    <ReactMarkdown className="prose prose-sm max-w-none">
                      {fullContent}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!summary && !summarizeMutation.isPending && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Select a document and click "Summarize" to generate an AI-powered overview
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}