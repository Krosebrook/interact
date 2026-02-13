import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Copy, RefreshCw, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

/**
 * AI Content Assistant - Universal AI helper for content creation
 * @param {string} type - Content type: 'recognition' | 'event' | 'moderation' | 'learning'
 * @param {object} context - Additional context for AI suggestions
 * @param {function} onSelect - Callback when user selects a suggestion
 */
export default function AIContentAssistant({ type, context = {}, onSelect, className = '' }) {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const contentTypes = {
    recognition: {
      title: 'Recognition Message Suggestions',
      icon: Sparkles,
      color: 'text-amber-600',
      placeholder: 'Describe what you want to recognize... (e.g., "helped me debug production issue")',
      examples: ['Great teamwork on sprint delivery', 'Exceptional customer support', 'Innovative solution to problem']
    },
    event: {
      title: 'Event Description Generator',
      icon: Wand2,
      color: 'text-blue-600',
      placeholder: 'Describe your event... (e.g., "team building activity for remote workers")',
      examples: ['Virtual coffee chat', 'Technical workshop on React', 'Wellness meditation session']
    },
    moderation: {
      title: 'Content Moderation Insights',
      icon: Sparkles,
      color: 'text-purple-600',
      placeholder: 'Paste content to analyze for moderation...',
      examples: []
    },
    learning: {
      title: 'Learning Path Recommendations',
      icon: Sparkles,
      color: 'text-green-600',
      placeholder: 'Describe your learning goals... (e.g., "improve leadership skills")',
      examples: ['Technical skills path', 'Leadership development', 'Communication mastery']
    }
  };

  const config = contentTypes[type] || contentTypes.recognition;
  const Icon = config.icon;

  const generateSuggestions = async () => {
    if (!prompt.trim() && !context.autoGenerate) {
      toast.error('Please provide some context');
      return;
    }

    setIsLoading(true);
    setSuggestions([]);

    try {
      const response = await base44.functions.invoke('generateAIContentSuggestions', {
        type,
        prompt: prompt.trim(),
        context
      });

      if (response.data?.suggestions) {
        setSuggestions(response.data.suggestions);
      } else {
        toast.error('No suggestions generated');
      }
    } catch (error) {
      toast.error('Failed to generate suggestions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelect = (suggestion) => {
    if (onSelect) {
      onSelect(suggestion);
    }
    toast.success('Suggestion applied');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          {config.title}
          <Badge variant="outline" className="ml-auto">AI-Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder={config.placeholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button 
            onClick={generateSuggestions}
            disabled={isLoading}
            className="w-full bg-int-orange hover:bg-[#C46322]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Suggestions
              </>
            )}
          </Button>
        </div>

        {config.examples.length > 0 && !suggestions.length && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {config.examples.map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example)}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">AI Suggestions:</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateSuggestions}
                disabled={isLoading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            </div>
            
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-int-orange transition-colors group"
              >
                <p className="text-sm text-slate-700 mb-2">{suggestion}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(suggestion, idx)}
                    className="text-xs"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  {onSelect && (
                    <Button
                      size="sm"
                      onClick={() => handleSelect(suggestion)}
                      className="text-xs bg-int-orange hover:bg-[#C46322]"
                    >
                      Use This
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}