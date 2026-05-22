# Razorpay Integration — Deploy & Test Guide

This integration handles **recurring subscriptions** for QResolve plans (Starter, Pro) via Razorpay. It uses a programmatic plan catalog stored in the `payment_plans` table, so pricing can be updated through the database without code changes.

---

## Architecture overview

```
┌──────────────┐         ┌────────────────────┐         ┌──────────────┐
│ Settings.tsx │ ──────▶ │ Edge Function:     │ ──────▶ │  Razorpay    │
│ (upgrade)    │         │ create-subscription│         │   API        │
└──────────────┘         └────────────────────┘         └──────┬───────┘
       │                                                       │
       │ Razorpay Checkout SDK (popup)                         │
       ▼                                                       │
┌──────────────┐                                               │
│  User pays   │                                               │
└──────────────┘                                               │
                                                               ▼
                          ┌────────────────────┐         ┌──────────────┐
                          │ Edge Function:     │ ◀────── │  Razorpay    │
                          │  webhook handler   │ events  │  webhook     │
                          └─────────┬──────────┘         └──────────────┘
                                    │
                                    ▼
                          ┌────────────────────┐
                          │  subscriptions     │
                          │  table (Supabase)  │
                          └────────────────────┘
```

**Source of truth:** subscription status comes from Razorpay webhooks, never the frontend.

---

## Files added by this integration

| Path | Purpose |
|---|---|
| `supabase/migrations/20260521_razorpay_integration.sql` | Adds Razorpay columns to `subscriptions`, creates `payment_plans` table, seeds Starter + Pro |
| `supabase/functions/_shared/cors.ts` | Shared CORS helpers |
| `supabase/functions/_shared/auth.ts` | Auth context resolver for edge functions |
| `supabase/functions/_shared/razorpay.ts` | Typed Razorpay REST client + webhook signature verifier |
| `supabase/functions/razorpay-sync-plans/index.ts` | Admin function — mirrors `payment_plans` rows into Razorpay |
| `supabase/functions/razorpay-create-subscription/index.ts` | User initiates a subscription |
| `supabase/functions/razorpay-webhook/index.ts` | Public webhook endpoint |
| `supabase/functions/razorpay-cancel-subscription/index.ts` | User cancels their subscription |
| `src/lib/razorpay.ts` | Frontend Razorpay SDK loader |
| `src/hooks/useRazorpayCheckout.ts` | Hook used by Settings page |
| `src/lib/subscription.ts` | Extended with DB plan fetcher + price formatter |
| `src/pages/Settings.tsx` | Billing tab wired to real checkout |

---

## Deployment steps

### 1. Apply the DB migration

Using the Supabase CLI:

```powershell
supabase db push
```

Or via the Supabase dashboard → SQL Editor → paste the contents of `supabase/migrations/20260521_razorpay_integration.sql` and run.

Verify:

```sql
select plan_key, name, amount, razorpay_plan_id from public.payment_plans;
```

You should see two rows (`starter`, `pro`) with `razorpay_plan_id = NULL`. The IDs get filled in by step 4.

### 2. Set Edge Function secrets

In the Supabase dashboard → Project Settings → **Edge Functions** → Secrets, add:

| Name | Value | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_Sri8zskzCyUA08` | Same as `VITE_RAZORPAY_KEY_ID` |
| `RAZORPAY_KEY_SECRET` | _(your test key secret)_ | Never put this in frontend |
| `RAZORPAY_WEBHOOK_SECRET` | _(set after step 5)_ | A random string you generate, e.g. `openssl rand -hex 32` |

Or via CLI:

```powershell
supabase secrets set RAZORPAY_KEY_ID=rzp_test_Sri8zskzCyUA08
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_here
supabase secrets set RAZORPAY_WEBHOOK_SECRET=$(openssl rand -hex 32)
```

### 3. Deploy the Edge Functions

```powershell
supabase functions deploy razorpay-sync-plans
supabase functions deploy razorpay-create-subscription
supabase functions deploy razorpay-cancel-subscription
supabase functions deploy razorpay-webhook --no-verify-jwt
```

> The `--no-verify-jwt` flag on the webhook is **required** — Razorpay can't send a JWT, only its own HMAC signature. Our function verifies that signature internally.

### 4. Sync plans to Razorpay

Once secrets are set and functions deployed, invoke the sync function as an admin user:

```powershell
# Get a session token first (from your app, after logging in as an admin user)
curl -X POST "$env:VITE_SUPABASE_URL/functions/v1/razorpay-sync-plans" `
  -H "Authorization: Bearer YOUR_ADMIN_JWT" `
  -H "apikey: $env:VITE_SUPABASE_PUBLISHABLE_KEY"
```

Expected response:

```json
{
  "synced": [
    { "plan_key": "starter", "razorpay_plan_id": "plan_XXXX", "status": "created" },
    { "plan_key": "pro",     "razorpay_plan_id": "plan_YYYY", "status": "created" }
  ]
}
```

Verify in Razorpay dashboard → Subscriptions → Plans tab, you should see 2 new plans.

### 5. Register the webhook in Razorpay

In Razorpay dashboard → Settings → Webhooks → **Add New Webhook**:

- **Webhook URL**: `https://<your-project>.supabase.co/functions/v1/razorpay-webhook`
- **Secret**: paste the same value you set as `RAZORPAY_WEBHOOK_SECRET` in step 2
- **Active events** — enable:
  - `subscription.activated`
  - `subscription.charged`
  - `subscription.completed`
  - `subscription.cancelled`
  - `subscription.halted`
  - `subscription.paused`
  - `subscription.resumed`
  - `subscription.pending`
  - `payment.failed`

Click "Create Webhook". Razorpay sends a test ping — check the Edge Function logs to confirm it returns 200.

---

## Testing the flow

### Test cards (test mode only)

| Card | Result |
|---|---|
| `4111 1111 1111 1111` (any CVV, future date) | Success |
| `5104 0600 0000 0008` | Mastercard success |
| `4000 0000 0000 0002` | Decline (insufficient funds) |
| `5104 0155 5555 5558` | International, OTP required |

Full list: https://razorpay.com/docs/payments/payments/test-card-details/

### Manual test plan

1. Log in to QResolve as a non-admin org member
2. Go to **Settings → Billing** — you should see Trial, Starter, Pro cards with live prices from `payment_plans`
3. Click **Upgrade** on Starter
4. Razorpay popup opens — use a test card
5. After "Payment Successful" message, watch the Supabase Edge Function logs — you should see `Processed subscription.activated for sub sub_XXX → active`
6. Refresh Settings → Starter should now show "Current Plan" badge
7. Click **Cancel Subscription** → confirm → row should show `cancelled_at` set in DB

### Inspecting subscription state

```sql
select org_id, status, plan_key, razorpay_subscription_id, current_period_end, cancelled_at, last_webhook_event_id
  from public.subscriptions
  order by updated_at desc;
```

---

## Switching to Live mode

When ready to take real payments:

1. In Razorpay dashboard, switch to **Live Mode** (top-right toggle)
2. Generate live API keys (`rzp_live_*`)
3. Update `VITE_RAZORPAY_KEY_ID` in `.env` to the live key
4. Update Supabase secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` to live values
5. Generate a new `RAZORPAY_WEBHOOK_SECRET` and update Supabase + the webhook config in Razorpay live mode
6. Re-run **step 4 (sync plans)** — plans created in test mode are not visible in live mode; the sync function will create fresh live-mode plans and update the `razorpay_plan_id` column
7. Register the webhook URL in live mode webhook settings
8. Rebuild and redeploy frontend so the new `VITE_RAZORPAY_KEY_ID` is baked in

No code changes are needed for the live cutover.

---

## Updating prices later

To change a plan's price:

```sql
update public.payment_plans
   set amount = 599900,                 -- new price in paise (₹5,999)
       razorpay_plan_id = null          -- forces a fresh Razorpay plan to be created
 where plan_key = 'starter';
```

Then call `razorpay-sync-plans` as an admin again. Existing subscriptions keep their original plan (Razorpay plans are immutable); new subscribers get the new price.

> ⚠️ If you want to migrate existing subscribers to the new price, you must cancel + recreate their subscriptions. Razorpay does not support in-place price changes on running subscriptions.

---

## Troubleshooting

**"Plan 'starter' is not yet synced to Razorpay"** — run `razorpay-sync-plans` as an admin.

**Webhook signature errors in logs** — confirm `RAZORPAY_WEBHOOK_SECRET` in Supabase secrets exactly matches the secret in Razorpay's webhook config (no trailing whitespace).

**Test card declined but expected success** — make sure you're in test mode (orange banner in dashboard).

**Subscription stays in `trialing` after successful payment** — check Razorpay → Webhooks → recent deliveries. If a delivery shows failed, click "Resend" after fixing the issue. Common causes: webhook URL wrong, secret mismatch, function not deployed with `--no-verify-jwt`.
