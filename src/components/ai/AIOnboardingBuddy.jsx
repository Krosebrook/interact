import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIOnboardingBuddy({ userEmail, userName }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${userName}! 👋 I'm your AI Onboarding Buddy. I'm here to help you get started with INTeract. Ask me anything about:\n\n• How to earn points and badges\n• Finding and joining events\n• Sending recognition to colleagues\n• Navigating the platform\n• Team features and challenges\n\nWhat would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      const conversationContext = messages
        .slice(-4)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Onboarding Buddy for INTeract, an employee engagement platform. Help the new employee understand how to use the platform.

Platform Features:
- Points System: Earn points by attending events, sending recognition, completing challenges
- Badges: Auto-awarded when you reach milestones
- Leaderboards: See how you rank weekly/monthly
- Events: Virtual team activities you can join
- Recognition: Send shoutouts to colleagues (awards both sender and recipient points)
- Teams: Join departments or interest-based groups
- Challenges: Personal and team goals with rewards
- Wellness: Track steps, meditation, hydration
- Profile: Customize with avatar, bio, skills

Conversation so far:
${conversationContext}

User's question: ${userMessage}

Provide a helpful, friendly, concise response (2-3 sentences). Use emojis occasionally. If they ask how to do something specific, give step-by-step guidance.`
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again or contact support if the issue persists.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-int-orange/10 to-purple-500/10">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-int-orange rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          AI Onboarding Buddy
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-int-orange to-purple-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-int-navy text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              {message.role === 'assistant' ? (
                <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                  {message.content}
                </ReactMarkdown>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
            
            {message.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold">{userName?.[0]}</span>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-int-orange to-purple-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="bg-slate-100 rounded-2xl px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about INTeract..."
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-int-orange hover:bg-int-orange-dark"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 mt-2 flex-wrap">
          {['How do I earn points?', 'What are badges?', 'How to join events?'].map(suggestion => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => {
                setInput(suggestion);
                setTimeout(() => handleSend(), 100);
              }}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}