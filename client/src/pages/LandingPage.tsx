import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  BarChart3,
  Users,
  Mail,
  Shield,
  Zap,
  Globe,
  Sparkles,
  Star,
  TrendingUp,
  Lock,
  ChevronRight,
  Rocket,
  Clock,
  Send,
  Target,
  MessageSquare,
  Quote,
} from 'lucide-react';
import { SkySendLogo } from '../components/SkySendLogo';

const features = [
  {
    icon: Zap,
    title: 'Intelligent Sequences',
    description: 'Multi-step campaigns with AI-optimized send times, smart delays, and conditional branching that adapts to recipient behavior.',
    color: '#8B5CF6',
  },
  {
    icon: Users,
    title: 'Contact Intelligence',
    description: 'Import, enrich, and segment contacts with AI-powered field mapping. Automatic deduplication keeps your data pristine.',
    color: '#8B5CF6',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Granular performance dashboards with A/B testing insights. Track every touchpoint across your pipeline.',
    color: '#8B5CF6',
  },
  {
    icon: Shield,
    title: 'Deliverability Engine',
    description: 'Built-in warmup, reputation monitoring, and domain health scoring. Every email lands in the primary inbox.',
    color: '#8B5CF6',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Inbox',
    description: 'Smart email tagging automatically classifies replies by intent. AI reply assist helps you draft responses in seconds.',
    color: '#8B5CF6',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with end-to-end encryption, SSO integration, and granular role-based access controls.',
    color: '#8B5CF6',
  },
];

const stats = [
  { value: '10M+', label: 'Emails delivered monthly' },
  { value: '98.7%', label: 'Average deliverability' },
  { value: '3.2x', label: 'Reply rate improvement' },
  { value: '500+', label: 'Enterprise teams active' },
];

const testimonials = [
  {
    quote: "SkySend transformed our outbound pipeline. We went from 2% to 12% reply rates in three weeks. The AI-driven send optimization alone was worth the switch.",
    author: "Sarah Chen",
    role: "Head of Sales",
    company: "TechCorp",
    metric: "6x reply rate",
    metricDetail: "in 3 weeks",
    avatar: "SC",
  },
  {
    quote: "Finally, an outreach tool built for enterprise. The analytics granularity and deliverability monitoring give us confidence at scale.",
    author: "Marcus Johnson",
    role: "VP Sales",
    company: "GrowthLabs",
    metric: "42% more meetings",
    metricDetail: "quarter over quarter",
    avatar: "MJ",
  },
  {
    quote: "SARA AI has fundamentally changed how we handle replies. What took our team hours now happens in minutes with better accuracy.",
    author: "Emily Park",
    role: "Director of Marketing",
    company: "ScaleUp",
    metric: "85% time saved",
    metricDetail: "on reply management",
    avatar: "EP",
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

function AnimatedCounter({ target }: { target: string }) {
  const [display, setDisplay] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const numericPart = target.replace(/[^0-9.]/g, '');
          const num = parseFloat(numericPart);
          const prefix = target.match(/^[^0-9]*/)?.[0] || '';
          const suffixPart = target.match(/[^0-9.]*$/)?.[0] || '';

          if (!isNaN(num)) {
            const duration = 1500;
            const startTime = performance.now();
            const animate = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = num * eased;

              if (num >= 100) {
                setDisplay(`${prefix}${Math.round(current).toLocaleString()}${suffixPart}`);
              } else {
                setDisplay(`${prefix}${current.toFixed(1)}${suffixPart}`);
              }

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setDisplay(target);
              }
            };
            requestAnimationFrame(animate);
          }
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{display}</span>;
}

export function LandingPage() {
  const pageRef = useIntersectionObserver();

  return (
    <div ref={pageRef} className="landing-page min-h-screen bg-[var(--bg-app)]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <span className="text-xl"><SkySendLogo /></span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
              <a href="#rocket-send" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Rocket Send</a>
              <a href="#testimonials" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-2">
                Log in
              </Link>
              <Link to="/signup" className="landing-cta-btn text-sm px-5 py-2.5 rounded-lg font-medium">
                Start for free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="landing-hero-bg" />

        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-1.5 mb-8 opacity-0 animate-fade-up">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-sm text-[var(--text-secondary)]">
                Trusted by <span className="font-semibold text-[var(--text-primary)]">500+</span> revenue teams
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
            </div>

            <h1 className="text-display-xl sm:text-[5rem] lg:text-[5.5rem] leading-[1] tracking-[-0.03em] font-semibold opacity-0 animate-fade-up-delay-1">
              <span className="text-[var(--text-primary)]">Cold emails that</span>
              <br />
              <span className="text-[var(--text-primary)]">actually get </span>
              <span className="text-[#8B5CF6]">replies</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-up-delay-2">
              The AI-powered outreach platform that automates your campaigns,
              enriches your pipeline, and turns cold prospects into warm conversations.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up-delay-3">
              <Link to="/signup" className="landing-cta-btn text-base px-8 py-3.5 rounded-xl font-medium shadow-lg landing-cta-shadow">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="group inline-flex items-center gap-2 text-base px-8 py-3.5 rounded-xl font-medium border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all">
                Watch demo
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[var(--text-tertiary)]">
              {['Free forever plan', 'No credit card required', 'Setup in 5 minutes'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#10B981]" strokeWidth={2.5} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 opacity-0 animate-fade-up-delay-3">
            <div className="landing-mockup-container rounded-2xl p-1.5">
              <div className="rounded-xl bg-[#111114] overflow-hidden" style={{ aspectRatio: '16/9.2' }}>
                {/* Browser chrome */}
                <div className="h-10 border-b border-[#1C1C21] flex items-center px-4 gap-2 bg-[#0D0D10]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-6 w-64 rounded-lg bg-[#16161A] border border-[#1C1C21] flex items-center justify-center px-3 gap-1.5">
                      <svg className="w-2.5 h-2.5 text-[#3A3A42]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span className="text-[10px] text-[#6B6B76] font-medium tracking-wide">app.skysend.io/dashboard</span>
                    </div>
                  </div>
                  <div className="w-16" />
                </div>

                <div className="flex h-[calc(100%-40px)]">
                  {/* Sidebar mock */}
                  <div className="w-[185px] border-r border-[#1C1C21] bg-[#0C0C0F] flex flex-col flex-shrink-0">
                    <div className="flex items-center px-4 h-10 border-b border-[#1C1C21]">
                      <span className="text-[12px] font-medium text-[#FAFAFB] tracking-[-0.03em]">skysend</span>
                    </div>
                    <div className="px-2 py-3 space-y-0.5 flex-1">
                      {[
                        { name: 'Dashboard', active: true, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1' },
                        { name: 'Campaigns', active: false, icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7' },
                        { name: 'Contacts', active: false, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                        { name: 'Inbox', active: false, icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
                        { name: 'Analytics', active: false, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                      ].map((item) => (
                        <div key={item.name} className={`h-7 rounded-md flex items-center px-2.5 gap-2 ${item.active ? 'bg-[#1C1C21]' : ''}`}>
                          <svg className={`w-3.5 h-3.5 ${item.active ? 'text-[#FAFAFB]' : 'text-[#4A4A54]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d={item.icon} />
                          </svg>
                          <span className={`text-[10px] font-medium ${item.active ? 'text-[#FAFAFB]' : 'text-[#6B6B76]'}`}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[#1C1C21] p-2">
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                        <div className="w-6 h-6 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                          <span className="text-[8px] font-semibold text-white">JD</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-medium text-[#FAFAFB] truncate">john.doe</div>
                          <div className="text-[7px] text-[#6B6B76] truncate">john@company.com</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main content area */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="h-10 border-b border-[#1C1C21] flex items-center justify-between px-5 bg-[#0D0D10]">
                      <div className="flex items-center h-7 w-52 rounded-lg border border-[#1C1C21] bg-[#111114] px-2.5 gap-2">
                        <svg className="w-3 h-3 text-[#4A4A54]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <span className="text-[9px] text-[#4A4A54]">Search anything...</span>
                        <span className="ml-auto text-[7px] text-[#3A3A42] bg-[#16161A] border border-[#1C1C21] rounded px-1.5 py-0.5 font-mono">K</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-7 h-7 rounded-lg flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-[#6B6B76]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                        </div>
                      </div>
                    </div>

                    {/* Dashboard content */}
                    <div className="flex-1 p-5 overflow-hidden bg-[#111114]">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <div className="text-[9px] text-[#6B6B76] mb-0.5">Good morning, John</div>
                          <div className="text-[14px] font-semibold text-[#FAFAFB] tracking-tight">Dashboard</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-7 px-3 bg-[#8B5CF6] rounded-lg flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"/></svg>
                            <span className="text-[10px] font-medium text-white">New Campaign</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-3 mb-5">
                        {[
                          { label: 'Total Campaigns', val: '24', change: '+12%', trend: [30,35,28,42,38,45,52,48,55,62] },
                          { label: 'Total Contacts', val: '8,431', change: '+8%', trend: [40,42,45,43,48,52,55,58,56,60] },
                          { label: 'Emails Sent', val: '42,156', change: '+24%', trend: [20,25,22,35,40,38,50,55,60,68] },
                          { label: 'Reply Rate', val: '4.8%', change: '+0.6%', trend: [32,35,30,38,42,40,45,48,46,50] },
                        ].map((stat) => (
                          <div key={stat.label} className="p-3 bg-[#0C0C0F] rounded-lg border border-[#1C1C21]">
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="text-[8px] text-[#6B6B76]">{stat.label}</div>
                              <span className="text-[8px] font-medium text-[#4ADE80]">{stat.change}</span>
                            </div>
                            <div className="text-[14px] font-semibold text-[#FAFAFB] tracking-tight mb-2">{stat.val}</div>
                            <svg className="w-full h-4" viewBox="0 0 100 40" preserveAspectRatio="none">
                              <polyline fill="none" stroke="#3A3A42" strokeWidth="2" points={stat.trend.map((v, i) => `${i * 11.1},${40 - v * 0.6}`).join(' ')} />
                              <polyline fill="none" stroke="#8B5CF6" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" strokeLinejoin="round" points={stat.trend.slice(-4).map((v, i) => `${(i + 6) * 11.1},${40 - v * 0.6}`).join(' ')} />
                            </svg>
                          </div>
                        ))}
                      </div>

                      {/* Content grid */}
                      <div className="grid grid-cols-5 gap-4">
                        <div className="col-span-3">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[10px] font-semibold text-[#FAFAFB]">Recent Campaigns</span>
                            <span className="text-[9px] text-[#6B6B76]">View all</span>
                          </div>
                          <div className="border border-[#1C1C21] rounded-lg bg-[#0C0C0F] overflow-hidden">
                            <div className="flex items-center px-3.5 py-2 border-b border-[#1C1C21] bg-[#0A0A0D]">
                              <span className="text-[8px] font-medium text-[#4A4A54] uppercase tracking-wider flex-1">Campaign</span>
                              <span className="text-[8px] font-medium text-[#4A4A54] uppercase tracking-wider w-16 text-center">Status</span>
                              <span className="text-[8px] font-medium text-[#4A4A54] uppercase tracking-wider w-14 text-right">Sent</span>
                              <span className="text-[8px] font-medium text-[#4A4A54] uppercase tracking-wider w-14 text-right">Opens</span>
                              <span className="text-[8px] font-medium text-[#4A4A54] uppercase tracking-wider w-14 text-right">Replies</span>
                            </div>
                            {[
                              { name: 'Q1 Enterprise Outreach', status: 'Active', statusColor: '#4ADE80', sent: '2,847', opens: '68%', replies: '4.8%' },
                              { name: 'Product Launch Follow-up', status: 'Active', statusColor: '#4ADE80', sent: '1,203', opens: '72%', replies: '6.2%' },
                              { name: 'Re-engagement Series', status: 'Paused', statusColor: '#FACC15', sent: '856', opens: '45%', replies: '2.1%' },
                              { name: 'December Newsletter', status: 'Done', statusColor: '#6B6B76', sent: '5,420', opens: '61%', replies: '3.4%' },
                            ].map((campaign, i) => (
                              <div key={campaign.name} className={`flex items-center px-3.5 py-2.5 hover:bg-[#111114] transition-colors ${i < 3 ? 'border-b border-[#1C1C21]' : ''}`}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: campaign.statusColor }} />
                                  <span className="text-[10px] font-medium text-[#FAFAFB] truncate">{campaign.name}</span>
                                </div>
                                <div className="w-16 flex justify-center">
                                  <span className="text-[8px] font-medium px-1.5 py-0.5 rounded" style={{ color: campaign.statusColor, backgroundColor: campaign.statusColor + '12' }}>{campaign.status}</span>
                                </div>
                                <span className="text-[9px] text-[#9B9BA5] w-14 text-right font-mono">{campaign.sent}</span>
                                <span className="text-[9px] text-[#9B9BA5] w-14 text-right font-mono">{campaign.opens}</span>
                                <span className="text-[9px] text-[#9B9BA5] w-14 text-right font-mono">{campaign.replies}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] font-semibold text-[#FAFAFB] block mb-2.5">Engagement Overview</span>
                          <div className="space-y-2">
                            {[
                              { label: 'Open Rate', value: '68.2%', pct: 68 },
                              { label: 'Click Rate', value: '12.4%', pct: 24 },
                              { label: 'Reply Rate', value: '4.8%', pct: 10 },
                              { label: 'Bounce Rate', value: '1.2%', pct: 2 },
                            ].map((metric) => (
                              <div key={metric.label} className="p-2.5 bg-[#0C0C0F] rounded-lg border border-[#1C1C21]">
                                <div className="flex items-center justify-between">
                                  <div className="text-[8px] text-[#6B6B76]">{metric.label}</div>
                                </div>
                                <div className="text-[13px] font-semibold text-[#FAFAFB] tracking-tight mt-0.5 mb-1.5">{metric.value}</div>
                                <div className="w-full h-1 rounded-full bg-[#1C1C21]">
                                  <div className="h-1 rounded-full bg-[#8B5CF6] transition-all duration-1000" style={{ width: `${metric.pct}%` }} />
                                </div>
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
          </div>
        </div>
      </section>

      {/* Logo ticker */}
      <section className="py-16 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs text-[var(--text-tertiary)] mb-8 uppercase tracking-widest font-medium">
            Trusted by forward-thinking teams
          </p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--bg-app)] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--bg-app)] to-transparent z-10" />
            <div className="flex animate-marquee">
              {[...logos, ...logos].map((logo, i) => (
                <div key={i} className="flex-shrink-0 mx-10 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-base font-medium text-[var(--text-tertiary)] whitespace-nowrap">{logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 text-center p-8 rounded-2xl landing-card"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                  <AnimatedCounter target={stat.value} />
                </div>
                <div className="mt-1.5 text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-500">
            <p className="text-sm font-medium text-[#8B5CF6] mb-3 uppercase tracking-wider">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Everything you need to dominate outreach
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Stop juggling tools. SkySend brings your entire outreach workflow into one
              intelligent platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 landing-card p-7 rounded-2xl"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }}>
                  <feature.icon className="h-5 w-5 text-[#8B5CF6]" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rocket Send */}
      <section id="rocket-send" className="py-24 border-t border-[var(--border-subtle)] relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500">
              <p className="text-sm font-medium text-[#8B5CF6] mb-3 uppercase tracking-wider">Rocket Send</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-6">
                Launch campaigns at lightspeed
              </h2>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
                Rocket Send intelligently distributes your emails across optimal time windows,
                warming up sending patterns and maximizing deliverability. Set your audience,
                craft your message, and watch your pipeline ignite.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: Clock,
                    title: 'AI-Optimized Timing',
                    description: 'Machine learning analyzes recipient behavior to send each email at the perfect moment.',
                  },
                  {
                    icon: Shield,
                    title: 'Smart Throttling',
                    description: 'Automatic rate limiting protects your sender reputation while maximizing throughput.',
                  },
                  {
                    icon: Target,
                    title: 'Adaptive Sequences',
                    description: 'Dynamically adjust follow-up cadence based on engagement signals and intent data.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }}>
                      <item.icon className="h-4.5 w-4.5 text-[#8B5CF6]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{item.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/signup" className="landing-cta-btn text-sm px-6 py-3 rounded-xl font-medium">
                  Try Rocket Send
                  <Rocket className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Rocket Send visual */}
            <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: '150ms' }}>
              <div className="landing-card rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Rocket Send</div>
                    <div className="text-xs text-[var(--text-tertiary)]">Q1 Enterprise Campaign</div>
                  </div>
                  <div className="ml-auto px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[10px] font-medium text-[#10B981]">Live</div>
                </div>

                {/* Send progress */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[var(--text-secondary)]">Delivery progress</span>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">2,847 / 4,200</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)]">
                      <div className="h-2 rounded-full bg-[#8B5CF6]" style={{ width: '68%' }} />
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  {[
                    { time: '09:14 AM', action: 'Batch 1 delivered', count: '842 emails', status: 'done' },
                    { time: '11:30 AM', action: 'Batch 2 delivered', count: '1,205 emails', status: 'done' },
                    { time: '02:45 PM', action: 'Batch 3 sending', count: '800 emails', status: 'active' },
                    { time: '05:00 PM', action: 'Batch 4 scheduled', count: '1,353 emails', status: 'pending' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        item.status === 'done' ? 'bg-[#10B981]' :
                        item.status === 'active' ? 'bg-[#8B5CF6] animate-pulse' :
                        'bg-[var(--border-default)]'
                      }`} />
                      <span className="text-xs text-[var(--text-tertiary)] w-16 font-mono">{item.time}</span>
                      <span className="text-xs text-[var(--text-primary)] flex-1">{item.action}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">{item.count}</span>
                    </div>
                  ))}
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[var(--border-subtle)]">
                  {[
                    { label: 'Open Rate', value: '72.4%' },
                    { label: 'Reply Rate', value: '6.2%' },
                    { label: 'Bounce Rate', value: '0.3%' },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <div className="text-lg font-bold text-[var(--text-primary)]">{m.value}</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-500">
            <p className="text-sm font-medium text-[#8B5CF6] mb-3 uppercase tracking-wider">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              From cold list to closed deal
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Three steps to transform your outreach pipeline.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Import & Enrich',
                description: 'Upload your contact list or connect your CRM. AI maps fields, deduplicates entries, and enriches profiles automatically.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Build & Launch',
                description: 'Create multi-step email sequences with the visual builder. Set conditions, A/B test, and let AI optimize send times.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Engage & Convert',
                description: 'AI classifies every reply, drafts responses, and surfaces the hottest leads. Focus on conversations that close.',
                icon: TrendingUp,
              },
            ].map((step, i) => (
              <div
                key={step.step}
                className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="landing-card p-8 rounded-2xl h-full relative overflow-hidden">
                  <div className="absolute top-6 right-6 text-6xl font-bold text-[var(--border-subtle)] leading-none opacity-50">{step.step}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }}>
                    <step.icon className="h-6 w-6 text-[#8B5CF6]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">{step.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-500">
            <p className="text-sm font-medium text-[#8B5CF6] mb-3 uppercase tracking-wider">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Trusted by revenue leaders
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              See how teams are transforming their outreach with SkySend.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={testimonial.author}
                className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 landing-testimonial-card rounded-2xl overflow-hidden"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Metric banner */}
                <div className="px-6 py-4 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[var(--text-primary)]">{testimonial.metric}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{testimonial.metricDetail}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>

                  <Quote className="h-5 w-5 text-[var(--border-default)] mb-3" />
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-6">{testimonial.quote}</p>

                  <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-subtle)]">
                    <div className="h-10 w-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-xs font-bold text-white">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{testimonial.author}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-500">
            <p className="text-sm font-medium text-[#8B5CF6] mb-3 uppercase tracking-wider">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
              Start free. Upgrade once. Own it forever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 landing-card p-8 rounded-2xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Free</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Everything you need to get started.</p>
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold text-[var(--text-primary)]">&pound;0</span>
                <span className="text-sm text-[var(--text-tertiary)]">forever</span>
              </div>
              <Link
                to="/signup"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all mb-8"
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div className="space-y-3.5">
                {['1,000 emails/month', '500 contacts', 'Basic sequences', 'Email support', 'Analytics dashboard'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <div className="w-4 h-4 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                      <Check className="h-2.5 w-2.5 text-[var(--text-tertiary)]" strokeWidth={3} />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Lifetime Plan */}
            <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 relative landing-card-featured p-8 rounded-2xl" style={{ transitionDelay: '100ms' }}>
              <div className="absolute -top-3 left-6 px-4 py-1 rounded-full bg-[#8B5CF6] text-white text-xs font-semibold">
                Best value
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Lifetime</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Unlimited access. One payment. No recurring fees.</p>
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold text-[var(--text-primary)]">&pound;299</span>
                <span className="text-sm text-[var(--text-tertiary)]">one-time</span>
              </div>
              <Link
                to="/signup"
                className="w-full landing-cta-btn flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium mb-8"
              >
                Get lifetime access
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div className="space-y-3.5">
                {['Unlimited emails', 'Unlimited contacts', 'AI assistant', 'A/B testing', 'API access', 'Priority support', 'Custom domains', 'SSO & SAML'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <div className="w-4 h-4 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-2.5 w-2.5 text-[#8B5CF6]" strokeWidth={3} />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="landing-cta-section rounded-3xl p-12 sm:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                Ready to transform
                <br />
                your outreach?
              </h2>
              <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
                Join thousands of revenue teams using SkySend to book more meetings and close more deals.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-[#0A0A0B] font-semibold px-8 py-3.5 rounded-xl text-base hover:bg-white/90 transition-all shadow-lg">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 bg-transparent text-white/80 font-medium px-8 py-3.5 rounded-xl text-base border border-white/20 hover:bg-white/10 transition-all">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center mb-4">
                <span className="text-lg"><SkySendLogo /></span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                The intelligent email outreach platform for modern revenue teams.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Product</h4>
              <div className="space-y-2.5">
                <a href="#features" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
                <a href="#pricing" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Integrations</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Changelog</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Company</h4>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">About</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Blog</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Careers</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Legal</h4>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Privacy</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Terms</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Security</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">GDPR</a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--text-tertiary)]">
            <div>&copy; {new Date().getFullYear()} SkySend. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Status</a>
              <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .animate-on-scroll {
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        /* Hero background - subtle */
        .landing-hero-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .landing-hero-bg::before {
          content: '';
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(139, 92, 246, 0.06) 0%, transparent 60%);
          border-radius: 50%;
        }
        .landing-hero-bg::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-subtle), transparent);
        }

        /* CTA Button */
        .landing-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #8B5CF6;
          color: white;
          transition: all 0.2s ease;
        }
        .landing-cta-btn:hover {
          background: #7C3AED;
          transform: translateY(-1px);
        }
        .landing-cta-shadow {
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.25);
        }

        /* Mockup container */
        .landing-mockup-container {
          border: 1px solid var(--border-default);
          background: #0A0A0B;
          box-shadow: 0 32px 80px -12px rgba(0, 0, 0, 0.4);
        }

        /* Shared card style */
        .landing-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          transition: all 0.3s ease;
        }
        .landing-card:hover {
          border-color: var(--border-strong);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
        }
        .dark .landing-card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        /* Featured card (pricing) */
        .landing-card-featured {
          background: var(--bg-surface);
          border: 2px solid #8B5CF6;
          transition: all 0.3s ease;
          box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.1), 0 8px 30px rgba(139, 92, 246, 0.06);
        }
        .landing-card-featured:hover {
          box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.15), 0 12px 40px rgba(139, 92, 246, 0.1);
          transform: translateY(-2px);
        }

        /* Testimonial card */
        .landing-testimonial-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          transition: all 0.3s ease;
        }
        .landing-testimonial-card:hover {
          border-color: var(--border-strong);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
        }
        .dark .landing-testimonial-card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        /* CTA section */
        .landing-cta-section {
          background: linear-gradient(135deg, #1a0a2e 0%, #0A0A0B 50%, #0a1628 100%);
          border: 1px solid rgba(139, 92, 246, 0.1);
        }
      `}</style>
    </div>
  );
}
