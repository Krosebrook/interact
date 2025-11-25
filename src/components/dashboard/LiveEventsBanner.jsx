import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Play, Users, ArrowRight, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveEventsBanner({ events, participations }) {
  const liveEvents = events?.filter(e => e.status === 'in_progress') || [];
  
  if (liveEvents.length === 0) return null;

  const getParticipantCount = (eventId) => {
    return participations?.filter(p => p.event_id === eventId && p.attended).length || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className="h-6 w-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            </div>
            <Badge className="bg-white/20 text-white border-0">
              {liveEvents.length} Live Now
            </Badge>
          </div>

          <div className="flex-1 flex gap-4 overflow-x-auto">
            {liveEvents.slice(0, 3).map((event) => (
              <Link 
                key={event.id}
                to={createPageUrl(`FacilitatorView?eventId=${event.id}`)}
                className="flex-shrink-0"
              >
                <div className="flex items-center gap-3 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/20 transition-colors">
                  <Play className="h-4 w-4 text-white" />
                  <div>
                    <p className="font-medium text-white text-sm">{event.title}</p>
                    <p className="text-xs text-white/70 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {getParticipantCount(event.id)} active
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/50" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}