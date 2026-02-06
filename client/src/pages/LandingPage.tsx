import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  BarChart3,
  Users,
  Mail,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Automated Sequences',
    description: 'Build multi-step campaigns that run on autopilot with smart delays and conditions.',
  },
  {
    icon: Users,
    title: 'Contact Management',
    description: 'Import and organize thousands of contacts with AI-powered field mapping.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Track opens, clicks, and replies with detailed performance dashboards.',
  },
  {
    icon: Shield,
    title: 'Deliverability',
    description: 'Built-in warmup and reputation monitoring to ensure inbox placement.',
  },
];

const stats = [
  { value: '10M+', label: 'Emails sent' },
  { value: '98.7%', label: 'Deliverability' },
  { value: '3.2x', label: 'Reply rate increase' },
  { value: '500+', label: 'Enterprise teams' },
];

const testimonials = [
  {
    quote: "SkySend transformed our outbound. We went from 2% to 12% reply rates in just 3 weeks.",
    author: "Sarah Chen",
    role: "Head of Sales, TechCorp",
  },
  {
    quote: "Finally, an outreach tool built for enterprise. The analytics are incredibly detailed.",
    author: "Marcus Johnson",
    role: "VP Sales, GrowthLabs",
  },
  {
    quote: "The deliverability features alone saved us from getting blacklisted. Essential tool.",
    author: "Emily Park",
    role: "Director of Marketing, ScaleUp",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-[var(--text-primary)] flex items-center justify-center">
              <span className="text-[var(--bg-app)] text-sm font-bold">S</span>
            </div>
            <span className="text-lg font-semibold text-[var(--text-primary)]">SkySend</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="btn-primary">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 mb-8">
              <Globe className="h-4 w-4 text-[var(--text-tertiary)]" />
              <span className="text-sm text-[var(--text-secondary)]">Trusted by 500+ enterprise teams</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-[var(--text-primary)]">
              Enterprise-grade
              <br />
              email outreach
            </h1>

            <p className="mt-6 text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              The modern platform for cold email outreach. Build sequences, manage contacts,
              and track every interaction—built for teams that demand results.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary text-base px-6 py-3">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-6 py-3">
                Sign in
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                <Check className="h-4 w-4 text-[var(--success)]" />
                No credit card required
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                <Check className="h-4 w-4 text-[var(--success)]" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                <Check className="h-4 w-4 text-[var(--success)]" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 shadow-lg">
              <div className="aspect-[16/9] rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] overflow-hidden">
                <div className="h-10 border-b border-[var(--border-subtle)] flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--border-default)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--border-default)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--border-default)]" />
                </div>
                <div className="p-6 flex gap-6">
                  <div className="w-48 space-y-2">
                    {['Dashboard', 'Campaigns', 'Contacts', 'Analytics'].map((item, i) => (
                      <div
                        key={item}
                        className={`h-9 rounded-md ${i === 0 ? 'bg-[var(--bg-elevated)]' : ''} flex items-center px-3`}
                      >
                        <span className="text-sm text-[var(--text-secondary)]">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 w-48 bg-[var(--bg-elevated)] rounded" />
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]" />
                      ))}
                    </div>
                    <div className="h-48 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-semibold text-[var(--text-primary)]">{stat.value}</div>
                <div className="mt-2 text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[var(--text-primary)]">
              Everything you need to scale outreach
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Stop juggling multiple tools. SkySend brings your entire outreach workflow into one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-default)] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[var(--text-primary)]">
              Trusted by industry leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <p className="text-[var(--text-primary)] mb-6">"{testimonial.quote}"</p>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{testimonial.author}</div>
                  <div className="text-sm text-[var(--text-secondary)]">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
            <h2 className="text-3xl font-semibold text-[var(--text-primary)] mb-4">
              Ready to transform your outreach?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
              Join thousands of teams using SkySend to book more meetings and close more deals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary text-base px-6 py-3">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-6 py-3">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-[var(--text-primary)] flex items-center justify-center">
                <span className="text-[var(--bg-app)] text-xs font-bold">S</span>
              </div>
              <span className="text-lg font-semibold text-[var(--text-primary)]">SkySend</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-[var(--text-secondary)]">
              <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
              <a href="#testimonials" className="hover:text-[var(--text-primary)] transition-colors">Testimonials</a>
              <Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">Log in</Link>
              <Link to="/signup" className="hover:text-[var(--text-primary)] transition-colors">Sign up</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--text-tertiary)]">
            <div>&copy; {new Date().getFullYear()} SkySend. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
