# Enhanced Rewards Store Documentation

## Overview
The Rewards Store has been upgraded to support multiple reward types beyond physical items: virtual items (badges, profile flair), team lunch vouchers, and charitable donations. High-value redemptions now require admin approval.

## Features

### Reward Categories

#### 1. **Virtual Items** (Stars ✨)
- Custom badges (rare, legendary)
- Profile titles
- Avatar borders
- Nameplate colors
- Emoji reactions
- **Key Benefit**: Instantly applied to user profiles, permanent display

**Configuration:**
```json
{
  "item_type": "virtual",
  "virtual_item_config": {
    "type": "badge|profile_title|avatar_border|nameplate_color|emoji_reaction",
    "design_url": "https://...",
    "rarity": "common|uncommon|rare|legendary"
  }
}
```

#### 2. **Team Lunch Vouchers** (👥)
- Dollar-value vouchers for team meals
- Covers configurable number of people
- Restaurant category filters (fast_casual, fine_dining, vegetarian)
- **Key Benefit**: Team bonding, employee wellness

**Configuration:**
```json
{
  "item_type": "team_meal",
  "team_lunch_config": {
    "value": 100,
    "team_size": 6,
    "restaurant_category": "any|fast_casual|fine_dining|vegetarian"
  }
}
```

#### 3. **Charitable Donations** (❤️)
- Points converted to real-world impact
- Partner with multiple charities
- Impact metrics (e.g., "Provides 10 meals")
- Corporate matching available
- **Key Benefit**: Social impact, employee satisfaction

**Configuration:**
```json
{
  "item_type": "charitable",
  "charitable_config": {
    "charity_name": "Feeding America",
    "charity_url": "https://...",
    "donation_amount": 50,
    "impact_metric": "Provides 10 meals"
  }
}
```

#### 4. **Physical Items** (Traditional)
- Swag, gift cards, experiences
- Stock management
- Delivery tracking

### Approval Workflow

**Automatic Approval:**
- Items with `requires_approval: false` (default)
- Points deducted immediately
- Virtual items applied instantly

**Admin Approval Required:**
Set `requires_approval: true` and `approval_threshold` (in points)

**Approval Flow:**
1. User submits redemption request
2. `RewardApproval` record created with status "pending"
3. Admin notified via email
4. Admin reviews in `RedemptionAdmin` page
5. Admin approves/rejects with notes
6. Points deducted only on approval
7. User notified of status

**Approval Check Criteria:**
- Remaining monthly budget
- Per-user redemption limits (`max_per_month`, `max_per_user`)
- Stock availability
- User's total points balance

## Database Schema

### StoreItem
```
- item_name (required)
- points_cost (required)
- item_type: physical|virtual|experiential|charitable|team_meal
- category: virtual|team_lunch|donation|experience|time_off|swag|gift_card
- requires_approval: boolean
- approval_threshold: number
- max_per_user: number (monthly)
- max_per_month: number
- stock_quantity: -1 for unlimited
- virtual_item_config: object
- charitable_config: object
- team_lunch_config: object
```

### RewardRedemption
```
- user_email
- store_item_id
- points_spent
- status: pending|approved|rejected|fulfilled|cancelled
- request_date
- reviewed_date
- reviewed_by (admin)
- admin_notes
- fulfillment_details
```

### RewardApproval (High-Value Only)
```
- redemption_id
- user_email
- status: pending|approved|rejected|fulfilled
- budget_available
- user_monthly_redeemed
- priority: low|normal|high
```

## User Experience

### Redemption Flow
1. User browses store by category
2. Sees points cost and item details
3. Clicks "Redeem"
4. Reviews summary and adds optional notes
5. Confirms redemption
6. If requires approval: message "Pending admin review"
7. If auto-approved: immediate success notification + virtual items applied

### Virtual Item Application
- Badges added to profile automatically
- Profile title updates immediately
- Avatar border visible to other users
- Permanent display (user can manage which ones featured)

## Admin Management

### Creating Items
Navigate to Store Item Admin panel:

**Virtual Badge Example:**
```
Name: Speedster Badge
Category: virtual
Points: 50
Type: virtual
Rarity: rare
Design URL: https://...
Stock: unlimited
Auto-approve: ✓
```

**Team Lunch Voucher Example:**
```
Name: $100 Team Lunch for 6
Category: team_lunch
Points: 400
Type: team_meal
Value: $100
Team Size: 6
Category: fast_casual
Stock: 10
Requires Approval: ✓ (>350 points)
```

**Charitable Donation Example:**
```
Name: $50 Donation - Feeding America
Category: donation
Points: 500
Type: charitable
Charity: Feeding America
Amount: $50
Impact: Provides 10 meals
Stock: unlimited
Auto-approve: ✓
```

### Approval Queue
- Filter by: pending, user, item, date range
- Sort by: priority, date, points
- Bulk approve/reject
- Add notes and fulfillment details

### Analytics
Track:
- Most redeemed items
- Approval rate by item
- Budget utilization
- Charitable impact totals
- Team lunch participation

## API Integration

### processRedemption Function
```javascript
POST /api/functions/processRedemption
{
  "store_item_id": "item_123",
  "user_email": "user@company.com"
}

Response:
{
  "success": true,
  "redemption_id": "redemption_456",
  "requires_approval": false,
  "message": "Reward redeemed successfully!"
}
```

## Best Practices

1. **Set Approval Thresholds Wisely**
   - High-value physical items: require approval
   - Virtual badges: auto-approve (low cost, instant delivery)
   - Charitable donations: auto-approve (great for company image)

2. **Monitor Stock**
   - Set realistic stock quantities
   - Use -1 for unlimited virtual items
   - Track physical item inventory manually

3. **Monthly Budgeting**
   - Set reasonable `max_per_month` limits
   - Prevent point hoarding abuse
   - Encourage regular engagement

4. **Charitable Matching**
   - Consider corporate matching programs
   - Publicize total impact regularly
   - Feature top donors on company channels

5. **Fulfillment Process**
   - Approval notes: payment method, address, etc.
   - Fulfillment details: tracking number, delivery date
   - Automate physical item notifications

## Future Enhancements
- [ ] Marketplace (user-to-user trading)
- [ ] Seasonal limited-edition items
- [ ] Subscription rewards (monthly)
- [ ] Tiered rewards (unlock at certain point levels)
- [ ] Custom 3D avatar customization