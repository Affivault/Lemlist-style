import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Users,
  Mail,
  Check,
  Play,
  Star,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast Sequences',
    description: 'Build multi-step campaigns that run on autopilot. Set delays, conditions, and watch your outreach scale.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Users,
    title: 'Smart Contact Management',
    description: 'Import thousands of contacts instantly. AI-powered field mapping and duplicate detection.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track every open, click, and reply. Beautiful dashboards that tell the story of your campaigns.',
    gradient: 'from-orange-500 to-amber-600',
  },
  {
    icon: Shield,
    title: 'Deliverability Engine',
    description: 'Built-in warmup, smart throttling, and reputation monitoring. Your emails land in the inbox.',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

const stats = [
  { value: '10M+', label: 'Emails sent' },
  { value: '98.7%', label: 'Deliverability' },
  { value: '3.2x', label: 'Reply rate increase' },
  { value: '500+', label: 'Happy teams' },
];

const testimonials = [
  {
    quote: "SkySend transformed our outbound. We went from 2% to 12% reply rates in just 3 weeks.",
    author: "Sarah Chen",
    role: "Head of Sales, TechCorp",
    avatar: "SC",
  },
  {
    quote: "Finally, an outreach tool that doesn't feel like it was built in 2010. The UX is incredible.",
    author: "Marcus Johnson",
    role: "Founder, GrowthLabs",
    avatar: "MJ",
  },
  {
    quote: "The deliverability features alone saved us from getting blacklisted. Worth every penny.",
    author: "Emily Park",
    role: "Marketing Director, ScaleUp",
    avatar: "EP",
  },
];

export function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-app overflow-hidden">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb w-[600px] h-[600px] -top-[200px] -left-[200px] animate-glow" />
        <div className="orb w-[500px] h-[500px] top-[40%] -right-[150px] animate-glow" style={{ animationDelay: '-10s' }} />
        <div className="orb w-[400px] h-[400px] -bottom-[100px] left-[30%] animate-glow" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-subtle bg-app/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500" />
              <div className="absolute inset-0 h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 blur-lg opacity-50" />
            </div>
            <span className="text-lg font-bold text-primary">SkySend</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="nav-link">Features</a>
            <a href="#testimonials" className="nav-link">Testimonials</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-secondary hover:text-primary transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="btn-solid">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface/50 backdrop-blur-sm px-4 py-2 mb-8 animate-fade-up opacity-0">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-secondary">Introducing SkySend 2.0</span>
              <ChevronRight className="h-4 w-4 text-tertiary" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight animate-fade-up opacity-0 stagger-1">
              <span className="text-primary">Outreach that</span>
              <br />
              <span className="gradient-text">actually converts</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-xl text-secondary max-w-2xl mx-auto leading-relaxed animate-fade-up opacity-0 stagger-2">
              The modern platform for cold email outreach. Build sequences, manage contacts,
              and track every interaction—all in one beautiful interface.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0 stagger-3">
              <Link to="/signup" className="btn-glow">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="btn-ghost">
                <Play className="h-4 w-4" />
                Watch demo
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex items-center justify-center gap-8 animate-fade-up opacity-0 stagger-4">
              <div className="flex items-center gap-2 text-sm text-tertiary">
                <Check className="h-4 w-4 text-emerald-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2 text-sm text-tertiary">
                <Check className="h-4 w-4 text-emerald-500" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2 text-sm text-tertiary">
                <Check className="h-4 w-4 text-emerald-500" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-20 relative animate-fade-up opacity-0 stagger-5">
            <div className="gradient-border">
              <div className="relative rounded-2xl bg-surface p-2 overflow-hidden">
                {/* Mock dashboard */}
                <div className="aspect-[16/9] rounded-xl bg-app border border-subtle overflow-hidden">
                  <div className="h-10 border-b border-subtle flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="p-6 flex gap-6">
                    {/* Sidebar mock */}
                    <div className="w-48 space-y-2">
                      {['Dashboard', 'Campaigns', 'Contacts', 'Analytics'].map((item, i) => (
                        <div
                          key={item}
                          className={`h-9 rounded-lg ${i === 0 ? 'bg-active' : 'bg-surface'} flex items-center px-3`}
                        >
                          <span className={`text-sm ${i === 0 ? 'text-violet-400' : 'text-secondary'}`}>{item}</span>
                        </div>
                      ))}
                    </div>
                    {/* Content mock */}
                    <div className="flex-1 space-y-4">
                      <div className="h-8 w-48 bg-elevated rounded-lg" />
                      <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-24 bg-surface rounded-xl border border-subtle" />
                        ))}
                      </div>
                      <div className="h-48 bg-surface rounded-xl border border-subtle" />
                    </div>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-px bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-50 -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-subtle">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-2 text-sm text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="badge mb-4">
              <Zap className="h-3.5 w-3.5" />
              Features
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-primary">
              Everything you need to
              <br />
              <span className="gradient-text">scale your outreach</span>
            </h2>
            <p className="mt-6 text-lg text-secondary max-w-2xl mx-auto">
              Stop juggling multiple tools. SkySend brings your entire outreach workflow into one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="card-glow group cursor-pointer"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
                <p className="text-secondary leading-relaxed">{feature.description}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 border-t border-subtle">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="badge mb-4">
              <Star className="h-3.5 w-3.5" />
              Testimonials
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-primary">
              Loved by teams
              <br />
              <span className="gradient-text">everywhere</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={testimonial.author} className="card-glow">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-primary leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-semibold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-primary">{testimonial.author}</div>
                    <div className="text-sm text-secondary">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative rounded-3xl border border-subtle bg-surface/50 backdrop-blur-sm p-12 lg:p-20 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-orange-500/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[120px]" />

            <div className="relative">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
                Ready to transform
                <br />
                <span className="gradient-text">your outreach?</span>
              </h2>
              <p className="text-lg text-secondary max-w-xl mx-auto mb-10">
                Join thousands of teams using SkySend to book more meetings and close more deals.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="btn-glow">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500" />
              <span className="text-lg font-bold text-primary">SkySend</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-secondary">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
              <Link to="/login" className="hover:text-primary transition-colors">Log in</Link>
              <Link to="/signup" className="hover:text-primary transition-colors">Sign up</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-subtle flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-tertiary">
            <div>&copy; {new Date().getFullYear()} SkySend. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-secondary transition-colors">Privacy</a>
              <a href="#" className="hover:text-secondary transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
