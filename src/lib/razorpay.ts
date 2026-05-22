// Razorpay checkout integration helpers (frontend)
//
// Loads the Razorpay Checkout SDK on demand and exposes a strongly-typed
// opener. The script tag is appended once and cached.

export interface RazorpayCheckoutOptions {
  key: string
  subscription_id: string
  name: string
  description?: string
  image?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  handler?: (response: RazorpayPaymentSuccess) => void
  modal?: {
    ondismiss?: () => void
    escape?: boolean
    backdropclose?: boolean
    confirm_close?: boolean
  }
}

export interface RazorpayPaymentSuccess {
  razorpay_payment_id: string
  razorpay_subscription_id: string
  razorpay_signature: string
}

interface RazorpayInstance {
  open: () => void
  close: () => void
  on: (event: string, handler: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
let loadPromise: Promise<void> | null = null

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only be loaded in the browser'))
  }
  if (window.Razorpay) {
    return Promise.resolve()
  }
  if (loadPromise) return loadPromise

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Failed to load Razorpay'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions,
): Promise<RazorpayInstance> {
  await loadRazorpayScript()
  if (!window.Razorpay) throw new Error('Razorpay SDK did not load correctly')
  const rzp = new window.Razorpay(options)
  rzp.open()
  return rzp
}
