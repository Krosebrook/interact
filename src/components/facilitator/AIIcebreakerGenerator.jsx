import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Copy, CheckCircle2, Zap, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

const ENERGY_COLORS = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700'
};

export default function AIIcebreakerGenerator({ eventId, eventType: defaultType }) {
  const [eventType, setEventType] = useState(defaultType || 'meeting');
  const [participantCount, setParticipantCount] = useState(10);
  const [icebreakers, setIcebreakers] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateEventIcebreakers', {
        event_id: eventId,
        event_type: eventType,
        participant_count: participantCount
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setIcebreakers(data.icebreakers);
        toast.success('Icebreakers generated!');
      }
    },
    onError: () => toast.error('Failed to generate icebreakers')
  });

  const handleCopy = (icebreaker, index) => {
    const text = `${icebreaker.title}\n\n${icebreaker.description}\n\nInstructions:\n${icebreaker.instructions}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          AI Icebreaker Generator
        </CardTitle>
        <p className="text-sm text-slate-600">Get personalized icebreakers for your event</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Team Meeting</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="social">Social Event</SelectItem>
                <SelectItem value="brainstorm">Brainstorm</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Participant Count</Label>
            <Input
              type="number"
              value={participantCount}
              onChange={(e) => setParticipantCount(parseInt(e.target.value))}
              min="2"
              max="100"
            />
          </div>
        </div>

        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Icebreakers
            </>
          )}
        </Button>

        {/* Icebreaker Results */}
        <AnimatePresence>
          {icebreakers && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 mt-6"
            >
              {icebreakers.map((icebreaker, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-slate-900">{icebreaker.title}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className={ENERGY_COLORS[icebreaker.energy_level]}>
                              {icebreaker.energy_level} energy
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {icebreaker.duration_minutes} min
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {icebreaker.format}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopy(icebreaker, idx)}
                          className="flex-shrink-0"
                        >
                          {copiedIndex === idx ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>
                      </div>

                      <p className="text-sm text-slate-600 mb-3">{icebreaker.description}</p>

                      <div className="space-y-2">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Instructions:</p>
                          <p className="text-xs text-blue-800">{icebreaker.instructions}</p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-xs font-semibold text-green-900 mb-1">Expected Outcome:</p>
                          <p className="text-xs text-green-800">{icebreaker.expected_outcome}</p>
                        </div>

                        {icebreaker.best_for?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-purple-500" />
                            <span className="text-xs text-slate-600">
                              Best for: {icebreaker.best_for.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}