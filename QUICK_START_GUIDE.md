# Account Tier Management - Quick Start Guide

## What's New?

You can now set custom asset limits for specific organizations/accounts without requiring a subscription change. Perfect for demo accounts for prospective clients!

## Quick Setup

### Step 1: Access Admin Settings
1. Log in with your admin account
2. Navigate to the **Admin Dashboard**
3. Click on **Settings** tab

### Step 2: Create a Demo Tier
1. In the "Account Tier Management" section, click **"Add Tier"**
2. Fill in the form:
   - **Organization**: Select the demo account (e.g., "Acme Corp Demo")
   - **Tier Name**: Name it (e.g., "Demo Tier", "Sales Demo", "Premium Demo")
   - **Max Assets**: Set the limit (e.g., 50, 100, 200)
   - **Description**: Optional notes (e.g., "For sales demo - prospect evaluation")
3. Click **"Create"**

**That's it!** The organization now has a custom limit.

## Real-World Example

### Scenario: Demonstrating to Prospect "Acme Corp"
```
Organization: Acme Corp Demo Account
Tier Name: Sales Demo Tier
Max Assets: 100 assets
Description: Demonstration account for Acme Corp sales pitch

Result: Acme Corp Demo users can now create up to 100 assets
(instead of the default 5 for trial accounts)
```

## How It Works for Users

When a user logs into an account with a custom tier set:

### In Dashboard Settings
- They'll see a **"Custom Tier"** badge next to "Assets Used"
- Asset limit shows their custom number
- Progress bar reflects their actual limit

### When Creating Assets
- They can create up to the custom limit
- If they reach the limit, they'll see a message:
  > "Your custom tier is limited to 100 assets. Please contact support or upgrade to add more."

## Managing Tiers

### View All Tiers
All tiers appear in the table below the "Add Tier" button. You can:
- **Search** by organization name or tier name
- **Edit** a tier (click the pencil icon)
- **Delete** a tier (click the trash icon)

### Edit a Tier
1. Click the **edit icon** (pencil) on any tier row
2. Change the max assets or description
3. Click **"Update"**

The new limit takes effect immediately!

### Delete a Tier
1. Click the **delete icon** (trash) on any tier row
2. Confirm the deletion
3. The organization reverts to its plan limits

## Common Use Cases

### Demo/Trial Account
```
Tier Name: Demo
Max Assets: 50
Notes: 30-day demo for prospect evaluation
```

### Premium Demo
```
Tier Name: Premium Demo
Max Assets: 200
Notes: Extended demo showing enterprise features
```

### Trial Extension
```
Tier Name: Extended Trial
Max Assets: 20
Notes: Existing customer trial extension
```

## Tips & Best Practices

✅ **DO:**
- Use clear tier names (e.g., "Sales Demo", "Client Trial")
- Add notes explaining the reason for the custom tier
- Set realistic limits based on demonstration needs
- Remove tiers after demo period ends

❌ **DON'T:**
- Give unlimited assets to trial accounts (use Pro plan instead)
- Forget to document the tier purpose
- Leave unused tiers in the system

## Support & Troubleshooting

**Q: Can I change the max assets for a tier?**
A: Yes! Click edit and change the number. Changes take effect immediately.

**Q: What happens if I delete a tier?**
A: The organization reverts to its subscription plan limits.

**Q: Can a user see their tier name?**
A: They see a "Custom Tier" badge, but not the tier name. This is by design.

**Q: Can I set different tiers for different users in the same org?**
A: No, the limit is per organization. All users in that org share the same limit.

**Q: How many demo tiers can I create?**
A: Unlimited! Create as many as you need.

## What This Replaces

Before this feature, you would have had to:
- Upgrade users to a higher subscription plan
- Wait for billing cycles
- Pay for extra features they didn't need

Now you can:
- Set custom limits instantly
- Create multiple demo accounts with different limits
- No subscription changes needed
- No additional costs

## Questions?

Refer to the detailed documentation in `ACCOUNT_TIER_MANAGEMENT.md` for technical details, or contact your development team.

---

**Ready to create your first demo tier?**
Go to Admin Dashboard → Settings → Account Tier Management → Add Tier

Good luck with your client demos! 🚀
