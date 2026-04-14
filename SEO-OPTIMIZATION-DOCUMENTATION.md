# QResolve SEO Optimization Documentation

## Overview
This document outlines the comprehensive SEO optimizations implemented for the QResolve website (qresolve.com). The improvements focus on technical SEO, content optimization, and search engine visibility.

---

## 1. Technical SEO Implementations

### 1.1 Dynamic Sitemap (sitemap.ts)
**File:** `directory/src/app/sitemap.ts`

- **Purpose:** Automatically generates a sitemap for all pages
- **Updates:** Refreshes on every build/deployment
- **Coverage:**
  - Homepage
  - All category + city combinations (11 categories × 8 cities)
  - Individual provider pages (dynamic, pulled from Supabase)
- **Priority Levels:**
  - Homepage: 1.0 (highest priority)
  - Category pages: 0.8 (daily content)
  - Provider pages: 0.7 (updated weekly)
- **Access:** `https://qresolve.com/sitemap.xml`

### 1.2 Dynamic Robots.txt (robots.ts)
**File:** `directory/src/app/robots.ts`

- **Purpose:** Controls search engine crawler behavior
- **Features:**
  - Allows all public paths
  - Blocks admin and dashboard routes
  - Crawl-delay optimization for Googlebot (0) and Bingbot (1)
  - Points to sitemap.xml
- **Access:** `https://qresolve.com/robots.txt`

### 1.3 Structured Data (JSON-LD)
Implemented across all pages:

#### Root Layout (layout.tsx)
- **Schema Type:** Organization + WebSite
- **Includes:**
  - Company information
  - Logo and basic metadata
  - SearchAction support for site search
  - Social media profiles

#### Category/City Pages ([category]/[city]/page.tsx)
- **Schema Type:** CollectionPage
- **Includes:**
  - Page name and description
  - List of top 10 providers with position
  - Local business schema references

#### Provider Pages (provider/[slug]/page.tsx)
- **Schema Type:** LocalBusiness
- **Includes:**
  - Provider name and contact information
  - Address with postal code
  - Aggregate rating (rating + review count)
  - Service area
  - Price range

### 1.4 Enhanced Metadata
Comprehensive metadata added to all pages:

#### Root Metadata (layout.tsx)
- Title with key phrases
- Detailed description
- Keywords list (11 key categories)
- Author and creator information
- Open Graph tags (Facebook sharing)
- Twitter Card tags
- Robots directives (index, follow, image/snippet/video preview sizes)
- Google verification placeholder
- Alternate language versions (en-IN, hi-IN, mr-IN)
- Manifest link for PWA

#### Page-Specific Metadata
All dynamic pages have `generateMetadata` functions that:
- Create unique, descriptive titles
- Write dynamic descriptions incorporating category/city/provider names
- Set canonical URLs
- Add open graph and twitter tags
- Include relevant keywords

### 1.5 Web App Manifest (manifest.json)
**File:** `directory/public/manifest.json`

- **Purpose:** PWA support and mobile optimization
- **Features:**
  - App name and short name
  - Theme colors (green accent: #06d6a0)
  - Display mode (standalone)
  - Categories and description
  - Shortcuts for quick actions
  - Icon definitions for all sizes

---

## 2. Content Optimization

### 2.1 Semantic HTML Structure
- Proper heading hierarchy (H1, H2, H3)
- Structured breadcrumb navigation
- Nav landmarks for accessibility
- Main content wrapped in `<main>` tags
- Footer with copyright information

### 2.2 Page Titles
Each page has a unique, descriptive title:

- **Homepage:** "QResolve — India's Verified Maintenance Provider Directory | Best Service Providers"
- **Category Pages:** "Top [CATEGORY] Service Providers in [CITY] | QResolve"
- **Provider Pages:** "[PROVIDER NAME] — Verified [CATEGORY] Service Provider | QResolve"

### 2.3 Meta Descriptions
Descriptions are 150-160 characters and include:
- Primary keyword
- Value proposition
- Geographic location
- Call-to-action implication

Example: "Find [SERVICE] providers in [CITY]. Ranked by verified performance data, response times, and customer reviews. Compare verified [SERVICE] specialists."

---

## 3. Keyword Strategy

### Target Keywords
1. **Primary:** "maintenance service providers India"
2. **Category:** "vending machine service", "EV charger maintenance", "lift engineer", etc.
3. **Geographic:** "[Service] in [City]", "[City] services"
4. **Long-tail:** "best [service] providers [city]", "verified [service] [city]"

### Keyword Distribution
- **Homepage:** 11+ target keywords
- **Category Pages:** 5+ keywords per page (dynamically generated)
- **Provider Pages:** 5+ keywords per page

---

## 4. Mobile & Performance Optimization

### 4.1 Viewport Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
```

### 4.2 Mobile-First Design
- Responsive layout implemented
- Touch-friendly navigation
- Fast load times via Next.js optimization

### 4.3 Image Optimization
- Lazy loading support
- Responsive image sizing
- PNG/SVG usage for icons

---

## 5. Social Media Optimization

### 5.1 Open Graph Meta Tags
- `og:type`: "website" (homepage), "business.business" (provider pages)
- `og:title`, `og:description`, `og:url`
- `og:image`: Placeholder (needs OG image file)
- `og:locale`: "en_IN"
- `og:site_name`: "QResolve"

### 5.2 Twitter Card Tags
```
twitter:card: "summary_large_image"
twitter:title, twitter:description, twitter:image
twitter:creator: "@qresolve_in"
twitter:site: "@qresolve_in"
```

### 5.3 Social Media Profiles
Linked in JSON-LD:
- Twitter: `https://twitter.com/qresolve_in`
- LinkedIn: `https://linkedin.com/company/qresolve`

---

## 6. Canonical URLs

All pages implement canonical URLs to prevent duplicate content:
- Homepage: `https://qresolve.com`
- Category pages: `https://qresolve.com/[category]/[city]`
- Provider pages: `https://qresolve.com/provider/[slug]`

---

## 7. Implementation Checklist

### Files Modified/Created
- [✓] `directory/src/app/sitemap.ts` - Dynamic sitemap generation
- [✓] `directory/src/app/robots.ts` - Dynamic robots.txt
- [✓] `directory/src/app/layout.tsx` - Enhanced root layout with metadata & JSON-LD
- [✓] `directory/src/app/page.tsx` - Homepage metadata
- [✓] `directory/src/app/[category]/[city]/page.tsx` - Category page metadata & schema
- [✓] `directory/src/app/provider/[slug]/page.tsx` - Provider page metadata & schema
- [✓] `directory/public/manifest.json` - PWA manifest

---

## 8. Todo / Next Steps

### Critical (Immediate)
1. **Google Search Console Verification**
   - Add `google-site-verification` meta tag in layout.tsx
   - Verify domain ownership
   - Check search coverage

2. **Create OG Image**
   - Generate `og-image.png` (1200x630px)
   - Place in `public/` directory
   - Reference in metadata

3. **Generate Icon Variants**
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
   - Both referenced in manifest.json

4. **Create Screenshots**
   - `screenshot-1.png` (540x720px) - Mobile
   - `screenshot-2.png` (1280x720px) - Desktop
   - For PWA install prompts

### High Priority
5. **Test & Monitor**
   - Run through Google PageSpeed Insights
   - Test with Google Mobile-Friendly Test
   - Check Core Web Vitals

6. **SEO Tools Integration**
   - Connect Google Analytics 4
   - Set up Google Search Console
   - Add Google Tag Manager (optional)

7. **Local SEO**
   - Verify Google Business Profile listings for each city
   - Add structured data for each location
   - Implement location-specific landing pages

8. **Content Enhancement**
   - Add FAQ schema to category pages
   - Write blog/best-practice content
   - Optimize for People Also Ask (PAA)

### Medium Priority
9. **Link Building**
   - Internal linking strategy
   - Sitemap submission
   - Directory listings

10. **Technical SEO**
    - Ensure fast Core Web Vitals (LCP, FID, CLS)
    - Implement 404 redirect strategy
    - Add XML sitemap for images (with media schema)

### Ongoing Optimization
11. **Monitoring**
    - Track rankings for target keywords
    - Monitor organic traffic
    - Analyze search queries
    - Test competitors' strategies

12. **Content Updates**
    - Keep provider information fresh
    - Update ratings and reviews schema
    - Refresh outdated content

---

## 9. Verification Steps

### Test Metadata
```bash
# Visit in browser and check source code:
curl https://qresolve.com | grep -i "og:title"
```

### Validate JSON-LD
- Use Google's Rich Results Test: https://search.google.com/test/rich-results
- Use Schema.org Validator: https://validator.schema.org

### Check Sitemap
```
https://qresolve.com/sitemap.xml
```

### Check Robots.txt
```
https://qresolve.com/robots.txt
```

---

## 10. Performance Metrics Targets

| Metric | Target |
|--------|--------|
| Largest Contentful Paint (LCP) | < 2.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to First Byte (TTFB) | < 600ms |
| First Contentful Paint (FCP) | < 1.8s |

---

## 11. Search Console Configuration

### Sitemaps to Submit
1. `https://qresolve.com/sitemap.xml`
2. Image sitemap (if created separately)

### Crawl Issues to Monitor
- Check for 4xx errors
- Monitor crawl budget
- Review coverage report
- Fix any excluded URLs

### Performance Monitoring
- Track average position for keywords
- Monitor click-through rate (CTR)
- Check impressions by page
- Analyze device performance (mobile vs. desktop)

---

## 12. Future Enhancements

### Phase 2
- Implement breadcrumb schema across all pages
- Add FAQ schema for category pages
- Create location-based landing pages
- Implement pagination schema

### Phase 3
- Build knowledge panel schema
- Implement video schema (if adding video content)
- Create event schema (for webinars/events)
- Add job schema (if expanding)

### Phase 4
- Implement AMP pages (optional)
- Create multilingual versions (Hindi, Marathi)
- Set up hreflang tags for language variants
- Implement canonical for international versions

---

## 13. Quick Reference Links

| Item | Link |
|------|------|
| Root Sitemap | https://qresolve.com/sitemap.xml |
| Robots.txt | https://qresolve.com/robots.txt |
| Manifest | https://qresolve.com/manifest.json |
| Google Search Console | https://search.google.com/search-console |
| Rich Results Test | https://search.google.com/test/rich-results |
| PageSpeed Insights | https://pagespeed.web.dev |
| Mobile-Friendly Test | https://search.google.com/mobile-friendly |
| Schema.org Reference | https://schema.org |

---

## 14. Contact & Support

For questions or updates to SEO strategy:
- **Email:** [Add support email]
- **Team:** Q-Resolve Analytics
- **Documentation:** This file (kept in repo)

---

**Last Updated:** April 14, 2026  
**Version:** 1.0  
**Status:** ✅ Complete
