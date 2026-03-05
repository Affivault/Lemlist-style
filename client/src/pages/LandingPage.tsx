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
  Star,
  TrendingUp,
  Lock,
  Mail,
  MousePointer,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { SkySendLogo } from '../components/SkySendLogo';

const features = [
  {
    icon: Zap,
    title: 'Intelligent Sequences',
    description: 'Multi-step campaigns with AI-optimized send times, smart delays, and conditional branching that adapts to recipient behavior.',
    accent: '#6366F1',
  },
  {
    icon: Users,
    title: 'Contact Intelligence',
    description: 'Import, enrich, and segment contacts with AI-powered field mapping. Automatic deduplication keeps your data pristine.',
    accent: '#8B5CF6',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Granular performance dashboards with A/B testing insights. Track every touchpoint across your pipeline.',
    accent: '#06B6D4',
  },
  {
    icon: Shield,
    title: 'Deliverability Engine',
    description: 'Built-in warmup, reputation monitoring, and domain health scoring. Every email lands in the primary inbox.',
    accent: '#10B981',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Inbox',
    description: 'Smart email tagging automatically classifies replies by intent. AI reply assist helps you draft responses in seconds.',
    accent: '#F59E0B',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with end-to-end encryption, SSO integration, and granular role-based access controls.',
    accent: '#EF4444',
  },
];

const stats = [
  { value: '10M+', label: 'Emails delivered monthly', icon: Mail },
  { value: '98.7%', label: 'Average deliverability', icon: TrendingUp },
  { value: '3.2x', label: 'Reply rate improvement', icon: RefreshCw },
  { value: '500+', label: 'Enterprise teams active', icon: Users },
];

const testimonials = [
  {
    quote: "SkySend transformed our outbound pipeline. We went from 2% to 12% reply rates in three weeks. The AI-driven send optimization alone was worth the switch.",
    author: "Sarah Chen",
    role: "Head of Sales",
    company: "TechCorp",
    metric: "6x",
    metricLabel: "Reply rate increase",
    avatar: "SC",
    avatarColor: '#6366F1',
  },
  {
    quote: "Finally, an outreach tool built for enterprise. The analytics granularity and deliverability monitoring give us confidence at scale.",
    author: "Marcus Johnson",
    role: "VP Sales",
    company: "GrowthLabs",
    metric: "98.7%",
    metricLabel: "Deliverability rate",
    avatar: "MJ",
    avatarColor: '#8B5CF6',
  },
  {
    quote: "SARA AI has fundamentally changed how we handle replies. What took our team hours now happens in minutes with better accuracy.",
    author: "Emily Park",
    role: "Director of Marketing",
    company: "ScaleUp",
    metric: "12x",
    metricLabel: "Faster response time",
    avatar: "EP",
    avatarColor: '#06B6D4',
  },
  {
    quote: "We replaced three tools with SkySend. The unified platform approach saved us $40K annually while improving every metric across the board.",
    author: "David Kim",
    role: "CRO",
    company: "Meridian",
    metric: "$40K",
    metricLabel: "Annual savings",
    avatar: "DK",
    avatarColor: '#10B981',
  },
  {
    quote: "The contact enrichment is like magic. We imported 50K contacts and the AI mapped every field perfectly. Zero manual cleanup needed.",
    author: "Lisa Morales",
    role: "Growth Lead",
    company: "Vertex AI",
    metric: "50K",
    metricLabel: "Contacts enriched",
    avatar: "LM",
    avatarColor: '#F59E0B',
  },
  {
    quote: "Our sales team doubled their meeting bookings within the first month. The intelligent sequencing adapts to each prospect automatically.",
    author: "James Wright",
    role: "Head of Revenue",
    company: "Catalyst",
    metric: "2x",
    metricLabel: "More meetings booked",
    avatar: "JW",
    avatarColor: '#EC4899',
  },
];

const logos = [
  'TechCorp', 'GrowthLabs', 'ScaleUp', 'Meridian', 'Vertex AI', 'Catalyst', 'NexGen', 'Prism',
];

function useIntersectionObserver() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export function LandingPage() {
  const pageRef = useIntersectionObserver();

  return (
    <div ref={pageRef} className="min-h-screen" style={{ background: '#050508', color: '#FAFAFB' }}>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div style={{ background: 'rgba(5,5,8,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex h-[60px] items-center justify-between">
              <Link to="/" className="flex items-center">
                <SkySendLogo inverted />
              </Link>

              <div className="hidden items-center gap-8 md:flex">
                {['Features', 'Testimonials', 'Pricing'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    style={{ color: 'rgba(250,250,251,0.55)', fontSize: '14px', fontWeight: 500, transition: 'color 0.15s' }}
                    onMouseOver={(e) => (e.currentTarget.style.color = '#FAFAFB')}
                    onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(250,250,251,0.55)')}
                  >
                    {item}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(250,250,251,0.6)', padding: '8px 14px', transition: 'color 0.15s' }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#FAFAFB')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(250,250,251,0.6)')}
                >
                  Log in
                </Link>
                <Link to="/signup" className="lp-btn-cta" style={{ fontSize: '14px', padding: '8px 18px', borderRadius: '10px' }}>
                  Get Started Free
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        {/* Background mesh */}
        <div className="lp-hero-mesh" />
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
        }} />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-4xl text-center">

            {/* Trust badge */}
            <div className="lp-fade-up inline-flex items-center gap-2 mb-8"
              style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '100px',
                padding: '6px 16px',
              }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#6366F1' }} />
              <span style={{ fontSize: '13px', color: 'rgba(250,250,251,0.7)', fontWeight: 500 }}>
                Trusted by <span style={{ color: '#818CF8', fontWeight: 600 }}>500+</span> enterprise teams worldwide
              </span>
              <ChevronRight className="h-3 w-3" style={{ color: 'rgba(129,140,248,0.7)' }} />
            </div>

            {/* Headline */}
            <h1 className="lp-fade-up lp-delay-1" style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: '-0.03em',
              color: '#FAFAFB',
            }}>
              Cold outreach that
              <br />
              <span className="lp-gradient-text">actually converts.</span>
            </h1>

            {/* Subheading */}
            <p className="lp-fade-up lp-delay-2 mx-auto mt-7" style={{
              fontSize: '18px',
              lineHeight: 1.7,
              color: 'rgba(250,250,251,0.55)',
              maxWidth: '560px',
              fontWeight: 400,
            }}>
              The intelligent email platform that automates your outreach, enriches your pipeline,
              and turns cold prospects into warm conversations.
            </p>

            {/* CTA buttons */}
            <div className="lp-fade-up lp-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="lp-btn-cta" style={{ fontSize: '16px', padding: '14px 32px', borderRadius: '12px' }}>
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 500,
                  padding: '14px 32px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(250,250,251,0.75)',
                  background: 'rgba(255,255,255,0.04)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                View demo
              </Link>
            </div>

            {/* Micro social proof */}
            <div className="lp-fade-up lp-delay-3 mt-8 flex flex-wrap items-center justify-center gap-6">
              {['No credit card required', 'Free forever plan', 'Setup in 5 minutes'].map((item) => (
                <div key={item} className="flex items-center gap-2" style={{ fontSize: '13px', color: 'rgba(250,250,251,0.4)' }}>
                  <Check className="h-3.5 w-3.5" style={{ color: '#6366F1' }} strokeWidth={2.5} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="lp-fade-up lp-delay-3 mt-20 relative">
            {/* Glow beneath the mockup */}
            <div style={{
              position: 'absolute',
              bottom: '-60px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '70%',
              height: '120px',
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.3), transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }} />

            <div style={{
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              padding: '4px',
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), 0 0 80px -30px rgba(99,102,241,0.2)',
            }}>
              <div style={{ borderRadius: '13px', background: '#0D0D12', overflow: 'hidden', aspectRatio: '16/9.5' }}>
                {/* Browser bar */}
                <div style={{ height: '38px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px', background: '#0A0A0F' }}>
                  <div className="flex gap-1.5">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ height: '22px', width: '220px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <svg style={{ width: '9px', height: '9px', color: 'rgba(255,255,255,0.3)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>app.skysend.io</span>
                    </div>
                  </div>
                  <div style={{ width: '60px' }} />
                </div>

                <div style={{ display: 'flex', height: 'calc(100% - 38px)' }}>
                  {/* Sidebar */}
                  <div style={{ width: '168px', background: '#080810', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#FAFAFB', letterSpacing: '-0.03em' }}>skysend</span>
                    </div>
                    <div style={{ padding: '8px', flex: 1 }}>
                      {[
                        { name: 'Dashboard', active: true, iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1' },
                        { name: 'Campaigns', active: false, iconPath: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7' },
                        { name: 'Contacts', active: false, iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                        { name: 'Inbox', active: false, iconPath: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
                        { name: 'Analytics', active: false, iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                      ].map((item) => (
                        <div key={item.name} style={{ height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', padding: '0 8px', gap: '8px', background: item.active ? 'rgba(99,102,241,0.15)' : 'transparent', marginBottom: '2px' }}>
                          <svg style={{ width: '13px', height: '13px', color: item.active ? '#818CF8' : 'rgba(255,255,255,0.25)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d={item.iconPath} />
                          </svg>
                          <span style={{ fontSize: '11px', fontWeight: item.active ? 600 : 400, color: item.active ? '#C7D2FE' : 'rgba(255,255,255,0.4)' }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '8px', fontWeight: 700, color: 'white' }}>JD</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: '#FAFAFB' }}>John Doe</div>
                          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)' }}>john@company.com</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main area */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#0D0D14' }}>
                    {/* Top bar */}
                    <div style={{ height: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', background: '#0A0A11' }}>
                      <div style={{ height: '24px', width: '180px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: '6px' }}>
                        <svg style={{ width: '10px', height: '10px', color: 'rgba(255,255,255,0.2)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>Search anything...</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <svg style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.4)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                          <div style={{ position: 'absolute', top: '4px', right: '4px', width: '5px', height: '5px', borderRadius: '50%', background: '#6366F1', border: '1px solid #0A0A11' }} />
                        </div>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '7px', fontWeight: 700, color: 'white' }}>JD</span>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard content */}
                    <div style={{ flex: 1, padding: '18px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>Good morning, John</div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#FAFAFB', letterSpacing: '-0.03em' }}>Dashboard</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <div style={{ height: '26px', padding: '0 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Export</span>
                          </div>
                          <div style={{ height: '26px', padding: '0 10px', borderRadius: '6px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 600, color: 'white' }}>+ New Campaign</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '14px' }}>
                        {[
                          { label: 'Campaigns', val: '24', change: '+12%', color: '#6366F1', spark: [30,35,28,42,38,45,52,48,55,62] },
                          { label: 'Contacts', val: '8,431', change: '+8%', color: '#8B5CF6', spark: [40,42,45,43,48,52,55,58,56,60] },
                          { label: 'Sent', val: '42K', change: '+24%', color: '#06B6D4', spark: [20,25,22,35,40,38,50,55,60,68] },
                          { label: 'Reply Rate', val: '4.8%', change: '+0.6%', color: '#10B981', spark: [32,35,30,38,42,40,45,48,46,50] },
                        ].map((s) => (
                          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
                              <span style={{ fontSize: '8px', fontWeight: 600, color: '#4ADE80' }}>{s.change}</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FAFAFB', letterSpacing: '-0.03em', marginBottom: '8px' }}>{s.val}</div>
                            <svg style={{ width: '100%', height: '16px' }} viewBox="0 0 100 40" preserveAspectRatio="none">
                              <polyline fill="none" stroke={`${s.color}40`} strokeWidth="2" points={s.spark.map((v, i) => `${i * 11.1},${40 - v * 0.6}`).join(' ')} />
                              <polyline fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={s.spark.slice(-4).map((v, i) => `${(i + 6) * 11.1},${40 - v * 0.6}`).join(' ')} />
                            </svg>
                          </div>
                        ))}
                      </div>

                      {/* Campaigns table */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
                          <span style={{ flex: 1, fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Campaign</span>
                          {['Status','Sent','Replies'].map(h => <span key={h} style={{ width: '52px', fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>{h}</span>)}
                        </div>
                        {[
                          { name: 'Q1 Enterprise Outreach', status: 'Active', statusColor: '#4ADE80', sent: '2,847', replies: '4.8%' },
                          { name: 'Product Launch Follow-up', status: 'Active', statusColor: '#4ADE80', sent: '1,203', replies: '6.2%' },
                          { name: 'Re-engagement Series', status: 'Paused', statusColor: '#FACC15', sent: '856', replies: '2.1%' },
                        ].map((c, i) => (
                          <div key={c.name} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.03)' : undefined }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.statusColor, flexShrink: 0 }} />
                              <span style={{ fontSize: '10px', fontWeight: 500, color: '#FAFAFB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                            </div>
                            <span style={{ width: '52px', textAlign: 'right', fontSize: '9px', color: c.statusColor, fontWeight: 600 }}>{c.status}</span>
                            <span style={{ width: '52px', textAlign: 'right', fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{c.sent}</span>
                            <span style={{ width: '52px', textAlign: 'right', fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{c.replies}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Logo ticker ────────────────────────────────────────────── */}
      <section style={{ padding: '56px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '28px' }}>
            Trusted by forward-thinking teams
          </p>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(to right, #050508, transparent)', zIndex: 10, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(to left, #050508, transparent)', zIndex: 10, pointerEvents: 'none' }} />
            <div className="animate-marquee" style={{ display: 'flex' }}>
              {[...logos, ...logos].map((logo, i) => (
                <div key={i} style={{ flexShrink: 0, margin: '0 40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(99,102,241,0.5)' }} />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}
            className="md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="animate-on-scroll"
                style={{
                  padding: '40px 32px',
                  background: '#050508',
                  textAlign: 'center',
                  opacity: 0,
                  transform: 'translateY(16px)',
                  transition: `opacity 0.6s ease-out ${i * 80}ms, transform 0.6s ease-out ${i * 80}ms`,
                }}
              >
                <div style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #818CF8, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.1 }}>
                  {stat.value}
                </div>
                <div style={{ marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '96px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '64px', opacity: 0, transform: 'translateY(16px)', transition: 'all 0.6s ease-out' }}>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#818CF8', marginBottom: '16px' }}>
              Platform
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 700, color: '#FAFAFB', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Everything you need to
              <br />
              dominate outreach
            </h2>
            <p style={{ marginTop: '16px', fontSize: '17px', color: 'rgba(255,255,255,0.5)', maxWidth: '520px', margin: '16px auto 0', lineHeight: 1.65 }}>
              Stop juggling tools. SkySend brings your entire outreach workflow into one intelligent platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="md:grid-cols-3 grid-cols-1">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="animate-on-scroll lp-feature-card"
                style={{
                  padding: '28px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.025)',
                  opacity: 0,
                  transform: 'translateY(16px)',
                  transition: `opacity 0.6s ease-out ${i * 60}ms, transform 0.6s ease-out ${i * 60}ms`,
                  cursor: 'default',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${feature.accent}18`, border: `1px solid ${feature.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <feature.icon style={{ width: '18px', height: '18px', color: feature.accent }} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFB', marginBottom: '8px', letterSpacing: '-0.01em' }}>{feature.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section style={{ padding: '96px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '64px', opacity: 0, transform: 'translateY(16px)', transition: 'all 0.6s ease-out' }}>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#818CF8', marginBottom: '16px' }}>
              Process
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 700, color: '#FAFAFB', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              From cold list to closed deal
            </h2>
            <p style={{ marginTop: '16px', fontSize: '17px', color: 'rgba(255,255,255,0.5)', maxWidth: '440px', margin: '16px auto 0', lineHeight: 1.65 }}>
              Three simple steps to transform your outreach pipeline.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', position: 'relative' }} className="md:grid-cols-3 grid-cols-1">
            {/* Connector line */}
            <div style={{ position: 'absolute', top: '28px', left: '33.3%', right: '33.3%', height: '1px', background: 'linear-gradient(to right, rgba(99,102,241,0.3), rgba(139,92,246,0.3))', display: 'none' }} className="md:block" />

            {[
              {
                step: '01',
                title: 'Import & Enrich',
                description: 'Upload your contact list or connect your CRM. AI maps fields, deduplicates entries, and enriches profiles automatically.',
                icon: Users,
                color: '#6366F1',
              },
              {
                step: '02',
                title: 'Build & Launch',
                description: 'Create multi-step email sequences with the visual builder. Set conditions, A/B test, and let AI optimize send times.',
                icon: Zap,
                color: '#8B5CF6',
              },
              {
                step: '03',
                title: 'Engage & Convert',
                description: 'SARA AI classifies every reply, drafts responses, and surfaces the hottest leads. Focus on conversations that close.',
                icon: TrendingUp,
                color: '#06B6D4',
              },
            ].map((step, i) => (
              <div
                key={step.step}
                className="animate-on-scroll"
                style={{
                  padding: '32px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.025)',
                  opacity: 0,
                  transform: 'translateY(16px)',
                  transition: `opacity 0.6s ease-out ${i * 100}ms, transform 0.6s ease-out ${i * 100}ms`,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${step.color}18`, border: `1px solid ${step.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: step.color }}>{step.step}</span>
                  </div>
                  <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, ${step.color}40, transparent)` }} />
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${step.color}12`, border: `1px solid ${step.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <step.icon style={{ width: '18px', height: '18px', color: step.color }} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FAFAFB', marginBottom: '10px', letterSpacing: '-0.02em' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section id="testimonials" style={{ padding: '96px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '64px', opacity: 0, transform: 'translateY(16px)', transition: 'all 0.6s ease-out' }}>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#818CF8', marginBottom: '16px' }}>
              Testimonials
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 700, color: '#FAFAFB', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Loved by revenue teams
            </h2>
            <p style={{ marginTop: '16px', fontSize: '17px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '16px auto 0', lineHeight: 1.65 }}>
              See why the fastest-growing companies trust SkySend to power their outreach.
            </p>
          </div>

          <div style={{ columns: '1', gap: '16px' }} className="md:columns-3 sm:columns-2">
            {testimonials.map((t, i) => (
              <div
                key={t.author}
                className="animate-on-scroll"
                style={{
                  breakInside: 'avoid',
                  marginBottom: '16px',
                  opacity: 0,
                  transform: 'translateY(16px)',
                  transition: `opacity 0.6s ease-out ${i * 70}ms, transform 0.6s ease-out ${i * 70}ms`,
                }}
              >
                <div
                  style={{
                    padding: '24px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.025)',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = `${t.avatarColor}40`)}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                >
                  {/* Metric */}
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em', color: t.avatarColor, lineHeight: 1 }}>{t.metric}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', fontWeight: 500 }}>{t.metricLabel}</div>
                  </div>

                  {/* Stars */}
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} style={{ width: '12px', height: '12px', fill: '#F59E0B', color: '#F59E0B' }} />
                    ))}
                  </div>

                  {/* Quote */}
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '20px' }}>
                    "{t.quote}"
                  </p>

                  {/* Author */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `${t.avatarColor}25`, border: `1px solid ${t.avatarColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: t.avatarColor }}>{t.avatar}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFB' }}>{t.author}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{t.role}, {t.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '96px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '64px', opacity: 0, transform: 'translateY(16px)', transition: 'all 0.6s ease-out' }}>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#818CF8', marginBottom: '16px' }}>
              Pricing
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 700, color: '#FAFAFB', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Simple, transparent pricing
            </h2>
            <p style={{ marginTop: '16px', fontSize: '17px', color: 'rgba(255,255,255,0.5)', maxWidth: '400px', margin: '16px auto 0', lineHeight: 1.65 }}>
              Start free. Upgrade once. Own it forever.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '760px', margin: '0 auto' }} className="grid-cols-1 md:grid-cols-2">
            {/* Free */}
            <div className="animate-on-scroll" style={{ padding: '36px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.025)', opacity: 0, transform: 'translateY(16px)', transition: 'all 0.6s ease-out' }}>
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FAFAFB', marginBottom: '6px', letterSpacing: '-0.02em' }}>Free</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Everything you need to get started.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '28px' }}>
                <span style={{ fontSize: '44px', fontWeight: 800, color: '#FAFAFB', letterSpacing: '-0.04em', lineHeight: 1 }}>£0</span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>forever</span>
              </div>
              <Link
                to="/signup"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(99,102,241,0.4)',
                  color: '#818CF8',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: 'rgba(99,102,241,0.08)',
                  marginBottom: '24px',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['1,000 emails/month', '500 contacts', 'Basic sequences', 'Email support', 'Analytics dashboard'].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
                    <Check style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} strokeWidth={2.5} />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Lifetime */}
            <div className="animate-on-scroll" style={{ padding: '36px', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.06)', opacity: 0, transform: 'translateY(16px)', transition: 'all 0.6s ease-out 100ms', position: 'relative', overflow: 'hidden' }}>
              {/* Glow */}
              <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '-10px', left: '20px' }}>
                <span style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.05em' }}>
                  BEST VALUE
                </span>
              </div>
              <div style={{ marginBottom: '28px', marginTop: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FAFAFB', marginBottom: '6px', letterSpacing: '-0.02em' }}>Lifetime</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Unlimited access. One payment. No fees.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '28px' }}>
                <span style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, background: 'linear-gradient(135deg,#818CF8,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>£299</span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>one-time</span>
              </div>
              <Link to="/signup" className="lp-btn-cta" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '12px', borderRadius: '10px', fontSize: '14px', marginBottom: '24px' }}>
                Get lifetime access
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Unlimited emails', 'Unlimited contacts', 'SARA AI assistant', 'A/B testing', 'API access', 'Priority support', 'Custom domains', 'SSO & SAML'].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>
                    <Check style={{ width: '14px', height: '14px', color: '#818CF8', flexShrink: 0 }} strokeWidth={2.5} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 96px' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', padding: '72px 48px', textAlign: 'center', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}>
            {/* Animated gradient bg */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18), transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '30%', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(139,92,246,0.12), transparent)', pointerEvents: 'none' }} />
            {/* Grid overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 100% at 50% 50%, black, transparent)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '100px', padding: '6px 16px', marginBottom: '24px' }}>
                <MousePointer style={{ width: '12px', height: '12px', color: '#818CF8' }} />
                <span style={{ fontSize: '13px', color: '#A5B4FC', fontWeight: 500 }}>Start in 5 minutes, no card needed</span>
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, color: '#FAFAFB', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px' }}>
                Ready to transform
                <br />
                your outreach?
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.65 }}>
                Join thousands of revenue teams using SkySend to book more meetings and close more deals.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                <Link to="/signup" className="lp-btn-cta" style={{ fontSize: '16px', padding: '14px 36px', borderRadius: '12px' }}>
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '16px',
                    fontWeight: 500,
                    padding: '14px 32px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.05)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '60px', paddingBottom: '40px' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', marginBottom: '48px' }} className="grid-cols-2 md:grid-cols-4">
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ marginBottom: '16px' }}>
                <SkySendLogo inverted />
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
                The intelligent email outreach platform for modern revenue teams.
              </p>
            </div>
            {[
              { heading: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
              { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { heading: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFB', marginBottom: '16px', letterSpacing: '-0.01em' }}>{col.heading}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.4)', transition: 'color 0.15s', textDecoration: 'none' }}
                      onMouseOver={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                      onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
              &copy; {new Date().getFullYear()} SkySend. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              {['Status', 'Privacy', 'Terms'].map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', transition: 'color 0.15s', textDecoration: 'none' }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        /* Scroll animation */
        .animate-on-scroll {
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        /* Hero entry animations */
        .lp-fade-up {
          animation: lpFadeUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards;
          opacity: 0;
        }
        .lp-delay-1 { animation-delay: 0.15s; }
        .lp-delay-2 { animation-delay: 0.3s; }
        .lp-delay-3 { animation-delay: 0.45s; }

        @keyframes lpFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Gradient text */
        .lp-gradient-text {
          background: linear-gradient(125deg, #818CF8 0%, #C084FC 45%, #60A5FA 90%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* CTA button */
        .lp-btn-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          background: linear-gradient(135deg, #6366F1, #7C3AED);
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 12px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
          text-decoration: none;
        }
        .lp-btn-cta:hover {
          background: linear-gradient(135deg, #4F46E5, #6D28D9);
          box-shadow: 0 4px 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }
        .lp-btn-cta:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(99,102,241,0.3);
        }

        /* Hero orbs */
        .lp-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .lp-orb-1 {
          width: 700px;
          height: 700px;
          top: -280px;
          left: -160px;
          background: #6366F1;
          opacity: 0.07;
          animation: lpOrb1 14s ease-in-out infinite;
        }
        .lp-orb-2 {
          width: 550px;
          height: 550px;
          top: -180px;
          right: -140px;
          background: #8B5CF6;
          opacity: 0.06;
          animation: lpOrb2 18s ease-in-out infinite;
        }
        .lp-orb-3 {
          width: 450px;
          height: 450px;
          bottom: -120px;
          left: 35%;
          background: #06B6D4;
          opacity: 0.04;
          animation: lpOrb3 22s ease-in-out infinite;
        }

        @keyframes lpOrb1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          40%       { transform: translate(70px,50px) scale(1.08); }
          70%       { transform: translate(-30px,70px) scale(0.95); }
        }
        @keyframes lpOrb2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          35%       { transform: translate(-60px,40px) scale(1.12); }
          65%       { transform: translate(40px,-30px) scale(0.92); }
        }
        @keyframes lpOrb3 {
          0%, 100% { transform: translate(0,0) scale(1); }
          45%       { transform: translate(50px,-50px) scale(1.1); }
          75%       { transform: translate(-40px,-20px) scale(0.96); }
        }

        /* Marquee */
        .animate-marquee {
          animation: marquee 28s linear infinite;
          will-change: transform;
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Feature card hover */
        .lp-feature-card {
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s !important;
        }
        .lp-feature-card:hover {
          border-color: rgba(99,102,241,0.3) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          transform: translateY(-3px) !important;
        }

        /* Responsive grid overrides */
        @media (max-width: 768px) {
          .md\\:grid-cols-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .md\\:grid-cols-3 { grid-template-columns: repeat(1, 1fr) !important; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(1, 1fr) !important; }
          .md\\:columns-3 { columns: 1 !important; }
          .sm\\:columns-2 { columns: 1 !important; }
          .md\\:block { display: none !important; }
        }
        @media (min-width: 640px) {
          .sm\\:columns-2 { columns: 2 !important; }
        }
        @media (min-width: 768px) {
          .md\\:columns-3 { columns: 3 !important; }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
          .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
          .md\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}
