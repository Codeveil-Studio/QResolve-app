// SEO Configuration and Utilities for QResolve
// This file can be imported across the app for consistent SEO handling

export const SEO_CONFIG = {
  site: {
    name: "QResolve",
    url: "https://qresolve.com",
    description: "India's Verified Maintenance Provider Directory",
    locale: "en_IN",
    currency: "INR",
  },
  
  social: {
    twitter: "@qresolve_in",
    linkedin: "https://linkedin.com/company/qresolve",
    facebook: "https://facebook.com/qresolve",
  },
  
  contact: {
    email: "support@qresolve.com",
    phone: "+91-...", // Add actual phone
    address: "Q-Resolve Analytics Private Limited, India",
  },

  image: {
    logo: "/icon.svg",
    og: "https://qresolve.com/og-image.png",
  },

  colors: {
    primary: "#06d6a0", // Teal/Green
    dark: "#0a0f0d",
  },

  // Keywords organized by category
  keywords: {
    global: [
      "maintenance service providers India",
      "verified service directory",
      "maintenance contractors",
    ],
    categories: {
      "vending-and-automated-retail": [
        "vending machine service",
        "vending machine repair",
        "snack machine maintenance",
      ],
      "ev-charger-maintenance": [
        "EV charger maintenance",
        "electric vehicle charging",
        "charging station repair",
      ],
      "lift-and-escalator": [
        "lift engineer",
        "elevator maintenance",
        "escalator repair",
      ],
      "hvac-refrigeration": [
        "HVAC service",
        "air conditioning repair",
        "cooling system maintenance",
      ],
      "commercial-cleaning": [
        "commercial cleaning",
        "office cleaning service",
        "industrial cleaning",
      ],
      "fire-safety-systems": [
        "fire safety service",
        "fire alarm maintenance",
        "fire extinguisher service",
      ],
      "security-and-access": [
        "security system service",
        "CCTV maintenance",
        "access control repair",
      ],
      "solar-and-energy": [
        "solar panel maintenance",
        "solar energy service",
        "battery maintenance",
      ],
      "electrical-services": [
        "electrical service",
        "electrical repair",
        "power system maintenance",
      ],
      "plumbing-and-water": [
        "plumbing service",
        "water system maintenance",
        "drainage repair",
      ],
      "car-repair-services": [
        "car repair service",
        "automobile maintenance",
        "vehicle repair",
      ],
    },
  },

  // Cities and regions served
  locations: {
    "delhi": "Delhi NCR",
    "mumbai": "Mumbai",
    "bangalore": "Bangalore",
    "hyderabad": "Hyderabad",
    "chennai": "Chennai",
    "pune": "Pune",
    "kolkata": "Kolkata",
    "ahmedabad": "Ahmedabad",
  },

  // Breadcrumb helpers
  breadcrumbs: {
    home: { name: "Home", url: "/" },
  },
};

// Generate meta description with fallback
export const generateMetaDescription = (
  text: string,
  maxLength: number = 160
): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength - 3)}...` : text;
};

// Generate canonical URL
export const generateCanonical = (path: string): string => {
  return `${SEO_CONFIG.site.url}${path}`.replace(/\/+/g, "/");
};

// Generate breadcrumb schema
export const generateBreadcrumbSchema = (
  breadcrumbs: Array<{ name: string; url: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Generate organization schema
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SEO_CONFIG.site.name,
  url: SEO_CONFIG.site.url,
  logo: SEO_CONFIG.image.logo,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: SEO_CONFIG.contact.email,
  },
  sameAs: [
    `https://twitter.com/${SEO_CONFIG.social.twitter.replace("@", "")}`,
    SEO_CONFIG.social.linkedin,
    SEO_CONFIG.social.facebook,
  ],
});
