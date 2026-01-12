import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FacilitatorSupportChat({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI facilitator assistant. Ask me anything about running engaging events, handling difficult situations, or improving participation! 🎯"
    }
  ]);
  const [input, setInput] = useState('');

  const chatMutation = useMutation({
    mutationFn: async (message) => {
      const conversationContext = messages.map(m => 
        `${m.role === 'user' ? 'You' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const prompt = `You are an expert event facilitator assistant helping admins run successful team engagement activities. 

Previous conversation:
${conversationContext}

User question: ${message}

Provide practical, actionable advice for facilitators. Be concise, supportive, and specific. Include tips, best practices, or solutions to common facilitation challenges.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      return response;
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    chatMutation.mutate(userMessage);
  };

  const quickActions = [
    "How do I boost participation?",
    "Tips for virtual icebreakers",
    "Handling quiet participants",
    "Managing time effectively",
    "Post-event follow-up ideas"
  ];

  return (
    <motion.div
      data-b44-sync="true"
      data-feature="facilitator"
      data-component="facilitatorsupportchat"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <div>
            <h3 className="font-bold">AI Support Assistant</h3>
            <p className="text-xs opacity-90">Here to help you facilitate</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="p-4 border-b bg-slate-50">
          <p className="text-xs text-slate-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(action);
                }}
                className="text-xs"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {chatMutation.isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask for facilitation help..."
            disabled={chatMutation.isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}