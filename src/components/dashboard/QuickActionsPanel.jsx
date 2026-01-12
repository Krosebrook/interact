import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Sparkles, 
  BarChart3, 
  MessageSquare,
  Layers,
  PlusCircle,
  Bot
} from 'lucide-react';
import { motion } from 'framer-motion';

const ActionButton = ({ icon: Icon, label, description, href, onClick, gradient, delay }) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`p-4 cursor-pointer transition-all hover:shadow-lg border-0 ${gradient}`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white">{label}</h4>
            <p className="text-xs text-white/70">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (href) {
    return <Link data-b44-sync="true" data-feature="dashboard" data-component="quickactionspanel" to={href}>{content}</Link>;
  }
  return content;
};

export default function QuickActionsPanel({ 
  onOpenAgentChat, 
  onOpenActivityGenerator,
  onOpenTemplates
}) {
  const actions = [
    {
      icon: PlusCircle,
      label: 'Schedule Event',
      description: 'Create a new event',
      href: createPageUrl('Calendar'),
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      icon: Bot,
      label: 'AI Assistant',
      description: 'Get help from AI',
      onClick: onOpenAgentChat,
      gradient: 'bg-gradient-to-r from-purple-500 to-indigo-600'
    },
    {
      icon: Sparkles,
      label: 'Generate Activity',
      description: 'AI-powered creation',
      onClick: onOpenActivityGenerator,
      gradient: 'bg-gradient-to-r from-pink-500 to-rose-600'
    },
    {
      icon: Layers,
      label: 'Templates',
      description: 'Use event templates',
      href: createPageUrl('EventTemplates'),
      gradient: 'bg-gradient-to-r from-amber-500 to-orange-600'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'View insights',
      href: createPageUrl('Analytics'),
      gradient: 'bg-gradient-to-r from-emerald-500 to-teal-600'
    },
    {
      icon: Users,
      label: 'Teams',
      description: 'Manage teams',
      href: createPageUrl('Teams'),
      gradient: 'bg-gradient-to-r from-cyan-500 to-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {actions.map((action, i) => (
        <ActionButton key={i} {...action} delay={i * 0.05} />
      ))}
    </div>
  );
}