"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    const closeMobileMenu = () => {
        setMenuOpen(false);
        document.body.style.overflow = "";
    };

    const navItems: { href: string; label: string; external?: boolean }[] = [  ];

    return (
        <>
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
                {navItems.map((item) => (
                    <li key={item.href}>
                        {item.external ? (
                            <a href={item.href} target="_blank" rel="noreferrer">
                                {item.label}
                            </a>
                        ) : (
                            <Link href={item.href}>{item.label}</Link>
                        )}
                    </li>
                ))}
                <li>
                    <a href="https://relay.qresolve.com/signup" className="nav-cta" target="_blank" rel="noreferrer">
                        List Your Business
                    </a>
                </li>
            </ul>
            <button
                className={`nav-hamburger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu"
            >
                <span />
                <span />
                <span />
            </button>
        </nav>
            <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
                {(
                    [
                    { href: "/#how-it-works", label: "How It Works" },
                    { href: "/#categories", label: "Categories" },
                    { href: "/#verified", label: "Why Verified" },
                    { href: "/#relay", label: "For Providers" },
                    { href: "/demo", label: "Interactive Demo" },
                    { href: "https://relay.qresolve.com/login", label: "Login", external: true },
                    ] as { href: string; label: string; external?: boolean }[]
                ).map((item) =>
                    item.external ? (
                        <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={closeMobileMenu}
                        >
                            {item.label}
                        </a>
                    ) : (
                        <Link key={item.href} href={item.href} onClick={closeMobileMenu}>
                            {item.label}
                        </Link>
                    )
                )}
                <a
                    href="https://relay.qresolve.com/signup"
                    className="mobile-cta"
                    target="_blank"
                    rel="noreferrer"
                    onClick={closeMobileMenu}
                >
                    List Your Business — Free
                </a>
            </div>
        </>
    );
}
