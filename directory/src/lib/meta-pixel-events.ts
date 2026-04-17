/**
 * Meta Pixel Event Tracking Utilities
 * Use these functions to track custom events throughout the app
 */

// Type definition for Meta Pixel
declare global {
  interface Window {
    fbq?: (event: string, type: string, data?: Record<string, any>) => void;
  }
}

/**
 * Track a page view (automatically tracked by pixel, but can be called manually)
 */
export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Track when user searches for a provider
 */
export const trackSearch = (category: string, city: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      content_type: 'category',
      content_name: `${category} in ${city}`,
    });
  }
};

/**
 * Track when user views a provider profile
 */
export const trackViewContent = (providerName: string, category: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_type: 'product',
      content_name: providerName,
      content_ids: [category],
    });
  }
};

/**
 * Track when user contacts a provider
 */
export const trackContact = (providerName: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Contact', {
      content_name: providerName,
    });
  }
};

/**
 * Track when user initiates a lead submission
 */
export const trackLead = (category: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_type: 'service',
      content_name: category,
    });
  }
};

/**
 * Track custom event
 */
export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  }
};

export default {
  trackPageView,
  trackSearch,
  trackViewContent,
  trackContact,
  trackLead,
  trackEvent,
};
