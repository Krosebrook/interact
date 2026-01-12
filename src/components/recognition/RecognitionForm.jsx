import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useGamificationTrigger } from '../hooks/useGamificationTrigger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Send, Sparkles, Loader2, User, Wand2, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { value: 'teamwork', label: 'Teamwork', icon: '🤝', description: 'Collaboration & support' },
  { value: 'innovation', label: 'Innovation', icon: '💡', description: 'Creative solutions' },
  { value: 'leadership', label: 'Leadership', icon: '🎯', description: 'Guiding & inspiring' },
  { value: 'going_above', label: 'Going Above & Beyond', icon: '🚀', description: 'Extra effort' },
  { value: 'customer_focus', label: 'Customer Focus', icon: '❤️', description: 'Client dedication' },
  { value: 'problem_solving', label: 'Problem Solving', icon: '🧩', description: 'Finding solutions' },
  { value: 'mentorship', label: 'Mentorship', icon: '🌱', description: 'Teaching & growth' },
  { value: 'culture_champion', label: 'Culture Champion', icon: '⭐', description: 'Living our values' }
];

const COMPANY_VALUES = [
  'Integrity', 'Innovation', 'Collaboration', 'Excellence', 'Customer First', 'Growth Mindset'
];

export default function RecognitionForm({ currentUser, onSuccess }) {
  const queryClient = useQueryClient();
  const { trigger } = useGamificationTrigger();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [selectedValues, setSelectedValues] = useState([]);
  const [visibility, setVisibility] = useState('public');
  const [isAiSuggested, setIsAiSuggested] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Fetch users for recipient selection (only basic info, no PII)
  const { data: users = [] } = useQuery({
    queryKey: ['users-list-basic'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      // Filter to only show id, email, full_name (no PII)
      return allUsers.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role
      }));
    }
  });

  const filteredUsers = users.filter(u => 
    u.email !== currentUser?.email && 
    (u.email.toLowerCase().includes(recipientEmail.toLowerCase()) ||
     u.full_name?.toLowerCase().includes(recipientEmail.toLowerCase()))
  ).slice(0, 5);

  // Generate AI suggestions
  const generateSuggestions = async () => {
    if (!recipientName || !category) {
      toast.error('Select a recipient and category first');
      return;
    }

    setAiLoading(true);
    try {
      const categoryLabel = CATEGORIES.find(c => c.value === category)?.label || category;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 heartfelt, professional peer recognition messages for an employee named "${recipientName}" in the category "${categoryLabel}". 
        
Each message should:
- Be 2-3 sentences
- Sound genuine and personal
- Mention specific positive traits
- Be suitable for a workplace setting

Return as JSON: { "suggestions": ["message1", "message2", "message3"] }`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });
      setAiSuggestions(result.suggestions || []);
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setMessage(suggestion);
    setIsAiSuggested(true);
    setAiSuggestions([]);
  };

  // Submit recognition
  const submitMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Recognition.create({
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        message,
        category,
        company_values: selectedValues,
        visibility,
        ai_suggested: isAiSuggested,
        points_awarded: 10,
        status: 'approved'
      });
    },
    onSuccess: async (recognition) => {
      queryClient.invalidateQueries(['recognitions']);
      toast.success(`Recognition sent to ${recipientName}! 🎉`);
      
      // Trigger gamification rules for both sender and recipient
      await trigger('recognition_given', currentUser.email, {
        recognition_id: recognition.id,
        category,
        reference_id: recognition.id
      });
      
      await trigger('recognition_received', recipientEmail, {
        recognition_id: recognition.id,
        category,
        reference_id: recognition.id
      });
      
      // Reset form
      setRecipientEmail('');
      setRecipientName('');
      setMessage('');
      setCategory('');
      setSelectedValues([]);
      setIsAiSuggested(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to send recognition');
    }
  });

  const handleSelectUser = (user) => {
    setRecipientEmail(user.email);
    setRecipientName(user.full_name);
  };

  const toggleValue = (value) => {
    setSelectedValues(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const isValid = recipientEmail && recipientName && message.length >= 10 && category;

  return (
    <Card className="glass-card-solid" data-b44-sync="true" data-feature="recognition" data-component="recognitionform">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-int-orange" />
          Give Recognition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipient Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Who do you want to recognize?</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name or email..."
              value={recipientName || recipientEmail}
              onChange={(e) => {
                setRecipientEmail(e.target.value);
                setRecipientName('');
              }}
              className="pl-10"
            />
          </div>
          {recipientEmail && !recipientName && filteredUsers.length > 0 && (
            <div className="border rounded-lg bg-white shadow-lg p-2 space-y-1">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-int-orange text-white flex items-center justify-center text-sm font-medium">
                    {user.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-xs text-slate-600">{user.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  category === cat.value 
                    ? 'border-int-orange bg-orange-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-sm font-medium">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Message with AI Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Your Message</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateSuggestions}
              disabled={aiLoading || !recipientName || !category}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-1" />
              )}
              AI Suggestions
            </Button>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-3 space-y-2 border border-purple-200">
              <div className="flex items-center gap-2 text-purple-700 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Generated Suggestions
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-auto"
                  onClick={generateSuggestions}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              {aiSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <Textarea
            placeholder="Write a heartfelt message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setIsAiSuggested(false);
            }}
            rows={4}
            className="resize-none"
          />
          {isAiSuggested && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-assisted
            </Badge>
          )}
        </div>

        {/* Company Values */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Company Values (optional)</label>
          <div className="flex flex-wrap gap-2">
            {COMPANY_VALUES.map(value => (
              <Badge
                key={value}
                variant={selectedValues.includes(value) ? 'default' : 'outline'}
                className={`cursor-pointer ${
                  selectedValues.includes(value) ? 'bg-int-orange' : ''
                }`}
                onClick={() => toggleValue(value)}
              >
                {value}
              </Badge>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Visibility</label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">🌍 Public - Visible to everyone</SelectItem>
              <SelectItem value="team_only">👥 Team Only - Visible to team</SelectItem>
              <SelectItem value="private">🔒 Private - Only recipient sees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={!isValid || submitMutation.isLoading}
          className="w-full bg-int-orange hover:bg-int-orange/90 text-slate-900 font-semibold"
        >
          {submitMutation.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send Recognition
        </Button>
      </CardContent>
    </Card>
  );
}