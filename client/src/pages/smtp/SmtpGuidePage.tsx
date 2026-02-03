import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Globe,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const providers = [
  {
    name: 'Gmail / Google Workspace',
    host: 'smtp.gmail.com',
    port: '587 (TLS) or 465 (SSL)',
    security: 'TLS/SSL',
    notes: 'Requires App Password if 2FA enabled.',
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
    host: 'smtp.office365.com',
    port: '587',
    security: 'STARTTLS',
    notes: 'Use your full email address as username.',
    steps: [
      'Sign in to Microsoft 365 admin center',
      'Go to Settings > Org settings > SMTP',
      'Enable authenticated SMTP for your account',
      'Use your email and password to connect',
    ],
  },
  {
    name: 'SendGrid',
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
    host: 'smtp.mailgun.org',
    port: '587',
    security: 'TLS',
    notes: 'Use your domain-specific SMTP credentials.',
    steps: [
      'Add and verify your domain in Mailgun',
      'Go to Sending > Domain settings > SMTP credentials',
      'Create SMTP credentials for your domain',
      'Use the generated username and password',
    ],
  },
  {
    name: 'Amazon SES',
    host: 'email-smtp.[region].amazonaws.com',
    port: '587 or 465',
    security: 'TLS/SSL',
    notes: 'Replace [region] with your AWS region.',
    steps: [
      'Verify your email/domain in Amazon SES',
      'Move out of sandbox mode',
      'Go to Account dashboard > SMTP settings',
      'Create SMTP credentials',
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-hover text-tertiary hover:text-secondary transition-colors"
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  );
}

export function SmtpGuidePage() {
  const [selectedProvider, setSelectedProvider] = useState(providers[0]);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link
          to="/smtp-accounts"
          className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to SMTP Accounts
        </Link>
        <h1 className="text-2xl font-semibold text-white">SMTP Connection Guide</h1>
        <p className="text-sm text-secondary mt-1">
          Learn how to connect your email provider to SkySend.
        </p>
      </div>

      {/* What You'll Need */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-subtle bg-surface p-4">
          <Server className="h-5 w-5 text-brand mb-3" />
          <h3 className="text-sm font-medium text-white mb-1">SMTP Host</h3>
          <p className="text-xs text-secondary">Server address</p>
        </div>
        <div className="rounded-lg border border-subtle bg-surface p-4">
          <Globe className="h-5 w-5 text-brand mb-3" />
          <h3 className="text-sm font-medium text-white mb-1">Port</h3>
          <p className="text-xs text-secondary">Usually 587 or 465</p>
        </div>
        <div className="rounded-lg border border-subtle bg-surface p-4">
          <Mail className="h-5 w-5 text-brand mb-3" />
          <h3 className="text-sm font-medium text-white mb-1">Username</h3>
          <p className="text-xs text-secondary">Your email address</p>
        </div>
        <div className="rounded-lg border border-subtle bg-surface p-4">
          <Key className="h-5 w-5 text-brand mb-3" />
          <h3 className="text-sm font-medium text-white mb-1">Password</h3>
          <p className="text-xs text-secondary">Password or API key</p>
        </div>
      </div>

      {/* Provider Selection */}
      <div>
        <h2 className="text-sm font-medium text-secondary uppercase tracking-wide mb-3">
          Choose Your Provider
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {providers.map((provider) => (
            <button
              key={provider.name}
              onClick={() => setSelectedProvider(provider)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedProvider.name === provider.name
                  ? 'bg-brand text-white'
                  : 'bg-surface border border-subtle text-secondary hover:text-white hover:bg-hover'
              }`}
            >
              {provider.name}
            </button>
          ))}
        </div>

        {/* Provider Details */}
        <div className="rounded-lg border border-subtle bg-surface">
          <div className="p-5 border-b border-subtle">
            <h3 className="font-medium text-white">{selectedProvider.name}</h3>
            <p className="text-sm text-secondary mt-1">{selectedProvider.notes}</p>
          </div>

          <div className="p-5">
            {/* Connection Details */}
            <h4 className="text-xs font-medium text-secondary uppercase tracking-wide mb-3">
              Connection Details
            </h4>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-md bg-elevated p-3">
                <p className="text-xs text-tertiary mb-1">SMTP Host</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-white">{selectedProvider.host}</code>
                  <CopyButton text={selectedProvider.host} />
                </div>
              </div>
              <div className="rounded-md bg-elevated p-3">
                <p className="text-xs text-tertiary mb-1">Port</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-white">{selectedProvider.port}</code>
                  <CopyButton text={selectedProvider.port.split(' ')[0]} />
                </div>
              </div>
              <div className="rounded-md bg-elevated p-3">
                <p className="text-xs text-tertiary mb-1">Security</p>
                <code className="text-sm text-white">{selectedProvider.security}</code>
              </div>
            </div>

            {/* Setup Steps */}
            <h4 className="text-xs font-medium text-secondary uppercase tracking-wide mb-3">
              Setup Steps
            </h4>
            <div className="space-y-2">
              {selectedProvider.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-elevated">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm text-secondary pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-500 mb-2">Tips</h3>
            <ul className="space-y-1.5 text-sm text-amber-500/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                Always use TLS/SSL encryption
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                Use app-specific passwords when possible
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                Test your connection before sending campaigns
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-lg border border-subtle bg-surface p-6 text-center">
        <h3 className="font-medium text-white mb-2">Ready to connect?</h3>
        <p className="text-sm text-secondary mb-4">
          Add your SMTP credentials to start sending campaigns.
        </p>
        <Link
          to="/smtp-accounts"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-400 transition-colors"
        >
          <Mail className="h-4 w-4" />
          Add SMTP Account
        </Link>
      </div>
    </div>
  );
}
