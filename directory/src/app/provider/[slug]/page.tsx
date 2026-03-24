import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Phone, MapPin, Star, Building, CheckCircle2, ArrowLeft, Calendar, Shield, ExternalLink, Mail, Clock } from "lucide-react";

interface PageProps {
    params: Promise<{ slug: string }>;
}

const capitalize = (s: string) =>
    s ? s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";

export default async function ProviderPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: provider, error } = await supabase
        .from("providers")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !provider) notFound();

    const cityName = capitalize(provider.city_slug || "");
    const isVerified = provider.verification_status === "verified";
    const initials = provider.provider_name?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "P";
    const listedDate = new Date(provider.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long" });

    return (
        <div className="qresolve-page">
            <Navbar />

            {/* ── HERO BANNER ── */}
            <section className="inner-hero" style={{ paddingBottom: "3rem" }}>
                <div className="inner-hero-content">
                    {/* Breadcrumb */}
                    <nav className="breadcrumb" style={{ padding: "0 0 2rem 0", margin: 0 }}>
                        <Link href="/">Home</Link>
                        <span>›</span>
                        <Link href={`/${provider.category_slug}/${provider.city_slug}`}>
                            {provider.category} in {cityName}
                        </Link>
                        <span>›</span>
                        <span>{provider.provider_name}</span>
                    </nav>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 32, flexWrap: "wrap" }}>
                        {/* Avatar */}
                        <div style={{
                            width: 100, height: 100, minWidth: 100, borderRadius: 24,
                            background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: "2.25rem", color: "white", flexShrink: 0,
                            boxShadow: "0 12px 40px rgba(13,148,136,0.3)"
                        }}>
                            {initials}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                                <span className="result-card-badge" style={{ padding: "4px 14px", fontSize: 12 }}>
                                    {provider.category}
                                </span>
                                {isVerified && (
                                    <span className="result-card-badge" style={{ padding: "4px 14px", fontSize: 12 }}>
                                        <CheckCircle2 size={13} /> Verified by Relay
                                    </span>
                                )}
                            </div>

                            <h1 className="inner-hero-title" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: 16 }}>
                                {provider.provider_name}
                            </h1>

                            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                                    <MapPin size={16} />
                                    {provider.sub_locality}, {cityName}
                                </span>
                                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.95rem" }}>
                                    <Star size={16} fill="currentColor" style={{ color: "#fbbf24" }} />
                                    <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{provider.rating}</strong>
                                    <span style={{ color: "var(--text-muted)" }}>/ 5</span>
                                </span>
                                {provider.platform && (
                                    <span className="result-card-badge" style={{ background: "var(--surface)", color: "var(--text-muted)", fontWeight: 400 }}>
                                        <Building size={12} /> {provider.platform}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MAIN CONTENT ── */}
            <main className="profile-layout">
                {/* LEFT COLUMN */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* About section */}
                    <div className="profile-card">
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>
                            Business Profile
                        </h2>
                        <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                            {provider.description ? (
                                provider.description
                            ) : (
                                <>
                                    {provider.provider_name} is a leading {provider.category?.toLowerCase() || 'service'} professional serving the {provider.sub_locality} area in {cityName}.
                                    As a verified member of the QResolve directory, they maintain high standards of service and customer satisfaction.
                                    {isVerified
                                        ? " This provider has opted into the Relay verification system, meaning their work performance and resolution rates are tracked via real-world data points."
                                        : " This profile is currently unverified. Verified providers receive priority placement and the 'Verified' badge by connecting their performance data."}
                                </>
                            )}
                        </p>
                    </div>

                    {/* Info grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {[
                            { icon: <Clock size={20} />, label: "Response Time", value: isVerified ? "Under 45 mins" : "Not Tracked" },
                            { icon: <Shield size={20} />, label: "Trust Score", value: isVerified ? "High" : "Standard" },
                            { icon: <Mail size={20} />, label: "Directory ID", value: `QR-${provider.id.slice(0, 8).toUpperCase()}` },
                            { icon: <Calendar size={20} />, label: "Member Since", value: listedDate },
                        ].map((item) => (
                            <div key={item.label} className="info-tile" style={{
                                background: "var(--bg-card)", border: "1px solid var(--border)",
                                borderRadius: "var(--radius-lg)", padding: "1.5rem", display: "flex",
                                flexDirection: "column", gap: 8
                            }}>
                                <div style={{ color: "var(--accent)" }}>{item.icon}</div>
                                <div>
                                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 4 }}>{item.label}</div>
                                    <div style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-primary)" }}>{item.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Verification Box */}
                    <div style={{
                        background: isVerified ? "var(--bg-card)" : "var(--bg-card)",
                        border: `1px solid ${isVerified ? "rgba(52,211,153,0.3)" : "var(--border)"}`,
                        borderRadius: "var(--radius-xl)", padding: "2.5rem", position: "relative",
                        overflow: "hidden"
                    }}>
                        {isVerified && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at top right, rgba(52,211,153,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />}

                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: isVerified ? "var(--accent-glow)" : "var(--surface)", border: `1px solid ${isVerified ? "rgba(52,211,153,0.2)" : "var(--border)"}`, display: "grid", placeItems: "center" }}>
                                <Shield size={22} style={{ color: isVerified ? "var(--accent)" : "var(--text-muted)" }} />
                            </div>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 500 }}>
                                Service Verification
                            </h2>
                        </div>

                        {isVerified ? (
                            <>
                                <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "2rem" }}>
                                    This provider is <em style={{ color: "var(--accent)", fontStyle: "normal", fontWeight: 600 }}>Verified by Relay</em>. This status is earned by maintaining a 90%+ resolution rate and a response time under 1 hour as measured through the Relay platform.
                                </p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                                    {[
                                        { label: "Status", value: "Verified", color: "var(--accent)" },
                                        { label: "Jobs Done", value: "50+", color: "var(--text-primary)" },
                                        { label: "On Time", value: "98%", color: "var(--accent)" },
                                    ].map((stat) => (
                                        <div key={stat.label} style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", padding: "1.25rem", textAlign: "center" }}>
                                            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600, color: stat.color }}>{stat.value}</div>
                                            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginTop: 6 }}>{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                                    {provider.provider_name} has not yet completed the Relay verification process. Claiming this profile allows businesses to verify their expertise and build trust with direct performance metrics.
                                </p>
                                {provider.owner_id ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", fontWeight: 500 }}>
                                        <CheckCircle2 size={18} />
                                        This profile is claimed and managed by its owner.
                                    </div>
                                ) : (
                                    <a href={`https://app.qresolve.com/signup?claim_id=${provider.id}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: "inline-flex" }}>
                                        Claim This Profile →
                                    </a>
                                )}
                            </>
                        )}
                    </div>

                    <Link href={`/${provider.category_slug}/${provider.city_slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                        <ArrowLeft size={14} />
                        Back to {provider.category} in {cityName}
                    </Link>
                </div>

                {/* SIDEBAR */}
                <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Action Card */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "2rem", position: "sticky", top: "100px" }}>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 500, marginBottom: 8 }}>Need Service?</h3>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.5 }}>Connect with this provider directly for quotes or bookings.</p>

                        {provider.contact_info && (
                            <a href={`tel:${provider.contact_info}`} className="btn btn-accent" style={{ display: "flex", width: "100%", justifyContent: "center", marginBottom: 12 }}>
                                <Phone size={18} /> Call Now
                            </a>
                        )}
                        <button className="btn btn-outline" style={{ display: "flex", width: "100%", justifyContent: "center" }}>
                            Request a Quote
                        </button>

                        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface)", display: "grid", placeItems: "center" }}>
                                    <MapPin size={16} />
                                </div>
                                <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{provider.sub_locality}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface)", display: "grid", placeItems: "center" }}>
                                    <ExternalLink size={16} />
                                </div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>View on {provider.platform || "Platform"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Directory Summary */}
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "1.5rem" }}>
                        <h4 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", fontWeight: 600, marginBottom: 16 }}>Directory Record</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[
                                { label: "Category", value: provider.category },
                                { label: "City", value: cityName },
                                { label: "Verification", value: isVerified ? "RELAY-VERIFIED" : "PENDING", highlight: isVerified },
                            ].map((row) => (
                                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                    <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
                                    <span style={{ color: row.highlight ? "var(--accent)" : "var(--text-primary)", fontWeight: 500 }}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
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
