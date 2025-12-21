import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function OnboardingChatbot({ userName }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${userName?.split(' ')[0]}! 👋 I'm your AI onboarding assistant. I'm here to help answer any questions about the platform, company culture, or your onboarding journey. What would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const chatMutation = useMutation({
    mutationFn: async (question) => {
      const response = await base44.functions.invoke('newEmployeeOnboardingAI', {
        action: 'chatbot',
        context: { question }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response.answer,
        actions: data.response.suggested_actions,
        resources: data.response.helpful_resources
      }]);
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    chatMutation.mutate(input);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="sticky top-4 h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-5 w-5 text-purple-600" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.map((message, idx) => (
              <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-int-orange text-white' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-int-orange text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-slate-600 font-medium">Suggested actions:</p>
                        {message.actions.map((action, i) => (
                          <p key={i} className="text-xs text-slate-600 ml-2">• {action}</p>
                        ))}
                      </div>
                    )}
                    {message.resources && message.resources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-slate-600 font-medium">Helpful resources:</p>
                        {message.resources.map((resource, i) => (
                          <p key={i} className="text-xs text-blue-600 ml-2 hover:underline cursor-pointer">
                            → {resource}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl px-4 py-2 bg-slate-100">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1"
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              size="icon"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            AI assistant • Available 24/7
          </p>
        </div>
      </CardContent>
    </Card>
  );
}