"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav className={scrolled ? "scrolled" : ""}>
            <Link href="/" className="nav-logo">
                <div className="nav-logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0a0f0d" strokeWidth="2.5" strokeLinecap="round">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="16" y="16" width="3" height="3" rx="0.5" />
                    </svg>
                </div>
                <span className="nav-logo-text">QResolve</span>
            </Link>
            <ul className="nav-links">
                <li><Link href="/#how-it-works">How It Works</Link></li>
                <li><Link href="/#categories">Categories</Link></li>
                <li><Link href="/#verified">Why Verified</Link></li>
                <li><Link href="/#relay">For Providers</Link></li>
                <li><Link href="http://localhost:8081/login">Login</Link></li>
                <li><Link href="/#list-your-business" className="nav-cta">List Your Business</Link></li>
            </ul>
        </nav>
    );
}
