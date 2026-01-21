import { useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook for handling analytics export with loading states and error handling
 * @returns {object} Export functions and state
 */
export function useAnalyticsExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const exportData = async (format, options = {}) => {
    setIsExporting(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('exportAnalytics', {
        format,
        metrics: options.metrics || ['engagement', 'lifecycle', 'recognition', 'abtest'],
        date_range: options.date_range || 'last_30_days'
      });

      // Create blob and download
      const mimeType = format === 'csv' ? 'text/csv' : 'application/pdf';
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      a.remove();

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting,
    error,
    clearError: () => setError(null)
  };
}