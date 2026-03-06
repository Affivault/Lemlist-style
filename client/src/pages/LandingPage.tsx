import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  Check,
  BarChart3,
  Users,
  Shield,
  Zap,
  Sparkles,
  Lock,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { SkySendLogo } from '../components/SkySendLogo';

// ─── Data ──────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Zap,
    title: 'Intelligent Sequences',
    description:
      'Multi-step campaigns with AI-optimised send times, smart delays, and conditional branching that adapts to every prospect\'s behaviour.',
  },
  {
    icon: Users,
    title: 'Contact Intelligence',
    description:
      'Import, enrich, and segment contacts at scale. AI-powered field mapping and automatic deduplication keeps your data pristine.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description:
      'Granular dashboards with A/B testing insights. Track every open, click, and reply across the full length of your pipeline.',
  },
  {
    icon: Shield,
    title: 'Deliverability Engine',
    description:
      'Built-in email warmup, reputation monitoring, and domain health scoring ensures your emails land in the primary inbox every time.',
  },
  {
    icon: Sparkles,
    title: 'SARA AI Inbox',
    description:
      'Smart reply classification automatically tags intent. AI response drafting turns hours of inbox triage into seconds.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description:
      'SOC 2 compliant with end-to-end encryption, SSO integration, and granular role-based access controls built for large teams.',
  },
];

const stats = [
  { value: '10M+', label: 'Emails delivered monthly', icon: Mail },
  { value: '98.7%', label: 'Average deliverability rate', icon: TrendingUp },
  { value: '3.2×', label: 'Reply rate improvement', icon: RefreshCw },
  { value: '500+', label: 'Enterprise teams active', icon: Users },
];

const testimonials = [
  {
    quote:
      'SkySend transformed our outbound pipeline. We went from 2% to 12% reply rates in three weeks. The AI-driven send optimisation alone was worth the switch.',
    author: 'Sarah Chen',
    role: 'Head of Sales',
    company: 'TechCorp',
    metric: '6×',
    metricLabel: 'Reply rate increase',
    initials: 'SC',
  },
  {
    quote:
      'We replaced three tools with SkySend. The unified platform saved us $40K annually while improving every metric across the board.',
    author: 'David Kim',
    role: 'CRO',
    company: 'Meridian',
    metric: '$40K',
    metricLabel: 'Annual savings',
    initials: 'DK',
  },
  {
    quote:
      'Our team doubled meeting bookings in the first month. The intelligent sequencing adapts to each prospect automatically — it feels like an extra SDR.',
    author: 'James Wright',
    role: 'Head of Revenue',
    company: 'Catalyst',
    metric: '2×',
    metricLabel: 'More meetings booked',
    initials: 'JW',
  },
  {
    quote:
      'SARA AI changed how we handle replies. What took hours now happens in minutes with better accuracy. The most impactful feature we have ever adopted.',
    author: 'Emily Park',
    role: 'Director of Marketing',
    company: 'ScaleUp',
    metric: '12×',
    metricLabel: 'Faster response time',
    initials: 'EP',
  },
  {
    quote:
      'The contact enrichment is remarkable. We imported 50K contacts and the AI mapped every field perfectly. Zero manual cleanup required.',
    author: 'Lisa Morales',
    role: 'Growth Lead',
    company: 'Vertex AI',
    metric: '50K',
    metricLabel: 'Contacts enriched',
    initials: 'LM',
  },
  {
    quote:
      'Deliverability went from 89% to 98.7% in two weeks after enabling the warmup engine. Our open rates followed immediately.',
    author: 'Marcus Johnson',
    role: 'VP Sales',
    company: 'GrowthLabs',
    metric: '98.7%',
    metricLabel: 'Deliverability rate',
    initials: 'MJ',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'For solo founders and small teams starting cold outreach.',
    features: [
      '2 team members',
      '5,000 emails per month',
      'AI-optimised sending',
      'Basic analytics dashboard',
      'Email support',
    ],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/month',
    description: 'For growing sales teams that need more power and AI.',
    features: [
      '10 team members',
      '50,000 emails per month',
      'SARA AI inbox',
      'Advanced analytics & A/B testing',
      'Custom domain warmup',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Unlimited scale with dedicated infrastructure and a CSM.',
    features: [
      'Unlimited team members',
      'Unlimited emails',
      'Dedicated IP pools',
      'SSO & SAML',
      'SLA guarantee',
      'Dedicated success manager',
    ],
    cta: 'Talk to sales',
    highlighted: false,
  },
];

const steps = [
  {
    number: '01',
    title: 'Import & Enrich Your Contacts',
    description:
      'Upload your prospect list and our AI automatically maps, enriches, and deduplicates every contact — no manual cleanup needed.',
    icon: Users,
  },
  {
    number: '02',
    title: 'Build Intelligent Sequences',
    description:
      'Create multi-step campaigns with AI-optimised timing and conditional logic that adapts in real time to each prospect\'s behaviour.',
    icon: Zap,
  },
  {
    number: '03',
    title: 'Monitor, Reply & Close',
    description:
      'Track every touchpoint live. SARA AI handles reply triage while you focus on the conversations that move deals forward.',
    icon: BarChart3,
  },
];

const mockCampaigns = [
  { name: 'Q4 Outreach — Series A Prospects', sent: '2,847', open: '67.2', reply: '18.4', active: true },
  { name: 'Partnership Discovery Campaign', sent: '1,203', open: '72.8', reply: '22.1', active: true },
  { name: 'Enterprise Demo Requests', sent: '892', open: '81.4', reply: '31.8', active: true },
  { name: 'Investor Relations — Round B', sent: '334', open: '88.3', reply: '41.2', active: false },
];

const logos = ['TechCorp', 'GrowthLabs', 'Meridian', 'Vertex AI', 'Catalyst', 'NexGen', 'Prism', 'ScaleUp'];

// ─── Hook ──────────────────────────────────────────────────────────────────

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-revealed');
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -48px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.lp-reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function LandingPage() {
  const pageRef = useScrollReveal();

  return (
    <div ref={pageRef} className="lp-root">

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-content">

            <Link to="/" className="lp-nav-logo">
              <SkySendLogo inverted />
            </Link>

            <div className="lp-nav-links">
              {[
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Customers', href: '#testimonials' },
                { label: 'Pricing', href: '#pricing' },
              ].map((item) => (
                <a key={item.label} href={item.href} className="lp-nav-link">
                  {item.label}
                </a>
              ))}
            </div>

            <div className="lp-nav-actions">
              <Link to="/login" className="lp-nav-login">Log in</Link>
              <Link to="/signup" className="lp-btn-primary">
                Get started free
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="lp-hero">
        <div className="lp-hero-grid" />
        <div className="lp-hero-glow" />

        <div className="lp-container lp-z1">
          <div className="lp-hero-inner">

            {/* Announcement pill */}
            <div className="lp-badge animate-fade-up">
              <span className="lp-badge-dot" />
              <span className="lp-badge-new">New</span>
              <span className="lp-badge-sep" />
              <span className="lp-badge-text">SARA AI now powered by GPT-4o</span>
              <ChevronRight size={12} className="lp-badge-arrow" />
            </div>

            {/* Headline */}
            <h1 className="lp-hero-headline animate-fade-up-delay-1">
              Turn Cold Contacts Into{' '}
              <span className="lp-gradient-text">Closed Deals</span>
            </h1>

            {/* Sub */}
            <p className="lp-hero-sub animate-fade-up-delay-2">
              The AI-powered outreach platform trusted by 500+ enterprise sales teams.
              Higher deliverability, better reply rates, less manual work.
            </p>

            {/* CTAs */}
            <div className="lp-hero-ctas animate-fade-up-delay-2">
              <Link to="/signup" className="lp-btn-hero-primary">
                Start for free
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="lp-btn-hero-ghost">
                View live dashboard
              </Link>
            </div>

            <p className="lp-hero-trust animate-fade-up-delay-3">
              Free 14-day trial&nbsp;·&nbsp;No credit card required&nbsp;·&nbsp;Cancel anytime
            </p>

          </div>

          {/* ── Product Mockup ─────────────────────────────────────────────── */}
          <div className="lp-mockup-wrap animate-fade-up-delay-3">
            <div className="lp-mockup">

              {/* Window chrome */}
              <div className="lp-mockup-chrome">
                <div className="lp-mockup-dots">
                  <span className="lp-dot" />
                  <span className="lp-dot" />
                  <span className="lp-dot" />
                </div>
                <span className="lp-mockup-title">SkySend — Active Campaigns</span>
                <div className="lp-mockup-live">
                  <span className="lp-live-dot" />
                  <span className="lp-live-label">3 campaigns live</span>
                </div>
              </div>

              {/* Body */}
              <div className="lp-mockup-body">

                <div className="lp-dash-topbar">
                  <div>
                    <div className="lp-dash-title">Campaign Overview</div>
                    <div className="lp-dash-subtitle">Last updated: just now</div>
                  </div>
                  <div className="lp-dash-new-btn">+ New Campaign</div>
                </div>

                <div className="lp-table-header-row">
                  <span>Campaign</span>
                  <span>Sent</span>
                  <span>Open rate</span>
                  <span>Reply rate</span>
                </div>

                {mockCampaigns.map((c, i) => (
                  <div
                    key={i}
                    className="lp-campaign-row"
                    style={{
                      background:
                        i === 0 ? 'rgba(99,102,241,0.07)'
                        : i === 1 ? 'rgba(255,255,255,0.015)'
                        : 'transparent',
                      border:
                        i === 0 ? '1px solid rgba(99,102,241,0.18)'
                        : '1px solid transparent',
                    }}
                  >
                    <div className="lp-campaign-name">
                      <span
                        className="lp-status-dot"
                        style={{
                          background: c.active ? '#22C55E' : '#3B3B3B',
                          boxShadow: c.active ? '0 0 6px rgba(34,197,94,0.55)' : 'none',
                        }}
                      />
                      {c.name}
                    </div>
                    <div className="lp-campaign-cell lp-cell-muted">{c.sent}</div>
                    <div className="lp-campaign-cell lp-cell-bold">{c.open}%</div>
                    <div
                      className="lp-campaign-cell lp-cell-bold"
                      style={{ color: parseFloat(c.reply) > 20 ? '#4ADE80' : '#E4E4E7' }}
                    >
                      {c.reply}%
                    </div>
                  </div>
                ))}

                {/* Mini stat cards */}
                <div className="lp-mini-stats">
                  {[
                    { label: 'Total Emails Sent', value: '5,276', change: '+12.4%' },
                    { label: 'Avg. Open Rate', value: '72.4%', change: '+8.1%' },
                    { label: 'Avg. Reply Rate', value: '28.4%', change: '+19.3%' },
                  ].map((s, i) => (
                    <div key={i} className="lp-mini-stat-card">
                      <div className="lp-mini-stat-label">{s.label}</div>
                      <div className="lp-mini-stat-bottom">
                        <span className="lp-mini-stat-value">{s.value}</span>
                        <span className="lp-mini-stat-change">{s.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══ LOGO STRIP ══════════════════════════════════════════════════════ */}
      <section className="lp-logos-section">
        <div className="lp-container">
          <p className="lp-logos-eyebrow">Trusted by teams at</p>
          <div className="lp-logos-row">
            {logos.map((name) => (
              <span key={name} className="lp-logo-name">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════════════════════ */}
      <section className="lp-stats-section">
        <div className="lp-container">
          <div className="lp-stats-grid">
            {stats.map((s, i) => (
              <div
                key={i}
                className="lp-reveal lp-stat-item"
                style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
              >
                <div className="lp-stat-big">{s.value}</div>
                <div className="lp-stat-caption">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════ */}
      <section id="features" className="lp-section">
        <div className="lp-container">
          <div className="lp-reveal lp-section-header">
            <div className="lp-section-tag">Features</div>
            <h2 className="lp-section-title">Everything you need to dominate outreach</h2>
            <p className="lp-section-sub">
              Built for enterprise sales teams who refuse to accept mediocre reply rates.
            </p>
          </div>
          <div className="lp-features-grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="lp-reveal lp-feature-card">
                  <div className="lp-feature-icon-wrap">
                    <Icon size={18} style={{ color: '#818CF8' }} />
                  </div>
                  <h3 className="lp-feature-title">{f.title}</h3>
                  <p className="lp-feature-desc">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="lp-section lp-border-top">
        <div className="lp-container">
          <div className="lp-reveal lp-section-header">
            <div className="lp-section-tag">How it works</div>
            <h2 className="lp-section-title">
              From cold prospect to booked meeting in 3 steps
            </h2>
          </div>
          <div className="lp-steps-grid">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="lp-reveal lp-step-card">
                  <div className="lp-step-num">{step.number}</div>
                  <div className="lp-step-icon-wrap">
                    <Icon size={20} style={{ color: '#818CF8' }} />
                  </div>
                  <h3 className="lp-step-title">{step.title}</h3>
                  <p className="lp-step-desc">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section id="testimonials" className="lp-section lp-border-top">
        <div className="lp-container">
          <div className="lp-reveal lp-section-header">
            <div className="lp-section-tag">Customer stories</div>
            <h2 className="lp-section-title">Real results from real teams</h2>
            <p className="lp-section-sub">
              See how enterprise sales teams use SkySend to hit their pipeline goals consistently.
            </p>
          </div>
          <div className="lp-testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="lp-reveal lp-testi-card">
                <div className="lp-testi-metric">{t.metric}</div>
                <div className="lp-testi-metric-label">{t.metricLabel}</div>
                <div className="lp-testi-divider" />
                <p className="lp-testi-quote">"{t.quote}"</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-avatar">{t.initials}</div>
                  <div>
                    <div className="lp-testi-name">{t.author}</div>
                    <div className="lp-testi-role">{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ═════════════════════════════════════════════════════════ */}
      <section id="pricing" className="lp-section lp-border-top">
        <div className="lp-container">
          <div className="lp-reveal lp-section-header">
            <div className="lp-section-tag">Pricing</div>
            <h2 className="lp-section-title">Simple, transparent pricing</h2>
            <p className="lp-section-sub">
              Start free. Scale as you grow. No hidden fees, no surprises.
            </p>
          </div>
          <div className="lp-pricing-grid">
            {plans.map((plan, i) => (
              <div
                key={i}
                className="lp-reveal lp-pricing-card"
                style={{
                  background: plan.highlighted ? '#FFFFFF' : 'rgba(255,255,255,0.03)',
                  border: plan.highlighted
                    ? '1px solid rgba(255,255,255,0.95)'
                    : '1px solid rgba(255,255,255,0.07)',
                  transform: plan.highlighted ? 'scale(1.025)' : 'none',
                }}
              >
                {plan.badge && <div className="lp-pricing-badge">{plan.badge}</div>}

                <div
                  className="lp-pricing-name"
                  style={{ color: plan.highlighted ? '#0A0A0B' : '#F4F4F5' }}
                >
                  {plan.name}
                </div>

                <div className="lp-pricing-price-row">
                  <span
                    className="lp-pricing-price"
                    style={{ color: plan.highlighted ? '#0A0A0B' : '#F8F8F9' }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="lp-pricing-period"
                      style={{ color: plan.highlighted ? '#71717A' : '#52525B' }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>

                <p
                  className="lp-pricing-desc"
                  style={{ color: plan.highlighted ? '#52525B' : '#71717A' }}
                >
                  {plan.description}
                </p>

                <Link
                  to="/signup"
                  className="lp-pricing-cta-btn"
                  style={{
                    background: plan.highlighted ? '#6366F1' : 'rgba(255,255,255,0.06)',
                    color: '#FFFFFF',
                    border: plan.highlighted ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {plan.cta}
                  {plan.highlighted && <ArrowRight size={14} />}
                </Link>

                <div
                  className="lp-pricing-rule"
                  style={{
                    background: plan.highlighted ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)',
                  }}
                />

                <ul className="lp-pricing-features">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="lp-pricing-feature-item">
                      <div
                        className="lp-pricing-check-wrap"
                        style={{
                          background: plan.highlighted
                            ? 'rgba(99,102,241,0.12)'
                            : 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <Check
                          size={11}
                          style={{ color: plan.highlighted ? '#6366F1' : '#71717A' }}
                        />
                      </div>
                      <span
                        className="lp-pricing-feature-text"
                        style={{ color: plan.highlighted ? '#3F3F46' : '#A1A1AA' }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═══════════════════════════════════════════════════════ */}
      <section className="lp-section lp-border-top">
        <div className="lp-container">
          <div className="lp-reveal lp-cta-box">
            <div className="lp-cta-glow" />
            <h2 className="lp-cta-headline">Ready to 10× your reply rate?</h2>
            <p className="lp-cta-sub">
              Join 500+ enterprise teams using SkySend to fill their pipeline with qualified meetings.
            </p>
            <Link to="/signup" className="lp-btn-cta-final">
              Start your free trial
              <ArrowRight size={16} />
            </Link>
            <p className="lp-cta-trust">
              No credit card required&nbsp;·&nbsp;14-day free trial&nbsp;·&nbsp;Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">

            <div className="lp-footer-brand">
              <SkySendLogo inverted />
              <p className="lp-footer-tagline">
                The AI-powered cold outreach platform for serious B2B sales teams.
              </p>
            </div>

            <div className="lp-footer-cols">
              {[
                { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
                { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
              ].map((col) => (
                <div key={col.title} className="lp-footer-col">
                  <div className="lp-footer-col-title">{col.title}</div>
                  <ul className="lp-footer-link-list">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="lp-footer-link">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>
          <div className="lp-footer-rule" />
          <div className="lp-footer-bottom">
            <p className="lp-footer-copy">© 2024 SkySend. All rights reserved.</p>
            <p className="lp-footer-copy">Built for the world's best sales teams.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
