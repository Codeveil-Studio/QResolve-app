import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Landing() {
  const { user, organization, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
      <nav>
        <a href="#hero" className="nav-logo">
          <svg viewBox="0 0 28 28" fill="none">
            <rect
              x="2"
              y="2"
              width="24"
              height="24"
              rx="6"
              stroke="#06d6a0"
              strokeWidth="2.5"
            />
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
          <button
            type="button"
            className="nav-cta"
            onClick={() => navigate('/signup')}
          >
            List Your Business
          </button>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="dot" />
            India's trusted provider directory
          </div>
          <h1>
            Find the right people
            <br />
            to fix <span className="accent">every asset</span>
          </h1>
          <p className="hero-sub">
            Vending machines. EV chargers. Lifts. HVAC. Cleaning. One directory of verified
            service providers — ranked by real performance data, not just promises.
          </p>

          <div className="hero-search">
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
          </div>

          <div className="hero-tags">
            <span>Vending Repair</span>
            <span>EV Charger Maintenance</span>
            <span>Lift Engineers</span>
            <span>Commercial Cleaning</span>
            <span>HVAC Servicing</span>
            <span>Fire Safety</span>
          </div>

          <div className="hero-stats">
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
          </div>
        </div>
      </section>

      <section className="categories" id="categories">
        <div className="section-header">
          <div className="section-label">Browse by Category</div>
          <h2>Every asset. One directory.</h2>
          <p>
            From coffee machines to cooling towers — find specialists for the assets that keep
            your buildings running.
          </p>
        </div>
        <div className="cat-grid">
          <div className="cat-card">
            <span className="cat-icon">🏗️</span>
            <h4>Vending &amp; Automated Retail</h4>
            <p>Machines, kiosks, micro-markets</p>
          </div>
          <div className="cat-card">
            <span className="cat-icon">⚡</span>
            <h4>EV Charger Maintenance</h4>
            <p>Charging posts, payment terminals</p>
          </div>
          <div className="cat-card">
            <span className="cat-icon">🛗</span>
            <h4>Lift &amp; Escalator</h4>
            <p>Passenger lifts, goods lifts, escalators</p>
          </div>
          <div className="cat-card">
            <span className="cat-icon">❄️</span>
            <h4>HVAC &amp; Refrigeration</h4>
            <p>Air conditioning, chillers, heat pumps</p>
          </div>
          <div className="cat-card">
            <span className="cat-icon">🧹</span>
            <h4>Commercial Cleaning</h4>
            <p>Offices, restrooms, deep cleans</p>
          </div>
          <div className="cat-card">
            <span className="cat-icon">🔥</span>
            <h4>Fire Safety Systems</h4>
            <p>Alarms, sprinklers, extinguishers</p>
          </div>
          <div className="cat-card">
            <span className="cat-icon">🔌</span>
            <h4>Electrical Services</h4>
            <p>Testing, installation, emergency</p>
          </div>
          <div className="cat-card">
            <span className="cat-icon">🚰</span>
            <h4>Plumbing &amp; Water</h4>
            <p>Pipes, boilers, water treatment</p>
          </div>
          <div className="cat-card">
            <span className="cat-icon">🔐</span>
            <h4>Security &amp; Access</h4>
            <p>CCTV, access control, intruder alarms</p>
          </div>
          <div className="cat-card">
            <span className="cat-icon">☀️</span>
            <h4>Solar &amp; Energy</h4>
            <p>Solar panels, battery storage, EPC</p>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-header">
          <div className="section-label">How QResolve Works</div>
          <h2>Three ways to find the right provider</h2>
          <p>
            Whether you're browsing, comparing, or need someone right now — we've got you
            covered.
          </p>
        </div>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-num">01</div>
            <h3>Search the directory</h3>
            <p>
              Browse thousands of service providers by category, location, and asset type.
              Filter by verified status, response time, and ratings. Every provider profile
              shows the information you actually need.
            </p>
            <span className="how-tag">Free — no account needed</span>
          </div>
          <div className="how-card">
            <div className="how-num">02</div>
            <h3>Compare on real data</h3>
            <p>
              Providers with the{' '}
              <strong style={{ color: 'var(--teal)' }}>Verified by Relay</strong> badge have
              their performance tracked by our platform — average response time, resolution
              rate, and verified reviews. Not self-reported. Measured.
            </p>
            <span className="how-tag">Data from real service delivery</span>
          </div>
          <div className="how-card">
            <div className="how-num">03</div>
            <h3>Request urgent repair</h3>
            <p>
              Need someone now? Submit an urgent repair request and we'll dispatch it to the
              top 3 verified providers in your area. The fastest to respond wins the job. You
              get a fix, not a phone tree.
            </p>
            <span className="how-tag">Matched in under 60 seconds</span>
          </div>
        </div>
      </section>

      <section className="verified" id="verified">
        <div className="verified-inner">
          <div className="verified-content">
            <div className="section-label">The Verified Difference</div>
            <h2>
              Performance you can see.
              <br />
              Not promises you can't.
            </h2>
            <p>
              Any provider can claim they're fast and reliable. Verified providers prove it.
              Our platform tracks every job from report to resolution — so you see real
              numbers, not marketing copy.
            </p>
            <div className="verified-features">
              <div className="vf">
                <div className="vf-icon">⏱</div>
                <div className="vf-text">
                  <h4>Measured Response Time</h4>
                  <p>
                    Tracked from the moment a fault is reported to the moment a technician is
                    dispatched. No self-reporting.
                  </p>
                </div>
              </div>
              <div className="vf">
                <div className="vf-icon">✓</div>
                <div className="vf-text">
                  <h4>Verified Resolution Rate</h4>
                  <p>
                    What percentage of jobs are completed within the agreed SLA? You'll see
                    the actual number on their profile.
                  </p>
                </div>
              </div>
              <div className="vf">
                <div className="vf-icon">📊</div>
                <div className="vf-text">
                  <h4>Auditable Service Trail</h4>
                  <p>
                    Every report, every status update, every completion — logged with
                    timestamps. If there's ever a dispute, the data settles it.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="verified-visual">
            <div className="v-float">✓ Verified by Relay</div>
            <div className="v-card">
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
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="v-review-text">
                "Fastest response we've ever had. Card reader fixed before lunch. Data shows
                it."
              </p>
              <a href="#!" className="v-cta">
                View Full Profile →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="urgent" id="urgent">
        <div className="urgent-inner">
          <div className="section-label">Need It Fixed Now?</div>
          <h2>Submit an urgent repair request</h2>
          <p>
            Describe the issue. We match you with verified providers in your area. The first
            to respond gets the job.
          </p>
          <div className="urgent-form">
            <div className="uf-row">
              <div>
                <label className="uf-label" htmlFor="asset-type">
                  Asset type
                </label>
                <select id="asset-type" className="uf-input">
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
                <label className="uf-label" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  className="uf-input"
                  placeholder="PIN code or city name"
                />
              </div>
            </div>
            <div className="uf-full">
              <label className="uf-label" htmlFor="issue">
                What's the issue?
              </label>
              <textarea
                id="issue"
                className="uf-input"
                placeholder="e.g. Card reader not accepting payments, machine displaying error code E12..."
              />
            </div>
            <div className="uf-full">
              <label className="uf-label" htmlFor="email">
                Your email (for provider responses)
              </label>
              <input
                id="email"
                type="email"
                className="uf-input"
                placeholder="your@email.com"
              />
            </div>
            <button type="button" className="uf-submit">
              Find Verified Providers →
            </button>
            <p className="uf-note">
              Dispatched to the top 3 verified providers near you. Free to submit — providers pay
              to respond.
            </p>
          </div>
        </div>
      </section>

      <section className="relay" id="relay">
        <div className="relay-inner">
          <div className="relay-header">
            <div className="section-label" style={{ color: 'var(--violet)' }}>
              For Service Providers
            </div>
            <div className="relay-brand">
              <div className="relay-brand-icon">
                <svg viewBox="0 0 22 22" fill="none">
                  <path
                    d="M4 11h14M11 4v14M7 7l8 8M15 7l-8 8"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                </svg>
              </div>
              <span>Relay</span>
            </div>
            <h2>
              The operating system for
              <br />
              service providers
            </h2>
            <p>
              You handle the repairs. Relay handles everything else — fault reports, job tracking,
              technician dispatch, compliance logs, and the data that wins you contracts.
            </p>
          </div>

          <div className="relay-flow">
            <div className="rf-step">
              <div className="rf-step-num">📱</div>
              <h4>Stick a QR Code</h4>
              <p>Put a Relay QR sticker on every asset you manage</p>
            </div>
            <div className="rf-step">
              <div className="rf-step-num">⚡</div>
              <h4>Anyone Reports</h4>
              <p>Anyone scans it and reports a fault in under 10 seconds — no app needed</p>
            </div>
            <div className="rf-step">
              <div className="rf-step-num">📊</div>
              <h4>You See Everything</h4>
              <p>
                Reports land in your dashboard, triaged by revenue impact, with GPS and photos
              </p>
            </div>
            <div className="rf-step">
              <div className="rf-step-num">✅</div>
              <h4>Prove You Delivered</h4>
              <p>
                Every action logged. Response times tracked. Clients see the data, not excuses
              </p>
            </div>
          </div>

          <div className="relay-grid">
            <div className="relay-feature">
              <div className="rf-icon">📲</div>
              <h4>QR-Powered Fault Reporting</h4>
              <p>
                Your clients report issues by scanning a QR code. No phone calls, no app downloads,
                no forms to fill. Asset name and location auto-populated. Report submitted in 10
                seconds flat.
              </p>
              <span className="rf-tag rf-tag--core">Core</span>
            </div>
            <div className="relay-feature">
              <div className="rf-icon">🎯</div>
              <h4>Revenue-Impact Triage</h4>
              <p>
                Not all faults are equal. Relay's OIC dashboard ranks every ticket by revenue risk —
                a card reader failure on a busy machine jumps to the top. A missing sticker stays at
                the bottom.
              </p>
              <span className="rf-tag rf-tag--core">Core</span>
            </div>
            <div className="relay-feature">
              <div className="rf-icon">🗺️</div>
              <h4>Heatmap &amp; Dispatch</h4>
              <p>
                See where faults cluster on a live map. Identify problem buildings. Pre-position
                technicians before the next call. Dispatch the right person to the right place with
                one tap.
              </p>
              <span className="rf-tag rf-tag--core">Core</span>
            </div>
            <div className="relay-feature">
              <div className="rf-icon">📋</div>
              <h4>Immutable Audit Trail</h4>
              <p>
                Every report, every status change, every resolution — timestamped and tamper-proof.
                When a client questions your response time, the data answers for you. Legal-grade
                compliance built in.
              </p>
              <span className="rf-tag rf-tag--core">Core</span>
            </div>
            <div className="relay-feature">
              <div className="rf-icon">🔍</div>
              <h4>Procurement Intelligence</h4>
              <p>
                Which manufacturer's machines fail most? Which parts cost you the most over time?
                Relay aggregates your fault data into Vendor Reliability Reports that turn you from
                repair person into strategic advisor.
              </p>
              <span className="rf-tag rf-tag--pro">Pro</span>
            </div>
            <div className="relay-feature">
              <div className="rf-icon">🏅</div>
              <h4>"Verified by Relay" Badge</h4>
              <p>
                Active Relay subscribers earn a verified badge on their QResolve directory profile —
                with live response times and resolution rates. You rank higher, get more leads, and
                win more contracts.
              </p>
              <span className="rf-tag rf-tag--core">Core</span>
            </div>
          </div>

          <div className="relay-pricing">
            <div className="rp-card">
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
              <a href="#!" className="rp-cta rp-cta--outline">
                Start Free 30-Day Trial
              </a>
            </div>
            <div className="rp-card rp-card--pro">
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
              <a href="#!" className="rp-cta rp-cta--fill">
                Start Free 30-Day Trial
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="cta" id="list">
        <h2>Two products. One growth engine.</h2>
        <p>
          QResolve brings you the clients. Relay helps you keep them. List for free, upgrade to
          Verified, and let your performance data do the selling.
        </p>
        <div className="cta-buttons">
          <a href="#!" className="cta-primary">
            Claim Your Free Listing
          </a>
          <a href="#relay" className="cta-secondary">
            Explore Relay →
          </a>
        </div>
      </section>

      <footer>
        <p>
          © 2026 QResolve — Q-Resolve Analytics Private Limited, India.{' '}
          <a href="#!">Privacy</a> · <a href="#!">Terms</a> · <a href="#!">For Providers</a>
        </p>
      </footer>
    </div>
  );
}
