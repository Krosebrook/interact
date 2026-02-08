import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AIChatbotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your INTeract Assistant. Ask me about gamification, events, recognition, or any platform features!'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const sendMessage = useMutation({
    mutationFn: async (userMessage) => {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const response = await base44.functions.invoke('aiChatbotAssistant', {
        message: userMessage,
        conversationHistory
      });
      
      return response.data.response;
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.'
      }]);
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    sendMessage.mutate(userMessage);
  };
  
  const quickActions = [
    { label: '📊 How do I earn points?', message: 'How do I earn points in the gamification system?' },
    { label: '🎯 What are tiers?', message: 'Explain the tier system and how to advance' },
    { label: '📅 How to propose events?', message: 'How can I propose a new event?' },
    { label: '⭐ Recognition guidelines', message: 'What are the guidelines for giving recognition?' }
  ];
  
  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full h-16 w-16 shadow-lg bg-gradient-to-br from-int-orange to-int-gold hover:shadow-xl transition-all"
            >
              <MessageCircle className="h-7 w-7" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} z-50`}
          >
            <Card className={`shadow-2xl ${isMinimized ? 'w-80' : 'w-96 h-[600px]'} flex flex-col`}>
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-int-orange to-int-gold">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    INTeract Assistant
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => setIsMinimized(!isMinimized)}
                    >
                      {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {!isMinimized && (
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                              {msg.content}
                            </ReactMarkdown>
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {sendMessage.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 rounded-lg p-3">
                          <LoadingSpinner size="small" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Quick Actions */}
                  {messages.length === 1 && (
                    <div className="px-4 pb-3 space-y-2">
                      <p className="text-xs text-slate-500 font-semibold">Quick Actions:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setMessages(prev => [...prev, { role: 'user', content: action.message }]);
                              sendMessage.mutate(action.message);
                            }}
                            className="text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-left transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Input */}
                  <form onSubmit={handleSubmit} className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={sendMessage.isPending}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || sendMessage.isPending}
                        className="bg-int-orange hover:bg-int-orange-dark"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}