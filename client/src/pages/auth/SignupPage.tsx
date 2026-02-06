import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';

export function SignupPage() {
  const { signUp, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email for confirmation.');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #7E22CE 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full border border-white/20" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full border border-white/20" />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full border border-white/10" />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)', backdropFilter: 'blur(10px)' }}
            >
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SkySend</span>
          </Link>

          {/* Tagline */}
          <div className="mt-16">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Start closing deals<br />
              on autopilot.
            </h1>
            <p className="mt-4 text-lg text-indigo-100/80 max-w-md">
              Set up your first campaign in minutes and watch the replies roll in. No credit card required.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <svg className="h-4 w-4 text-indigo-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">5-minute setup</p>
                <p className="mt-1 text-sm text-indigo-200/70">Connect your email, import contacts, and launch</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <svg className="h-4 w-4 text-indigo-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Enterprise-grade security</p>
                <p className="mt-1 text-sm text-indigo-200/70">SOC 2 compliant with end-to-end encryption</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <svg className="h-4 w-4 text-indigo-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Unlimited integrations</p>
                <p className="mt-1 text-sm text-indigo-200/70">Connect with HubSpot, Salesforce, Pipedrive, and more</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 mt-auto pt-12">
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/10">
            <p className="text-white/90 text-sm leading-relaxed italic">
              "We onboarded our entire SDR team in a single afternoon. The templates and AI suggestions made it incredibly easy to get started."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
                MK
              </div>
              <div>
                <p className="text-sm font-medium text-white">Marcus Kim</p>
                <p className="text-xs text-indigo-200/70">Head of Growth, ScaleUp.io</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[var(--bg-app)] px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)' }}
              >
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">SkySend</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Get started for free -- no credit card required
            </p>
          </div>

          {/* Google OAuth - top placement */}
          <button
            type="button"
            onClick={async () => {
              const { error } = await signInWithOAuth('google');
              if (error) toast.error(error.message);
            }}
            className="w-full btn-secondary justify-center py-2.5 rounded-xl"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg-app)] px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-brand justify-center py-2.5 rounded-xl"
              >
                {loading ? 'Creating account...' : 'Create account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
              By signing up, you agree to our{' '}
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Privacy Policy</a>
            </p>
          </div>

          {/* Login link */}
          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
