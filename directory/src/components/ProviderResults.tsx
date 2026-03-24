"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MapPin, Star, CheckCircle2, Building, Search, ArrowRight, ShieldCheck, SortAsc, Filter } from "lucide-react";

interface Provider {
    id: string;
    slug: string;
    provider_name: string;
    category: string | null;
    category_slug: string | null;
    city_slug: string | null;
    sub_locality: string | null;
    rating: string | null;
    verification_status: string | null;
    platform: string | null;
    owner_id: string | null;
}

interface ProviderResultsProps {
    initialProviders: Provider[];
    cityName: string;
}

const capitalize = (s: string) =>
    s ? s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";

export function ProviderResults({ initialProviders, cityName }: ProviderResultsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("rating"); // 'rating' | 'name'
    const [filterClaimed, setFilterClaimed] = useState(false);

    const filteredAndSortedProviders = useMemo(() => {
        let result = initialProviders.filter((p) =>
            p.provider_name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filterClaimed) {
            result = result.filter((p) => p.owner_id !== null);
        }

        if (sortBy === "rating") {
            result.sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
        } else if (sortBy === "name") {
            result.sort((a, b) => a.provider_name.localeCompare(b.provider_name));
        }

        return result;
    }, [initialProviders, searchQuery, sortBy, filterClaimed]);

    return (
        <div className="results-wrapper">
            {/* Filters and Search Bar */}
            <div className="filters-bar" style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                    {/* Search Field */}
                    <div className="search-field" style={{ flex: 1, minWidth: "250px", position: "relative" }}>
                        <Search className="search-icon" size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input
                            type="text"
                            placeholder="Search by business name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 10px 10px 38px",
                                borderRadius: "8px",
                                border: "1px solid var(--border)",
                                background: "var(--bg-card)",
                                color: "var(--text-primary)",
                                outline: "none"
                            }}
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="sort-field" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <SortAsc size={16} style={{ color: "var(--text-muted)" }} />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1px solid var(--border)",
                                background: "var(--bg-card)",
                                color: "var(--text-primary)",
                                cursor: "pointer",
                                outline: "none"
                            }}
                        >
                            <option value="rating">Top Rated</option>
                            <option value="name">Alphabetical</option>
                        </select>
                    </div>

                    {/* Claimed Filter Toggle */}
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "8px 14px", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", cursor: "pointer", fontSize: "14px" }}>
                        <input
                            type="checkbox"
                            checked={filterClaimed}
                            onChange={(e) => setFilterClaimed(e.target.checked)}
                        />
                        <ShieldCheck size={16} style={{ color: filterClaimed ? "var(--accent)" : "var(--text-muted)" }} />
                        Managed Only
                    </label>
                </div>
            </div>

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border)" }}>
                <p className="results-count">
                    Showing <strong>{filteredAndSortedProviders.length}</strong> providers in {cityName}
                </p>
                <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                    ← Back to home
                </Link>
            </div>

            {filteredAndSortedProviders.length > 0 ? (
                <div className="results-list">
                    {filteredAndSortedProviders.map((provider) => {
                        const initials = provider.provider_name?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "P";
                        const isVerified = provider.verification_status === "verified";
                        const isClaimed = provider.owner_id !== null;

                        return (
                            <Link key={provider.id} href={`/provider/${provider.slug}`} className="result-card">
                                <div className="result-card-left">
                                    <div className="result-card-avatar" style={{ border: isClaimed ? "2px solid var(--accent)" : "none" }}>{initials}</div>
                                    <div className="result-card-info">
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                            <span className="result-card-name" style={{ color: isClaimed ? "var(--text-primary)" : "inherit" }}>{provider.provider_name}</span>
                                            {isClaimed && (
                                                <span className="result-card-badge" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                                                    <ShieldCheck size={11} /> Managed Listing
                                                </span>
                                            )}
                                            {isVerified && (
                                                <span className="result-card-badge">
                                                    <CheckCircle2 size={11} /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <div className="result-card-meta">
                                            <span>
                                                <MapPin size={13} />
                                                {provider.sub_locality || "Local Area"}, {capitalize(provider.city_slug || cityName)}
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
                    <h3>No results match your criteria</h3>
                    <p>Try adjusting your search or filters to find more providers.</p>
                </div>
            )}
        </div>
    );
}
