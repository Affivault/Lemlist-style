import { Link } from 'react-router-dom';
import {
  Send,
  Users,
  BarChart3,
  Mail,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Send,
    title: 'Multi-Step Campaigns',
    description: 'Build automated email sequences with delays, conditions, and follow-ups.',
  },
  {
    icon: Users,
    title: 'Contact Management',
    description: 'Import, segment, and manage contacts with CSV uploads and custom fields.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track opens, clicks, replies, and bounces with live dashboards.',
  },
  {
    icon: Mail,
    title: 'Multi-Sender Rotation',
    description: 'Connect multiple SMTP accounts and rotate senders automatically.',
  },
  {
    icon: Shield,
    title: 'Deliverability First',
    description: 'Built-in warm-up scheduling, send limits, and bounce handling.',
  },
  {
    icon: Zap,
    title: 'Personalization',
    description: 'Dynamic variables and conditional content for every email.',
  },
];

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-subtle bg-app/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-brand" />
            <span className="text-base font-semibold text-primary">SkySend</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-secondary transition-colors hover:text-primary">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-secondary transition-colors hover:text-primary">
              How It Works
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm text-secondary transition-colors hover:text-primary"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-400"
            >
              Get Started
            </Link>
          </div>

          <button
            className="text-secondary md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-subtle bg-app px-4 pb-4 pt-2 md:hidden">
            <a href="#features" className="block py-2 text-sm text-secondary" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" className="block py-2 text-sm text-secondary" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </a>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/login" className="rounded-md border border-default px-4 py-2 text-center text-sm text-primary">
                Log in
              </Link>
              <Link to="/signup" className="rounded-md bg-brand px-4 py-2 text-center text-sm font-medium text-white">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-14">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
              Cold email outreach
              <br />
              <span className="text-brand">that actually works</span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg text-secondary">
              The all-in-one platform for building email campaigns, managing contacts,
              and tracking every interaction.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-400 sm:w-auto"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-default px-6 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-hover hover:text-primary sm:w-auto"
              >
                Learn more
              </a>
            </div>

            <p className="mt-4 text-xs text-tertiary">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-subtle">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
              Everything you need
            </h2>
            <p className="mt-3 text-secondary">
              Built for teams that need to scale their outreach without the complexity.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-subtle bg-surface p-6"
              >
                <feature.icon className="h-5 w-5 text-brand" />
                <h3 className="mt-4 text-sm font-medium text-primary">{feature.title}</h3>
                <p className="mt-2 text-sm text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-subtle">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-secondary">
              Get started in minutes with three simple steps.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-8 lg:grid-cols-3">
            {[
              { num: '1', title: 'Import contacts', desc: 'Upload a CSV or add contacts manually.' },
              { num: '2', title: 'Build your sequence', desc: 'Create multi-step email campaigns.' },
              { num: '3', title: 'Launch & track', desc: 'Monitor opens, clicks, and replies in real-time.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-surface text-sm font-medium text-brand">
                  {step.num}
                </div>
                <h3 className="mt-4 text-sm font-medium text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-subtle">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
                  Built for teams that move fast
                </h2>
                <p className="mt-4 text-secondary">
                  Stop juggling spreadsheets and mail clients. SkySend brings your entire
                  outreach workflow into one platform.
                </p>
                <ul className="mt-8 space-y-3">
                  {[
                    'Automated follow-ups',
                    'Unified inbox for replies',
                    'Domain reputation protection',
                    'Smart field mapping on import',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-secondary">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-brand" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '3x', label: 'Higher reply rates' },
                  { value: '98%', label: 'Deliverability' },
                  { value: '50%', label: 'Time saved' },
                  { value: '10k+', label: 'Emails/day' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-subtle bg-surface p-5 text-center"
                  >
                    <div className="text-2xl font-semibold text-brand">{stat.value}</div>
                    <div className="mt-1 text-xs text-secondary">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-subtle">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mt-3 text-secondary">
              Join teams using SkySend to book more meetings and close more deals.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-400 sm:w-auto"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-md border border-default px-6 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-hover hover:text-primary sm:w-auto"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-brand" />
              <span className="text-sm font-medium text-primary">SkySend</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-tertiary">
              <a href="#features" className="transition-colors hover:text-secondary">Features</a>
              <Link to="/login" className="transition-colors hover:text-secondary">Log in</Link>
              <Link to="/signup" className="transition-colors hover:text-secondary">Sign up</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-tertiary">
            &copy; {new Date().getFullYear()} SkySend
          </div>
        </div>
      </footer>
    </div>
  );
}
