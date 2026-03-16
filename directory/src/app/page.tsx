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
  ChevronRight
} from "lucide-react";

const citySlugMap: Record<string, string> = {
  "Mumbai": "mumbai",
  "Delhi NCR": "delhi",
  "Bangalore": "bangalore",
  "Hyderabad": "hyderabad",
  "Chennai": "chennai",
  "Pune": "pune",
  "Kolkata": "kolkata",
  "Ahmedabad": "ahmedabad",
};

const slugify = (text: string) =>
  text.toLowerCase().trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const categories = [
  { icon: <Store size={22} />, title: "Vending & Automated Retail", sub: "Machines, kiosks, micro-markets", slug: "vending-and-automated-retail" },
  { icon: <Zap size={22} />, title: "EV Charger Maintenance", sub: "Charging posts, payment terminals", slug: "ev-charger-maintenance" },
  { icon: <ArrowUpToLine size={22} />, title: "Lift Engineers", sub: "Passenger, freight, escalators", slug: "lift-and-escalator" },
  { icon: <Wind size={22} />, title: "HVAC Servicing", sub: "Cooling, heating, ventilation", slug: "hvac-refrigeration" },
  { icon: <Sparkles size={22} />, title: "Commercial Cleaning", sub: "Office, retail, industrial spaces", slug: "commercial-cleaning" },
  { icon: <Flame size={22} />, title: "Fire Safety", sub: "Alarms, extinguishers, compliance", slug: "fire-safety-systems" },
  { icon: <Shield size={22} />, title: "Security & Access", sub: "CCTV, access control, alarms", slug: "security-and-access" },
  { icon: <Sun size={22} />, title: "Solar & Energy", sub: "Panels, battery, EPC", slug: "solar-and-energy" },
  { icon: <Plug2 size={22} />, title: "Electrical Services", sub: "Testing, installation, emergency", slug: "electrical-services" },
  { icon: <Droplets size={22} />, title: "Plumbing & Water", sub: "Pipes, boilers, water treatment", slug: "plumbing-and-water" },
  { icon: <Car size={22} />, title: "Car Repair Services", sub: "Multi-brand car service & repair", slug: "car-repair-services" },
];

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
        <div className="hero-badge"><span /> Building India&apos;s first performance-ranked maintenance directory</div>
        <h1>Find the right people<br />to fix <em>every asset</em></h1>
        <p className="hero-sub">
          One directory of maintenance service providers — ranked by <strong>real performance data</strong>, not just promises. Starting with Delhi NCR, expanding city by city.
        </p>
        <div className="audience-split">
          <a href="#categories" className="audience-card">
            <div className="audience-label">I need a repair</div>
            <h3>Find a verified provider</h3>
            <p>Search by asset type and location. Compare providers on actual response times, resolution rates, and verified reviews.</p>
            <span className="audience-action">Browse categories <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span>
          </a>
          <a href="#relay" className="audience-card">
            <div className="audience-label">I&apos;m a service provider</div>
            <h3>Grow with Relay</h3>
            <p>Get a free directory listing. Upgrade to Relay for QR-based fault reporting, job tracking, and the verified badge that wins contracts.</p>
            <span className="audience-action">Explore Relay <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span>
          </a>
        </div>
      </div>

      <div className="divider"><div className="divider-line" /></div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="qr-explainer reveal" ref={addReveal}>
        <div className="qr-left">
          <div className="section-label">How it works</div>
          <h2 className="section-title">A QR sticker on every asset.<br /><em>Anyone</em> can report a fault.</h2>
          <p className="section-desc">The &ldquo;Q&rdquo; in QResolve is the QR code. Providers stick a code on each asset they maintain. When something breaks, anyone — a cleaner, a guard, a tenant — scans it and reports the issue in under 10 seconds. No app download, no training.</p>
          <div className="qr-steps">
            {[
              { n: "1", h: "Scan the QR code", p: "Any smartphone camera. Opens directly in the browser — no app needed." },
              { n: "2", h: "Asset auto-identified", p: "Name, location, and service history are pre-loaded. Reporter just describes the fault." },
              { n: "3", h: "Right technician dispatched", p: "The provider's dashboard triages by priority. Technician gets a push notification with full context." },
              { n: "4", h: "Everything is logged", p: "Response time, resolution, client confirmation — all timestamped. This data builds the provider's verified profile." },
            ].map((s) => (
              <div className="qr-step" key={s.n}>
                <div className="qr-step-num">{s.n}</div>
                <div><h4>{s.h}</h4><p>{s.p}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="qr-demo-visual">
          <div className="qr-phone-mock">
            <div className="qr-phone-notch" />
            <div className="qr-phone-screen">
              <div className="qr-icon">
                <div className="qr-grid">
                  {[1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1].map((f, i) => (
                    <span key={i} className={f ? "filled" : "empty"} />
                  ))}
                </div>
              </div>
              <div className="qr-phone-title">Report a Fault</div>
              <div className="qr-phone-subtitle">Vending Machine · Lobby B, Tower 3</div>
              <div className="qr-phone-field"><div className="qr-phone-field-label">Asset</div><div className="qr-phone-field-value">Freshcase VM-200 #0847</div></div>
              <div className="qr-phone-field"><div className="qr-phone-field-label">Issue</div><div className="qr-phone-field-value">Card reader not accepting UPI</div></div>
              <div className="qr-phone-btn">Submit Report →</div>
              <div className="qr-phone-timer">Avg. time to submit: <strong>8 seconds</strong></div>
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

      {/* HONESTY */}
      <div className="honesty-section" id="early-access">
        <div className="honesty-inner reveal" ref={addReveal}>
          <div>
            <div className="section-label">Where we are today</div>
            <h2 className="section-title">We&apos;re early. And we&apos;re being honest about it.</h2>
            <p className="section-desc" style={{ marginTop: 16 }}>Most directories launch with inflated numbers. We&apos;d rather show you exactly where we stand and grow alongside the providers who believe in transparent, data-backed service delivery.</p>
          </div>
          <div className="honesty-right">
            {[
              { v: "Delhi NCR", l: "Our launch city — proving the model here first" },
              { v: "6", l: "Service categories live and growing" },
              { v: "Free", l: "To list your business during early access" },
              { v: "30 days", l: "Free Relay trial for founding providers" },
            ].map((s) => (
              <div className="honesty-stat" key={s.l}><div className="honesty-stat-value">{s.v}</div><div className="honesty-stat-label">{s.l}</div></div>
            ))}
            <div className="honesty-note"><strong>Founding provider perks:</strong> Early providers help shape the platform and get priority placement, a locked-in rate, and direct access to our team. We grow when you grow.</div>
          </div>
        </div>
      </div>

      {/* RELAY */}
      <section id="relay" className="reveal" ref={addReveal}>
        <div className="relay-teaser-inner">
          <div>
            <div className="relay-label">For Service Providers</div>
            <h2>Relay — the operating system for <em>your</em> service business</h2>
            <p className="relay-teaser-desc">You handle the repairs. Relay handles everything else — fault reports via QR code, job tracking, technician dispatch, compliance logs, and the verified performance data that wins you contracts on QResolve.</p>
            <div className="relay-features-mini">
              {["QR fault reporting", "OIC dashboard", "Technician dispatch", "Audit trail", "Verified badge", "Procurement intel"].map((f) => (
                <span className="relay-feat-tag" key={f}>{f}</span>
              ))}
            </div>
            <div className="relay-pricing-hint">Starting at <strong>₹4,999/month</strong> · Free 30-day trial · No credit card required</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#list-your-business" className="btn btn-purple">Start Free Trial</a>
              <a href="#pricing" className="btn btn-outline">See Pricing →</a>
            </div>
          </div>
          <div className="relay-preview-card">
            <div className="relay-preview-header">
              <div className="relay-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <div><div className="relay-preview-title">Relay Dashboard</div><div className="relay-preview-subtitle">PrecisionMaint Services · Today</div></div>
            </div>
            <div className="relay-mini-stats">
              {[{ l: "Open tickets", v: "7", c: "warn" }, { l: "Resolved today", v: "12", c: "good" }, { l: "Avg response", v: "11m", c: "good" }, { l: "SLA compliance", v: "98%", c: "good" }].map((s) => (
                <div className="relay-mini-stat" key={s.l}><div className="relay-mini-stat-label">{s.l}</div><div className={`relay-mini-stat-value ${s.c}`}>{s.v}</div></div>
              ))}
            </div>
            <div className="relay-job-list">
              {[
                { n: "VM-200 #0847 · Card reader", s: "active", l: "In Progress" },
                { n: "VM-150 #0392 · Display error", s: "resolved", l: "Resolved" },
                { n: "VM-200 #1104 · Coin jam", s: "resolved", l: "Resolved" },
              ].map((j) => (
                <div className="relay-job" key={j.n}><span className="relay-job-name">{j.n}</span><span className={`relay-job-status ${j.s}`}>{j.l}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* PRICING */}
      <section id="pricing" className="reveal" ref={addReveal}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div className="section-label">Pricing</div>
          <h2 className="section-title" style={{ margin: "0 auto" }}>Simple plans. No hidden costs.</h2>
          <p className="section-desc" style={{ margin: "16px auto 0", textAlign: "center" }}>Both plans include a free 30-day trial. No credit card required to start.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-name">Relay Starter</div>
            <div className="pricing-price">₹4,999 <span>/month</span></div>
            <p className="pricing-desc">For providers managing up to 100 assets across a single city. Everything you need to look professional and prove your performance.</p>
            <ul className="pricing-features">
              {["QR code generation & asset mapping", "No-app fault reporting (under 10 seconds)", "OIC Dashboard with revenue-impact triage", "Technician assignment & notifications", "Immutable audit log & compliance exports", '"Verified by Relay" badge on QResolve', "Real-time status URL for reporters"].map((f) => <li key={f}>{f}</li>)}
            </ul>
            <a href="#list-your-business" className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>Start Free 30-Day Trial</a>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-name">Relay Pro</div>
            <div className="pricing-price">₹12,999 <span>/month</span></div>
            <p className="pricing-desc">For providers scaling across multiple clients and cities. Advanced analytics that turn fault data into strategic advantage.</p>
            <ul className="pricing-features">
              {["Everything in Starter", "Unlimited assets & multi-city support", "Procurement Intelligence reports", "Vendor Reliability & TCO analysis", "Micro-Friction Index per asset", "Priority lead access on QResolve", '"Relay Elite" badge & top placement'].map((f) => <li key={f}>{f}</li>)}
            </ul>
            <a href="#list-your-business" className="btn btn-purple" style={{ width: "100%", justifyContent: "center" }}>Start Free 30-Day Trial</a>
          </div>
        </div>
      </section>

      <div className="divider"><div className="divider-line" /></div>

      {/* BLOG */}
      <section id="blog" className="reveal" ref={addReveal}>
        <div className="section-label">From the blog</div>
        <h2 className="section-title">Thinking about maintenance, differently</h2>
        <p className="section-desc">Insights on building a transparent service economy in India.</p>
        <div className="blog-grid">
          {[
            { slug: "trust-problem", tag: "Industry", emoji: "📊", title: "Why India's ₹4 lakh crore maintenance market has a trust problem", excerpt: "The gap between what service providers promise and what they deliver costs facility managers crores every year." },
            { slug: "qr-scan", tag: "Product", emoji: "📱", title: "How a 10-second QR scan replaces a 4-hour fault reporting chain", excerpt: "The average time from fault to work order in Indian commercial buildings is over 4 hours. We built Relay to make it under 60 seconds." },
            { slug: "law-to-saas", tag: "Founder", emoji: "🏢", title: "From law school to SaaS: why I'm building for India's service providers", excerpt: "How studying evidence law at Leeds led me to build a platform that proves service provider performance with data." },
          ].map((post) => (
            <a key={post.slug} href="#blog" className="blog-card" onClick={(e) => { e.preventDefault(); setActiveBlog(post.slug); document.body.style.overflow = "hidden"; }}>
              <div className="blog-card-image">
                <div className="blog-card-image-inner">{post.emoji}</div>
                <span className="blog-card-tag">{post.tag}</span>
              </div>
              <div className="blog-card-body">
                <div className="blog-card-title">{post.title}</div>
                <div className="blog-card-excerpt">{post.excerpt}</div>
                <div className="blog-card-date">March 2026</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* BLOG OVERLAY */}
      {activeBlog && blogData[activeBlog] && (
        <div className="blog-page-overlay open" id="blog-page-overlay">
          <div className="blog-page-nav">
            <button className="blog-back-btn" onClick={() => { setActiveBlog(null); document.body.style.overflow = ""; }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to QResolve
            </button>
            <a href="#list-your-business" className="nav-cta" onClick={() => { setActiveBlog(null); document.body.style.overflow = ""; }} style={{ padding: "8px 20px", background: "var(--accent)", color: "var(--bg-primary)", borderRadius: "100px", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>List Your Business</a>
          </div>
          <div className="blog-page-content">
            <span className="blog-page-tag">{blogData[activeBlog].tag}</span>
            <h1>{blogData[activeBlog].title}</h1>
            <div className="blog-page-meta">{blogData[activeBlog].date} · QResolve Blog</div>
            <div className="blog-page-body" dangerouslySetInnerHTML={{ __html: blogData[activeBlog].body }} />
            <div className="blog-page-cta">
              <h3>Interested in QResolve?</h3>
              <p>List your service business for free during early access.</p>
              <a href="#list-your-business" className="btn btn-accent" onClick={() => { setActiveBlog(null); document.body.style.overflow = ""; }}>Claim Your Free Listing</a>
            </div>
          </div>
        </div>
      )}

      <div className="divider"><div className="divider-line" /></div>

      {/* FOUNDER */}
      <section id="about" className="reveal" ref={addReveal}>
        <div className="section-label">Our story</div>
        <h2 className="section-title" style={{ marginBottom: 32 }}>Why I&apos;m building QResolve</h2>
        <div className="founder-strip">
          <div className="founder-avatar-lg">S</div>
          <div className="founder-body">
            <div className="founder-meta">
              <span className="founder-meta-name">Founder</span>
              <div className="founder-meta-tags">
                <span>Law · Leeds &amp; Exeter</span>
                <span>SaaS Builder</span>
                <span>Delhi NCR</span>
              </div>
            </div>
            <blockquote>&ldquo;A vending machine goes down, someone calls someone, who texts someone, who maybe sends a technician tomorrow. No data, no accountability, no proof anything happened.&rdquo;</blockquote>
            <p className="founder-text">
              I studied law — not the obvious path to building a maintenance SaaS. But law taught me that <strong>evidence matters</strong>, and India&apos;s commercial maintenance industry has almost none. QResolve fixes that with a QR code on every asset, 10-second fault reporting, and a verified performance record that lets the next facility manager choose based on data, not sales pitches.
            </p>
            <a href="#contact" className="founder-cta">
              Say hello <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <div className="contact-section" id="contact">
        <div className="contact-inner reveal" ref={addReveal}>
          <div>
            <div className="section-label">Get in touch</div>
            <h2 className="section-title">We&apos;d love to hear from you</h2>
            <p className="section-desc" style={{ marginTop: 16 }}>Whether you&apos;re a facility manager looking for providers, a service company exploring Relay, or just curious — drop us a line.</p>
            <div className="contact-channels">
              {[
                { href: "mailto:hello@qresolve.com", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>, h: "Email us", p: "hello@qresolve.com" },
                { href: "https://twitter.com/qresolvesupport", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" fill="currentColor" stroke="none" /></svg>, h: "Follow on X", p: "@qresolvesupport" },
                { href: "https://linkedin.com/company/qresolve", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>, h: "LinkedIn", p: "Q-Resolve Analytics" },
              ].map((ch) => (
                <a key={ch.h} href={ch.href} className="contact-channel" target={ch.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  <div className="contact-channel-icon">{ch.icon}</div>
                  <div><h4>{ch.h}</h4><p>{ch.p}</p></div>
                </a>
              ))}
            </div>
          </div>
          <div id="list-your-business">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, marginBottom: 6 }}>List your business</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>Free during early access. Takes 2 minutes.</p>
            {!formSuccess ? (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-row">
                  <div className="contact-field"><label htmlFor="name">Your name</label><input type="text" id="name" placeholder="Full name" required /></div>
                  <div className="contact-field"><label htmlFor="email">Email</label><input type="email" id="email" placeholder="you@company.com" required /></div>
                </div>
                <div className="contact-field"><label htmlFor="company">Company name</label><input type="text" id="company" placeholder="Your service company name" /></div>
                <div className="contact-row">
                  <div className="contact-field">
                    <label htmlFor="category">Service category</label>
                    <select id="category">
                      <option value="">Select a category...</option>
                      {categories.map((c) => <option key={c.slug}>{c.title}</option>)}
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="contact-field"><label htmlFor="city">City</label><input type="text" id="city" placeholder="e.g. Delhi NCR, Mumbai" /></div>
                </div>
                <div className="contact-field"><label htmlFor="message">Anything else? (optional)</label><textarea id="message" placeholder="Tell us about your business..." /></div>
                <button type="submit" className="btn btn-accent" style={{ width: "100%", justifyContent: "center", padding: "14px 28px", fontSize: 15 }}>
                  Submit — Get Your Free Listing
                </button>
                <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>Free during early access · We&apos;ll reach out within 24 hours</p>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <div style={{ fontSize: 48, marginBottom: 16, color: "var(--accent)" }}>✓</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, marginBottom: 8 }}>You&apos;re in!</h3>
                <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>We&apos;ll be in touch within 24 hours to get your listing set up. Welcome to QResolve.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <section style={{ textAlign: "center", paddingTop: 60, paddingBottom: 80 }} className="reveal" ref={addReveal}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400, letterSpacing: -1, lineHeight: 1.15, marginBottom: 16 }}>
          Two products.<br />One growth engine.
        </h2>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
          QResolve brings you the clients. Relay helps you keep them. List for free, upgrade to Verified, and let your performance data do the selling.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#list-your-business" className="btn btn-accent">Claim Your Free Listing</a>
          <a href="#relay" className="btn btn-outline">Explore Relay →</a>
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
                <li><a href="#early-access">Delhi NCR</a></li>
                <li><a href="#contact">Request a Category</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">For Providers</div>
              <ul className="footer-links">
                <li><a href="https://app.qresolve.com/signup">List Your Business</a></li>
                <li><a href="#relay">Relay Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#early-access">Founding Provider Program</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links">
                <li><a href="#about">Our Story</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#contact">Contact</a></li>
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
