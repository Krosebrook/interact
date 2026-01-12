import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Send, BarChart3, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function LivePollCreator({ eventId }) {
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const { data: polls = [] } = useQuery({
    queryKey: ['polls', eventId],
    queryFn: () => base44.entities.Poll.filter({ event_id: eventId }),
    refetchInterval: 5000
  });

  const createPollMutation = useMutation({
    mutationFn: async () => {
      const validOptions = options.filter(o => o.trim());
      if (validOptions.length < 2) {
        throw new Error('Need at least 2 options');
      }
      
      return await base44.entities.Poll.create({
        event_id: eventId,
        question: question.trim(),
        options: validOptions,
        responses: {},
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['polls']);
      setQuestion('');
      setOptions(['', '']);
      toast.success('Poll launched! 📊');
    }
  });

  const closePollMutation = useMutation({
    mutationFn: async (pollId) => {
      await base44.entities.Poll.update(pollId, {
        is_active: false,
        closed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['polls']);
      toast.success('Poll closed');
    }
  });

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const getResults = (poll) => {
    const total = Object.keys(poll.responses || {}).length;
    const counts = {};
    
    poll.options.forEach(opt => {
      counts[opt] = 0;
    });
    
    Object.values(poll.responses || {}).forEach(response => {
      if (counts[response] !== undefined) {
        counts[response]++;
      }
    });
    
    return { counts, total };
  };

  return (
    <div className="space-y-4" data-b44-sync="true" data-feature="facilitator" data-component="livepollcreator">
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Create Live Poll</h3>
        
        <div className="space-y-4">
          <div>
            <Input
              placeholder="What's your poll question?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            {options.map((option, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {options.length < 6 && (
              <Button
                variant="outline"
                onClick={handleAddOption}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
            <Button
              onClick={() => createPollMutation.mutate()}
              disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Launch Poll
            </Button>
          </div>
        </div>
      </Card>

      {/* Active Polls */}
      <div className="space-y-3">
        <h3 className="font-bold">Active Polls ({polls.filter(p => p.is_active).length})</h3>
        <AnimatePresence>
          {polls.filter(p => p.is_active).map(poll => {
            const { counts, total } = getResults(poll);
            return (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-4 border-2 border-green-200 bg-green-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Badge className="bg-green-600 mb-2">LIVE</Badge>
                      <h4 className="font-bold">{poll.question}</h4>
                      <p className="text-sm text-slate-600 mt-1">{total} responses</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closePollMutation.mutate(poll.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {poll.options.map(opt => {
                      const count = counts[opt] || 0;
                      const percentage = total > 0 ? (count / total * 100) : 0;
                      return (
                        <div key={opt} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{opt}</span>
                            <span className="font-semibold">{count} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className="h-full bg-indigo-600"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {polls.filter(p => !p.is_active).length > 0 && (
          <>
            <h3 className="font-bold mt-6">Closed Polls</h3>
            {polls.filter(p => !p.is_active).map(poll => {
              const { counts, total } = getResults(poll);
              return (
                <Card key={poll.id} className="p-4">
                  <h4 className="font-bold mb-2">{poll.question}</h4>
                  <p className="text-sm text-slate-600 mb-3">{total} responses</p>
                  <div className="space-y-2">
                    {poll.options.map(opt => {
                      const count = counts[opt] || 0;
                      const percentage = total > 0 ? (count / total * 100) : 0;
                      return (
                        <div key={opt} className="flex justify-between text-sm">
                          <span>{opt}</span>
                          <span className="font-semibold">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}