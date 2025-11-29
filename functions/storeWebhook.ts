import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Get raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_SIGNING_SECRET')
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { user_email, item_id, transaction_id, quantity } = session.metadata;

      try {
        // Update transaction
        await base44.asServiceRole.entities.StoreTransaction.update(transaction_id, {
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent
        });

        // Get item
        const items = await base44.asServiceRole.entities.StoreItem.filter({ id: item_id });
        const item = items[0];

        if (!item) {
          console.error('Item not found:', item_id);
          break;
        }

        // Calculate expiration for power-ups
        let expiresAt = null;
        if (item.effect_config?.duration_hours) {
          expiresAt = new Date(Date.now() + item.effect_config.duration_hours * 60 * 60 * 1000).toISOString();
        }

        // Add to inventory
        await base44.asServiceRole.entities.UserInventory.create({
          user_email,
          item_id,
          item_name: item.name,
          item_category: item.category,
          item_rarity: item.rarity,
          acquisition_type: 'stripe',
          transaction_id,
          acquired_at: new Date().toISOString(),
          expires_at: expiresAt,
          is_active: true
        });

        // Update purchase count
        const qty = parseInt(quantity) || 1;
        await base44.asServiceRole.entities.StoreItem.update(item_id, {
          purchase_count: (item.purchase_count || 0) + qty,
          stock_quantity: item.stock_quantity !== null ? item.stock_quantity - qty : null
        });

        // If power-up, activate it
        if (item.category === 'power_up' && item.effect_config) {
          const avatars = await base44.asServiceRole.entities.UserAvatar.filter({ user_email });
          let avatar = avatars[0];

          const powerUp = {
            item_id,
            effect_type: item.effect_config.type,
            multiplier: item.effect_config.multiplier || 1,
            expires_at: expiresAt
          };

          if (avatar) {
            await base44.asServiceRole.entities.UserAvatar.update(avatar.id, {
              active_power_ups: [...(avatar.active_power_ups || []), powerUp],
              last_updated: new Date().toISOString()
            });
          } else {
            await base44.asServiceRole.entities.UserAvatar.create({
              user_email,
              active_power_ups: [powerUp],
              last_updated: new Date().toISOString()
            });
          }
        }

        // Create notification
        await base44.asServiceRole.entities.Notification.create({
          user_email,
          title: 'Purchase Complete! 🎉',
          message: `${item.name} has been added to your inventory.`,
          type: 'success',
          icon: '🛍️'
        });

      } catch (err) {
        console.error('Error processing purchase:', err);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      console.error('Payment failed:', intent.last_payment_error?.message);

      // Find and update transaction if possible
      if (intent.metadata?.transaction_id) {
        await base44.asServiceRole.entities.StoreTransaction.update(intent.metadata.transaction_id, {
          status: 'failed',
          notes: intent.last_payment_error?.message
        });
      }
      break;
    }
  }

  return Response.json({ received: true });
});