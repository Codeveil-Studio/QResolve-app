import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Landing() {
  const { user, organization, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#06d6a0] border-t-transparent" />
      </div>
    );
  }

  if (user && organization) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && !organization) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="qresolve-landing">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <a href="#hero" className="nav-logo group">
          <svg viewBox="0 0 28 28" fill="none" className="transition-transform group-hover:scale-110">
            <rect x="2" y="2" width="24" height="24" rx="6" stroke="#06d6a0" strokeWidth="2.5" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="#06d6a0" />
            <rect x="15" y="8" width="5" height="5" rx="1" fill="#06d6a0" opacity="0.5" />
            <rect x="8" y="15" width="5" height="5" rx="1" fill="#06d6a0" opacity="0.5" />
            <rect x="15" y="15" width="5" height="5" rx="1" fill="#06d6a0" opacity="0.3" />
          </svg>
          <span>
            <em>Q</em>Resolve
          </span>
        </a>
        <div className="nav-links">
          <a href="#categories">Categories</a>
          <a href="#how">How It Works</a>
          <a href="#verified">Verified Providers</a>
          <a href="#urgent">Urgent Repair</a>
          <a href="#relay">Relay for Providers</a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="nav-cta"
            onClick={() => navigate('/signup')}
          >
            List Your Business
          </motion.button>
        </div>
      </motion.nav>

      <section className="hero" id="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <motion.div
          className="hero-inner"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp} className="hero-badge hover:bg-[rgba(6,214,160,0.2)] transition-colors cursor-default">
            <span className="dot" />
            India's trusted provider directory
          </motion.div>

          <motion.h1 variants={fadeInUp}>
            Find the right people
            <br />
            to fix <span className="accent">every asset</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="hero-sub">
            Vending machines. EV chargers. Lifts. HVAC. Cleaning. One directory of verified
            service providers — ranked by real performance data, not just promises.
          </motion.p>

          <motion.div variants={fadeInUp} className="hero-search group hover:shadow-[0_8px_50px_rgba(6,214,160,0.2)] transition-shadow">
            <input
              type="text"
              placeholder="What needs fixing? e.g. coffee machine, lift, EV charger..."
            />
            <select>
              <option>All locations</option>
              <option>Mumbai</option>
              <option>Delhi NCR</option>
              <option>Bangalore</option>
              <option>Hyderabad</option>
              <option>Chennai</option>
              <option>Pune</option>
              <option>Kolkata</option>
              <option>Ahmedabad</option>
            </select>
            <button type="button">Search</button>
          </motion.div>

          <motion.div variants={fadeInUp} className="hero-tags">
            {['Vending Repair', 'EV Charger Maintenance', 'Lift Engineers', 'Commercial Cleaning', 'HVAC Servicing', 'Fire Safety'].map((tag) => (
              <motion.span whileHover={{ scale: 1.05 }} key={tag}>{tag}</motion.span>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="hero-stats">
            <div className="hero-stat">
              <div className="num">5,000+</div>
              <div className="label">Service Providers</div>
            </div>
            <div className="hero-stat">
              <div className="num">120+</div>
              <div className="label">Service Categories</div>
            </div>
            <div className="hero-stat">
              <div className="num">50+</div>
              <div className="label">Cities Covered</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="categories" id="categories">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="section-label">Browse by Category</div>
          <h2>Every asset. One directory.</h2>
          <p>
            From coffee machines to cooling towers — find specialists for the assets that keep
            your buildings running.
          </p>
        </motion.div>

        <motion.div
          className="cat-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {[
            { icon: '🏗️', title: 'Vending & Automated Retail', desc: 'Machines, kiosks, micro-markets' },
            { icon: '⚡', title: 'EV Charger Maintenance', desc: 'Charging posts, payment terminals' },
            { icon: '🛗', title: 'Lift & Escalator', desc: 'Passenger lifts, goods lifts, escalators' },
            { icon: '❄️', title: 'HVAC & Refrigeration', desc: 'Air conditioning, chillers, heat pumps' },
            { icon: '🧹', title: 'Commercial Cleaning', desc: 'Offices, restrooms, deep cleans' },
            { icon: '🔥', title: 'Fire Safety Systems', desc: 'Alarms, sprinklers, extinguishers' },
            { icon: '🔌', title: 'Electrical Services', desc: 'Testing, installation, emergency' },
            { icon: '🚰', title: 'Plumbing & Water', desc: 'Pipes, boilers, water treatment' },
            { icon: '🔐', title: 'Security & Access', desc: 'CCTV, access control, intruder alarms' },
            { icon: '☀️', title: 'Solar & Energy', desc: 'Solar panels, battery storage, EPC' },
          ].map((cat, i) => (
            <motion.div variants={scaleIn} whileHover={{ y: -8, scale: 1.02 }} className="cat-card" key={i}>
              <motion.span
                className="cat-icon inline-block"
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                {cat.icon}
              </motion.span>
              <h4>{cat.title}</h4>
              <p>{cat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="how" id="how">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="section-label">How QResolve Works</div>
          <h2>Three ways to find the right provider</h2>
          <p>
            Whether you're browsing, comparing, or need someone right now — we've got you
            covered.
          </p>
        </motion.div>

        <motion.div
          className="how-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="how-card hover:bg-slate-800/20 transition-colors">
            <div className="how-num">01</div>
            <h3>Search the directory</h3>
            <p>
              Browse thousands of service providers by category, location, and asset type.
              Filter by verified status, response time, and ratings. Every provider profile
              shows the information you actually need.
            </p>
            <span className="how-tag">Free — no account needed</span>
          </motion.div>
          <motion.div variants={fadeInUp} className="how-card hover:bg-slate-800/20 transition-colors">
            <div className="how-num">02</div>
            <h3>Compare on real data</h3>
            <p>
              Providers with the{' '}
              <strong style={{ color: 'var(--teal)' }}>Verified by Relay</strong> badge have
              their performance tracked by our platform — average response time, resolution
              rate, and verified reviews. Not self-reported. Measured.
            </p>
            <span className="how-tag">Data from real service delivery</span>
          </motion.div>
          <motion.div variants={fadeInUp} className="how-card hover:bg-slate-800/20 transition-colors">
            <div className="how-num">03</div>
            <h3>Request urgent repair</h3>
            <p>
              Need someone now? Submit an urgent repair request and we'll dispatch it to the
              top 3 verified providers in your area. The fastest to respond wins the job. You
              get a fix, not a phone tree.
            </p>
            <span className="how-tag">Matched in under 60 seconds</span>
          </motion.div>
        </motion.div>
      </section>

      <section className="verified" id="verified">
        <div className="verified-inner">
          <motion.div
            className="verified-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="section-label">The Verified Difference</motion.div>
            <motion.h2 variants={fadeInUp}>
              Performance you can see.
              <br />
              Not promises you can't.
            </motion.h2>
            <motion.p variants={fadeInUp}>
              Any provider can claim they're fast and reliable. Verified providers prove it.
              Our platform tracks every job from report to resolution — so you see real
              numbers, not marketing copy.
            </motion.p>
            <div className="verified-features">
              <motion.div variants={fadeInUp} className="vf hover:translate-x-2 transition-transform cursor-default">
                <div className="vf-icon">⏱</div>
                <div className="vf-text">
                  <h4>Measured Response Time</h4>
                  <p>
                    Tracked from the moment a fault is reported to the moment a technician is
                    dispatched. No self-reporting.
                  </p>
                </div>
              </motion.div>
              <motion.div variants={fadeInUp} className="vf hover:translate-x-2 transition-transform cursor-default">
                <div className="vf-icon">✓</div>
                <div className="vf-text">
                  <h4>Verified Resolution Rate</h4>
                  <p>
                    What percentage of jobs are completed within the agreed SLA? You'll see
                    the actual number on their profile.
                  </p>
                </div>
              </motion.div>
              <motion.div variants={fadeInUp} className="vf hover:translate-x-2 transition-transform cursor-default">
                <div className="vf-icon">📊</div>
                <div className="vf-text">
                  <h4>Auditable Service Trail</h4>
                  <p>
                    Every report, every status update, every completion — logged with
                    timestamps. If there's ever a dispute, the data settles it.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            className="verified-visual"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="v-float shadow-[0_0_30px_rgba(6,214,160,0.3)]"
            >
              ✓ Verified by Relay
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="v-card hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-shadow">
              <div className="v-card-header">
                <div className="v-avatar">PM</div>
                <div>
                  <h4>PrecisionMaint Services</h4>
                  <p>Vending &amp; Automated Retail • Mumbai, Maharashtra</p>
                </div>
                <div className="v-badge">✓ Verified</div>
              </div>
              <div className="v-metrics">
                <div className="v-metric">
                  <div className="val">12m</div>
                  <div className="lbl">Avg Response</div>
                </div>
                <div className="v-metric">
                  <div className="val">97%</div>
                  <div className="lbl">Resolution Rate</div>
                </div>
                <div className="v-metric">
                  <div className="val">142</div>
                  <div className="lbl">Jobs This Month</div>
                </div>
              </div>
              <div className="v-reviews">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="v-review-text">
                "Fastest response we've ever had. Card reader fixed before lunch. Data shows
                it."
              </p>
              <a href="#!" className="v-cta group flex items-center gap-2">
                View Full Profile
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="urgent" id="urgent">
        <motion.div
          className="urgent-inner relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="section-label">Need It Fixed Now?</div>
          <h2>Submit an urgent repair request</h2>
          <p>
            Describe the issue. We match you with verified providers in your area. The first
            to respond gets the job.
          </p>
          <motion.div
            className="urgent-form bg-[#0a1628]/50 backdrop-blur-sm border border-[#06d6a0]/20"
            whileHover={{ boxShadow: "0 10px 40px rgba(6, 214, 160, 0.1)" }}
          >
            <div className="uf-row">
              <div>
                <label className="uf-label" htmlFor="asset-type">Asset type</label>
                <select id="asset-type" className="uf-input focus:ring-2 focus:ring-[#06d6a0] focus:border-transparent transition-all">
                  <option>Select asset type...</option>
                  <option>Vending Machine</option>
                  <option>EV Charger</option>
                  <option>Passenger Lift</option>
                  <option>HVAC / Air Conditioning</option>
                  <option>Coffee Machine</option>
                  <option>Escalator</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="uf-label" htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  className="uf-input focus:ring-2 focus:ring-[#06d6a0] focus:border-transparent transition-all"
                  placeholder="PIN code or city name"
                />
              </div>
            </div>
            <div className="uf-full">
              <label className="uf-label" htmlFor="issue">What's the issue?</label>
              <textarea
                id="issue"
                className="uf-input focus:ring-2 focus:ring-[#06d6a0] focus:border-transparent transition-all min-h-[100px]"
                placeholder="e.g. Card reader not accepting payments, machine displaying error code E12..."
              />
            </div>
            <div className="uf-full">
              <label className="uf-label" htmlFor="email">Your email (for provider responses)</label>
              <input
                id="email"
                type="email"
                className="uf-input focus:ring-2 focus:ring-[#06d6a0] focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" className="uf-submit">
              Find Verified Providers →
            </motion.button>
            <p className="uf-note">
              Dispatched to the top 3 verified providers near you. Free to submit — providers pay
              to respond.
            </p>
          </motion.div>
        </motion.div>
      </section>

      <section className="relay" id="relay">
        <div className="relay-inner">
          <motion.div
            className="relay-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="section-label" style={{ color: 'var(--violet)' }}>
              For Service Providers
            </motion.div>
            <motion.div variants={fadeInUp} className="relay-brand">
              <div className="relay-brand-icon">
                <svg viewBox="0 0 22 22" fill="none">
                  <path d="M4 11h14M11 4v14M7 7l8 8M15 7l-8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
                </svg>
              </div>
              <span>Relay</span>
            </motion.div>
            <motion.h2 variants={fadeInUp}>
              The operating system for
              <br />
              service providers
            </motion.h2>
            <motion.p variants={fadeInUp}>
              You handle the repairs. Relay handles everything else — fault reports, job tracking,
              technician dispatch, compliance logs, and the data that wins you contracts.
            </motion.p>
          </motion.div>

          <motion.div
            className="relay-flow"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={scaleIn} className="rf-step hover:bg-[#162240] transition-colors rounded-xl p-4 cursor-default">
              <div className="rf-step-num">📱</div>
              <h4>Stick a QR Code</h4>
              <p>Put a Relay QR sticker on every asset you manage</p>
            </motion.div>
            <motion.div variants={scaleIn} className="rf-step hover:bg-[#162240] transition-colors rounded-xl p-4 cursor-default">
              <div className="rf-step-num">⚡</div>
              <h4>Anyone Reports</h4>
              <p>Anyone scans it and reports a fault in under 10 seconds — no app needed</p>
            </motion.div>
            <motion.div variants={scaleIn} className="rf-step hover:bg-[#162240] transition-colors rounded-xl p-4 cursor-default">
              <div className="rf-step-num">📊</div>
              <h4>You See Everything</h4>
              <p>Reports land in your dashboard, triaged by revenue impact, with GPS and photos</p>
            </motion.div>
            <motion.div variants={scaleIn} className="rf-step hover:bg-[#162240] transition-colors rounded-xl p-4 cursor-default">
              <div className="rf-step-num">✅</div>
              <h4>Prove You Delivered</h4>
              <p>Every action logged. Response times tracked. Clients see the data, not excuses</p>
            </motion.div>
          </motion.div>

          <motion.div
            className="relay-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              { icon: '📲', title: 'QR-Powered Fault Reporting', desc: 'Your clients report issues by scanning a QR code. No phone calls, no app downloads, no forms to fill. Asset name and location auto-populated. Report submitted in 10 seconds flat.', tag: 'Core', tagClass: 'rf-tag--core' },
              { icon: '🎯', title: 'Revenue-Impact Triage', desc: "Not all faults are equal. Relay's OIC dashboard ranks every ticket by revenue risk — a card reader failure on a busy machine jumps to the top. A missing sticker stays at the bottom.", tag: 'Core', tagClass: 'rf-tag--core' },
              { icon: '🗺️', title: 'Heatmap & Dispatch', desc: 'See where faults cluster on a live map. Identify problem buildings. Pre-position technicians before the next call. Dispatch the right person to the right place with one tap.', tag: 'Core', tagClass: 'rf-tag--core' },
              { icon: '📋', title: 'Immutable Audit Trail', desc: 'Every report, every status change, every resolution — timestamped and tamper-proof. When a client questions your response time, the data answers for you. Legal-grade compliance built in.', tag: 'Core', tagClass: 'rf-tag--core' },
              { icon: '🔍', title: 'Procurement Intelligence', desc: "Which manufacturer's machines fail most? Which parts cost you the most over time? Relay aggregates your fault data into Vendor Reliability Reports that turn you from repair person into strategic advisor.", tag: 'Pro', tagClass: 'rf-tag--pro' },
              { icon: '🏅', title: '"Verified by Relay" Badge', desc: 'Active Relay subscribers earn a verified badge on their QResolve directory profile — with live response times and resolution rates. You rank higher, get more leads, and win more contracts.', tag: 'Core', tagClass: 'rf-tag--core' }
            ].map((feat, i) => (
              <motion.div variants={fadeInUp} whileHover={{ y: -5, borderColor: "rgba(167, 139, 250, 0.3)" }} className="relay-feature bg-[#0A1222] hover:bg-[#0D182B] transition-colors border border-transparent duration-300" key={i}>
                <div className="rf-icon">{feat.icon}</div>
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
                <span className={`rf-tag ${feat.tagClass}`}>{feat.tag}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="relay-pricing"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="rp-card hover:-translate-y-2 transition-transform duration-300 border border-[#162240] hover:border-[#a78bfa]/30 group">
              <div className="rp-name">Relay Starter</div>
              <div className="rp-price">
                ₹4,999 <span>/month</span>
              </div>
              <p className="rp-desc">
                For providers managing up to 100 assets across a single city. Everything you need to
                look professional and prove your performance.
              </p>
              <ul className="rp-features">
                <li>QR code generation &amp; asset mapping</li>
                <li>No-app fault reporting (under 10 seconds)</li>
                <li>OIC Dashboard with revenue-impact triage</li>
                <li>Technician assignment &amp; notifications</li>
                <li>Immutable audit log &amp; compliance exports</li>
                <li>"Verified by Relay" badge on QResolve</li>
                <li>Real-time status URL for reporters</li>
              </ul>
              <a href="#!" className="rp-cta rp-cta--outline group-hover:bg-[#a78bfa]/10 transition-colors">
                Start Free 30-Day Trial
              </a>
            </motion.div>
            <motion.div variants={fadeInUp} className="rp-card rp-card--pro hover:-translate-y-2 transition-transform duration-300 group">
              <div className="rp-name">Relay Pro</div>
              <div className="rp-price">
                ₹12,999 <span>/month</span>
              </div>
              <p className="rp-desc">
                For providers scaling across multiple clients and cities. Advanced analytics that
                turn fault data into strategic advantage.
              </p>
              <ul className="rp-features">
                <li>Everything in Starter</li>
                <li>Unlimited assets &amp; multi-city support</li>
                <li>Procurement Intelligence reports</li>
                <li>Vendor Reliability &amp; TCO analysis</li>
                <li>Micro-Friction Index per asset</li>
                <li>Priority lead access on QResolve</li>
                <li>"Relay Elite" badge &amp; top placement</li>
                <li>Dedicated account support</li>
              </ul>
              <a href="#!" className="rp-cta rp-cta--fill group-hover:opacity-90 transition-opacity">
                Start Free 30-Day Trial
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="cta" id="list">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2>Two products. One growth engine.</h2>
          <p>
            QResolve brings you the clients. Relay helps you keep them. List for free, upgrade to
            Verified, and let your performance data do the selling.
          </p>
          <div className="cta-buttons">
            <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#!" className="cta-primary shadow-[0_4px_20px_rgba(6,214,160,0.3)]">
              Claim Your Free Listing
            </motion.a>
            <motion.a whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }} whileTap={{ scale: 0.95 }} href="#relay" className="cta-secondary">
              Explore Relay →
            </motion.a>
          </div>
        </motion.div>
      </section>

      <footer>
        <p>
          © 2026 QResolve — Q-Resolve Analytics Private Limited, India.{' '}
          <a href="#!" className="hover:text-white transition-colors">Privacy</a> · <a href="#!" className="hover:text-white transition-colors">Terms</a> · <a href="#!" className="hover:text-white transition-colors">For Providers</a>
        </p>
      </footer>
    </div>
  );
}
