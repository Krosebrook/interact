import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';

export default function AnomalyDetectionPanel({ anomalies }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-5 h-5 text-green-600" />
            Anomaly Detection
            <Badge className="bg-green-600 text-white ml-2">All Clear</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <Activity className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">No Anomalies Detected</p>
            <p className="text-xs text-green-700 mt-1">
              Test performance is stable with no unexpected shifts or outliers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
  const warningAnomalies = anomalies.filter(a => a.severity === 'warning');

  const getTypeIcon = (type) => {
    if (type === 'spike' || type === 'sustained_increase') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    if (type === 'drop' || type === 'sustained_decrease') {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      spike: 'Performance Spike',
      drop: 'Performance Drop',
      sustained_increase: 'Sustained Increase',
      sustained_decrease: 'Sustained Decrease'
    };
    return labels[type] || type;
  };

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Anomaly Detection
          <Badge className="bg-amber-600 text-white ml-2">
            {anomalies.length} Alert{anomalies.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {criticalAnomalies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Critical Anomalies ({criticalAnomalies.length})
            </h4>
            <div className="space-y-2">
              {criticalAnomalies.map((anomaly, idx) => (
                <div 
                  key={idx}
                  className="p-3 border-2 border-red-300 bg-red-50 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(anomaly.type)}
                      <span className="font-semibold text-red-900 text-sm">
                        {anomaly.variant_name}
                      </span>
                    </div>
                    <Badge className="bg-red-600 text-white text-xs">Critical</Badge>
                  </div>
                  
                  <div className="text-xs text-red-800 space-y-1">
                    <p className="font-medium">{getTypeLabel(anomaly.type)}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="p-2 bg-white/50 rounded">
                        <p className="text-red-600">Date</p>
                        <p className="font-semibold text-red-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {anomaly.date}
                        </p>
                      </div>
                      {anomaly.conversion_rate != null && (
                        <div className="p-2 bg-white/50 rounded">
                          <p className="text-red-600">Conversion Rate</p>
                          <p className="font-semibold text-red-900">
                            {anomaly.conversion_rate.toFixed(2)}%
                            {anomaly.expected_rate && (
                              <span className="text-xs ml-1">
                                (expected: {anomaly.expected_rate.toFixed(2)}%)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      {anomaly.trend_change_pct != null && (
                        <div className="p-2 bg-white/50 rounded">
                          <p className="text-red-600">Trend Change</p>
                          <p className="font-semibold text-red-900">
                            {anomaly.trend_change_pct > 0 ? '+' : ''}
                            {anomaly.trend_change_pct.toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {anomaly.z_score && (
                        <div className="p-2 bg-white/50 rounded">
                          <p className="text-red-600">Z-Score</p>
                          <p className="font-semibold text-red-900">
                            {anomaly.z_score.toFixed(2)}σ
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {warningAnomalies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings ({warningAnomalies.length})
            </h4>
            <div className="space-y-2">
              {warningAnomalies.map((anomaly, idx) => (
                <div 
                  key={idx}
                  className="p-3 border border-amber-300 bg-amber-50 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(anomaly.type)}
                      <span className="font-semibold text-amber-900 text-sm">
                        {anomaly.variant_name}
                      </span>
                    </div>
                    <Badge className="bg-amber-600 text-white text-xs">Warning</Badge>
                  </div>
                  
                  <div className="text-xs text-amber-800 space-y-1">
                    <p className="font-medium">{getTypeLabel(anomaly.type)}</p>
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {anomaly.date}
                      {anomaly.sample_size && ` • ${anomaly.sample_size} samples`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <p className="font-semibold text-amber-900 mb-1">About Anomaly Detection</p>
          <p className="text-amber-700 text-xs">
            Automated monitoring detects unusual performance patterns using statistical outlier analysis (3σ threshold) 
            and trend detection. Critical alerts require immediate investigation, while warnings suggest monitoring closely.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}