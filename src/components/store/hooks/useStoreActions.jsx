import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Custom hook for store purchase actions
 * Handles both points and Stripe purchases with proper error handling
 */
export function useStoreActions() {
  const queryClient = useQueryClient();

  const invalidateStoreQueries = () => {
    queryClient.invalidateQueries(['user-points']);
    queryClient.invalidateQueries(['user-inventory']);
    queryClient.invalidateQueries(['store-items']);
  };

  // Purchase with points
  const purchasePointsMutation = useMutation({
    mutationFn: async (item) => {
      const response = await base44.functions.invoke('purchaseWithPoints', {
        itemId: item.id
      });
      return response.data;
    },
    onSuccess: (data) => {
      invalidateStoreQueries();
      toast.success(`${data.item.name} added to your inventory! 🎉`);
    },
    onError: (error) => {
      const msg = error.response?.data?.error || 'Purchase failed';
      toast.error(msg);
    }
  });

  // Purchase with Stripe
  const purchaseStripeMutation = useMutation({
    mutationFn: async (item) => {
      const response = await base44.functions.invoke('createStoreCheckout', {
        itemId: item.id
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      const msg = error.response?.data?.error || 'Checkout failed';
      toast.error(msg);
    }
  });

  // Combined purchase handler
  const purchase = (item, type) => {
    if (type === 'points') {
      purchasePointsMutation.mutate(item);
    } else {
      purchaseStripeMutation.mutate(item);
    }
  };

  return {
    purchasePointsMutation,
    purchaseStripeMutation,
    purchase,
    isPurchasing: purchasePointsMutation.isLoading || purchaseStripeMutation.isLoading,
    invalidateStoreQueries
  };
}

export default useStoreActions;