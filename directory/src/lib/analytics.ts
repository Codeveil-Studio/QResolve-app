/**
 * Google Analytics Event Tracking
 * Centralizes all custom event tracking for the application
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Tracking functions for specific user actions
export const analytics = {
  // Search tracking
  trackSearch: (searchTerm: string, category?: string) => {
    trackEvent('search', {
      search_term: searchTerm,
      category: category || 'all',
    });
  },

  // Category view tracking
  trackCategoryView: (categoryName: string, categoryId?: string) => {
    trackEvent('view_category', {
      category_name: categoryName,
      category_id: categoryId,
    });
  },

  // Provider profile view
  trackProviderView: (providerId: string, providerName: string, category?: string) => {
    trackEvent('view_provider', {
      provider_id: providerId,
      provider_name: providerName,
      category: category,
    });
  },

  // Contact form submission
  trackContactSubmission: (category: string, provider_id?: string) => {
    trackEvent('contact_provider', {
      category: category,
      provider_id: provider_id,
    });
  },

  // Rating submission
  trackRatingSubmission: (rating: number, category: string, provider_id?: string) => {
    trackEvent('submit_rating', {
      rating: rating,
      category: category,
      provider_id: provider_id,
    });
  },

  // Filter application
  trackFilterApplied: (filterType: string, filterValue: string) => {
    trackEvent('apply_filter', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  },

  // Page scroll tracking (percentage)
  trackPageScroll: (scrollPercentage: number) => {
    trackEvent('scroll', {
      scroll_percentage: scrollPercentage,
    });
  },

  // Demo view tracking
  trackDemoView: (demoType: string) => {
    trackEvent('view_demo', {
      demo_type: demoType,
    });
  },

  // CTA click tracking
  trackCTAClick: (ctaName: string, location: string) => {
    trackEvent('cta_click', {
      cta_name: ctaName,
      location: location,
    });
  },

  // Page view (custom - usually auto-tracked)
  trackPageView: (pageName: string, pageCategory?: string) => {
    trackEvent('page_view', {
      page_title: pageName,
      page_category: pageCategory,
    });
  },

  // User engagement
  trackEngagement: (engagementType: string, value?: number) => {
    trackEvent('engagement', {
      engagement_type: engagementType,
      engagement_value: value,
    });
  },

  // Error tracking
  trackError: (errorName: string, errorMessage: string) => {
    trackEvent('error', {
      error_name: errorName,
      error_message: errorMessage,
    });
  },

  // Demo account tracking
  trackDemoAccount: (accountId: string, action: string) => {
    trackEvent('demo_account_action', {
      account_id: accountId,
      action: action,
    });
  },
};
