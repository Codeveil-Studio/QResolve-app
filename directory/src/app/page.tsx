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
  PhoneOff,
  MessageSquare,
  VolumeX,
  TrendingDown,
  Search,
  Puzzle,
  CheckCircle,
  Smartphone
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

const blogData: Record<string, { tag: string; title: string; date: string; body: string }> = {
  "trust-problem": {
    tag: "Industry",
    title: "Why India's ₹4 lakh crore maintenance market has a trust problem",
    date: "March 2026 · 6 min read",
    body: `<p>India's commercial maintenance and facility services market is enormous — estimated at over ₹4 lakh crore annually. Yet for all its scale, the industry operates with almost zero transparency.</p><h2>The WhatsApp problem</h2><p>Walk into any facility management office in Delhi, Mumbai, or Bangalore and ask how they track service provider performance. The answer is almost always the same: <strong>WhatsApp groups, phone calls, and spreadsheets maintained by someone who left six months ago.</strong></p><h2>Why data changes everything</h2><p>The fix isn't more regulation or bigger contracts. It's <strong>measurement</strong>. When every fault report is timestamped, every technician dispatch is logged, and every resolution is confirmed by the client — the data speaks for itself.</p><blockquote>When you can see that Provider A responds in 12 minutes with a 97% resolution rate, and Provider B takes 4 hours with a 68% rate — the decision makes itself.</blockquote>`,
  },
  "qr-scan": {
    tag: "Product",
    title: "How a 10-second QR scan replaces a 4-hour fault reporting chain",
    date: "March 2026 · 5 min read",
    body: `<p>The average time between "something breaks" and "a technician is dispatched" in Indian commercial buildings is over 4 hours. Not because technicians are slow — but because the reporting chain is broken at every step.</p><h2>What if anyone could report a fault in 10 seconds?</h2><p>The service provider sticks a small QR code on every asset they maintain. When something goes wrong, <strong>anyone</strong> pulls out their phone and scans. No app download. No login. No training. Average time: <strong>8 seconds</strong>.</p><blockquote>The 4-hour gap doesn't shrink. It disappears. The report goes from the person who saw the problem directly to the person who can fix it.</blockquote>`,
  },
  "law-to-saas": {
    tag: "Founder",
    title: "From law school to SaaS: why I'm building for India's service providers",
    date: "March 2026 · 4 min read",
    body: `<p>People often ask how someone with a law degree from Leeds and Exeter ended up building a maintenance SaaS in Delhi. Law school teaches you that <strong>claims without evidence are worthless</strong>. In a courtroom, it doesn't matter what you say happened — it matters what you can prove happened.</p><blockquote>Every QR scan creates a timestamp. Every dispatch creates a log. Every resolution creates a verified data point. Over time, this builds an evidence trail that tells the true story of a provider's performance.</blockquote>`,
  },
};

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHowTab, setActiveHowTab] = useState<"dir" | "relay">("dir");
  const [activeBlog, setActiveBlog] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(true);
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
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#categories">Categories</a></li>
          <li><a href="#verified">Why Verified</a></li>
          <li><a href="#relay">For Providers</a></li>
          <li><a href="#about">Our Story</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="https://app.qresolve.com/login">Login</a></li>
          <li><a href="https://app.qresolve.com/signup" className="nav-cta">List Your Business</a></li>
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
        {["#how-it-works", "#categories", "#verified", "#relay", "#pricing", "#about", "#blog", "#contact"].map((href) => (
          <a key={href} href={href} onClick={closeMobileMenu}>{href.replace("#", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</a>
        ))}
        <a href="#list-your-business" className="mobile-cta" onClick={closeMobileMenu}>List Your Business — Free</a>
      </div>

      {/* HERO */}
      <div className="hero" id="top">
        <div className="hero-badge"><span />Building India&apos;s first performance-ranked maintenance directory</div>
        <h1>Find the right provider.<br /><em>Fix it</em> before anyone notices.</h1>
        <p className="hero-sub">
          Two products. One mission. QResolve is the marketplace where operators find verified service providers. Relay is the operating system that replaces WhatsApp chaos with structured dispatch. Together, they create a flywheel no standalone tool can match.
        </p>
        <HeroSearch />
      </div>

      <div className="divider"><div className="divider-line" /></div>

      {/* TWO PRODUCTS SPLIT */}
      <section className="split reveal" id="products" ref={addReveal}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 className="section-title" style={{ margin: "0 auto" }}>Two products. One flywheel.</h2>
          <p className="section-desc" style={{ margin: "16px auto 0" }}>Each one is powerful alone. Together, they compound — every lead from the directory makes Relay stickier, and every Relay customer strengthens the directory.</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }} className="audience-split">
          {/* DIRECTORY CARD */}
          <div className="product-card directory">
            <div className="pc-badge">◉ The Marketplace</div>
            <h3>QResolve.com</h3>
            <p className="pc-tagline">India&apos;s first specialized directory for built environment maintenance. Not a generic listing site — a performance-ranked marketplace where operators find providers who actually show up.</p>
            
            <ul className="pc-features">
              <li><ChevronRight size={16} /> Search by asset type: vending, EV chargers, lifts, HVAC, cleaning, fire safety</li>
              <li><ChevronRight size={16} /> Providers ranked by real resolution data — not just reviews</li>
              <li><ChevronRight size={16} /> &ldquo;Verified by Relay&rdquo; badge = proof the provider uses structured operations</li>
              <li><ChevronRight size={16} /> Submit urgent repair requests — matched to top providers in your area</li>
            </ul>
            
            <div className="pc-who">
              <div className="pc-who-label">Who is this for?</div>
              <p>Facility managers, building operators, fleet operators, and anyone managing physical assets who needs a reliable service provider — fast.</p>
            </div>
            
            <a href="#categories" className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>Search Providers on QResolve →</a>
          </div>

          {/* RELAY CARD */}
          <div className="product-card relay">
            <div className="pc-badge">◉ The SaaS Operating System</div>
            <h3>Relay by QResolve</h3>
            <p className="pc-tagline">The operating system for maintenance service providers. Replace WhatsApp groups, missed calls, and lost photos with QR-triggered tickets, structured dispatch, and an immutable audit trail.</p>
            
            <ul className="pc-features">
              <li><ChevronRight size={16} /> QR code on each asset — anyone scans, reports a fault in 30 seconds</li>
              <li><ChevronRight size={16} /> Instant structured ticket: location, photos, fault type, severity</li>
              <li><ChevronRight size={16} /> Smart dispatch to the right technician based on skill, proximity, load</li>
              <li><ChevronRight size={16} /> Immutable audit trail — every status change timestamped and read-only</li>
            </ul>
            
            <div className="pc-who">
              <div className="pc-who-label">Who is this for?</div>
              <p>Maintenance service providers, vending operators, EV charging networks, elevator contractors — anyone managing a fleet of physical assets.</p>
            </div>
            
            <a href="https://app.qresolve.com/signup" className="btn btn-purple" style={{ width: "100%", justifyContent: "center" }}>Start Free with Relay →</a>
          </div>
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* PAIN */}
      <section className="pain" id="pain">
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }} className="reveal" ref={addReveal}>
          <h2 className="section-title" style={{ margin: "0 auto" }}>The status quo is expensive. You just can&apos;t see it.</h2>
          <p className="section-desc" style={{ margin: "16px auto 48px" }}>Every unreported fault is invisible revenue loss. Every WhatsApp message is an audit trail that doesn&apos;t exist. Here&apos;s what&apos;s actually happening.</p>
          <div className="pain-grid">
            <div className="pain-card">
              <div className="pain-icon"><PhoneOff size={32} /></div>
              <h4>Faults go unreported</h4>
              <p>A broken EV charger, a jammed vending machine, a stuck lift — users walk away. You find out days later from an angry tweet, not a ticket.</p>
            </div>
            <div className="pain-card">
              <div className="pain-icon"><MessageSquare size={32} /></div>
              <h4>WhatsApp is your &ldquo;system&rdquo;</h4>
              <p>Photos in group chats. Voice notes from technicians. No timestamps, no SLAs, no way to know who&apos;s accountable for what.</p>
            </div>
            <div className="pain-card">
              <div className="pain-icon"><VolumeX size={32} /></div>
              <h4>No audit trail exists</h4>
              <p>When a client asks &ldquo;how quickly did you fix that?&rdquo;, you scroll through 300 WhatsApp messages. If you can find them at all.</p>
            </div>
            <div className="pain-card">
              <div className="pain-icon"><TrendingDown size={32} /></div>
              <h4>Silent revenue bleed</h4>
              <p>For a 50-charger EV network, even 10% downtime improvement can recover ₹2–3 lakh per month. But you can&apos;t fix what you can&apos;t see.</p>
            </div>
            <div className="pain-card">
              <div className="pain-icon"><Search size={32} /></div>
              <h4>No way to prove quality</h4>
              <p>You&apos;re a great service provider. But without data, your pitch is &ldquo;trust us&rdquo; — same as every competitor. No proof, no differentiation.</p>
            </div>
            <div className="pain-card">
              <div className="pain-icon"><Puzzle size={32} /></div>
              <h4>Finding providers is luck</h4>
              <p>Facility managers rely on word-of-mouth and Justdial for maintenance providers. No specialization, no performance data, no accountability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FLYWHEEL */}
      <section className="flywheel reveal" id="flywheel" ref={addReveal}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="pc-badge" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>◈ The QResolve Flywheel</div>
            <h2 className="section-title" style={{ margin: "0 auto" }}>The more they use it, the stronger it gets.</h2>
            <p className="section-desc" style={{ margin: "16px auto 0" }}>QResolve and Relay aren&apos;t two separate products duct-taped together. They&apos;re a closed loop — each one makes the other more valuable.</p>
          </div>
          <div className="fw-steps">
            <div className="fw-step">
              <div className="fw-num">01</div>
              <h4>Directory generates leads</h4>
              <p>Facility managers search QResolve.com for providers. Inbound leads flow to listed providers.</p>
            </div>
            <div className="fw-step">
              <div className="fw-num">02</div>
              <h4>Providers adopt Relay</h4>
              <p>To manage those leads efficiently, providers sign up for Relay. No more WhatsApp chaos.</p>
            </div>
            <div className="fw-step">
              <div className="fw-num">03</div>
              <h4>Relay earns &ldquo;Verified&rdquo; badge</h4>
              <p>Providers processing tickets transparently earn the performance-backed &ldquo;Verified by Relay&rdquo; badge.</p>
            </div>
            <div className="fw-step">
              <div className="fw-num">04</div>
              <h4>Badge boosts rankings</h4>
              <p>Verified providers rank higher on QResolve → more leads → more Relay usage. Loop closed.</p>
            </div>
          </div>
          <div className="fw-loop">↻ Cycle repeats — each revolution makes both products more valuable</div>
        </div>
      </section>

      {/* HOW IT WORKS (TABS) */}
      <section className="how" id="how-it-works">
        <div style={{ maxWidth: 1100, margin: "0 auto" }} className="reveal" ref={addReveal}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 className="section-title" style={{ margin: "0 auto" }}>How it works</h2>
            <p className="section-desc" style={{ margin: "16px auto 0" }}>Two different user journeys. One connected system.</p>
          </div>
          <div className="how-tabs">
            <button 
              className={`how-tab ${activeHowTab === "dir" ? "active-dir" : ""}`}
              onClick={() => setActiveHowTab("dir")}
            >
              QResolve Directory
            </button>
            <button 
              className={`how-tab ${activeHowTab === "relay" ? "active-relay" : ""}`}
              onClick={() => setActiveHowTab("relay")}
            >
              Relay by QResolve
            </button>
          </div>

          {activeHowTab === "dir" && (
            <div className="how-panel-dir" style={{ animation: "fadeUp 0.4s ease" }}>
              <div className="how-steps">
                <div className="how-step">
                  <div className="step-num">01</div>
                  <h4>Search by asset type & location</h4>
                  <p>Need a vending machine technician in Mumbai? An EV charger service provider in Bangalore? Search QResolve by what you need and where.</p>
                </div>
                <div className="how-step">
                  <div className="step-num">02</div>
                  <h4>Compare real performance data</h4>
                  <p>Providers are ranked by response times, resolution rates, and specialization — not just Google reviews. &ldquo;Verified by Relay&rdquo; means they use structured operations.</p>
                </div>
                <div className="how-step">
                  <div className="step-num">03</div>
                  <h4>Connect & dispatch</h4>
                  <p>Send a repair request directly through QResolve. Matched to the top 3 verified providers near you. First to respond gets the job.</p>
                </div>
              </div>
            </div>
          )}

          {activeHowTab === "relay" && (
            <div className="how-panel-relay" style={{ animation: "fadeUp 0.4s ease" }}>
              <div className="how-steps">
                <div className="how-step">
                  <div className="step-num" style={{ color: "var(--purple)" }}>01</div>
                  <h4>Stick a QR code on the asset</h4>
                  <p>Every asset — charger, vending machine, lift — gets a unique QR code. Anyone can scan it. No app download, no login required.</p>
                </div>
                <div className="how-step">
                  <div className="step-num" style={{ color: "var(--purple)" }}>02</div>
                  <h4>Fault reported in 30 seconds</h4>
                  <p>The reporter selects fault type, takes a photo, adds a note. Ticket auto-tagged with asset ID, location, timestamp. Structured from the start.</p>
                </div>
                <div className="how-step">
                  <div className="step-num" style={{ color: "var(--purple)" }}>03</div>
                  <h4>Right technician dispatched</h4>
                  <p>Relay routes the ticket to the right person based on skill, proximity, and workload. Full audit trail — every status change timestamped and immutable.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* QR DEMO (NO-APP) */}
      <section className="reveal" ref={addReveal}>
        <div className="qr-explainer">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div style={{ width: 180, height: 180, background: "var(--surface)", border: "2px solid var(--purple)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ position: "absolute", inset: -8, border: "1px dashed rgba(167, 139, 250, 0.3)", borderRadius: 20 }} />
              <div className="qr-grid" style={{ width: 120, height: 120, gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
                {[1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1].map((f, i) => (
                  <span key={i} className={f ? "filled" : "empty"} style={{ background: f ? "var(--purple)" : "var(--surface)" }} />
                ))}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--purple)", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>Scan → Report → Resolved</div>
          </div>
          <div>
            <div className="section-label">The No-App Mandate</div>
            <h2 className="section-title" style={{ fontSize: 32, marginBottom: 16 }}>Fast. Frictionless. <span style={{ color: "var(--purple)", fontStyle: "italic" }}>Foolproof.</span></h2>
            <p className="section-desc" style={{ marginBottom: 24 }}>Relay&apos;s QR codes open right in the browser. No app store. No login. No friction. A user at a broken EV charger scans, taps the fault type, takes a photo, and walks away. The ticket is live.</p>
            <p className="section-desc" style={{ marginBottom: 32 }}>This is intentional. The person reporting a fault isn&apos;t your employee — they&apos;re a stranger. The lower the friction, the more faults get reported, the faster you fix them, the less revenue you lose.</p>
            
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--purple)" }}>&lt;30s</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Report time</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--purple)" }}>0</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Apps to install</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--purple)" }}>0</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Logins required</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* CATEGORIES */}
      <section id="categories" className="reveal" ref={addReveal}>
        <div className="section-label">Service categories</div>
        <h2 className="section-title">From coffee machines to cooling towers</h2>
        <p className="section-desc">Find specialists for the assets that keep your buildings running.</p>
        
        <div className="city-selector-container">
          <button 
            className={`city-pill ${city === "all" ? "active" : ""}`}
            onClick={() => setCity("all")}
          >
            All India
          </button>
          {Object.keys(citySlugMap).map((cityName) => (
            <button
              key={cityName}
              className={`city-pill ${city === cityName ? "active" : ""}`}
              onClick={() => setCity(cityName)}
            >
              {cityName}
            </button>
          ))}
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.slug} className="cat-card" onClick={() => handleCatClick(cat.slug)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleCatClick(cat.slug)}>
              <div className="cat-icon">{cat.icon}</div>
              <div className="cat-name">{cat.title}</div>
              <div className="cat-sub">{cat.sub}</div>
            </div>
          ))}
        </div>
        <p className="categories-note">More categories added as providers join. Don&apos;t see yours? <a href="#contact">Let us know →</a></p>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* VERIFIED */}
      <section id="verified" className="verified-section reveal" ref={addReveal}>
        <div>
          <div className="section-label">The verified difference</div>
          <h2 className="section-title">Performance you can see. Not promises you can&apos;t.</h2>
          <p className="section-desc">Every provider with the &ldquo;Verified by Relay&rdquo; badge has their performance tracked through real service delivery — not self-reported claims.</p>
          <div className="verified-features">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, h: "Measured Response Time", p: "From the moment a fault is reported to when a technician is dispatched. No self-reporting." },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, h: "Verified Resolution Rate", p: "What percentage of jobs are completed within the agreed SLA. You see the actual number." },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>, h: "Auditable Service Trail", p: "Every report, every status change, every completion — timestamped and tamper-proof." },
            ].map((f) => (
              <div className="verified-feature" key={f.h}>
                <div className="verified-feature-icon">{f.icon}</div>
                <div><h4>{f.h}</h4><p>{f.p}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="provider-card-mock">
          <div className="provider-header">
            <div className="provider-info">
              <div className="provider-avatar">PM</div>
              <div><div className="provider-name">PrecisionMaint Services</div><div className="provider-type">Vending &amp; Automated Retail · Mumbai</div></div>
            </div>
            <div className="verified-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              Verified
            </div>
          </div>
          <div className="provider-stats">
            {[{ v: "12m", l: "Avg Response" }, { v: "97%", l: "Resolution Rate" }, { v: "142", l: "Jobs This Month" }].map((s) => (
              <div className="provider-stat" key={s.l}><div className="provider-stat-value">{s.v}</div><div className="provider-stat-label">{s.l}</div></div>
            ))}
          </div>
          <div className="provider-review">
            <div className="provider-stars">★★★★★</div>
            <div className="provider-review-text">&ldquo;Fastest response we&apos;ve ever had. Card reader fixed before lunch. Data shows everything — no more chasing WhatsApp updates.&rdquo;</div>
            <div className="provider-review-author">— Facility Manager, WeWork BKC</div>
          </div>
          <div className="provider-data-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Data from real service delivery via Relay
          </div>
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* PRICING */}
      <section id="pricing" className="reveal" ref={addReveal}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div className="section-label">Pricing</div>
          <h2 className="section-title" style={{ margin: "0 auto" }}>Simple plans. No hidden costs.</h2>
          <p className="section-desc" style={{ margin: "16px auto 0", textAlign: "center" }}>Start free on the directory. Upgrade when you're ready to grow.</p>
        </div>
        <div className="pricing-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="pricing-card">
            <div className="pricing-name" style={{ color: "var(--accent)" }}>Free Listing</div>
            <div className="pricing-price">₹0 <span>/forever</span></div>
            <p className="pricing-desc">A professional directory presence on QResolve. Ideal for providers looking to generate inbound leads.</p>
            <ul className="pricing-features">
              <li>Category & City placement</li>
              <li>Basic company profile</li>
              <li>Receive direct repair requests</li>
              <li>Customer reviews</li>
            </ul>
            <a href="https://app.qresolve.com/signup" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>Claim Free Profile</a>
          </div>
          <div className="pricing-card">
            <div className="pricing-name">Relay Starter</div>
            <div className="pricing-price">₹4,999 <span>/month</span></div>
            <p className="pricing-desc">For providers managing up to 100 assets. Everything you need to look professional and prove your performance.</p>
            <ul className="pricing-features">
              <li>QR fault reporting (no-app)</li>
              <li>OIC Dashboard & triaging</li>
              <li>Technician dispatch</li>
              <li>Immutable audit log</li>
              <li>"Verified by Relay" badge</li>
            </ul>
            <a href="https://app.qresolve.com/signup" className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>Start Free Trial</a>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-name">Relay Pro</div>
            <div className="pricing-price">₹12,999 <span>/month</span></div>
            <p className="pricing-desc">For providers scaling across multiple clients and cities. Advanced analytics that turn fault data into strategic advantage.</p>
            <ul className="pricing-features">
              <li>Everything in Starter</li>
              <li>Unlimited assets & multi-city</li>
              <li>Procurement Intelligence reports</li>
              <li>Vendor Reliability analysis</li>
              <li>Priority lead access on QResolve</li>
            </ul>
            <a href="https://app.qresolve.com/signup" className="btn btn-purple" style={{ width: "100%", justifyContent: "center" }}>Start Free Trial</a>
          </div>
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* FINAL CTA */}
      <section style={{ textAlign: "center", paddingTop: 60, paddingBottom: 80 }} className="reveal" ref={addReveal}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400, letterSpacing: -1, lineHeight: 1.15, marginBottom: 16 }}>
          Two products.<br />One growth engine.
        </h2>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
          QResolve brings you the clients. Relay helps you keep them. List for free, upgrade to Verified, and let your performance data do the selling.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://app.qresolve.com/signup" className="btn btn-accent">Claim Your Free Listing</a>
          <a href="#how-it-works" className="btn btn-outline" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setActiveHowTab('relay'); }}>Explore Relay →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <a href="#top" className="nav-logo" style={{ display: "inline-flex" }}>
                <div className="nav-logo-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#0a0f0d" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="16" y="16" width="3" height="3" rx="0.5" /></svg></div>
                <span className="nav-logo-text">QResolve</span>
              </a>
              <p className="footer-brand-desc">India&apos;s first maintenance provider directory ranked by verified performance data. QR-powered fault reporting that keeps buildings running.</p>
              <p className="footer-company">Q-Resolve Analytics Private Limited, India</p>
            </div>
            <div>
              <div className="footer-col-title">Directory</div>
              <ul className="footer-links">
                <li><a href="#categories">Browse Categories</a></li>
                <li><a href="#verified">Verified Providers</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">For Providers</div>
              <ul className="footer-links">
                <li><a href="https://app.qresolve.com/signup">List Your Business</a></li>
                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setActiveHowTab('relay'); }}>Relay Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links">
                <li><a href="mailto:hello@qresolve.com">Contact</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 QResolve — Q-Resolve Analytics Private Limited</span>
            <div className="footer-socials">
              <a href="https://twitter.com/qresolvesupport" target="_blank" rel="noreferrer" aria-label="X/Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://linkedin.com/company/qresolve" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="mailto:hello@qresolve.com" aria-label="Email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

