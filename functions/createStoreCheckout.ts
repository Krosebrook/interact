import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity = 1 } = await req.json();

    if (!itemId) {
      return Response.json({ error: 'Item ID required' }, { status: 400 });
    }

    // Get item
    const items = await base44.entities.StoreItem.filter({ id: itemId });
    const item = items[0];

    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    if (!item.is_available) {
      return Response.json({ error: 'Item not available' }, { status: 400 });
    }

    if (!item.money_cost_cents) {
      return Response.json({ error: 'Item not available for purchase with money' }, { status: 400 });
    }

    // Check stock
    if (item.stock_quantity !== null && item.stock_quantity < quantity) {
      return Response.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // Create pending transaction
    const transaction = await base44.asServiceRole.entities.StoreTransaction.create({
      user_email: user.email,
      item_id: itemId,
      item_name: item.name,
      transaction_type: 'stripe',
      money_spent_cents: item.money_cost_cents * quantity,
      quantity,
      status: 'pending'
    });

    // Create Stripe checkout session
    const origin = req.headers.get('origin') || 'https://app.base44.com';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description || `${item.rarity} ${item.category} item`,
            images: item.image_url ? [item.image_url] : []
          },
          unit_amount: item.money_cost_cents
        },
        quantity
      }],
      success_url: `${origin}/PointStore?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/PointStore?canceled=true`,
      customer_email: user.email,
      metadata: {
        user_email: user.email,
        item_id: itemId,
        transaction_id: transaction.id,
        quantity: String(quantity)
      }
    });

    // Update transaction with session ID
    await base44.asServiceRole.entities.StoreTransaction.update(transaction.id, {
      stripe_checkout_session_id: session.id
    });

    return Response.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});