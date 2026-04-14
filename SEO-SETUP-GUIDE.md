# SEO Setup Guide for QResolve

## Quick Start Checklist

This guide helps you complete the SEO setup after deployment.

### 1. Google Search Console Setup ✓

#### Step 1: Add Property
1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Click **Add Property**
3. Select **Domain** property type
4. Enter: `qresolve.com`
5. Follow DNS verification steps

#### Step 2: Verify Domain (Choose One Method)

**Method A: DNS Record (Recommended)**
```
Type: TXT
Name: qresolve.com
Value: google-site-verification=YOUR_VERIFICATION_CODE
```

**Method B: HTML File Upload**
- Download verification file from GSC
- Upload to: `/public/google-site-verification-file.html`

**Method C: Meta Tag (Current Implementation)**
```html
<meta name="google-site-verification" content="YOUR_CODE" />
```
- Update in `directory/src/app/layout.tsx` under metadata.verification.google

#### Step 3: Verification Code
1. Replace `TBD_ADD_GOOGLE_VERIFICATION` in `layout.tsx` with actual code
2. Redeploy and verify in Google Search Console

### 2. Submit Sitemap

1. Go to **Sitemaps** section in Google Search Console
2. Enter: `https://qresolve.com/sitemap.xml`
3. Click Submit
4. Monitor for any issues

### 3. Check Indexing Status

1. Go to **Coverage** in Google Search Console
2. Check following metrics:
   - ✓ Pages successfully indexed
   - ✗ Pages with errors (fix if any)
   - ⚠️ Pages excluded (review if unexpected)

### 4. Review Rich Results

1. Go to **Enhancements** → **Rich Results**
2. Check for:
   - ✓ LocalBusiness schema
   - ✓ CollectionPage schema
   - ✗ Errors or warnings

### 5. Mobile Usability

1. Go to **Mobile Usability** report
2. Fix any issues reported
3. Test with [Mobile-Friendly Test](https://search.google.com/mobile-friendly)

---

## 5. Bing Webmaster Tools Setup

### Step 1: Add Site
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Click **Add Site**
3. Enter: `https://qresolve.com`

### Step 2: Verify Ownership
- Choose verification method (XML sitemap, DNS, meta tag, or file)
- Follow instructions

### Step 3: Submit Sitemap
1. Go to **Sitemaps** section
2. Enter: `https://qresolve.com/sitemap.xml`
3. Submit

---

## 6. SEO Tool Integration

### Google Analytics 4 Setup

```bash
# Add to next.js config or use Google Tag Manager
npm install @react-google-analytics
```

Tracking ID format: `G-XXXXXXXXXX`

### Google Tag Manager (Optional)

1. Create GTM account at [tagmanager.google.com](https://tagmanager.google.com)
2. Get Container ID (format: `GTM-XXXXXXX`)
3. Add to your `layout.tsx`:

```jsx
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 7. Create OG Image

### Image Specifications
- **Filename:** `og-image.png`
- **Size:** 1200 x 630 pixels
- **Format:** PNG or JPG
- **Location:** `/public/og-image.png`

### Design Suggestions
- Include QResolve logo
- Add headline: "Find Verified Service Providers"
- Use brand colors (Teal #06d6a0)
- Add 1-2 category icons

### Tools to Create
- Canva: [canva.com](https://canva.com) (Free)
- Figma: [figma.com](https://figma.com) (Free)
- Adobe Express: [express.adobe.com](https://express.adobe.com)

---

## 8. Create Icon Variants

Required icons:

```
public/
  ├── icon.svg (already exists)
  ├── icon-192.png (192x192px) - Android home screen
  ├── icon-512.png (512x512px) - PWA splash screen
  └── og-image.png (1200x630px) - Social sharing
```

### Generate Icons
1. Start with your SVG icon
2. Export at different sizes (192, 512)
3. Use online tools:
   - [icoconvert.com](https://icoconvert.com)
   - [ezgif.com](https://ezgif.com)

---

## 9. Create Screenshots for PWA

### Mobile Screenshot
- **Size:** 540 x 720 pixels
- **Filename:** `screenshot-1.png`
- **Content:** Mobile view of homepage with provider list

### Desktop Screenshot
- **Size:** 1280 x 720 pixels
- **Filename:** `screenshot-2.png`
- **Content:** Desktop view showing categories and search

---

## 10. Test SEO Implementation

### Online Tools to Use

1. **Google PageSpeed Insights**
   ```
   https://pagespeed.web.dev
   ```
   - Check LCP, FID, CLS scores
   - Desktop: should be 90+
   - Mobile: should be 85+

2. **Google Mobile-Friendly Test**
   ```
   https://search.google.com/mobile-friendly
   ```
   - Verify mobile responsiveness
   - Check touch targets
   - Check font sizes

3. **Google Rich Results Test**
   ```
   https://search.google.com/test/rich-results
   ```
   - Validate JSON-LD schema
   - Check for errors
   - Preview rich results

4. **Schema.org Validator**
   ```
   https://validator.schema.org
   ```
   - Validate structured data
   - Check for warnings

### Manual Testing

```bash
# Check sitemap
curl -I https://qresolve.com/sitemap.xml

# Check robots.txt
curl https://qresolve.com/robots.txt

# Check Open Graph tags
curl https://qresolve.com | grep "og:"

# Check JSON-LD
curl https://qresolve.com | grep -A5 "application/ld+json"
```

---

## 11. Monitor Rankings & Traffic

### Keywords to Track

**Primary (High Priority)**
- "maintenance service providers India"
- "verified service directory"
- "QResolve"

**Secondary (Category-specific)**
- "vending machine service India"
- "EV charger maintenance"
- "lift engineer India"
- "HVAC service [city]"

**Tertiary (Geographic)**
- "[Service] in [City]"
- "best [service] providers [city]"

### Tools to Monitor

1. **Google Search Console**
   - Position by query
   - Impressions
   - Click-through rate (CTR)

2. **Google Analytics 4**
   - Organic traffic
   - Session duration
   - Conversion rate

3. **Third-party tools**
   - Ahrefs
   - SEMrush
   - Moz

---

## 12. Optimization Workflow

### Monthly Tasks
- [ ] Review Google Search Console data
- [ ] Check new keywords in top 20
- [ ] Monitor Core Web Vitals
- [ ] Check for indexation issues

### Quarterly Tasks
- [ ] Analyze competitor backlinks
- [ ] Update old content
- [ ] Audit internal links
- [ ] Check for broken links

### Annually
- [ ] Full SEO audit
- [ ] Update keyword strategy
- [ ] Rebuild entire sitemaps
- [ ] Review and update schema markup

---

## 13. Troubleshooting

### Sitemap Not Indexed
- Check if `robots.txt` allows `/sitemap.xml`
- Verify XML syntax using [XML validator](https://www.xmlvalidation.com)
- Resubmit in Google Search Console

### Pages Not Indexed
- Check for noindex meta tags
- Verify canonical URL correctness
- Check for robots.txt blocking
- Submit individual URLs to GSC

### Low Rankings
- Check keyword relevance
- Improve on-page SEO
- Audit Core Web Vitals
- Build quality backlinks

### Rich Results Not Showing
- Validate JSON-LD with Rich Results Test
- Check for schema.org errors
- Wait 2-3 weeks for re-crawl
- Check structured data in GSC

---

## 14. Quick Reference

### File Locations
```
directory/
├── src/
│   ├── app/
│   │   ├── layout.tsx (metadata)
│   │   ├── page.tsx (homepage)
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── [category]/[city]/page.tsx
│   └── lib/
│       └── seo-config.ts
└── public/
    ├── manifest.json
    ├── og-image.png (CREATE THIS)
    ├── icon.svg
    ├── icon-192.png (CREATE THIS)
    ├── icon-512.png (CREATE THIS)
    ├── robots.txt
    └── sitemap.xml (DYNAMIC)
```

### URLs to Monitor
```
Production:
https://qresolve.com/sitemap.xml
https://qresolve.com/robots.txt
https://qresolve.com/manifest.json

Verification Tools:
https://search.google.com/search-console
https://www.bing.com/webmasters
https://search.google.com/test/rich-results
https://pagespeed.web.dev
```

---

## 15. Support & Resources

### Documentation
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org Reference](https://schema.org)
- [Google Search Central Blog](https://developers.google.com/search/blog)

### Tools
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Mobile-Friendly Test](https://search.google.com/mobile-friendly)

---

**Last Updated:** April 14, 2026  
**Version:** 1.0  

---

## Next Steps After Deployment

1. ✓ Copy Google verification code
2. ✓ Update `layout.tsx` with verification code
3. ✓ Create OG image (1200x630px)
4. ✓ Create icon variants
5. ✓ Deploy to production
6. ✓ Verify domain in Google Search Console
7. ✓ Submit sitemap
8. ✓ Monitor coverage report

**Estimated time to full setup:** 1-2 hours
