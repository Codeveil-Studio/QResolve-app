"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Zap,
  ArrowUpToLine,
  Wind,
  Sparkles,
  Flame,
  Shield,
  Sun,
  Plug2,
  Droplets,
  Car,
  ChevronRight,
  Play,
} from "lucide-react";
import { categories as categoriesData, citySlugMap } from "@/data/categories";
import { HeroSearch } from "@/components/HeroSearch";

const iconMap: Record<string, React.ReactNode> = {
  "vending-and-automated-retail": <Store size={22} />,
  "ev-charger-maintenance": <Zap size={22} />,
  "lift-and-escalator": <ArrowUpToLine size={22} />,
  "hvac-refrigeration": <Wind size={22} />,
  "commercial-cleaning": <Sparkles size={22} />,
  "fire-safety-systems": <Flame size={22} />,
  "security-and-access": <Shield size={22} />,
  "solar-and-energy": <Sun size={22} />,
  "electrical-services": <Plug2 size={22} />,
  "plumbing-and-water": <Droplets size={22} />,
  "car-repair-services": <Car size={22} />,
};

const categories = categoriesData.map((cat) => ({
  ...cat,
  icon: iconMap[cat.slug] || <Store size={22} />,
}));

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const addReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const handleCatClick = (slug: string) => {
    const citySlug = city === "all" ? "india" : (citySlugMap[city] || "india");
    router.push(`/${slug}/${citySlug}`);
  };

  const closeMobileMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = "";
  };

  return (
    <>
      {/* NAV */}
      <nav id="main-nav" className={scrolled ? "scrolled" : ""}>
        <a href="#top" className="nav-logo">
          <div className="nav-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0a0f0d" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="16" y="16" width="3" height="3" rx="0.5" />
            </svg>
          </div>
          <span className="nav-logo-text">QResolve</span>
        </a>
        <ul className="nav-links">
          <li><a href="#products">Directory</a></li>
          <li><a href="#relay-pillar">Relay OS</a></li>
          <li><a href="#flywheel">Flywheel</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="https://app.qresolve.com/login">Login</a></li>
          <li><a href="https://app.qresolve.com/signup" className="nav-cta">Start Free</a></li>
        </ul>
        <button
          className={`nav-hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => { setMenuOpen(!menuOpen); document.body.style.overflow = menuOpen ? "" : "hidden"; }}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <a href="#products" onClick={closeMobileMenu}>Directory</a>
        <a href="#relay-pillar" onClick={closeMobileMenu}>Relay OS</a>
        <a href="#flywheel" onClick={closeMobileMenu}>Flywheel</a>
        <a href="#testimonials" onClick={closeMobileMenu}>Testimonials</a>
        <a href="#pricing" onClick={closeMobileMenu}>Pricing</a>
        <a href="#about" onClick={closeMobileMenu}>About</a>
        <a href="https://app.qresolve.com/login" onClick={closeMobileMenu}>Login</a>
        <a href="https://app.qresolve.com/signup" className="mobile-cta" onClick={closeMobileMenu}>Start Free</a>
      </div>

      {/* HERO */}
      <div className="hero" id="top">
        <div className="hero-badge"><span />The unified ecosystem for the built environment</div>
        <h1>Frictionless Reporting. <br />Fix problems faster.</h1>
        <p className="hero-sub">
          Transform any physical asset into a smart reporting system. QResolve connects operators with verified service partners, while Relay OS makes problem reporting effortless. Scan, report, resolve—no apps required.
        </p>
        <HeroSearch />
        <div className="hero-ctas" style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
          <a href="#categories" className="btn btn-accent">Visit QResolve.com →</a>
          <a href="https://app.qresolve.com/signup" className="btn btn-accent">Start Free with Relay →</a>
          <a href="/demo" className="btn btn-ghost" style={{ border: "1px solid var(--border)" }}>
            <Play size={16} style={{ marginRight: 6 }} /> Try the Demo
          </a>
        </div>
      </div>

      <div className="divider"><div className="divider-line" /></div>

      {/* TECH STACK */}
      <section className="tech-stack" id="stack" style={{ textAlign: "center", padding: "60px 24px" }}>
        <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 24 }}>Built on world-class infrastructure</h3>
        <div className="tech-stack-badges" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          {["Google Cloud", "Google Gemini", "OpenAI", "Anthropic", "Vercel"].map((partner) => (
            <div key={partner} className="tech-stack-badge" style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "999px", color: "var(--text-secondary)", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
              {partner}
            </div>
          ))}
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* THREE PILLARS */}
      <section className="pillars reveal" id="products" ref={addReveal} style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 className="section-title">Three pillars. One ecosystem.</h2>
          <p className="section-desc">Each product strengthens the other. Together, they build a compounding advantage no standalone tool can match.</p>
        </div>

        <div className="pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {/* DIRECTORY PILLAR */}
          <div className="product-card directory" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32 }}>
            <div className="pc-badge" style={{ display: "inline-block", fontSize: "0.8rem", color: "var(--accent)", background: "var(--accent-glow)", padding: "6px 12px", borderRadius: 6, marginBottom: 16 }}>◉ The Marketplace</div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: 12 }}>QResolve.com</h3>
            <p className="pc-tagline" style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: 20 }}>India's first specialized directory for built environment maintenance. Not a generic listing site — a performance-ranked marketplace where operators find providers who actually show up.</p>

            <ul className="pc-features" style={{ listStyle: "none", marginBottom: 20 }}>
              <li style={{ marginBottom: 12, display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>Search by asset type: vending, EV chargers, lifts, HVAC, cleaning, fire safety</span></li>
              <li style={{ marginBottom: 12, display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>Providers ranked by real resolution data — not just reviews</span></li>
              <li style={{ marginBottom: 12, display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>"Verified by Relay" badge = proof the provider uses structured operations</span></li>
              <li style={{ display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>Submit urgent repair requests — matched to top providers in your area</span></li>
            </ul>

            <a href="#categories" className="btn btn-accent" style={{ width: "100%", justifyContent: "center", marginTop: 24 }}>Search Providers →</a>
          </div>

          {/* RELAY PILLAR */}
          <div className="product-card relay" id="relay-pillar" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32 }}>
            <div className="pc-badge" style={{ display: "inline-block", fontSize: "0.8rem", color: "var(--accent)", background: "var(--accent-glow)", padding: "6px 12px", borderRadius: 6, marginBottom: 16 }}>◉ The SaaS Operating System</div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Relay OS</h3>
            <p className="pc-tagline" style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: 20 }}>The operating system for maintenance service providers. Replace WhatsApp groups, missed calls, and lost photos with QR-triggered tickets, structured dispatch, and an immutable audit trail.</p>

            <ul className="pc-features" style={{ listStyle: "none", marginBottom: 20 }}>
              <li style={{ marginBottom: 12, display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>QR code on each asset — anyone scans, reports a fault in 30 seconds</span></li>
              <li style={{ marginBottom: 12, display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>Instant structured ticket: location, photos, fault type, severity</span></li>
              <li style={{ marginBottom: 12, display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>Smart dispatch to the right technician based on skill, proximity, load</span></li>
              <li style={{ display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>Immutable audit trail — every status change timestamped and read-only</span></li>
            </ul>

            <div style={{ marginTop: 24 }}>
              <a href="https://app.qresolve.com/signup" className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>Start Free with Relay →</a>
              <a href="/demo" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 12, border: "1px solid var(--border)" }}>
                <Play size={16} style={{ marginRight: 6 }} /> Try the Demo
              </a>
            </div>
          </div>

          {/* AI PILLAR */}
          <div className="product-card ai" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32 }}>
            <div className="pc-badge" style={{ display: "inline-block", fontSize: "0.8rem", color: "var(--accent)", background: "var(--accent-glow)", padding: "6px 12px", borderRadius: 6, marginBottom: 16 }}>◈ The Intelligence Engine</div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: 12 }}>QResolve AI</h3>
            <p className="pc-tagline" style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: 20 }}>Prescriptive maintenance intelligence powered by Google Gemini. Turn fault data into predictive insights before problems compound.</p>

            <ul className="pc-features" style={{ listStyle: "none", marginBottom: 20 }}>
              <li style={{ marginBottom: 12, display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>Micro-Friction Index — daily asset health scores</span></li>
              <li style={{ marginBottom: 12, display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>Predictive fault alerts before downtime strikes</span></li>
              <li style={{ marginBottom: 12, display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>Vendor Reliability reports auto-generated from Relay data</span></li>
              <li style={{ display: "flex", gap: 8 }}><ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--accent)", marginTop: 2 }} /> <span>Procurement Intelligence for smarter maintenance budgets</span></li>
            </ul>

            <a href="https://app.qresolve.com/login" className="btn btn-accent" style={{ width: "100%", justifyContent: "center", marginTop: 24 }}>Explore AI Insights →</a>
          </div>
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* DEMO BANNER */}
      <section className="demo-banner" id="demo" style={{ background: "rgba(52, 211, 153, 0.04)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Interactive Demo</div>
          <h2 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: 12 }}>See Relay in action. No signup needed.</h2>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: 28 }}>Pick your industry and watch how a 30-second QR scan replaces your entire fault reporting chain.</p>
          <a href="/demo" className="btn btn-accent">
            <Play size={18} style={{ marginRight: 8 }} /> Launch Demo
          </a>
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* CATEGORIES */}
      <section className="categories reveal" id="categories" ref={addReveal} style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: "0.8rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Service Categories</div>
          <h2 className="section-title" style={{ margin: "0 auto" }}>Find a specialist for every asset</h2>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 48, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {["all", "delhi", "mumbai", "bangalore", "hyderabad", "pune", "kolkata", "chennai", "ahmedabad"].map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              style={{
                padding: "8px 16px",
                border: city === c ? "1px solid var(--accent)" : "1px solid var(--border)",
                borderRadius: 999,
                background: city === c ? "var(--accent-glow)" : "transparent",
                color: city === c ? "var(--accent)" : "var(--text-primary)",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {c === "all" ? "All India" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCatClick(cat.slug)}
              style={{
                padding: 24,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "center",
                color: "inherit",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", color: "var(--accent)" }}>
                {cat.icon}
              </div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 500 }}>{cat.title}</h4>
            </button>
          ))}
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* FLYWHEEL */}
      <section className="flywheel reveal" id="flywheel" ref={addReveal} style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-block", fontSize: "0.8rem", color: "var(--accent)", background: "var(--accent-glow)", padding: "6px 12px", borderRadius: 6, marginBottom: 16 }}>◈ The QResolve Flywheel</div>
          <h2 className="section-title" style={{ margin: "0 auto" }}>The more they use it, the stronger it gets.</h2>
          <p className="section-desc" style={{ margin: "16px auto 0" }}>QResolve and Relay aren't two separate products duct-taped together. They're a closed loop — each one makes the other more valuable.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[
            { num: "01", title: "Directory generates leads", desc: "Facility managers search QResolve.com for providers. Inbound leads flow to listed providers." },
            { num: "02", title: "Providers adopt Relay", desc: "To manage those leads efficiently, providers sign up for Relay. No more WhatsApp chaos." },
            { num: "03", title: "Relay earns badge", desc: "Providers processing tickets transparently earn the performance-backed \"Verified by Relay\" badge." },
            { num: "04", title: "Badge boosts rankings", desc: "Verified providers rank higher on QResolve → more leads → more Relay usage. Loop closed." },
          ].map((step, i) => (
            <div key={i} style={{ padding: 20, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12 }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}>{step.num}</div>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 8 }}>{step.title}</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40, fontSize: "0.9rem", color: "var(--text-secondary)" }}>↻ Cycle repeats — each revolution makes both products more valuable</div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* TESTIMONIALS */}
      <section className="testimonials reveal" id="testimonials" ref={addReveal} style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="section-title" style={{ margin: "0 auto" }}>Trusted by facility teams across India</h2>
          <p className="section-desc" style={{ margin: "12px auto 0" }}>Real outcomes from real operations.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {[
            { quote: "Response times dropped from hours to minutes after we started using Relay. Our clients noticed before we even sent the monthly report.", role: "Operations Manager, Large Retail Chain" },
            { quote: "Finally a way to vet contractors with actual data — not just who someone's cousin recommended. The verified badge means something.", role: "Facility Director, Commercial Real Estate Group" },
            { quote: "Every maintenance request is tracked end-to-end. No more chasing WhatsApp threads. Our whole workflow runs through QResolve now.", role: "Head of Maintenance, Co-working Network" },
          ].map((t, i) => (
            <div key={i} style={{ padding: 28, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
              <p style={{ fontSize: "1rem", lineHeight: 1.6, marginBottom: 20, color: "var(--text-primary)", fontStyle: "italic" }}>"{t.quote}"</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>— {t.role}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* PRICING */}
      <section className="pricing reveal" id="pricing" ref={addReveal} style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 className="section-title" style={{ margin: "0 auto" }}>Simple plans. No hidden costs.</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {[
            {
              name: "Free Listing",
              price: "₹0",
              subtext: "/forever",
              description: "Get found by facility managers, coworking spaces, and asset owners actively searching for maintenance providers in your city.",
              features: ["Category & city placement", "Company profile with service details", "Direct repair requests from asset owners", "Customer reviews & ratings", "\"Claim Your Profile\" badge"],
              cta: "Claim Your Free Profile",
              href: "https://app.qresolve.com/signup"
            },
            {
              name: "Relay Starter",
              price: "₹4,999",
              subtext: "/month",
              description: "One missed message = one lost client. Relay gives every fault report a ticket, every ticket a technician, and every resolution a timestamp your clients can verify.",
              features: ["QR-based fault reporting (no app, no login — anyone can report)", "Operations dashboard with triage & prioritisation", "One-tap technician dispatch", "Immutable audit trail (tamper-proof resolution history)", "\"Verified by Relay\" trust badge on QResolve listing", "Up to 100 managed assets"],
              cta: "Start 14-Day Free Trial",
              href: "https://app.qresolve.com/signup"
            },
            {
              name: "Relay Pro",
              price: "₹12,999",
              subtext: "/month",
              description: "Pro turns your fault data into the competitive advantage that wins renewals and new contracts. Built for providers managing across multiple clients, cities, and verticals.",
              features: ["Everything in Starter", "Unlimited assets & multi-city operations", "Procurement Intelligence reports (predict part failures before they happen)", "Vendor Reliability scoring (prove SLA performance, not just promise it)", "Priority lead placement on QResolve directory", "Dedicated onboarding support"],
              cta: "Start 14-Day Free Trial",
              href: "https://app.qresolve.com/signup",
              featured: true
            },
          ].map((plan, i) => (
            <div key={i} style={{ padding: 32, background: "var(--bg-card)", border: plan.featured ? "2px solid var(--accent)" : "1px solid var(--border)", borderRadius: 16, display: "flex", flexDirection: "column", position: plan.featured ? "relative" : "static", transform: plan.featured ? "scale(1.05)" : "scale(1)" }}>
              {plan.featured && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#000", padding: "4px 12px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Recommended</div>
              )}
              <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 8 }}>{plan.name}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>{plan.description}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 24 }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{plan.price}</span>
                {plan.subtext && <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{plan.subtext}</span>}
              </div>
              <ul style={{ listStyle: "none", marginBottom: 28, flex: 1 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ marginBottom: 12, display: "flex", gap: 8, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    <ChevronRight size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href={plan.href} className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* ABOUT */}
      <section className="about reveal" id="about" ref={addReveal} style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <h2 className="section-title" style={{ margin: "0 0 24px 0", textAlign: "left" }}>Built for India's maintenance ecosystem</h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: 16 }}>
              QResolve was founded with a simple observation: India's ₹4 lakh crore maintenance market operates almost entirely on WhatsApp, spreadsheets, and trust. No data. No accountability. No way to prove who's actually good at their job.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>
              We're building the infrastructure layer that turns maintenance from a mystery into a data-backed science. Every scan creates a timestamp. Every dispatch creates a log. Every resolution creates proof.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { stat: "11", label: "Service categories" },
              { stat: "2", label: "Products, 1 flywheel" },
              { stat: "Phase 3", label: "AI — Live" },
            ].map((item, i) => (
              <div key={i} style={{ padding: 20, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>{item.stat}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* FOOTER */}
      <footer className="footer" style={{ background: "var(--bg-secondary)", padding: "60px 24px 24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", marginBottom: 40 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 40, marginBottom: 40 }}>
            {[
              { title: "Product", links: [{ label: "Directory", href: "#products" }, { label: "Relay OS", href: "#relay-pillar" }, { label: "AI Insights", href: "https://app.qresolve.com/login" }] },
              { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "mailto:hello@qresolve.com" }, { label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>{col.title}</h4>
                <ul style={{ listStyle: "none" }}>
                  {col.links.map((link, j) => (
                    <li key={j} style={{ marginBottom: 12 }}>
                      <a href={link.href} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            © 2026 QResolve — Q-Resolve Analytics Private Limited
          </div>
        </div>
      </footer>
    </>
  );
}
