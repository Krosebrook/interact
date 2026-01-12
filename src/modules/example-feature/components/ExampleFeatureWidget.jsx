import React, { useState } from 'react';
import { useExampleFeatureData } from '../hooks/useExampleFeatureData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  RefreshCw,
  ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ExampleFeatureWidget Component
 * 
 * Demonstrates the standard pattern for Base44-compatible feature widgets.
 * Uses data-b44-sync attributes for Base44 visual canvas synchronization.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Widget title
 * @param {boolean} props.showMetrics - Show metrics section
 * @returns {JSX.Element}
 */
export default function ExampleFeatureWidget({ title = "Example Feature", showMetrics = true }) {
  const { data, isLoading, error, refetch } = useExampleFeatureData();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg border-red-200">
        <CardContent className="py-6">
          <p className="text-red-600 text-sm">Failed to load feature data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div data-b44-sync="true" data-feature="example-feature-widget" data-version="1.0.0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span data-b44-sync="true">{title}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                title="Refresh data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Main content area with Base44 sync marker */}
            <div data-b44-sync="true" className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Feature Status</p>
                  <p className="text-2xl font-bold text-slate-900">{data?.status || 'Active'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Last Updated</p>
                  <p className="text-sm font-medium text-slate-900">
                    {data?.lastUpdated || new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {showMetrics && data?.metrics && (
                <div data-b44-sync="true" className="grid grid-cols-2 gap-3">
                  {Object.entries(data.metrics).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="p-3 bg-white border border-slate-200 rounded-lg"
                    >
                      <p className="text-xs text-slate-500 uppercase mb-1">{key}</p>
                      <p className="text-xl font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Expandable details section */}
              {data?.details && (
                <div className="border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="w-full justify-between"
                  >
                    <span>View Details</span>
                    <ChevronRight 
                      className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} 
                    />
                  </Button>
                  
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 bg-slate-50 rounded-lg"
                      data-b44-sync="true"
                    >
                      <p className="text-sm text-slate-700">{data.details}</p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
