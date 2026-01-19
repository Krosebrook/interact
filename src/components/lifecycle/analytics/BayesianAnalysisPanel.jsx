import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function BayesianAnalysisPanel({ bayesianData, winningVariant }) {
  if (!bayesianData) return null;

  const variants = Object.entries(bayesianData);
  const sortedVariants = variants.sort((a, b) => 
    b[1].probability_to_be_best - a[1].probability_to_be_best
  );

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="w-5 h-5 text-blue-600" />
          Bayesian Analysis
          <Badge className="bg-blue-600 text-white ml-2">Advanced Stats</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {sortedVariants.map(([variantId, data]) => {
            const isWinner = variantId === winningVariant;
            const confidence = data.probability_to_be_best;
            
            return (
              <div 
                key={variantId} 
                className={`p-4 rounded-lg border-2 ${
                  isWinner ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{data.variant_name}</span>
                    {isWinner && (
                      <Badge className="bg-green-600 text-white">
                        <Award className="w-3 h-3 mr-1" />
                        Best
                      </Badge>
                    )}
                  </div>
                  <Badge 
                    className={
                      confidence > 90 ? 'bg-green-100 text-green-800' :
                      confidence > 70 ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }
                  >
                    {confidence.toFixed(1)}% Probability to Win
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Expected Conversion Rate</span>
                      <span className="font-semibold text-blue-600">
                        {data.expected_conversion.toFixed(2)}%
                      </span>
                    </div>
                    <Progress value={data.expected_conversion} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-slate-600 mb-1">95% Credible Interval</p>
                      <p className="font-mono font-semibold text-slate-900">
                        {data.credible_interval[0].toFixed(2)}% - {data.credible_interval[1].toFixed(2)}%
                      </p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-slate-600 mb-1">Sample Size</p>
                      <p className="font-semibold text-slate-900">{data.sample_size} users</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      Posterior: Beta(α={data.alpha.toFixed(1)}, β={data.beta.toFixed(1)})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold text-blue-900 mb-1">What is Bayesian Analysis?</p>
          <p className="text-blue-700 text-xs">
            Bayesian statistics update probabilities as data arrives, allowing faster decisions with smaller samples. 
            The "probability to win" shows the likelihood each variant is truly best, while credible intervals 
            provide uncertainty ranges.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}