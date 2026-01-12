import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

/**
 * ExampleFeatureCard Component
 * 
 * A simple card component demonstrating Base44 sync attributes.
 * This pattern should be followed for all new UI components.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {string} props.status - Status badge text
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export default function ExampleFeatureCard({ 
  title, 
  description, 
  status = 'active',
  children 
}) {
  return (
    <div data-b44-sync="true" data-component="example-feature-card">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1" data-b44-sync="true">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
              {description && (
                <p className="text-sm text-slate-600">{description}</p>
              )}
            </div>
            {status && (
              <Badge variant="outline" className="ml-3">
                {status}
              </Badge>
            )}
          </div>
          
          {children && (
            <div data-b44-sync="true" className="mt-4">
              {children}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
