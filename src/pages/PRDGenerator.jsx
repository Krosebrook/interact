import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Download, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import base44 from '@base44/sdk';

const PRDGenerator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    featureIdea: '',
    targetAudience: '',
    businessGoals: '',
    technicalConstraints: '',
    timeline: '',
    budget: '',
    existingIntegrations: ''
  });
  const [generatedPRD, setGeneratedPRD] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.featureIdea.trim()) {
      toast.error('Please provide a feature idea');
      return;
    }

    setIsGenerating(true);
    setGeneratedPRD('');

    try {
      // Build context object from form data
      const context = {};
      if (formData.targetAudience) context.targetAudience = formData.targetAudience;
      if (formData.businessGoals) context.businessGoals = formData.businessGoals;
      if (formData.technicalConstraints) context.technicalConstraints = formData.technicalConstraints;
      if (formData.timeline) context.timeline = formData.timeline;
      if (formData.budget) context.budget = formData.budget;
      if (formData.existingIntegrations) context.existingIntegrations = formData.existingIntegrations;

      // Call Base44 function to generate PRD
      const response = await base44.functions.call('generatePRD', {
        featureIdea: formData.featureIdea,
        context,
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        temperature: 0.8
      });

      if (response.success) {
        setGeneratedPRD(response.prd);
        toast.success('PRD generated successfully!');
      } else {
        throw new Error(response.error || 'Failed to generate PRD');
      }
    } catch (error) {
      console.error('Error generating PRD:', error);
      toast.error(`Failed to generate PRD: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPRD);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedPRD], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Create filename from feature idea
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedIdea = formData.featureIdea
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 50);
    a.download = `PRD-${sanitizedIdea}-${timestamp}.md`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('PRD downloaded!');
  };

  const handleReset = () => {
    setFormData({
      featureIdea: '',
      targetAudience: '',
      businessGoals: '',
      technicalConstraints: '',
      timeline: '',
      budget: '',
      existingIntegrations: ''
    });
    setGeneratedPRD('');
    setCopied(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">PRD Generator</h1>
        <p className="text-muted-foreground">
          Generate comprehensive Product Requirements Documents from your feature ideas using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Feature Information
            </CardTitle>
            <CardDescription>
              Provide details about your feature idea to generate a comprehensive PRD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="featureIdea" className="required">
                Feature Idea *
              </Label>
              <Textarea
                id="featureIdea"
                placeholder="Describe your feature idea in detail..."
                value={formData.featureIdea}
                onChange={(e) => handleInputChange('featureIdea', e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                Be as specific as possible about what you want to build
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Enterprise users, 100-5000 employees"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessGoals">Business Goals</Label>
              <Textarea
                id="businessGoals"
                placeholder="e.g., Increase engagement by 40% in 6 months"
                value={formData.businessGoals}
                onChange={(e) => handleInputChange('businessGoals', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalConstraints">Technical Constraints</Label>
              <Textarea
                id="technicalConstraints"
                placeholder="e.g., Must work with React 18 and Vite, integrate with existing API"
                value={formData.technicalConstraints}
                onChange={(e) => handleInputChange('technicalConstraints', e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  placeholder="e.g., Q2 2026"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  placeholder="e.g., $50,000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="existingIntegrations">Existing Integrations</Label>
              <Input
                id="existingIntegrations"
                placeholder="e.g., Slack, Microsoft Teams, Google Calendar"
                value={formData.existingIntegrations}
                onChange={(e) => handleInputChange('existingIntegrations', e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.featureIdea.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate PRD
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                <strong>Note:</strong> PRD generation uses AI and may take 30-60 seconds. 
                The generated document is a starting point and should be reviewed and customized.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Output Display */}
        <Card className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated PRD</CardTitle>
              {generatedPRD && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>
              {generatedPRD 
                ? 'Your AI-generated PRD is ready. Review and customize as needed.'
                : 'Your generated PRD will appear here'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Generating your PRD...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This may take 30-60 seconds
                </p>
              </div>
            ) : generatedPRD ? (
              <div className="prose prose-sm max-w-none overflow-auto max-h-[calc(100vh-16rem)]">
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">
                  {generatedPRD}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p>Fill in the feature information and click "Generate PRD" to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PRDGenerator;
