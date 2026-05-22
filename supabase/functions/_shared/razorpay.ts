// Shared Razorpay helpers for Supabase Edge Functions (Deno runtime)
//
// Why a fetch-based wrapper instead of the official Node SDK?
// - Razorpay's Node SDK relies on Node-only APIs (Buffer, http) that don't
//   work cleanly in Deno. The Razorpay REST API is small enough that a
//   thin fetch wrapper is simpler and has zero dependencies.
//
// All amounts are in paise (smallest currency unit).
// API docs: https://razorpay.com/docs/api/

const RAZORPAY_BASE = 'https://api.razorpay.com/v1'

function getCreds() {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID')
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set as Edge Function secrets')
  }
  return { keyId, keySecret }
}

function authHeader() {
  const { keyId, keySecret } = getCreds()
  // Basic auth: base64(keyId:keySecret)
  const token = btoa(`${keyId}:${keySecret}`)
  return `Basic ${token}`
}

async function razorpayFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${RAZORPAY_BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': authHeader(),
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  const text = await res.text()
  let body: unknown
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    body = { raw: text }
  }

  if (!res.ok) {
    const err = body as { error?: { description?: string; code?: string } }
    const msg = err?.error?.description ?? `Razorpay ${res.status}`
    throw new RazorpayError(msg, res.status, err?.error?.code, body)
  }

  return body as T
}

export class RazorpayError extends Error {
  status: number
  code?: string
  body: unknown
  constructor(message: string, status: number, code: string | undefined, body: unknown) {
    super(message)
    this.name = 'RazorpayError'
    this.status = status
    this.code = code
    this.body = body
  }
}

// ============================================
// Plans
// ============================================

export interface RazorpayPlanInput {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  item: {
    name: string
    amount: number       // in paise
    currency: string
    description?: string
  }
  notes?: Record<string, string>
}

export interface RazorpayPlan {
  id: string
  entity: 'plan'
  interval: number
  period: string
  item: {
    id: string
    name: string
    amount: number
    currency: string
    description?: string
  }
  notes?: Record<string, string>
  created_at: number
}

export function createPlan(input: RazorpayPlanInput): Promise<RazorpayPlan> {
  return razorpayFetch<RazorpayPlan>('/plans', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getPlan(planId: string): Promise<RazorpayPlan> {
  return razorpayFetch<RazorpayPlan>(`/plans/${planId}`)
}

// ============================================
// Customers
// ============================================

export interface RazorpayCustomerInput {
  name?: string
  email?: string
  contact?: string
  fail_existing?: '0' | '1'
  notes?: Record<string, string>
}

export interface RazorpayCustomer {
  id: string
  entity: 'customer'
  name?: string
  email?: string
  contact?: string
  created_at: number
}

export function createCustomer(input: RazorpayCustomerInput): Promise<RazorpayCustomer> {
  return razorpayFetch<RazorpayCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify({ ...input, fail_existing: input.fail_existing ?? '0' }),
  })
}

// ============================================
// Subscriptions
// ============================================

export interface RazorpaySubscriptionInput {
  plan_id: string
  customer_id?: string
  total_count: number                // Number of billing cycles. 12 = 1 year of monthly.
  customer_notify?: 0 | 1
  quantity?: number
  start_at?: number                  // Unix timestamp
  expire_by?: number
  addons?: Array<{ item: { name: string; amount: number; currency: string } }>
  offer_id?: string
  notes?: Record<string, string>
  notify_info?: { notify_phone?: string; notify_email?: string }
}

export interface RazorpaySubscription {
  id: string
  entity: 'subscription'
  plan_id: string
  customer_id?: string
  status:
    | 'created'
    | 'authenticated'
    | 'active'
    | 'pending'
    | 'halted'
    | 'cancelled'
    | 'completed'
    | 'expired'
    | 'paused'
  current_start: number | null
  current_end: number | null
  ended_at: number | null
  quantity: number
  notes?: Record<string, string>
  charge_at: number | null
  start_at: number | null
  end_at: number | null
  auth_attempts: number
  total_count: number
  paid_count: number
  customer_notify: boolean
  created_at: number
  expire_by?: number
  short_url: string
  has_scheduled_changes: boolean
  change_scheduled_at?: number | null
  source: string
  remaining_count: number
}

export function createSubscription(input: RazorpaySubscriptionInput): Promise<RazorpaySubscription> {
  return razorpayFetch<RazorpaySubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function fetchSubscription(subId: string): Promise<RazorpaySubscription> {
  return razorpayFetch<RazorpaySubscription>(`/subscriptions/${subId}`)
}

export function cancelSubscription(
  subId: string,
  cancelAtCycleEnd = false,
): Promise<RazorpaySubscription> {
  return razorpayFetch<RazorpaySubscription>(`/subscriptions/${subId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 }),
  })
}

// ============================================
// Webhook signature verification
// ============================================

/**
 * Verify a Razorpay webhook signature.
 * Razorpay sends X-Razorpay-Signature header = HMAC-SHA256(body, webhook_secret).
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string,
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const expected = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Constant-time comparison
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}
