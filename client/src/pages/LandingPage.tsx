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
  Sparkles,
  TrendingUp,
  MousePointerClick,
  Send,
  Lock,
  Layers,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Intelligent Sequences',
    description: 'Build multi-step campaigns with AI-optimized send times, smart delays, and conditional branching that adapts to recipient behavior.',
    gradient: 'from-violet-500/10 to-purple-500/10',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
  },
  {
    icon: Users,
    title: 'Contact Intelligence',
    description: 'Import, enrich, and segment contacts with AI-powered field mapping. Maintain pristine data with automatic deduplication.',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track every touchpoint with granular performance dashboards. Understand what works with A/B testing insights.',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    icon: Shield,
    title: 'Deliverability Engine',
    description: 'Built-in warmup protocols, reputation monitoring, and domain health scoring ensure every email lands in the primary inbox.',
    gradient: 'from-amber-500/10 to-orange-500/10',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  {
    icon: Bot,
    title: 'SARA AI Assistant',
    description: 'Our AI classifies replies by intent, drafts contextual responses, and routes conversations for human review when needed.',
    gradient: 'from-pink-500/10 to-rose-500/10',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant infrastructure with end-to-end encryption, SSO integration, and granular role-based access controls.',
    gradient: 'from-slate-500/10 to-gray-500/10',
    iconBg: 'bg-slate-500/10',
    iconColor: 'text-slate-500',
  },
];

const stats = [
  { value: '10M+', label: 'Emails delivered monthly', icon: Send },
  { value: '98.7%', label: 'Average deliverability', icon: Shield },
  { value: '3.2x', label: 'Reply rate improvement', icon: TrendingUp },
  { value: '500+', label: 'Enterprise teams active', icon: Users },
];

const testimonials = [
  {
    quote: "SkySend transformed our outbound pipeline. We went from 2% to 12% reply rates in three weeks. The AI-driven send optimization alone was worth the switch.",
    author: "Sarah Chen",
    role: "Head of Sales",
    company: "TechCorp",
    metric: "6x reply rate",
  },
  {
    quote: "Finally, an outreach tool built for enterprise. The analytics granularity and deliverability monitoring give us confidence at scale.",
    author: "Marcus Johnson",
    role: "VP Sales",
    company: "GrowthLabs",
    metric: "98.9% deliverability",
  },
  {
    quote: "SARA AI has fundamentally changed how we handle replies. What took our team hours now happens in minutes with better accuracy than humans.",
    author: "Emily Park",
    role: "Director of Marketing",
    company: "ScaleUp",
    metric: "90% time saved",
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
    <div ref={pageRef} className="min-h-screen bg-[var(--bg-app)] overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-[var(--mesh-1)] blur-[120px] animate-float" />
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[var(--mesh-2)] blur-[100px] animate-float" style={{ animationDelay: '-5s' }} />
        <div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] rounded-full bg-[var(--mesh-3)] blur-[100px] animate-float" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex h-14 items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-xl px-6 shadow-lg">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Send className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">SkySend</span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200">Features</a>
              <a href="#testimonials" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200">Testimonials</a>
              <a href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200">Pricing</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 px-3 py-2">
                Log in
              </Link>
              <Link to="/signup" className="btn-brand text-sm px-4 py-2 rounded-lg">
                Start Free Trial
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl text-center">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-sm px-4 py-2 mb-8 opacity-0 animate-fade-up shadow-sm">
              <div className="flex -space-x-1.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-5 w-5 rounded-full border-2 border-[var(--bg-surface)] bg-gradient-to-br from-indigo-400 to-violet-500" />
                ))}
              </div>
              <span className="text-sm text-[var(--text-secondary)]">Trusted by <span className="font-medium text-[var(--text-primary)]">500+</span> enterprise teams</span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] opacity-0 animate-fade-up-delay-1">
              <span className="text-[var(--text-primary)]">Outreach that </span>
              <span className="text-gradient">converts</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-up-delay-2">
              The intelligent email platform that automates your outreach, enriches your pipeline,
              and turns cold prospects into warm conversations.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up-delay-3">
              <Link to="/signup" className="btn-brand text-base px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3.5 rounded-xl">
                Sign in
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-8 text-sm text-[var(--text-tertiary)]">
              {['No credit card required', '14-day free trial', 'Cancel anytime'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-[var(--success-bg)] flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-[var(--success)]" strokeWidth={3} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            {/* Glow effect behind the mockup */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[var(--brand-subtle)] to-transparent opacity-40 blur-3xl -z-10" />

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1.5 shadow-2xl">
              <div className="aspect-[16/9] rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] overflow-hidden">
                {/* Browser chrome */}
                <div className="h-10 border-b border-[var(--border-subtle)] flex items-center px-4 gap-2 bg-[var(--bg-surface)]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--error)]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)]/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-6 w-64 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center">
                      <span className="text-[10px] text-[var(--text-tertiary)]">app.skysend.io/dashboard</span>
                    </div>
                  </div>
                </div>
                {/* App content mockup */}
                <div className="p-5 flex gap-5">
                  {/* Sidebar mockup */}
                  <div className="w-44 space-y-1.5 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 mb-3">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600" />
                      <div className="h-3 w-16 rounded bg-[var(--text-primary)]/20" />
                    </div>
                    {['Dashboard', 'Campaigns', 'Contacts', 'Analytics', 'Inbox'].map((item, i) => (
                      <div
                        key={item}
                        className={`h-8 rounded-lg flex items-center px-3 gap-2 ${i === 0 ? 'bg-[var(--brand-subtle)]' : ''}`}
                      >
                        <div className={`w-3.5 h-3.5 rounded ${i === 0 ? 'bg-[var(--brand)]/30' : 'bg-[var(--border-default)]'}`} />
                        <span className={`text-[11px] ${i === 0 ? 'text-[var(--brand)] font-medium' : 'text-[var(--text-secondary)]'}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Main content mockup */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-28 bg-[var(--text-primary)]/15 rounded" />
                      <div className="h-7 w-28 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-md" />
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Campaigns', val: '24' },
                        { label: 'Contacts', val: '8,431' },
                        { label: 'Sent', val: '42,156' },
                        { label: 'Replies', val: '1,284' },
                      ].map((stat) => (
                        <div key={stat.label} className="p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
                          <div className="text-[10px] text-[var(--text-tertiary)]">{stat.label}</div>
                          <div className="text-base font-semibold text-[var(--text-primary)] mt-0.5">{stat.val}</div>
                        </div>
                      ))}
                    </div>
                    {/* Chart mockup */}
                    <div className="h-36 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-3 flex items-end gap-1.5 overflow-hidden">
                      {[35, 45, 30, 50, 65, 55, 70, 60, 75, 80, 65, 85, 70, 90, 75, 95, 80, 72, 88, 78].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-gradient-to-t from-indigo-500/20 to-indigo-500/60"
                          style={{ height: `${h}%` }}
                        />
                      ))}
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
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm text-[var(--text-tertiary)] mb-8 uppercase tracking-wider font-medium">
            Trusted by forward-thinking teams
          </p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--bg-app)] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--bg-app)] to-transparent z-10" />
            <div className="flex animate-marquee">
              {[...logos, ...logos].map((logo, i) => (
                <div key={i} className="flex-shrink-0 mx-10 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center">
                    <Globe className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  </div>
                  <span className="text-base font-medium text-[var(--text-tertiary)] whitespace-nowrap">{logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 text-center p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 backdrop-blur-sm">
                <stat.icon className="h-5 w-5 text-[var(--brand)] mx-auto mb-3" strokeWidth={1.5} />
                <div className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">{stat.value}</div>
                <div className="mt-1.5 text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-subtle)] px-3 py-1 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span className="text-xs font-medium text-[var(--brand)]">Platform Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Everything you need to
              <br />
              <span className="text-gradient">dominate outreach</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Stop juggling tools. SkySend brings your entire outreach workflow into one
              intelligent, beautifully designed platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 group relative p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-default)] hover:shadow-lg transition-all duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works / Process section */}
      <section className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-subtle)] px-3 py-1 mb-4">
              <Layers className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span className="text-xs font-medium text-[var(--brand)]">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
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
                description: 'Upload your contact list or connect your CRM. Our AI automatically maps fields, deduplicates entries, and enriches profiles.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Build & Launch',
                description: 'Create multi-step email sequences with our visual builder. Set conditions, A/B test variations, and let AI optimize send times.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Engage & Convert',
                description: 'SARA AI classifies every reply, drafts responses, and surfaces the hottest leads. Focus on conversations that close.',
                icon: TrendingUp,
              },
            ].map((step, i) => (
              <div key={step.step} className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 relative" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="relative p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] h-full">
                  <div className="text-5xl font-bold text-[var(--brand-subtle)] dark:text-[var(--brand)]/10 mb-4">{step.step}</div>
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-subtle)] flex items-center justify-center mb-4">
                    <step.icon className="h-5 w-5 text-[var(--brand)]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-subtle)] px-3 py-1 mb-4">
              <Star className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span className="text-xs font-medium text-[var(--brand)]">Customer Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Loved by revenue teams
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={testimonial.author}
                className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 group p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-default)] hover:shadow-lg transition-all duration-300"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{testimonial.author}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[var(--brand)] bg-[var(--brand-subtle)] px-2.5 py-1 rounded-full">
                    {testimonial.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-500">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$49',
                period: '/mo',
                description: 'For individuals and small teams getting started with outreach.',
                features: ['1,000 emails/month', '500 contacts', 'Basic sequences', 'Email support', 'Analytics dashboard'],
                cta: 'Start free trial',
                popular: false,
              },
              {
                name: 'Professional',
                price: '$149',
                period: '/mo',
                description: 'For growing teams that need advanced automation and AI.',
                features: ['10,000 emails/month', 'Unlimited contacts', 'SARA AI assistant', 'A/B testing', 'API access', 'Priority support', 'Custom domains'],
                cta: 'Start free trial',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For large organizations with custom requirements.',
                features: ['Unlimited emails', 'Unlimited contacts', 'Dedicated CSM', 'SSO & SAML', 'Custom integrations', 'SLA guarantee', 'Onboarding program'],
                cta: 'Contact sales',
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={plan.name}
                className={`animate-on-scroll opacity-0 translate-y-4 transition-all duration-500 relative p-8 rounded-2xl border ${
                  plan.popular
                    ? 'border-[var(--brand)]/30 bg-[var(--bg-surface)] shadow-xl shadow-[var(--brand)]/5'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-medium shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{plan.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{plan.description}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-[var(--text-primary)]">{plan.price}</span>
                  {plan.period && <span className="text-sm text-[var(--text-tertiary)]">{plan.period}</span>}
                </div>
                <Link
                  to="/signup"
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-6 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                      <Check className="h-4 w-4 text-[var(--brand)] flex-shrink-0" strokeWidth={2} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
            <div className="absolute inset-0 bg-noise opacity-[0.03]" />
            {/* Decorative circles */}
            <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white/5 blur-2xl" />
            <div className="absolute bottom-[-30%] left-[-5%] w-[300px] h-[300px] rounded-full bg-white/5 blur-2xl" />

            <div className="relative px-8 py-20 sm:px-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Ready to transform your outreach?
              </h2>
              <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
                Join thousands of revenue teams using SkySend to book more meetings and close more deals.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-medium px-8 py-3.5 rounded-xl text-base shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all duration-200">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 bg-white/10 text-white font-medium px-8 py-3.5 rounded-xl text-base backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Send className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">SkySend</span>
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

      {/* Scroll animation styles */}
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
