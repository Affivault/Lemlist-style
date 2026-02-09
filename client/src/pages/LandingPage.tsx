import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  Check,
  BarChart3,
  Users,
  Mail,
  Shield,
  Zap,
  Globe,
  Bot,
  Star,
  TrendingUp,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { SkySendLogo } from '../components/SkySendLogo';

const features = [
  {
    icon: Zap,
    title: 'Intelligent Sequences',
    description: 'Multi-step campaigns with AI-optimized send times, smart delays, and conditional branching that adapts to recipient behavior.',
  },
  {
    icon: Users,
    title: 'Contact Intelligence',
    description: 'Import, enrich, and segment contacts with AI-powered field mapping. Automatic deduplication keeps your data pristine.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Granular performance dashboards with A/B testing insights. Track every touchpoint across your pipeline.',
  },
  {
    icon: Shield,
    title: 'Deliverability Engine',
    description: 'Built-in warmup, reputation monitoring, and domain health scoring. Every email lands in the primary inbox.',
  },
  {
    icon: Bot,
    title: 'SARA AI Assistant',
    description: 'AI classifies replies by intent, drafts contextual responses, and routes conversations for human review.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with end-to-end encryption, SSO integration, and granular role-based access controls.',
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
  },
  {
    quote: "Finally, an outreach tool built for enterprise. The analytics granularity and deliverability monitoring give us confidence at scale.",
    author: "Marcus Johnson",
    role: "VP Sales",
    company: "GrowthLabs",
  },
  {
    quote: "SARA AI has fundamentally changed how we handle replies. What took our team hours now happens in minutes with better accuracy.",
    author: "Emily Park",
    role: "Director of Marketing",
    company: "ScaleUp",
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

export function LandingPage() {
  const pageRef = useIntersectionObserver();

  return (
    <div ref={pageRef} className="min-h-screen bg-[var(--bg-app)]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <span className="text-xl"><SkySendLogo /></span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-2">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary text-sm px-4 py-2 rounded-lg">
                Get Started Free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-4 py-1.5 mb-8 opacity-0 animate-fade-up">
              <span className="text-sm text-[var(--text-secondary)]">Trusted by <span className="font-medium text-[var(--text-primary)]">500+</span> enterprise teams</span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-semibold tracking-tight leading-[1.05] text-[var(--text-primary)] opacity-0 animate-fade-up-delay-1">
              Outreach that
              <br />
              actually converts.
            </h1>

            <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-up-delay-2">
              The intelligent email platform that automates your outreach, enriches your pipeline,
              and turns cold prospects into warm conversations.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up-delay-3">
              <Link to="/signup" className="btn-primary text-base px-8 py-3 rounded-lg">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3 rounded-lg">
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-[var(--text-tertiary)]">
              {['Free forever plan', 'No credit card required', 'Setup in 5 minutes'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[var(--text-secondary)]" strokeWidth={2} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview - Realistic platform mockup */}
          <div className="mt-20 opacity-0 animate-fade-up-delay-3">
            <div className="rounded-2xl border border-[var(--border-default)] bg-[#0A0A0B] p-1.5 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.6)]">
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
                    {/* Logo */}
                    <div className="flex items-center px-4 h-10 border-b border-[#1C1C21]">
                      <span className="text-[12px] font-medium text-[#FAFAFB] tracking-[-0.03em]">skysend</span>
                    </div>

                    {/* Nav items */}
                    <div className="px-2 py-3 space-y-0.5 flex-1">
                      {[
                        { name: 'Dashboard', active: true, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1' },
                        { name: 'Campaigns', active: false, icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7' },
                        { name: 'Contacts', active: false, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                        { name: 'Inbox', active: false, icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
                        { name: 'Analytics', active: false, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className={`h-7 rounded-md flex items-center px-2.5 gap-2 ${
                            item.active ? 'bg-[#1C1C21]' : ''
                          }`}
                        >
                          <svg className={`w-3.5 h-3.5 ${item.active ? 'text-[#FAFAFB]' : 'text-[#4A4A54]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d={item.icon} />
                          </svg>
                          <span className={`text-[10px] font-medium ${item.active ? 'text-[#FAFAFB]' : 'text-[#6B6B76]'}`}>
                            {item.name}
                          </span>
                        </div>
                      ))}

                      <div className="pt-3 mt-3 border-t border-[#1C1C21]">
                        <div className="px-2.5 mb-1.5">
                          <span className="text-[8px] font-medium text-[#3A3A42] uppercase tracking-widest">Tools</span>
                        </div>
                        {[
                          { name: 'SARA AI', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                          { name: 'Webhooks', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101' },
                        ].map((item) => (
                          <div key={item.name} className="h-7 rounded-md flex items-center px-2.5 gap-2">
                            <svg className="w-3.5 h-3.5 text-[#4A4A54]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d={item.icon} />
                            </svg>
                            <span className="text-[10px] font-medium text-[#6B6B76]">{item.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#1C1C21]">
                        <div className="px-2.5 mb-1.5">
                          <span className="text-[8px] font-medium text-[#3A3A42] uppercase tracking-widest">Configure</span>
                        </div>
                        {[
                          { name: 'SMTP', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                          { name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                        ].map((item) => (
                          <div key={item.name} className="h-7 rounded-md flex items-center px-2.5 gap-2">
                            <svg className="w-3.5 h-3.5 text-[#4A4A54]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d={item.icon} />
                            </svg>
                            <span className="text-[10px] font-medium text-[#6B6B76]">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* User */}
                    <div className="border-t border-[#1C1C21] p-2">
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#16161A] transition-colors">
                        <div className="w-6 h-6 rounded-full bg-[#1C1C21] border border-[#24242A] flex items-center justify-center">
                          <span className="text-[8px] font-semibold text-[#9B9BA5]">JD</span>
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
                    {/* Header bar */}
                    <div className="h-10 border-b border-[#1C1C21] flex items-center justify-between px-5 bg-[#0D0D10]">
                      <div className="flex items-center h-7 w-52 rounded-lg border border-[#1C1C21] bg-[#111114] px-2.5 gap-2">
                        <svg className="w-3 h-3 text-[#4A4A54]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <span className="text-[9px] text-[#4A4A54]">Search anything...</span>
                        <span className="ml-auto text-[7px] text-[#3A3A42] bg-[#16161A] border border-[#1C1C21] rounded px-1.5 py-0.5 font-mono">⌘K</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#16161A] transition-colors">
                          <svg className="w-3.5 h-3.5 text-[#6B6B76]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FAFAFB]" />
                        </div>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#16161A] transition-colors">
                          <svg className="w-3.5 h-3.5 text-[#6B6B76]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                        </div>
                        <div className="w-px h-5 bg-[#1C1C21] mx-1" />
                        <div className="flex items-center gap-2 pl-1">
                          <div className="w-6 h-6 rounded-full bg-[#1C1C21] border border-[#24242A] flex items-center justify-center">
                            <span className="text-[7px] font-semibold text-[#9B9BA5]">JD</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard content */}
                    <div className="flex-1 p-5 overflow-hidden bg-[#111114]">
                      {/* Page header */}
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <div className="text-[9px] text-[#6B6B76] mb-0.5">Good morning, John</div>
                          <div className="text-[14px] font-semibold text-[#FAFAFB] tracking-tight">Dashboard</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-7 px-3 bg-[#16161A] border border-[#1C1C21] rounded-lg flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-[#6B6B76]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            <span className="text-[9px] font-medium text-[#9B9BA5]">Export</span>
                          </div>
                          <div className="h-7 px-3 bg-[#FAFAFB] rounded-lg flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-[#0A0A0B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"/></svg>
                            <span className="text-[10px] font-medium text-[#0A0A0B]">New Campaign</span>
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
                              <div className="w-3.5 h-3.5 rounded bg-[#1C1C21]" />
                              <span className="text-[8px] font-medium text-[#4ADE80]">{stat.change}</span>
                            </div>
                            <div className="text-[14px] font-semibold text-[#FAFAFB] tracking-tight">{stat.val}</div>
                            <div className="text-[8px] text-[#6B6B76] mt-0.5 mb-2">{stat.label}</div>
                            {/* Mini sparkline */}
                            <svg className="w-full h-4" viewBox="0 0 100 40" preserveAspectRatio="none">
                              <polyline
                                fill="none"
                                stroke="#3A3A42"
                                strokeWidth="2"
                                points={stat.trend.map((v, i) => `${i * 11.1},${40 - v * 0.6}`).join(' ')}
                              />
                              <polyline
                                fill="none"
                                stroke="#FAFAFB"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={stat.trend.slice(-4).map((v, i) => `${(i + 6) * 11.1},${40 - v * 0.6}`).join(' ')}
                              />
                            </svg>
                          </div>
                        ))}
                      </div>

                      {/* Content grid */}
                      <div className="grid grid-cols-5 gap-4">
                        {/* Recent campaigns - wider */}
                        <div className="col-span-3">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[10px] font-semibold text-[#FAFAFB]">Recent Campaigns</span>
                            <span className="text-[9px] text-[#6B6B76] hover:text-[#9B9BA5] cursor-pointer transition-colors">View all →</span>
                          </div>
                          <div className="border border-[#1C1C21] rounded-lg bg-[#0C0C0F] overflow-hidden">
                            {/* Table header */}
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
                              <div
                                key={campaign.name}
                                className={`flex items-center px-3.5 py-2.5 hover:bg-[#111114] transition-colors ${
                                  i < 3 ? 'border-b border-[#1C1C21]' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: campaign.statusColor }} />
                                  <span className="text-[10px] font-medium text-[#FAFAFB] truncate">{campaign.name}</span>
                                </div>
                                <div className="w-16 flex justify-center">
                                  <span
                                    className="text-[8px] font-medium px-1.5 py-0.5 rounded"
                                    style={{
                                      color: campaign.statusColor,
                                      backgroundColor: campaign.statusColor + '12',
                                    }}
                                  >
                                    {campaign.status}
                                  </span>
                                </div>
                                <span className="text-[9px] text-[#9B9BA5] w-14 text-right font-mono">{campaign.sent}</span>
                                <span className="text-[9px] text-[#9B9BA5] w-14 text-right font-mono">{campaign.opens}</span>
                                <span className="text-[9px] text-[#9B9BA5] w-14 text-right font-mono">{campaign.replies}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Engagement sidebar */}
                        <div className="col-span-2">
                          <span className="text-[10px] font-semibold text-[#FAFAFB] block mb-2.5">Engagement Overview</span>
                          <div className="space-y-2">
                            {[
                              { label: 'Open Rate', value: '68.2%', pct: 68, prev: '64.1%' },
                              { label: 'Click Rate', value: '12.4%', pct: 24, prev: '10.8%' },
                              { label: 'Reply Rate', value: '4.8%', pct: 10, prev: '4.2%' },
                              { label: 'Bounce Rate', value: '1.2%', pct: 2, prev: '1.5%' },
                            ].map((metric) => (
                              <div key={metric.label} className="p-2.5 bg-[#0C0C0F] rounded-lg border border-[#1C1C21]">
                                <div className="flex items-center justify-between">
                                  <div className="text-[8px] text-[#6B6B76]">{metric.label}</div>
                                  <div className="text-[7px] text-[#4A4A54]">prev: {metric.prev}</div>
                                </div>
                                <div className="text-[13px] font-semibold text-[#FAFAFB] tracking-tight mt-0.5 mb-1.5">{metric.value}</div>
                                <div className="w-full h-1 rounded-full bg-[#1C1C21]">
                                  <div
                                    className="h-1 rounded-full bg-[#FAFAFB] transition-all duration-1000"
                                    style={{ width: `${metric.pct}%` }}
                                  />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border-subtle)] rounded-xl overflow-hidden border border-[var(--border-subtle)]">
            {stats.map((stat) => (
              <div key={stat.label} className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 text-center p-8 bg-[var(--bg-surface)]">
                <div className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">{stat.value}</div>
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
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">
              Everything you need to
              <br />
              dominate outreach
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Stop juggling tools. SkySend brings your entire outreach workflow into one
              intelligent platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-subtle)] rounded-xl overflow-hidden border border-[var(--border-subtle)]">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 p-8 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-colors"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <feature.icon className="h-5 w-5 text-[var(--text-primary)] mb-4" strokeWidth={1.5} />
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-500">
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">
              From cold list to closed deal
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Three steps to transform your outreach pipeline.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
                description: 'SARA AI classifies every reply, drafts responses, and surfaces the hottest leads. Focus on conversations that close.',
                icon: TrendingUp,
              },
            ].map((step, i) => (
              <div key={step.step} className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="p-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] h-full">
                  <div className="text-5xl font-semibold text-[var(--border-default)] mb-6">{step.step}</div>
                  <step.icon className="h-5 w-5 text-[var(--text-primary)] mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{step.title}</h3>
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
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">
              Loved by revenue teams
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={testimonial.author}
                className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-[var(--text-primary)] text-[var(--text-primary)]" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="h-9 w-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-semibold text-[var(--text-primary)]">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{testimonial.author}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{testimonial.role}, {testimonial.company}</div>
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
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
              Start free. Upgrade once. Own it forever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 p-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Free</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Everything you need to get started with outreach.</p>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-semibold text-[var(--text-primary)]">&pound;0</span>
                <span className="text-sm text-[var(--text-tertiary)]">forever</span>
              </div>
              <Link
                to="/signup"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors mb-6"
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div className="space-y-3">
                {['1,000 emails/month', '500 contacts', 'Basic sequences', 'Email support', 'Analytics dashboard'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <Check className="h-4 w-4 text-[var(--text-tertiary)] flex-shrink-0" strokeWidth={2} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Lifetime Plan */}
            <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 relative p-8 rounded-xl border-2 border-[var(--text-primary)] bg-[var(--bg-surface)]" style={{ transitionDelay: '100ms' }}>
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-app)] text-xs font-medium">
                Best value
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Lifetime</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Unlimited access. One payment. No recurring fees.</p>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-semibold text-[var(--text-primary)]">&pound;299</span>
                <span className="text-sm text-[var(--text-tertiary)]">one-time</span>
              </div>
              <Link
                to="/signup"
                className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium mb-6"
              >
                Get lifetime access
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div className="space-y-3">
                {['Unlimited emails', 'Unlimited contacts', 'SARA AI assistant', 'A/B testing', 'API access', 'Priority support', 'Custom domains', 'SSO & SAML'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <Check className="h-4 w-4 text-[var(--text-primary)] flex-shrink-0" strokeWidth={2} />
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
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[#0A0A0B] p-12 sm:p-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
              Ready to transform your outreach?
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
              Join thousands of revenue teams using SkySend to book more meetings and close more deals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-[#0A0A0B] font-medium px-8 py-3 rounded-lg text-base hover:bg-white/90 transition-colors">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 bg-transparent text-white/80 font-medium px-8 py-3 rounded-lg text-base border border-white/20 hover:bg-white/10 transition-colors">
                Sign in
              </Link>
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
              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">Product</h4>
              <div className="space-y-2.5">
                <a href="#features" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
                <a href="#pricing" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Integrations</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Changelog</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">Company</h4>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">About</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Blog</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Careers</a>
                <a href="#" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">Legal</h4>
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
      `}</style>
    </div>
  );
}
