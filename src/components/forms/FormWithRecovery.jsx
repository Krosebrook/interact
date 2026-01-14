import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Form wrapper with automatic session recovery
 * Saves state periodically, recovers on reload
 */
export default function FormWithRecovery({ formId, initialData, onSubmit, children }) {
  const [formData, setFormData] = useState(initialData || {});
  const [hasRecovery, setHasRecovery] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveredData, setRecoveredData] = useState(null);

  // Check for recovery data on mount
  useEffect(() => {
    const checkRecovery = async () => {
      const response = await base44.functions.invoke('sessionRecovery', {
        action: 'recover',
        formId
      });

      if (response.data.recovered) {
        setRecoveredData(response.data.data);
        setHasRecovery(true);
        setShowRecoveryDialog(true);
      }
    };

    checkRecovery();
  }, [formId]);

  // Auto-save form state periodically
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      try {
        await base44.functions.invoke('sessionRecovery', {
          action: 'save',
          formId,
          formData
        });
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [formId, formData]);

  const handleRecover = async () => {
    setFormData(recoveredData);
    setShowRecoveryDialog(false);
    toast.success('Form data recovered from previous session');

    // Clear recovery data
    await base44.functions.invoke('sessionRecovery', {
      action: 'discard',
      formId
    });
  };

  const handleDiscard = async () => {
    setShowRecoveryDialog(false);
    setHasRecovery(false);

    // Clear recovery data
    await base44.functions.invoke('sessionRecovery', {
      action: 'discard',
      formId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await onSubmit(formData);

      // Clear recovery data on successful submit
      await base44.functions.invoke('sessionRecovery', {
        action: 'discard',
        formId
      });
    } catch (error) {
      // Form data remains for recovery
      toast.error('Form submission failed - data saved for recovery');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {children({ formData, setFormData })}
        <Button type="submit" className="w-full">Submit</Button>
      </form>

      {/* Recovery Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Form Recovery Available
          </DialogTitle>
          <DialogDescription>
            We found a previous version of your form that wasn't submitted. Would you like to recover it?
          </DialogDescription>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="flex-1"
            >
              Start Fresh
            </Button>
            <Button
              onClick={handleRecover}
              className="flex-1 gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Recover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}