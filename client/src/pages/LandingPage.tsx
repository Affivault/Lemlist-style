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
  Globe,
  Clock,
  TrendingUp,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { SkySendLogo } from '../components/SkySendLogo';

const features = [
  {
    icon: Send,
    title: 'Multi-Step Campaigns',
    description:
      'Build automated email sequences with delays, conditions, and follow-ups that convert prospects into customers.',
  },
  {
    icon: Users,
    title: 'Smart Contact Management',
    description:
      'Import, segment, and tag your contacts. CSV uploads, custom fields, and intelligent deduplication built in.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Track opens, clicks, replies, and bounces with live dashboards. Know exactly what works and optimize.',
  },
  {
    icon: Mail,
    title: 'Multi-Sender Rotation',
    description:
      'Connect multiple SMTP accounts and rotate senders automatically to maximize deliverability.',
  },
  {
    icon: Shield,
    title: 'Deliverability First',
    description:
      'Built-in warm-up scheduling, send limits, and bounce handling to keep your sender reputation spotless.',
  },
  {
    icon: Sparkles,
    title: 'Personalization Engine',
    description:
      'Dynamic variables, conditional content, and custom fields let every email feel hand-written.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Import Your Contacts',
    description: 'Upload a CSV or add contacts manually. Tag and segment them for targeted outreach.',
  },
  {
    num: '02',
    title: 'Build Your Sequence',
    description: 'Create multi-step email campaigns with custom delays, personalization, and A/B testing.',
  },
  {
    num: '03',
    title: 'Launch & Optimize',
    description: 'Hit send and watch real-time analytics. Adjust based on opens, clicks, and replies.',
  },
];

const stats = [
  { value: '3x', label: 'Higher reply rates' },
  { value: '98%', label: 'Deliverability rate' },
  { value: '50%', label: 'Less time on outreach' },
  { value: '10k+', label: 'Emails per day' },
];

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <SkySendLogo className="h-9 w-9" />
            <span className="text-xl font-bold text-white">SkySend</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-400 transition-colors hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-slate-400 transition-colors hover:text-white">
              How It Works
            </a>
            <a href="#stats" className="text-sm text-slate-400 transition-colors hover:text-white">
              Results
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="text-slate-400 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0a0a0f] px-4 pb-4 pt-2 md:hidden">
            <a href="#features" className="block py-2 text-sm text-slate-400" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" className="block py-2 text-sm text-slate-400" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </a>
            <a href="#stats" className="block py-2 text-sm text-slate-400" onClick={() => setMobileMenuOpen(false)}>
              Results
            </a>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/login" className="rounded-lg border border-white/20 px-4 py-2 text-center text-sm text-white">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0a0a0f] pt-16">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute -right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[120px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 sm:pb-32 sm:pt-32 lg:px-8 lg:pb-40 lg:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-400 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Cold outreach, reimagined</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl">
              Send smarter.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Close faster.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              The all-in-one outreach platform that helps you build multi-step email campaigns,
              manage contacts, and track every interaction — so you can focus on closing deals.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110 sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-base font-medium text-slate-400 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10 hover:text-white sm:w-auto"
              >
                See How It Works
              </a>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              No credit card required. Free plan available.
            </p>
          </div>

          {/* Floating UI Preview */}
          <div className="relative mx-auto mt-16 max-w-4xl sm:mt-20">
            <div className="rounded-xl border border-white/10 bg-white/5 p-1.5 shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
              <div className="overflow-hidden rounded-lg border border-white/5 bg-slate-900">
                {/* Mock app header */}
                <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                  <div className="ml-4 h-5 w-48 rounded bg-white/5" />
                </div>
                {/* Mock app content */}
                <div className="flex">
                  {/* Mock sidebar */}
                  <div className="hidden w-48 border-r border-white/5 p-4 sm:block">
                    <div className="mb-4 flex items-center gap-2">
                      <SkySendLogo className="h-5 w-5" />
                      <div className="h-3 w-16 rounded bg-white/10" />
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                            i === 1 ? 'bg-blue-500/20' : ''
                          }`}
                        >
                          <div className={`h-3 w-3 rounded ${i === 1 ? 'bg-blue-400/60' : 'bg-white/10'}`} />
                          <div className={`h-2 rounded ${i === 1 ? 'w-16 bg-blue-400/40' : 'w-12 bg-white/10'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Mock dashboard */}
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="h-4 w-28 rounded bg-white/10" />
                      <div className="h-7 w-24 rounded-md bg-gradient-to-r from-indigo-500/40 to-cyan-500/40" />
                    </div>
                    {/* Mock stats row */}
                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {['blue', 'indigo', 'cyan', 'violet'].map((color, i) => (
                        <div key={i} className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                          <div className="mb-2 h-2 w-12 rounded bg-white/10" />
                          <div className={`h-5 w-10 rounded bg-${color}-400/30`} />
                        </div>
                      ))}
                    </div>
                    {/* Mock chart area */}
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                      <div className="flex h-32 items-end justify-between gap-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                          <div
                            key={i}
                            className="w-full rounded-t bg-gradient-to-t from-blue-500/40 to-cyan-400/20"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect under preview */}
            <div className="absolute -bottom-8 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="relative bg-[#0a0a0f] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              Powerful Features
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                dominate outreach
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              From first contact to closed deal, SkySend handles the entire outreach workflow.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-slate-800 bg-slate-800/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-800/70"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-cyan-400 transition-colors group-hover:from-indigo-500/30 group-hover:to-cyan-500/30">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative bg-[#0d0d14] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              Simple Process
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Three simple steps to launch your first campaign.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-3">
            {steps.map((step, idx) => (
              <div key={step.num} className="relative text-center">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-gradient-to-r from-indigo-500/40 to-transparent lg:block" />
                )}
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-slate-800" />
                  <span className="relative text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative overflow-hidden bg-[#0a0a0f] py-24 sm:py-32">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              Proven Results
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Numbers that speak for themselves
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent sm:text-5xl">
                  {stat.value}
                </div>
                <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Benefits */}
      <section className="bg-[#0d0d14] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                  Why SkySend
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Built for teams that{' '}
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    move fast
                  </span>
                </h2>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  Stop juggling spreadsheets, mail clients, and CRMs. SkySend brings your entire
                  outreach workflow into one powerful platform.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    'Automated follow-ups that never slip through the cracks',
                    'Unified inbox for all your outreach replies',
                    'Smart sending that protects your domain reputation',
                    'CSV import with intelligent field mapping',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
                      <span className="text-sm text-slate-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefit cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Globe, label: 'Multi-sender rotation', value: 'Rotate senders' },
                  { icon: Clock, label: 'Smart scheduling', value: 'Auto delays' },
                  { icon: TrendingUp, label: 'Live analytics', value: 'Real-time' },
                  { icon: Shield, label: 'Bounce handling', value: 'Auto-protect' },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/50 p-6 text-center"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-cyan-400">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-semibold text-white">{card.value}</div>
                    <div className="mt-1 text-xs text-slate-400">{card.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 py-24 sm:py-32">
        <div className="absolute inset-0 opacity-30">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Ready to transform your outreach?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Join thousands of sales teams using SkySend to book more meetings and close more deals.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50 sm:w-auto"
            >
              Start Free Today
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-white/10 sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0a0a0f] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <SkySendLogo className="h-8 w-8" />
              <span className="text-lg font-bold text-white">SkySend</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#features" className="transition-colors hover:text-white">Features</a>
              <a href="#how-it-works" className="transition-colors hover:text-white">How It Works</a>
              <Link to="/login" className="transition-colors hover:text-white">Log In</Link>
              <Link to="/signup" className="transition-colors hover:text-white">Sign Up</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SkySend. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
