# Point Store - Feature Specification
## Employee Engagement Platform - Intinc

---

## 1. Overview

### 1.1 Purpose
The Point Store allows employees to spend earned points on avatar customizations, power-ups, and exclusive items. Premium items can be purchased with real money via Stripe integration.

### 1.2 Business Goals
- **Engagement Loop**: Create a compelling reason to earn points
- **Personalization**: Let employees express themselves
- **Revenue Option**: Premium items for additional revenue
- **Fun Factor**: Add gamification elements that drive participation

---

## 2. Database Schema

### Entity: `StoreItem`
```json
{
  "name": "StoreItem",
  "properties": {
    "name": { "type": "string", "description": "Item name" },
    "description": { "type": "string", "description": "Item description" },
    "category": {
      "type": "string",
      "enum": [
        "avatar_hat",
        "avatar_glasses",
        "avatar_accessory",
        "avatar_background",
        "avatar_frame",
        "avatar_effect",
        "power_up",
        "badge",
        "title",
        "theme",
        "donation"
      ]
    },
    "subcategory": { "type": "string" },
    "image_url": { "type": "string" },
    "preview_url": { "type": "string", "description": "Animated preview" },
    "rarity": {
      "type": "string",
      "enum": ["common", "uncommon", "rare", "epic", "legendary"],
      "default": "common"
    },
    "pricing": {
      "type": "object",
      "properties": {
        "points_cost": { "type": "number", "description": "Cost in points" },
        "money_cost_cents": { "type": "number", "description": "USD cents" },
        "stripe_price_id": { "type": "string" },
        "purchase_type": {
          "type": "string",
          "enum": ["points_only", "money_only", "both"],
          "default": "points_only"
        }
      }
    },
    "availability": {
      "type": "object",
      "properties": {
        "is_available": { "type": "boolean", "default": true },
        "stock_quantity": { "type": "number", "description": "null = unlimited" },
        "start_date": { "type": "string", "format": "date-time" },
        "end_date": { "type": "string", "format": "date-time" },
        "is_seasonal": { "type": "boolean", "default": false },
        "season_name": { "type": "string" }
      }
    },
    "requirements": {
      "type": "object",
      "properties": {
        "min_level": { "type": "number" },
        "required_badge_ids": { "type": "array", "items": { "type": "string" } },
        "min_tenure_days": { "type": "number" }
      }
    },
    "effects": {
      "type": "object",
      "description": "For power-ups",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["point_multiplier", "xp_boost", "recognition_boost", "visibility_boost"]
        },
        "multiplier": { "type": "number" },
        "duration_hours": { "type": "number" }
      }
    },
    "purchase_count": { "type": "number", "default": 0 },
    "is_featured": { "type": "boolean", "default": false },
    "sort_order": { "type": "number", "default": 0 }
  },
  "required": ["name", "category", "pricing"]
}
```

### Entity: `UserInventory`
```json
{
  "name": "UserInventory",
  "properties": {
    "user_email": { "type": "string" },
    "item_id": { "type": "string" },
    "item_name": { "type": "string" },
    "item_category": { "type": "string" },
    "quantity": { "type": "number", "default": 1 },
    "acquired_at": { "type": "string", "format": "date-time" },
    "acquisition_type": {
      "type": "string",
      "enum": ["points", "purchase", "reward", "gift", "promotion"],
      "default": "points"
    },
    "is_equipped": { "type": "boolean", "default": false },
    "equipped_slot": { "type": "string" },
    "transaction_id": { "type": "string" },
    "expires_at": { "type": "string", "format": "date-time" }
  },
  "required": ["user_email", "item_id"]
}
```

### Entity: `UserAvatar`
```json
{
  "name": "UserAvatar",
  "properties": {
    "user_email": { "type": "string" },
    "equipped_items": {
      "type": "object",
      "properties": {
        "hat": { "type": "string" },
        "glasses": { "type": "string" },
        "accessory": { "type": "string" },
        "background": { "type": "string" },
        "frame": { "type": "string" },
        "effect": { "type": "string" }
      }
    },
    "active_power_ups": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "item_id": { "type": "string" },
          "type": { "type": "string" },
          "multiplier": { "type": "number" },
          "activated_at": { "type": "string", "format": "date-time" },
          "expires_at": { "type": "string", "format": "date-time" }
        }
      }
    },
    "custom_title": { "type": "string" },
    "selected_theme": { "type": "string" }
  },
  "required": ["user_email"]
}
```

### Entity: `StoreTransaction`
```json
{
  "name": "StoreTransaction",
  "properties": {
    "user_email": { "type": "string" },
    "item_id": { "type": "string" },
    "item_name": { "type": "string" },
    "transaction_type": {
      "type": "string",
      "enum": ["points", "stripe", "gift", "refund"]
    },
    "points_spent": { "type": "number" },
    "money_spent_cents": { "type": "number" },
    "stripe_payment_intent_id": { "type": "string" },
    "stripe_checkout_session_id": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["pending", "completed", "failed", "refunded"],
      "default": "pending"
    },
    "quantity": { "type": "number", "default": 1 }
  },
  "required": ["user_email", "item_id", "transaction_type"]
}
```

---

## 3. User Flows

### 3.1 Browse & Purchase Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    POINT STORE                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💰 Your Balance: 2,450 points                    [My Inventory] │
│                                                                  │
│  CATEGORIES:                                                     │
│  [All] [Hats] [Glasses] [Backgrounds] [Effects] [Power-Ups]     │
│                                                                  │
│  FILTERS: [Affordable] [Rarity ▼] [New] [Limited Time]          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🌟 FEATURED                                              │    │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │    │
│  │ │ 🎩      │ │ 🕶️      │ │ ⚡      │                     │    │
│  │ │ Top Hat │ │ Shades  │ │ 2X Boost│                     │    │
│  │ │ 500 pts │ │ $4.99   │ │ 200 pts │                     │    │
│  │ │ [EPIC]  │ │ [RARE]  │ │ [24hr]  │                     │    │
│  │ └─────────┘ └─────────┘ └─────────┘                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ALL ITEMS                                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Item    │ │ Item    │ │ Item    │ │ Item    │              │
│  │ 100 pts │ │ 150 pts │ │ 200 pts │ │ OWNED ✓ │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Item Detail & Purchase

```
┌─────────────────────────────────────────────────────────────────┐
│                    ITEM DETAIL                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │                     │  │ 🎩 Golden Top Hat                │  │
│  │    [ANIMATED        │  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │     PREVIEW]        │  │                                  │  │
│  │                     │  │ ⭐ LEGENDARY                     │  │
│  │                     │  │                                  │  │
│  │                     │  │ Stand out with this dazzling    │  │
│  │                     │  │ golden top hat. Sparkle effects │  │
│  │                     │  │ included!                        │  │
│  │                     │  │                                  │  │
│  │                     │  │ 📊 Owned by 23 people           │  │
│  │                     │  │ 🔒 Requires Level 10            │  │
│  │                     │  │                                  │  │
│  │                     │  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │                     │  │                                  │  │
│  │                     │  │ 💰 1,000 points                  │  │
│  │                     │  │   - OR -                         │  │
│  │                     │  │ 💳 $9.99                         │  │
│  │                     │  │                                  │  │
│  │                     │  │ [Buy with Points] [Buy with $]  │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Avatar Customization

```
┌─────────────────────────────────────────────────────────────────┐
│                    MY AVATAR                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  EQUIPPED ITEMS                        │
│  │                     │  ━━━━━━━━━━━━━━━                        │
│  │    [LIVE AVATAR     │                                        │
│  │     PREVIEW]        │  🎩 Hat: Golden Top Hat    [Change]    │
│  │                     │  🕶️ Glasses: Cyber Shades  [Change]    │
│  │                     │  🌟 Effect: Sparkle Aura   [Change]    │
│  │                     │  🖼️ Background: Sunset     [Change]    │
│  │                     │  🔲 Frame: Diamond Border  [Change]    │
│  │                     │                                        │
│  │                     │  ACTIVE POWER-UPS                      │
│  │                     │  ━━━━━━━━━━━━━━━━━                      │
│  │                     │  ⚡ 2X Points (23:45 left)             │
│  │                     │                                        │
│  └─────────────────────┘  [Save] [Reset to Default]             │
│                                                                  │
│  MY INVENTORY (47 items)                                        │
│  [Hats (12)] [Glasses (8)] [Effects (5)] [Backgrounds (15)]...  │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Item    │ │ Item    │ │ Item    │ │ Item    │              │
│  │ [Equip] │ │[Equipped]│ │ [Equip] │ │ [Equip] │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Stripe Integration

### 4.1 Backend Function: Create Checkout

```javascript
// functions/createStoreCheckout.js
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

    // Get item details
    const items = await base44.entities.StoreItem.filter({ id: itemId });
    const item = items[0];
    
    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.pricing.purchase_type === 'points_only') {
      return Response.json({ error: 'This item cannot be purchased with money' }, { status: 400 });
    }

    // Check availability
    if (!item.availability?.is_available) {
      return Response.json({ error: 'Item not available' }, { status: 400 });
    }

    if (item.availability?.stock_quantity !== null && item.availability.stock_quantity < quantity) {
      return Response.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // Check requirements
    if (item.requirements?.min_level) {
      const userPoints = await base44.entities.UserPoints.filter({ user_email: user.email });
      if ((userPoints[0]?.level || 1) < item.requirements.min_level) {
        return Response.json({ error: `Requires level ${item.requirements.min_level}` }, { status: 400 });
      }
    }

    // Create pending transaction
    const transaction = await base44.asServiceRole.entities.StoreTransaction.create({
      user_email: user.email,
      item_id: itemId,
      item_name: item.name,
      transaction_type: 'stripe',
      money_spent_cents: item.pricing.money_cost_cents * quantity,
      quantity,
      status: 'pending'
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            images: item.image_url ? [item.image_url] : []
          },
          unit_amount: item.pricing.money_cost_cents
        },
        quantity
      }],
      success_url: `${req.headers.get('origin')}/PointStore?success=true&transaction=${transaction.id}`,
      cancel_url: `${req.headers.get('origin')}/PointStore?canceled=true`,
      metadata: {
        user_email: user.email,
        item_id: itemId,
        transaction_id: transaction.id
      },
      customer_email: user.email
    });

    // Update transaction with session ID
    await base44.asServiceRole.entities.StoreTransaction.update(transaction.id, {
      stripe_checkout_session_id: session.id
    });

    return Response.json({ 
      checkoutUrl: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

### 4.2 Backend Function: Stripe Webhook

```javascript
// functions/storeWebhook.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_SIGNING_SECRET')
    );
  } catch (err) {
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_email, item_id, transaction_id } = session.metadata;

    // Update transaction
    await base44.asServiceRole.entities.StoreTransaction.update(transaction_id, {
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent
    });

    // Get item details
    const items = await base44.asServiceRole.entities.StoreItem.filter({ id: item_id });
    const item = items[0];

    // Add to user inventory
    await base44.asServiceRole.entities.UserInventory.create({
      user_email,
      item_id,
      item_name: item.name,
      item_category: item.category,
      quantity: 1,
      acquisition_type: 'purchase',
      transaction_id,
      acquired_at: new Date().toISOString()
    });

    // Update item purchase count
    await base44.asServiceRole.entities.StoreItem.update(item_id, {
      purchase_count: (item.purchase_count || 0) + 1
    });

    // Decrease stock if limited
    if (item.availability?.stock_quantity !== null) {
      await base44.asServiceRole.entities.StoreItem.update(item_id, {
        'availability.stock_quantity': item.availability.stock_quantity - 1
      });
    }

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      user_email,
      title: 'Purchase Complete!',
      message: `You now own ${item.name}! Check your inventory.`,
      type: 'success',
      url: '/PointStore?tab=inventory'
    });
  }

  return Response.json({ received: true });
});
```

### 4.3 Backend Function: Purchase with Points

```javascript
// functions/purchaseWithPoints.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity = 1 } = await req.json();

    // Get item
    const items = await base44.entities.StoreItem.filter({ id: itemId });
    const item = items[0];
    
    if (!item || item.pricing.purchase_type === 'money_only') {
      return Response.json({ error: 'Cannot purchase with points' }, { status: 400 });
    }

    const totalCost = item.pricing.points_cost * quantity;

    // Get user points
    const userPoints = await base44.entities.UserPoints.filter({ user_email: user.email });
    const points = userPoints[0];
    
    if (!points || points.available_points < totalCost) {
      return Response.json({ 
        error: 'Insufficient points',
        required: totalCost,
        available: points?.available_points || 0
      }, { status: 400 });
    }

    // Deduct points
    await base44.asServiceRole.entities.UserPoints.update(points.id, {
      available_points: points.available_points - totalCost,
      points_history: [
        ...(points.points_history || []).slice(-99),
        {
          amount: -totalCost,
          reason: `Purchased ${item.name}`,
          source: 'store_purchase',
          timestamp: new Date().toISOString()
        }
      ]
    });

    // Create transaction
    const transaction = await base44.asServiceRole.entities.StoreTransaction.create({
      user_email: user.email,
      item_id: itemId,
      item_name: item.name,
      transaction_type: 'points',
      points_spent: totalCost,
      quantity,
      status: 'completed'
    });

    // Add to inventory
    await base44.asServiceRole.entities.UserInventory.create({
      user_email: user.email,
      item_id: itemId,
      item_name: item.name,
      item_category: item.category,
      quantity,
      acquisition_type: 'points',
      transaction_id: transaction.id,
      acquired_at: new Date().toISOString(),
      expires_at: item.effects?.duration_hours 
        ? new Date(Date.now() + item.effects.duration_hours * 3600000).toISOString()
        : null
    });

    // Update purchase count
    await base44.asServiceRole.entities.StoreItem.update(itemId, {
      purchase_count: (item.purchase_count || 0) + quantity
    });

    return Response.json({ 
      success: true,
      newBalance: points.available_points - totalCost,
      item: item.name
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## 5. Item Categories

### 5.1 Avatar Customizations

| Category | Examples | Price Range |
|----------|----------|-------------|
| Hats | Top hat, Crown, Beanie, Party hat | 100-1000 pts |
| Glasses | Sunglasses, Monocle, VR headset | 50-500 pts |
| Accessories | Bow tie, Earrings, Badge | 25-250 pts |
| Backgrounds | Gradient, Scene, Animated | 200-2000 pts |
| Frames | Gold, Diamond, Animated | 300-3000 pts |
| Effects | Sparkle, Fire, Rainbow aura | 500-5000 pts |

### 5.2 Power-Ups

| Power-Up | Effect | Duration | Cost |
|----------|--------|----------|------|
| Point Doubler | 2x points earned | 24 hours | 200 pts |
| XP Boost | 1.5x XP | 48 hours | 150 pts |
| Recognition Spotlight | Featured position | 7 days | 500 pts |
| Visibility Boost | Highlighted in feed | 24 hours | 100 pts |

### 5.3 Premium (Money Only)

| Item | Price | Notes |
|------|-------|-------|
| Legendary Pack | $14.99 | 3 random legendary items |
| Season Pass | $9.99/month | Early access + exclusives |
| Charity Bundle | $4.99 | Donate portion to charity |

---

## 6. UI Components

```
components/store/
├── PointStore.jsx              # Main store page
├── StoreHeader.jsx             # Balance + navigation
├── StoreCategoryNav.jsx        # Category tabs
├── StoreItemGrid.jsx           # Item grid display
├── StoreItemCard.jsx           # Individual item card
├── StoreItemDetail.jsx         # Item detail modal
├── StorePurchaseFlow.jsx       # Purchase confirmation
├── StoreCheckoutButton.jsx     # Points or Stripe
├── UserInventory.jsx           # User's owned items
├── AvatarCustomizer.jsx        # Equip items
├── AvatarPreview.jsx           # Live avatar preview
├── PowerUpStatus.jsx           # Active power-ups
├── StoreTransaction.jsx        # Transaction history
└── StoreAdmin.jsx              # Admin: manage items
```

---

## 7. Security Considerations

### 7.1 Purchase Validation

```javascript
// Server-side validation for all purchases
const validatePurchase = async (user, item, quantity) => {
  // 1. Item exists and available
  if (!item || !item.availability?.is_available) {
    throw new Error('Item not available');
  }

  // 2. Stock check
  if (item.availability?.stock_quantity !== null) {
    if (item.availability.stock_quantity < quantity) {
      throw new Error('Insufficient stock');
    }
  }

  // 3. User requirements
  if (item.requirements?.min_level) {
    const userLevel = await getUserLevel(user.email);
    if (userLevel < item.requirements.min_level) {
      throw new Error(`Requires level ${item.requirements.min_level}`);
    }
  }

  // 4. Already owned (for non-consumables)
  if (!['power_up', 'donation'].includes(item.category)) {
    const existing = await checkInventory(user.email, item.id);
    if (existing) {
      throw new Error('Already owned');
    }
  }

  // 5. Daily purchase limits
  const todayPurchases = await getTodayPurchases(user.email);
  if (todayPurchases >= 10) {
    throw new Error('Daily purchase limit reached');
  }

  return true;
};
```

### 7.2 Stripe Security

- Webhook signature verification
- Idempotency keys for retries
- No client-side price manipulation
- All prices from server/Stripe

---

## 8. Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| `store.enabled` | Master toggle | true |
| `store.stripe_enabled` | Real money purchases | false |
| `store.power_ups` | Power-up items | true |
| `store.seasonal` | Seasonal items | true |
| `store.gifting` | Gift items to others | false |
| `store.trading` | Trade between users | false |
| `store.auctions` | Auction rare items | false |

---

## 9. Analytics

### 9.1 Key Metrics

- **Conversion Rate**: Browsers → Purchasers
- **Popular Items**: By purchase count
- **Revenue**: Points spent, $ spent
- **Point Economy Health**: Earn vs Spend ratio
- **Power-Up Usage**: Which power-ups are popular
- **User Engagement**: Customization adoption rate