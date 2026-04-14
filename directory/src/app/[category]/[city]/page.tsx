import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { ProviderResults } from "@/components/ProviderResults";
import Link from "next/link";

interface PageProps {
    params: Promise<{ category: string; city: string }>;
}

const capitalize = (s: string) =>
    s ? s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";

async function fetchCategoryData(categorySlug: string, citySlug: string) {
    const supabase = await createClient();
    const query = supabase.from("providers").select("*").eq("category_slug", categorySlug);
    if (citySlug !== "india") query.eq("city_slug", citySlug);
    const { data: providers } = await query;
    return providers;
}

// SEO Metadata for dynamic pages
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category, city } = await params;
    const categoryName = capitalize(category);
    const cityName = city === "india" ? "India" : capitalize(city);
    const title = `Top ${categoryName} Service Providers in ${cityName} | QResolve`;
    const description = `Find ${categoryName.toLowerCase()} service providers in ${cityName}. Ranked by verified performance data, response times, and customer reviews. Compare verified ${categoryName.toLowerCase()} specialists.`;
    const url = `https://qresolve.com/${category}/${city}`;

    return {
        title,
        description,
        keywords: [
            `${categoryName.toLowerCase()} in ${cityName}`,
            `best ${categoryName.toLowerCase()} providers ${cityName}`,
            `verified ${categoryName.toLowerCase()} ${cityName}`,
            `${categoryName.toLowerCase()} service`,
            `${cityName} services`,
        ],
        openGraph: {
            title,
            description,
            url,
            type: "website",
        },
        twitter: {
            title,
            description,
            card: "summary_large_image",
        },
        alternates: {
            canonical: url,
        },
    };
}

async function fetchCategoryData(categorySlug: string, citySlug: string) {
    const supabase = await createClient();
    const query = supabase.from("providers").select("*").eq("category_slug", categorySlug);
    if (citySlug !== "india") query.eq("city_slug", citySlug);
    const { data: providers } = await query;
    return providers;
}

export default async function CategoryCityPage({ params }: PageProps) {
    const { category, city } = await params;
    const providers = await fetchCategoryData(category, city);

    const categoryName = capitalize(category);
    const cityName = city === "india" ? "India" : capitalize(city);

    if (providers === null) notFound();

    // JSON-LD Schema for category page
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${categoryName} Services in ${cityName}`,
        description: `Find verified ${categoryName.toLowerCase()} service providers in ${cityName}. Ranked by performance and verified customer reviews.`,
        url: `https://qresolve.com/${category}/${city}`,
        provider: {
            "@type": "LocalBusiness",
            name: "QResolve",
            url: "https://qresolve.com",
        },
        itemListElement: (providers || []).slice(0, 10).map((provider: any, index: number) => ({
            "@type": "LocalBusiness",
            position: index + 1,
            name: provider.provider_name,
            telephone: provider.contact_number,
            url: `https://qresolve.com/provider/${provider.slug}`,
        })),
    };

    return (
        <div className="qresolve-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                suppressHydrationWarning
            />
            <Navbar />

            {/* INNER HERO */}
            <section className="inner-hero">
                <div className="inner-hero-content">
                    {/* Breadcrumb */}
                    <nav className="breadcrumb">
                        <Link href="/">Home</Link>
                        <span>›</span>
                        <span>{categoryName} in {cityName}</span>
                    </nav>

                    <div className="inner-hero-badge">
                        <span className="dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "pulse 2s ease infinite" }} />
                        Verified Service Directory
                    </div>

                    <h1 className="inner-hero-title">
                        Top <em>{categoryName}</em><br />
                        in {cityName}
                    </h1>
                    <p className="inner-hero-sub">
                        Find and compare the best {categoryName.toLowerCase()} specialists in {cityName}. Ranked by performance, response time, and verified customer reviews.
                    </p>
                </div>
            </section>

            {/* RESULTS */}
            <main className="results-container">
                <ProviderResults initialProviders={providers || []} cityName={cityName} />
            </main>

            {/* FOOTER */}
            <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "2rem 0" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--accent)", display: "grid", placeItems: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0f0d" strokeWidth="2.5" strokeLinecap="round">
                                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="16" y="16" width="3" height="3" rx="0.5" />
                            </svg>
                        </div>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--text-primary)", fontSize: 16 }}>QResolve</span>
                    </Link>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>© 2026 Q-Resolve Analytics Private Limited, India</span>
                </div>
            </footer>
        </div>
    );
}
