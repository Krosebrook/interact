import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitMerge, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function MVTInteractionPanel({ mvtData }) {
  if (!mvtData || !mvtData.interactions) return null;

  const getSynergyIcon = (synergy) => {
    switch (synergy) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSynergyColor = (synergy) => {
    switch (synergy) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitMerge className="w-5 h-5 text-purple-600" />
          Multi-Variate Testing (MVT) - Interaction Effects
          <Badge className="bg-purple-600 text-white ml-2">Advanced</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mvtData.has_significant_interactions && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <GitMerge className="w-4 h-4" />
              Significant Interaction Effects Detected
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Variants are interacting in non-additive ways. Consider analyzing combined strategies.
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {mvtData.interactions.map((interaction, idx) => (
            <div 
              key={idx}
              className="p-4 border rounded-lg bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">
                    {interaction.variant_a} × {interaction.variant_b}
                  </span>
                  {getSynergyIcon(interaction.synergy)}
                </div>
                <Badge className={getSynergyColor(interaction.synergy)}>
                  {interaction.synergy === 'positive' ? 'Positive' : 
                   interaction.synergy === 'negative' ? 'Negative' : 'Neutral'} Synergy
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-slate-600 mb-1">Expected Combined</p>
                  <p className="font-semibold text-slate-900">
                    {interaction.expected_combined.toFixed(2)}%
                  </p>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-slate-600 mb-1">Actual Combined</p>
                  <p className="font-semibold text-slate-900">
                    {interaction.actual_combined.toFixed(2)}%
                  </p>
                </div>
                <div className={`p-2 rounded ${
                  Math.abs(interaction.interaction_effect) > 5 ? 'bg-purple-50' : 'bg-slate-50'
                }`}>
                  <p className="text-slate-600 mb-1">Interaction Effect</p>
                  <p className={`font-semibold ${
                    interaction.interaction_effect > 0 ? 'text-green-600' : 
                    interaction.interaction_effect < 0 ? 'text-red-600' : 'text-slate-900'
                  }`}>
                    {interaction.interaction_effect > 0 ? '+' : ''}
                    {interaction.interaction_effect.toFixed(2)}%
                  </p>
                </div>
              </div>

              {Math.abs(interaction.interaction_effect) > 5 && (
                <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-900">
                  <p className="font-medium">
                    {interaction.interaction_effect > 0 
                      ? '🔬 These variants work better together than individually!'
                      : '⚠️ These variants may interfere with each other\'s effectiveness.'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
          <p className="font-semibold text-purple-900 mb-1">Understanding MVT</p>
          <p className="text-purple-700 text-xs">
            Multi-variate testing reveals if variants have synergistic or antagonistic effects when combined. 
            Positive synergy suggests bundling strategies, while negative synergy indicates conflicting approaches.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}