# Google Analytics Setup - QResolve Production

## ✅ Setup Completed

- **Measurement ID**: `G-E2HDLMF366`
- **Environment**: Production (qresolve.com)
- **Status**: Active and Monitoring

---

## 📊 What's Tracking Automatically

1. **Page Views** - Every page visit is tracked
2. **User Sessions** - Session duration and user interactions
3. **Traffic Source** - Where users come from (organic, direct, referral)
4. **Device Info** - Desktop, mobile, tablet, OS info
5. **Geographic Data** - User location (IP-based)
6. **Browser Info** - Browser type, version

---

## 🎯 Custom Event Tracking

Use the analytics utility to track specific user actions:

```typescript
import { analytics } from '@/lib/analytics';

// Search tracking
analytics.trackSearch('lift maintenance', 'Lift');

// Category view
analytics.trackCategoryView('Lift Maintenance', 'cat-123');

// Provider view
analytics.trackProviderView('provider-456', 'ABC Lift Services', 'Lift');

// Contact submission
analytics.trackContactSubmission('HVAC', 'provider-789');

// Rating submission
analytics.trackRatingSubmission(5, 'EV Charger', 'provider-123');

// Filter applied
analytics.trackFilterApplied('rating', '4-5');

// Page scroll
analytics.trackPageScroll(50);

// CTA click
analytics.trackCTAClick('Find Providers', 'Hero Section');

// Error tracking
analytics.trackError('Search Failed', 'API timeout');

// Demo account action
analytics.trackDemoAccount('demo-acc-001', 'viewed');
```

---

## 📱 Google Analytics Dashboard Features

### Real-time Monitoring
- **Path**: Google Analytics → Real-time → Overview
- Shows live traffic and user activities
- Verify tracking is working

### User Demographics
- **Path**: Reports → Audience → Demographics
- See visitor age, gender, locations

### Traffic Sources
- **Path**: Reports → Acquisition
- Organic search, direct, referral, social

### User Behavior
- **Path**: Reports → Engagement
- Most viewed pages, bounce rates, user flow

### Conversions (Goals)
- **Path**: Admin → Conversions
- Set up goals for: provider searches, ratings, contacts

---

## 🔒 Privacy & Compliance

✅ **Implemented**:
- `anonymize_ip: true` - Complies with GDPR/CCPA
- No sensitive personal data tracked
- Appropriate for EU/GDPR traffic

---

## 📝 Recommended Actions

### 1. Create Conversion Goals
In Google Analytics:
1. Go to **Admin** → **Conversions** → **Create**
2. Set up goals for:
   - `search` event (Provider searches)
   - `contact_provider` event (Contact submissions)
   - `submit_rating` event (Ratings)

### 2. Add Custom Alerts
Monitor key metrics in real-time:
- High bounce rate (>70%)
- Traffic spikes/drops
- Error tracking events

### 3. Set Up Segments
Create custom audiences:
- First-time visitors
- Mobile users
- High-engagement users

### 4. Verify Installation
- Go to **Admin** → **Data streams**
- Click your data stream
- Check "Real-time" shows data flowing in
- If no data: check environment variables and rebuild

---

## 🧪 Testing

### Before Production Deployment

```typescript
// In your browser console, verify:
window.gtag // Should be a function
window.dataLayer // Should be an array
```

### Check Real-time Reports
1. Deploy to production
2. Open Google Analytics Dashboard
3. Go to **Real-time** → **Overview**
4. Visit your website
5. Should see activity within 5 seconds

---

## 🚨 Troubleshooting

### No data showing in GA?

1. **Check Environment Variable**:
   ```
   NEXT_PUBLIC_GA_ID=G-E2HDLMF366
   ```

2. **Restart Development Server**:
   ```bash
   npm run dev  # After changing .env.local
   ```

3. **Check Network Tab**:
   - Open DevTools → Network
   - Filter by `googletagmanager`
   - Should see requests to GA servers

4. **Verify Component Loads**:
   ```typescript
   // In browser console:
   console.log(process.env.NEXT_PUBLIC_GA_ID);
   // Should output: G-E2HDLMF366
   ```

---

## 📈 Performance Impact

- GA script loads **asynchronously** (non-blocking)
- No impact on page load speed
- Events queued and sent in batches
- Negligible memory footprint

---

## 📧 Support

For questions about:
- **Analytics Setup**: See this guide
- **Google Analytics Help**: https://support.google.com/analytics
- **Implementation Issues**: Check console errors with DevTools

---

**Last Updated**: June 1, 2026
**Status**: ✅ Production Ready
