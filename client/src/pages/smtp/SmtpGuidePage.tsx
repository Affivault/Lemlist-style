import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Shield,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const providers = [
  {
    name: 'Gmail / Google Workspace',
    logo: '📧',
    host: 'smtp.gmail.com',
    port: '587 (TLS) or 465 (SSL)',
    security: 'TLS/SSL',
    notes: 'Requires App Password if 2FA enabled. Enable "Less secure app access" for regular passwords.',
    steps: [
      'Go to your Google Account settings',
      'Navigate to Security > 2-Step Verification',
      'Scroll down to "App passwords"',
      'Generate a new app password for "Mail"',
      'Use this password instead of your regular password',
    ],
  },
  {
    name: 'Microsoft 365 / Outlook',
    logo: '📨',
    host: 'smtp.office365.com',
    port: '587',
    security: 'STARTTLS',
    notes: 'Use your full email address as username. May require admin approval for SMTP AUTH.',
    steps: [
      'Sign in to Microsoft 365 admin center',
      'Go to Settings > Org settings > SMTP',
      'Enable authenticated SMTP for your account',
      'Use your email and password to connect',
    ],
  },
  {
    name: 'SendGrid',
    logo: '🚀',
    host: 'smtp.sendgrid.net',
    port: '587 (TLS) or 465 (SSL)',
    security: 'TLS',
    notes: 'Username is always "apikey". Use your API key as the password.',
    steps: [
      'Create a SendGrid account',
      'Go to Settings > API Keys',
      'Create a new API key with Mail Send permissions',
      'Use "apikey" as username and your API key as password',
    ],
  },
  {
    name: 'Mailgun',
    logo: '📬',
    host: 'smtp.mailgun.org',
    port: '587',
    security: 'TLS',
    notes: 'Use your domain-specific SMTP credentials from the Mailgun dashboard.',
    steps: [
      'Add and verify your domain in Mailgun',
      'Go to Sending > Domain settings > SMTP credentials',
      'Create SMTP credentials for your domain',
      'Use the generated username and password',
    ],
  },
  {
    name: 'Amazon SES',
    logo: '☁️',
    host: 'email-smtp.[region].amazonaws.com',
    port: '587 or 465',
    security: 'TLS/SSL',
    notes: 'Replace [region] with your AWS region (e.g., us-east-1). Requires SMTP credentials from SES.',
    steps: [
      'Verify your email/domain in Amazon SES',
      'Move out of sandbox mode (request production access)',
      'Go to Account dashboard > SMTP settings',
      'Create SMTP credentials',
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
    >
      <Copy className="h-4 w-4" />
    </button>
  );
}

export function SmtpGuidePage() {
  const [selectedProvider, setSelectedProvider] = useState(providers[0]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          to="/smtp-accounts"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to SMTP Accounts
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">SMTP Connection Guide</h1>
        <p className="text-gray-500 mt-2">
          Learn how to connect your email provider to SkySend for sending campaigns.
        </p>
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-white/20">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Quick Start</h2>
          </div>
          <p className="text-indigo-100 max-w-2xl mb-6">
            To send emails through SkySend, you need to connect an SMTP server. This is how email services
            communicate to deliver your messages. Below you'll find step-by-step instructions for popular providers.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Secure TLS/SSL</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
              <Server className="h-5 w-5" />
              <span className="text-sm">Any SMTP Provider</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
              <Lock className="h-5 w-5" />
              <span className="text-sm">Encrypted Storage</span>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Need */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
            <Server className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">SMTP Host</h3>
          <p className="text-sm text-gray-500">The server address for your email provider</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4">
            <Globe className="h-6 w-6 text-cyan-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Port Number</h3>
          <p className="text-sm text-gray-500">Usually 587 (TLS) or 465 (SSL)</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-violet-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Username</h3>
          <p className="text-sm text-gray-500">Usually your full email address</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Password/API Key</h3>
          <p className="text-sm text-gray-500">Your password or app-specific key</p>
        </div>
      </div>

      {/* Provider Selection */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Provider</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {providers.map((provider) => (
            <button
              key={provider.name}
              onClick={() => setSelectedProvider(provider)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedProvider.name === provider.name
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <span className="mr-2">{provider.logo}</span>
              {provider.name}
            </button>
          ))}
        </div>

        {/* Provider Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedProvider.logo}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedProvider.name}</h3>
                <p className="text-sm text-gray-500">{selectedProvider.notes}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Connection Details */}
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Connection Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">SMTP Host</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-900">{selectedProvider.host}</code>
                  <CopyButton text={selectedProvider.host} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Port</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-900">{selectedProvider.port}</code>
                  <CopyButton text={selectedProvider.port.split(' ')[0]} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Security</p>
                <code className="text-sm font-mono text-gray-900">{selectedProvider.security}</code>
              </div>
            </div>

            {/* Setup Steps */}
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Setup Steps
            </h4>
            <div className="space-y-3">
              {selectedProvider.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">Important Tips</h3>
            <ul className="space-y-2 text-amber-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Always use TLS/SSL encryption for secure email delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Use app-specific passwords instead of your main password when possible</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>For high-volume sending, consider dedicated email services like SendGrid or Mailgun</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Test your SMTP connection with a small campaign before scaling up</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-card text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to connect your email?</h3>
        <p className="text-gray-500 mb-6">
          Head back to SMTP Accounts and add your credentials to start sending campaigns.
        </p>
        <Link
          to="/smtp-accounts"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200"
        >
          <Mail className="h-5 w-5" />
          Add SMTP Account
        </Link>
      </div>
    </div>
  );
}
