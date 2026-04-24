# Account Tier Management Feature - Implementation Guide

## Overview
This feature allows admin users to set custom asset limits for specific organizations/accounts. This is useful for:
- Creating demo accounts with higher limits for prospect demonstrations
- Trial accounts that need extended capabilities
- Custom business arrangements with specific clients

## Database Schema

### New Table: `account_tiers`
```sql
CREATE TABLE public.account_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  max_assets INTEGER NOT NULL DEFAULT 5,
  tier_name TEXT NOT NULL DEFAULT 'custom',
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Key Points:**
- `org_id` is UNIQUE to ensure one tier per organization
- Cascading delete ensures data cleanup when organization is deleted
- `created_by` tracks which admin created the tier for audit purposes
- RLS policies ensure only admins can create/edit/delete tiers
- Regular users can view their own org's tier for display purposes

## How It Works

### 1. Asset Creation Flow
```
User clicks "Add Asset"
       ↓
System fetches subscription status
       ↓
getEffectiveAssetLimit() called with (orgId, subscriptionStatus)
       ↓
Check: Does account_tiers row exist for this org?
       ├─ YES → Use custom limit
       └─ NO → Use plan limit (trial=5, starter=100, pro=∞)
       ↓
Compare current asset count against limit
       ├─ Under limit → Allow creation
       └─ At/over limit → Show error, prevent creation
```

### 2. Limit Hierarchy
```
Custom Tier (if exists)
    ↓ (if not exists)
Subscription Plan Limit (trial/starter/pro)
```

## API Functions

### `getCustomAssetLimit(orgId: string): Promise<number | null>`
Fetches the custom asset limit for an organization.
- Returns the `max_assets` value if a custom tier exists
- Returns `null` if no custom tier found
- Handles errors gracefully, logs to console

### `getEffectiveAssetLimit(orgId: string, subscriptionStatus: SubscriptionStatus): Promise<number>`
Gets the effective limit combining both custom and plan limits.
- Checks for custom tier first
- Falls back to plan limit if no custom tier
- Always returns a number (never null)

### `getPlan(status: SubscriptionStatus): Object`
Returns the plan definition (unchanged from before).
```typescript
{
  maxAssets: number,
  maxIssues: number,
  features: string[],
  price: number
}
```

## Admin UI - Settings Tab

### Accessing Tier Management
1. Log in as admin user
2. Navigate to "Settings" tab in Admin Dashboard
3. "Account Tier Management" section appears at the top

### Creating a New Tier
1. Click "Add Tier" button
2. Select target organization from dropdown
3. Enter tier name (e.g., "Demo Tier", "Premium Demo")
4. Set maximum assets number
5. Optional: Add description/notes
6. Click "Create" to save

**Example:**
- Organization: "Acme Corp Demo"
- Tier Name: "Demo Tier"
- Max Assets: 50
- Description: "Demo account for sales demo to prospect"

### Editing a Tier
1. Click edit icon (pencil) on tier row
2. Update tier name, max assets, or description
3. Note: Organization cannot be changed after creation
4. Click "Update" to save

### Deleting a Tier
1. Click delete icon (trash) on tier row
2. Confirm deletion
3. Organization reverts to plan limits immediately

### Searching/Filtering
- Search by organization name
- Search by tier name
- Real-time filtering as you type

## User Experience

### In Settings Page
When a custom tier is set for a user's organization:
- "Custom Tier" badge appears next to "Assets Used"
- Asset limit shows the custom number (not plan limit)
- Progress bar reflects actual limit

Example:
```
Assets Used                     [Custom Tier badge]
42                              
Limit: 50

Progress bar showing 42/50 usage
```

### In Asset Creation
If limit is reached with custom tier:
```
"Limit Reached"
"Your custom tier is limited to 50 assets. 
 Please contact support or upgrade to add more."
```

## Database Queries Reference

### Find all custom tiers with organization names
```sql
SELECT 
  at.id,
  at.org_id,
  o.name as org_name,
  at.max_assets,
  at.tier_name,
  at.description,
  at.created_at
FROM account_tiers at
JOIN organizations o ON o.id = at.org_id
ORDER BY at.created_at DESC;
```

### Find organizations WITHOUT custom tiers
```sql
SELECT o.id, o.name
FROM organizations o
LEFT JOIN account_tiers at ON o.id = at.org_id
WHERE at.id IS NULL;
```

### Find custom tiers created by specific admin
```sql
SELECT * FROM account_tiers
WHERE created_by = 'admin-user-id'
ORDER BY created_at DESC;
```

## Testing Checklist

- [ ] Create custom tier for test organization
- [ ] Verify admin can see tier in settings
- [ ] Log in as user in that org
- [ ] Verify "Custom Tier" badge appears in Settings page
- [ ] Create assets up to custom limit
- [ ] Verify error when exceeding custom limit
- [ ] Edit custom tier (change max assets)
- [ ] Verify updated limit applies immediately
- [ ] Delete custom tier
- [ ] Verify user reverts to plan limits
- [ ] Test with trial org (5 asset default)
- [ ] Test with starter org (100 asset default)
- [ ] Test with pro org (unlimited default)

## Migration Notes

The migration file `20260424_create_account_tiers.sql` should be run against the Supabase database:

```bash
# Via Supabase CLI:
supabase migration up

# Or copy-paste the SQL into Supabase SQL Editor
```

This creates:
- Table structure
- Indexes
- RLS policies
- Comments/documentation

## Error Handling

### Common Error Scenarios

**Scenario 1: Custom limit doesn't exist**
- Function returns null
- System uses plan limit instead
- No error shown to user

**Scenario 2: Custom limit fetch fails**
- Error logged to console
- Function returns null gracefully
- System falls back to plan limit

**Scenario 3: Asset creation validation fails**
- User sees clear error message
- Message indicates whether limit is custom or plan-based
- Asset creation is blocked

**Scenario 4: Admin deletes tier while user is viewing**
- User will see old cached limit until page refresh
- Next asset creation will use plan limit (graceful degradation)

## Performance Considerations

- Custom tier lookup is single database query via `maybeSingle()`
- Query is indexed on `org_id` for fast retrieval
- Result can be cached in component state to reduce queries
- No N+1 queries (limit per organization, not per asset)

## Security

### Row Level Security
- Admins (checked via `admins` table): Full CRUD access
- Regular users: Read-only access to their own org's tier
- Cannot modify tiers via direct SQL access outside RLS

### Audit Trail
- `created_by` field tracks which admin set the tier
- `created_at` and `updated_at` timestamps for history
- Supabase audit logs capture all changes

## Future Enhancements

Potential improvements:
1. Tier history/changelog
2. Bulk tier updates
3. Tier templates
4. Expiring custom tiers (e.g., 30-day demo tier)
5. Custom tier notifications (when org is close to limit)
6. Analytics on custom tier usage
7. Tier tier approval workflow
