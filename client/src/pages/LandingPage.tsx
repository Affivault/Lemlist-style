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
import { SkySendLogoMark } from '../components/SkySendLogo';

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
            <Link to="/" className="flex items-center gap-2.5">
              <SkySendLogoMark className="h-7 w-7" />
              <span className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">SkySend</span>
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
          <div className="mt-20">
            <div className="rounded-2xl border border-[var(--border-default)] bg-[#0A0A0B] p-1.5 shadow-2xl">
              <div className="rounded-xl bg-[#111114] overflow-hidden" style={{ aspectRatio: '16/9.5' }}>
                {/* Browser chrome */}
                <div className="h-9 border-b border-[#1C1C21] flex items-center px-3.5 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3A3A42]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3A3A42]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3A3A42]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-5.5 w-56 rounded-md bg-[#16161A] flex items-center justify-center px-3">
                      <span className="text-[10px] text-[#6B6B76] font-medium tracking-wide">app.skysend.io/dashboard</span>
                    </div>
                  </div>
                </div>

                <div className="flex h-[calc(100%-36px)]">
                  {/* Sidebar mock */}
                  <div className="w-[180px] border-r border-[#1C1C21] bg-[#0F0F12] flex flex-col flex-shrink-0">
                    {/* Logo */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1C1C21]">
                      <div className="w-5 h-5 rounded-md bg-[#FAFAFB] flex items-center justify-center">
                        <span className="text-[8px] font-black text-[#0A0A0B]">S</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-[#FAFAFB] tracking-tight">SkySend</span>
                    </div>

                    {/* Nav items */}
                    <div className="px-2 py-3 space-y-0.5 flex-1">
                      {[
                        { name: 'Dashboard', active: true },
                        { name: 'Campaigns', active: false },
                        { name: 'Contacts', active: false },
                        { name: 'Inbox', active: false },
                        { name: 'Analytics', active: false },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className={`h-7 rounded-md flex items-center px-2.5 gap-2 ${
                            item.active ? 'bg-[#1C1C21]' : ''
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-sm ${item.active ? 'bg-[#FAFAFB]/30' : 'bg-[#3A3A42]'}`} />
                          <span className={`text-[10px] font-medium ${item.active ? 'text-[#FAFAFB]' : 'text-[#6B6B76]'}`}>
                            {item.name}
                          </span>
                        </div>
                      ))}

                      <div className="pt-3 mt-3 border-t border-[#1C1C21]">
                        <div className="px-2.5 mb-1.5">
                          <span className="text-[8px] font-medium text-[#3A3A42] uppercase tracking-widest">Tools</span>
                        </div>
                        {['SARA AI', 'Webhooks'].map((item) => (
                          <div key={item} className="h-7 rounded-md flex items-center px-2.5 gap-2">
                            <div className="w-3 h-3 rounded-sm bg-[#3A3A42]" />
                            <span className="text-[10px] font-medium text-[#6B6B76]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* User */}
                    <div className="border-t border-[#1C1C21] p-2">
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                        <div className="w-5 h-5 rounded-full bg-[#1C1C21] border border-[#24242A] flex items-center justify-center">
                          <span className="text-[7px] font-bold text-[#9B9BA5]">J</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-medium text-[#FAFAFB] truncate">john.doe</div>
                          <div className="text-[8px] text-[#6B6B76] truncate">john@company.com</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main content area */}
                  <div className="flex-1 flex flex-col min-w-0">
                    {/* Header bar */}
                    <div className="h-10 border-b border-[#1C1C21] flex items-center justify-between px-5 bg-[#0F0F12]">
                      <div className="flex items-center h-6 w-48 rounded-md border border-[#1C1C21] bg-[#111114] px-2.5">
                        <div className="w-3 h-3 rounded-sm bg-[#3A3A42] mr-2" />
                        <span className="text-[9px] text-[#6B6B76]">Search...</span>
                        <span className="ml-auto text-[7px] text-[#3A3A42] bg-[#16161A] rounded px-1 py-0.5 font-medium">⌘K</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[#16161A]">
                          <div className="w-3 h-3 rounded-sm bg-[#3A3A42]" />
                        </div>
                        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[#16161A]">
                          <div className="w-3 h-3 rounded-sm bg-[#3A3A42]" />
                        </div>
                      </div>
                    </div>

                    {/* Dashboard content */}
                    <div className="flex-1 p-5 overflow-hidden">
                      {/* Page header */}
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <div className="text-[9px] text-[#6B6B76] mb-0.5">Good morning</div>
                          <div className="text-[14px] font-semibold text-[#FAFAFB] tracking-tight">Dashboard</div>
                        </div>
                        <div className="h-7 px-3 bg-[#FAFAFB] rounded-md flex items-center gap-1.5">
                          <span className="text-[10px] font-medium text-[#0A0A0B]">New Campaign</span>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-3 mb-5">
                        {[
                          { label: 'Total Campaigns', val: '24', change: '+12%' },
                          { label: 'Total Contacts', val: '8,431', change: '+8%' },
                          { label: 'Emails Sent', val: '42,156', change: '+24%' },
                          { label: 'Active Now', val: '6', change: '+2' },
                        ].map((stat) => (
                          <div key={stat.label} className="p-3 bg-[#0F0F12] rounded-lg border border-[#1C1C21]">
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="w-3.5 h-3.5 rounded-sm bg-[#24242A]" />
                              <span className="text-[8px] font-medium text-[#4ADE80]">{stat.change}</span>
                            </div>
                            <div className="text-[14px] font-semibold text-[#FAFAFB] tracking-tight">{stat.val}</div>
                            <div className="text-[9px] text-[#6B6B76] mt-0.5">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Content grid */}
                      <div className="grid grid-cols-3 gap-4">
                        {/* Recent campaigns */}
                        <div className="col-span-2">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[10px] font-semibold text-[#FAFAFB]">Recent Campaigns</span>
                            <span className="text-[9px] text-[#6B6B76]">View all →</span>
                          </div>
                          <div className="border border-[#1C1C21] rounded-lg bg-[#0F0F12] overflow-hidden">
                            {[
                              { name: 'Q1 Enterprise Outreach', status: 'Active', statusColor: '#4ADE80' },
                              { name: 'Product Launch Follow-up', status: 'Active', statusColor: '#4ADE80' },
                              { name: 'Re-engagement Series', status: 'Paused', statusColor: '#FACC15' },
                              { name: 'December Newsletter', status: 'Completed', statusColor: '#6B6B76' },
                            ].map((campaign, i) => (
                              <div
                                key={campaign.name}
                                className={`flex items-center justify-between px-3.5 py-2.5 ${
                                  i < 3 ? 'border-b border-[#1C1C21]' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-3.5 h-3.5 rounded-sm bg-[#24242A]" />
                                  <span className="text-[10px] font-medium text-[#FAFAFB]">{campaign.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
                                    style={{
                                      color: campaign.statusColor,
                                      backgroundColor: campaign.statusColor + '15',
                                    }}
                                  >
                                    {campaign.status}
                                  </span>
                                  <div className="w-3 h-3 rounded-sm bg-[#24242A]" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Engagement sidebar */}
                        <div>
                          <span className="text-[10px] font-semibold text-[#FAFAFB] block mb-2.5">Engagement</span>
                          <div className="space-y-2">
                            {[
                              { label: 'Open Rate', value: '68.2%', pct: 68 },
                              { label: 'Click Rate', value: '12.4%', pct: 12 },
                              { label: 'Reply Rate', value: '4.8%', pct: 5 },
                            ].map((metric) => (
                              <div key={metric.label} className="p-3 bg-[#0F0F12] rounded-lg border border-[#1C1C21]">
                                <div className="text-[9px] text-[#6B6B76]">{metric.label}</div>
                                <div className="text-[13px] font-semibold text-[#FAFAFB] tracking-tight mt-0.5 mb-2">{metric.value}</div>
                                <div className="w-full h-1 rounded-full bg-[#1C1C21]">
                                  <div
                                    className="h-1 rounded-full bg-[#FAFAFB]"
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
              <div className="flex items-center gap-2.5 mb-4">
                <SkySendLogoMark className="h-6 w-6" />
                <span className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">SkySend</span>
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
