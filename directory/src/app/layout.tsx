import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  axes: ["opsz"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "QResolve — India's Verified Maintenance Provider Directory | Best Service Providers",
  description: "Find verified, ranked maintenance service providers in India across 11 categories. Real performance data, QR-powered warranty tracking, and verified customer reviews for vending machines, EV chargers, lifts, HVAC, and more.",
  icons: {
    icon: "/icon.svg",
  },
  keywords: [
    "maintenance service providers India",
    "verified service directory",
    "maintenance contractors",
    "vending machine service",
    "EV charger maintenance",
    "lift engineer",
    "HVAC service",
    "commercial cleaning",
    "electrical services",
    "plumbing services",
    "QR warranty tracking"
  ],
  authors: [{ name: "Q-Resolve Analytics Private Limited", url: "https://qresolve.com" }],
  creator: "Q-Resolve Analytics",
  publisher: "Q-Resolve Analytics",
  applicationName: "QResolve",
  category: "Service Directory",
  
  // Open Graph
  openGraph: {
    type: "website",
    url: "https://qresolve.com",
    title: "QResolve — India's Verified Maintenance Provider Directory",
    description: "Find verified, ranked maintenance service providers in India. Real performance data and verified reviews.",
    siteName: "QResolve",
    images: [
      {
        url: "https://qresolve.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "QResolve - Verified Maintenance Provider Directory",
        type: "image/png",
      },
    ],
    locale: "en_IN",
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "QResolve — India's Verified Maintenance Provider Directory",
    description: "Find verified maintenance service providers ranked by real performance data.",
    images: ["https://qresolve.com/og-image.png"],
    creator: "@qresolve_in",
    site: "@qresolve_in",
  },
  
  // Additional SEO
  metadataBase: new URL("https://qresolve.com"),
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  },
  
  // Verification
  verification: {
    google: "TBD_ADD_GOOGLE_VERIFICATION",
  },
  
  // Alternate links for language/region variants
  alternates: {
    canonical: "https://qresolve.com",
    languages: {
      "en-IN": "https://qresolve.com",
      "hi-IN": "https://qresolve.com/hi",
      "mr-IN": "https://qresolve.com/mr",
    },
  },
  
  // Other
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QResolve",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://qresolve.com/#organization",
        name: "QResolve",
        url: "https://qresolve.com",
        logo: {
          "@type": "ImageObject",
          "@id": "https://qresolve.com/#logo",
          url: "https://qresolve.com/icon.svg",
          width: 256,
          height: 256,
        },
        description: "India's Verified Maintenance Provider Directory",
        sameAs: [
          "https://twitter.com/qresolve_in",
          "https://linkedin.com/company/qresolve",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://qresolve.com/#website",
        url: "https://qresolve.com",
        name: "QResolve",
        description: "Find verified maintenance service providers in India",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://qresolve.com/{search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
          suppressHydrationWarning
        />
      </head>
      <body className={`${dmSans.variable} ${fraunces.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
