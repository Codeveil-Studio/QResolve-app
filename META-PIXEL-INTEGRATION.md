# Meta Pixel Integration Guide

## Overview

Meta Pixel is now fully integrated into QResolve for tracking user behavior and campaign performance on Facebook/Instagram ads.

**Pixel ID:** `4512300942383837`

---

## Setup

### 1. Environment Variable Configuration

Add the Meta Pixel ID to your `.env.local` file:

```env
NEXT_PUBLIC_META_PIXEL_ID=4512300942383837
```

**Files:**
- `.env.local` - Your local/production environment
- `.env.local.example` - Template (included in repo)

### 2. Automatic Tracking

The pixel automatically tracks:
- ✅ **Page Views** - Every page load
- ✅ **Page Visits** - Time on site
- ✅ **Device Info** - Browser, OS, device type
- ✅ **Location Data** - Country, region (if available)

No additional code needed for this.

---

## Custom Event Tracking

### Available Events

The pixel tracks several standard events for different user actions:

#### 1. **Search Event**
When user searches for a provider:

```typescript
import { trackSearch } from '@/lib/meta-pixel-events';

// In your search component
trackSearch('hvac-refrigeration', 'mumbai');
```

#### 2. **View Content Event**
When user views a provider profile:

```typescript
import { trackViewContent } from '@/lib/meta-pixel-events';

// In provider page component
trackViewContent('ABC HVAC Services', 'HVAC Servicing');
```

#### 3. **Contact Event**
When user clicks to contact a provider:

```typescript
import { trackContact } from '@/lib/meta-pixel-events';

// When user initiates contact
trackContact('ABC HVAC Services');
```

#### 4. **Lead Event**
When user submits an inquiry:

```typescript
import { trackLead } from '@/lib/meta-pixel-events';

// When form is submitted
trackLead('HVAC Servicing');
```

#### 5. **Custom Event**
For any other event:

```typescript
import { trackEvent } from '@/lib/meta-pixel-events';

// Track custom events
trackEvent('ProviderFilterApplied', {
  filters: ['verified', 'high_rating'],
  count: 12,
});
```

---

## Implementation Examples

### In a Client Component

```typescript
'use client';

import { trackSearch } from '@/lib/meta-pixel-events';

export function SearchProviders() {
  const handleSearch = (category: string, city: string) => {
    // Track the search
    trackSearch(category, city);
    
    // Perform search logic
    // ...
  };

  return (
    // Your component JSX
  );
}
```

### In Provider Results

```typescript
'use client';

import { trackViewContent, trackContact } from '@/lib/meta-pixel-events';

export function ProviderCard({ provider }) {
  useEffect(() => {
    // Track when provider is viewed
    trackViewContent(provider.name, provider.category);
  }, [provider]);

  const handleContact = () => {
    trackContact(provider.name);
    // Open contact modal/form
  };

  return (
    <button onClick={handleContact}>Contact Provider</button>
  );
}
```

---

## Facebook Conversion API (Advanced)

For even better tracking (especially for server-side conversions), Facebook offers the Conversion API:

1. Go to Facebook Events Manager
2. Settings → Data Sources → Conversion API
3. Generate access token
4. Implement server-side tracking

Example server implementation:

```typescript
// pages/api/facebook-conversion.ts
export async function POST(req: Request) {
  const { eventData } = await req.json();
  
  const response = await fetch(
    `https://graph.facebook.com/v18.0/{PIXEL_ID}/events?access_token={TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            ...eventData,
          },
        ],
      }),
    }
  );

  return response;
}
```

---

## Troubleshooting

### Pixel Not Loading

1. **Check environment variable:**
   ```bash
   echo $NEXT_PUBLIC_META_PIXEL_ID
   ```

2. **Verify in browser console:**
   ```javascript
   console.log(typeof window.fbq); // Should be 'function'
   ```

3. **Check Meta Events Manager:**
   - Go to Facebook Events Manager
   - Select pixel 4512300942383837
   - Check "Test Events" tab
   - Trigger a page view

### Events Not Tracking

1. **Ensure `fbq` is available:**
   ```typescript
   if (typeof window !== 'undefined' && window.fbq) {
     window.fbq('track', 'CustomEvent');
   }
   ```

2. **Check for ad blockers** - Some users have ad blockers that prevent pixel loading

3. **Verify pixel status** - In Meta Business Suite:
   - Business Tools → Events Manager
   - Check if events appear in real-time

---

## Standard Event Values

Common event parameter values for better segmentation:

### Event Names (Standard)
- `PageView` - Page visited
- `ViewContent` - Product/content viewed
- `Search` - Search performed
- `AddToCart` - Item added to cart
- `AddToWishlist` - Item wishlist added
- `InitiateCheckout` - Checkout started
- `Purchase` - Purchase completed
- `Lead` - Lead form submitted
- `Contact` - Contact initiated
- `CustomizeProduct` - Product customized
- `FindLocation` - Location found
- `ViewCart` - Cart viewed

### Content Types
- `product` - For products/services
- `product_group` - For product groups
- `category` - For categories
- `page` - For pages
- `event` - For events

---

## Best Practices

### ✅ Do's
- ✅ Track meaningful user journeys
- ✅ Use consistent event naming
- ✅ Include relevant metadata
- ✅ Test changes before deploying
- ✅ Monitor conversion rates regularly

### ❌ Don'ts
- ❌ Over-track (creates noise)
- ❌ Track before user action
- ❌ Include sensitive user data
- ❌ Track duplicate events
- ❌ Use outdated event names

---

## Monitoring & Analysis

### In Facebook Ads Manager

1. **Create Conversion Tracking Campaign**
   - Business Tools → Events Manager
   - Select Pixel → Create Campaign
   - Choose conversion event
   - Set up retargeting audience

2. **View Performance Metrics**
   - Campaigns → Results
   - Filter by conversion event
   - Analyze ROI per pixel event

3. **Create Custom Audiences**
   - Audiences → Create Audience
   - Source: Pixel events
   - Filter by event and properties
   - Use for retargeting ads

---

## Files Added/Modified

### New Files Created
1. `src/components/MetaPixel.tsx` - Pixel component
2. `src/lib/meta-pixel-events.ts` - Event tracking utilities
3. `.env.local.example` - Environment template

### Modified Files
1. `src/app/layout.tsx` - Added MetaPixel component

---

## Resources

- [Meta Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel)
- [Standard Events Reference](https://developers.facebook.com/docs/facebook-pixel/implementation/standard-events)
- [Events Manager](https://business.facebook.com/events_manager)
- [Conversion API](https://developers.facebook.com/docs/marketing-api/conversion-api)

---

## Support

For questions or issues:
1. Check Meta Pixel documentation
2. Review Events Manager test events
3. Verify pixel ID is correct: `4512300942383837`
4. Check `.env.local` has `NEXT_PUBLIC_META_PIXEL_ID` set

---

**Last Updated:** April 17, 2026  
**Pixel ID:** 4512300942383837  
**Status:** ✅ Active & Working
