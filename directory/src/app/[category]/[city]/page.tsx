import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MapPin, Star, CheckCircle2, Building, Search, ArrowRight } from "lucide-react";

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

export default async function CategoryCityPage({ params }: PageProps) {
    const { category, city } = await params;
    const providers = await fetchCategoryData(category, city);

    const categoryName = capitalize(category);
    const cityName = city === "india" ? "India" : capitalize(city);

    if (providers === null) notFound();

    return (
        <div className="qresolve-page">
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
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border)" }}>
                    <p className="results-count">
                        Showing <strong>{providers?.length || 0}</strong> providers in {cityName}
                    </p>
                    <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                        ← Back to home
                    </Link>
                </div>

                {providers && providers.length > 0 ? (
                    <div className="results-list">
                        {providers.map((provider) => {
                            const initials = provider.provider_name?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "P";
                            const isVerified = provider.verification_status === "verified";
                            return (
                                <Link key={provider.id} href={`/provider/${provider.slug}`} className="result-card">
                                    <div className="result-card-left">
                                        <div className="result-card-avatar">{initials}</div>
                                        <div className="result-card-info">
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                                <span className="result-card-name">{provider.provider_name}</span>
                                                {isVerified && (
                                                    <span className="result-card-badge">
                                                        <CheckCircle2 size={11} /> Verified
                                                    </span>
                                                )}
                                            </div>
                                            <div className="result-card-meta">
                                                <span>
                                                    <MapPin size={13} />
                                                    {provider.sub_locality}, {capitalize(provider.city_slug)}
                                                </span>
                                                <span style={{ color: "var(--warning)" }}>
                                                    <Star size={13} fill="currentColor" />
                                                    <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{provider.rating}</strong>
                                                    <span style={{ color: "var(--text-muted)" }}>/ 5</span>
                                                </span>
                                                {provider.platform && (
                                                    <span className="result-card-badge" style={{ background: "var(--surface)", color: "var(--text-muted)", fontWeight: 400 }}>
                                                        <Building size={11} /> {provider.platform}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="result-card-right">
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>View Profile</span>
                                        <ArrowRight size={15} className="result-card-arrow" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="results-empty">
                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--text-muted)" }}>
                            <Search size={36} strokeWidth={1.5} />
                        </div>
                        <h3>No providers found</h3>
                        <p>
                            No {categoryName} providers in {cityName} yet. We&apos;re growing fast — check back soon.
                        </p>
                        <Link href="/" className="btn btn-accent" style={{ marginTop: "2rem", display: "inline-flex" }}>← Back to home</Link>
                    </div>
                )}
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
