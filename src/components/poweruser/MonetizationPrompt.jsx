import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MonetizationPrompt({ moment, onDismiss, onConvert }) {
  const [showDetails, setShowDetails] = useState(false);

  const dismissMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      await base44.functions.invoke('monetizationEngine', {
        action: 'dismiss_offer',
        userEmail: user.email,
        moment_name: moment.name
      });
    },
    onSuccess: () => {
      onDismiss?.();
    }
  });

  const convertMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      await base44.functions.invoke('monetizationEngine', {
        action: 'track_conversion',
        userEmail: user.email,
        moment_name: moment.name,
        converted: true,
        value: 99
      });
    },
    onSuccess: () => {
      onConvert?.();
    }
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Card className="border-int-orange/30 bg-gradient-to-r from-int-orange/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{moment.message}</CardTitle>
              <button
                onClick={() => dismissMutation.mutate()}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* BENEFIT STATEMENT */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-700">{moment.benefit_statement}</p>
            </div>

            {/* EXPANDABLE DETAILS */}
            {!showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                className="text-sm text-int-orange font-medium hover:underline"
              >
                See what's included
              </button>
            )}

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 pt-2 border-t border-slate-200"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Stays free:</p>
                  <ul className="space-y-1">
                    {moment.stays_free.map(item => (
                      <li key={item} className="text-xs text-slate-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-slate-400 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Unlocks with upgrade:</p>
                  <ul className="space-y-1">
                    {moment.upgrades_to.map(item => (
                      <li key={item} className="text-xs text-slate-900 font-medium flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* ACTIONS */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-int-orange hover:bg-int-orange/90 text-white"
                onClick={() => convertMutation.mutate()}
                disabled={convertMutation.isPending}
              >
                Learn More
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => dismissMutation.mutate()}
                disabled={dismissMutation.isPending}
              >
                Maybe Later
              </Button>
            </div>

            {/* TRUST ELEMENT */}
            <p className="text-xs text-slate-500 text-center">
              Free tier never expires. Cancel anytime.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}