import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, TrendingUp, MessageSquare, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserStatsCards({ stats }) {
  const cards = [
    { icon: Calendar, label: 'Upcoming Events', value: stats.upcoming, color: 'text-int-navy' },
    { icon: TrendingUp, label: 'Past Events', value: stats.past, color: 'text-[#4A6070]' },
    { icon: MessageSquare, label: 'Pending Feedback', value: stats.pendingFeedback, color: 'text-int-orange' },
    { icon: Users, label: 'Events Attended', value: stats.attended, color: 'text-int-orange' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{card.label}</p>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}