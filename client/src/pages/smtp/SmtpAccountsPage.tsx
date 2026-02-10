import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { smtpApi } from '../../api/smtp.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/shared/EmptyState';
import { formatDate } from '../../lib/utils';
import {
  Mail,
  Plus,
  Trash2,
  TestTube,
  CheckCircle2,
  XCircle,
  Server,
  HelpCircle,
  ArrowRight,
  Settings,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { SmtpAccount, CreateSmtpAccountInput } from '@lemlist/shared';
import { SMTP_PRESETS } from '@lemlist/shared';

const emptyForm: CreateSmtpAccountInput = {
  label: '',
  email_address: '',
  smtp_host: '',
  smtp_port: 587,
  smtp_secure: false,
  smtp_user: '',
  smtp_pass: '',
  daily_send_limit: 200,
};

const GMAIL_FORM: CreateSmtpAccountInput = {
  label: 'Gmail',
  email_address: '',
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_secure: false,
  smtp_user: '',
  smtp_pass: '',
  imap_host: 'imap.gmail.com',
  imap_port: 993,
  imap_secure: true,
  daily_send_limit: 200,
};

export function SmtpAccountsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showGmailGuide, setShowGmailGuide] = useState(false);
  const [form, setForm] = useState<CreateSmtpAccountInput>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);

  const handleQuickConnect = () => {
    setForm({ ...GMAIL_FORM });
    setEditId(null);
    setShowGmailGuide(true);
    setShowModal(true);
  };

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['smtp-accounts'],
    queryFn: smtpApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateSmtpAccountInput) =>
      editId ? smtpApi.update(editId, input) : smtpApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-accounts'] });
      toast.success(editId ? 'Account updated' : 'Account created');
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error
        || err.message
        || 'Failed to save';
      toast.error(msg);
      console.error('SMTP save error:', err.response?.status, err.response?.data, err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: smtpApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-accounts'] });
      toast.success('Account deleted');
    },
  });

  const testMutation = useMutation({
    mutationFn: smtpApi.test,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['smtp-accounts'] });
      } else {
        toast.error(result.message);
      }
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setShowGmailGuide(false);
    setEditId(null);
    setForm({ ...emptyForm });
  };

  const openEdit = (account: SmtpAccount) => {
    setEditId(account.id);
    setShowGmailGuide(false);
    setForm({
      label: account.label,
      email_address: account.email_address,
      smtp_host: account.smtp_host,
      smtp_port: account.smtp_port,
      smtp_secure: account.smtp_secure,
      smtp_user: account.smtp_user,
      smtp_pass: '',
      imap_host: account.imap_host || undefined,
      imap_port: account.imap_port || undefined,
      imap_secure: account.imap_secure || undefined,
      daily_send_limit: account.daily_send_limit,
    });
    setShowModal(true);
  };

  const applyPreset = (presetName: string) => {
    const preset = SMTP_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setForm((prev) => ({
        ...prev,
        smtp_host: preset.smtp_host,
        smtp_port: preset.smtp_port,
        smtp_secure: preset.smtp_secure,
        imap_host: preset.imap_host,
        imap_port: preset.imap_port,
        imap_secure: preset.imap_secure,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-fill smtp_user from email_address if empty
    const submitForm = {
      ...form,
      smtp_user: form.smtp_user || form.email_address,
    };
    createMutation.mutate(submitForm);
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">SMTP Accounts</h1>
          <p className="text-sm text-secondary mt-1">Manage your email sending accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/smtp-accounts/guide"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary border border-default rounded-md hover:bg-hover hover:text-primary transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            Setup Guide
          </Link>
          <Button variant="primary" onClick={() => { setShowGmailGuide(false); setShowModal(true); }}>
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Quick Connect */}
      <div className="rounded-lg border border-subtle bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-primary">Quick Connect</h2>
            <p className="text-sm text-secondary mt-0.5">Connect your Gmail in under 2 minutes</p>
          </div>
          <span className="px-2 py-0.5 text-xs font-medium text-primary bg-elevated rounded">
            Recommended
          </span>
        </div>

        <button
          onClick={handleQuickConnect}
          className="group w-full flex items-center gap-4 p-4 rounded-md border border-default hover:bg-hover transition-colors"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-surface border border-subtle">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-primary">Connect Gmail</p>
            <p className="text-sm text-secondary">Use Google Workspace or Gmail with App Password</p>
          </div>
          <ArrowRight className="h-4 w-4 text-tertiary group-hover:text-secondary transition-colors" />
        </button>
      </div>

      {/* Stats */}
      {accounts && accounts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-subtle bg-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Total Accounts</span>
            </div>
            <p className="text-2xl font-semibold text-primary">{accounts.length}</p>
          </div>
          <div className="rounded-lg border border-subtle bg-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Verified</span>
            </div>
            <p className="text-2xl font-semibold text-primary">
              {accounts.filter((a: SmtpAccount) => a.is_verified).length}
            </p>
          </div>
          <div className="rounded-lg border border-subtle bg-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Sent Today</span>
            </div>
            <p className="text-2xl font-semibold text-primary">
              {accounts.reduce((sum: number, a: SmtpAccount) => sum + a.sends_today, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Empty State or List */}
      {(!accounts || accounts.length === 0) ? (
        <EmptyState
          icon={Mail}
          title="No SMTP accounts"
          description="Connect your email provider to start sending campaigns."
          actionLabel="Add Account"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {accounts.map((account: SmtpAccount) => (
            <div
              key={account.id}
              className="group rounded-lg border border-subtle bg-surface p-5 transition-colors hover:bg-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[var(--bg-elevated)]">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-primary">{account.label}</h3>
                      {account.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-primary bg-elevated rounded">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-secondary bg-elevated rounded">
                          <XCircle className="h-3 w-3" />
                          Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary">{account.email_address}</p>
                    <p className="text-sm text-tertiary mt-1">
                      {account.smtp_host}:{account.smtp_port} · {account.sends_today}/{account.daily_send_limit} today
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => testMutation.mutate(account.id)}
                    disabled={testMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-secondary hover:text-primary hover:bg-elevated rounded-md transition-colors"
                  >
                    <TestTube className="h-3.5 w-3.5" />
                    Test
                  </button>
                  <button
                    onClick={() => openEdit(account)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-secondary hover:text-primary hover:bg-elevated rounded-md transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this SMTP account?')) deleteMutation.mutate(account.id);
                    }}
                    className="flex items-center justify-center w-8 h-8 text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Usage Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-tertiary mb-1">
                  <span>Daily usage</span>
                  <span>{Math.round((account.sends_today / account.daily_send_limit) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--text-primary)] rounded-full transition-all"
                    style={{ width: `${Math.min((account.sends_today / account.daily_send_limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editId ? 'Edit SMTP Account' : showGmailGuide ? 'Connect Gmail' : 'Add SMTP Account'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Gmail Guide Banner */}
          {showGmailGuide && !editId && (
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 mt-0.5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Gmail App Password Setup</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    SMTP settings are pre-filled. You just need to:
                  </p>
                  <ol className="text-sm text-[var(--text-secondary)] mt-2 space-y-1.5 list-decimal list-inside">
                    <li>Enter your Gmail address below</li>
                    <li>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--text-primary)] underline underline-offset-2 inline-flex items-center gap-1"
                      >
                        Generate a Google App Password
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {' '}(select "Mail" as the app)
                    </li>
                    <li>Paste the 16-character app password below</li>
                  </ol>
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">
                    Requires 2-Step Verification enabled on your Google account.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Label"
              value={form.label}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="e.g., Work Gmail"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={form.email_address}
              onChange={(e) => {
                updateField('email_address', e.target.value);
                // Auto-fill smtp_user when in gmail guide mode
                if (showGmailGuide) {
                  updateField('smtp_user', e.target.value);
                }
              }}
              placeholder="you@gmail.com"
              required
            />
          </div>

          {/* Only show password field prominently in Gmail guide mode */}
          {showGmailGuide && !editId && (
            <Input
              label="App Password"
              type="password"
              value={form.smtp_pass}
              onChange={(e) => updateField('smtp_pass', e.target.value)}
              placeholder="Paste your 16-character app password"
              required
            />
          )}

          {/* Provider preset - hide in gmail guide mode */}
          {!showGmailGuide && (
            <Select
              label="Provider Preset"
              options={[
                { value: '', label: 'Custom Configuration' },
                ...SMTP_PRESETS.map((p) => ({ value: p.name, label: p.name })),
              ]}
              onChange={(e) => applyPreset(e.target.value)}
            />
          )}

          {/* SMTP Settings - collapsed by default in gmail mode */}
          {showGmailGuide && !editId ? (
            <details className="border-t border-subtle pt-3">
              <summary className="text-sm font-medium text-secondary cursor-pointer hover:text-primary transition-colors">
                Advanced SMTP settings (pre-filled for Gmail)
              </summary>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Host"
                    value={form.smtp_host}
                    onChange={(e) => updateField('smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                    required
                  />
                  <Input
                    label="Port"
                    type="number"
                    value={String(form.smtp_port)}
                    onChange={(e) => updateField('smtp_port', parseInt(e.target.value))}
                    required
                  />
                  <Input
                    label="Username"
                    value={form.smtp_user}
                    onChange={(e) => updateField('smtp_user', e.target.value)}
                    placeholder="you@gmail.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="IMAP Host"
                    value={form.imap_host || ''}
                    onChange={(e) => updateField('imap_host', e.target.value)}
                    placeholder="imap.gmail.com"
                  />
                  <Input
                    label="IMAP Port"
                    type="number"
                    value={String(form.imap_port || '')}
                    onChange={(e) => updateField('imap_port', parseInt(e.target.value) || undefined)}
                    placeholder="993"
                  />
                  <Input
                    label="Daily Send Limit"
                    type="number"
                    value={String(form.daily_send_limit || 200)}
                    onChange={(e) => updateField('daily_send_limit', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </details>
          ) : (
            <>
              <div className="border-t border-subtle pt-4">
                <h4 className="text-sm font-medium text-primary mb-3">SMTP Settings</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Host"
                    value={form.smtp_host}
                    onChange={(e) => updateField('smtp_host', e.target.value)}
                    placeholder="smtp.example.com"
                    required
                  />
                  <Input
                    label="Port"
                    type="number"
                    value={String(form.smtp_port)}
                    onChange={(e) => updateField('smtp_port', parseInt(e.target.value))}
                    required
                  />
                  <Input
                    label="Username"
                    value={form.smtp_user}
                    onChange={(e) => updateField('smtp_user', e.target.value)}
                    placeholder="Email or username"
                    required
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Password"
                    type="password"
                    value={form.smtp_pass}
                    onChange={(e) => updateField('smtp_pass', e.target.value)}
                    placeholder={editId ? 'Leave blank to keep current' : 'Enter password or app key'}
                    required={!editId}
                  />
                </div>
              </div>

              <div className="border-t border-subtle pt-4">
                <h4 className="text-sm font-medium text-primary mb-3">IMAP Settings (optional)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="IMAP Host"
                    value={form.imap_host || ''}
                    onChange={(e) => updateField('imap_host', e.target.value)}
                    placeholder="imap.example.com"
                  />
                  <Input
                    label="IMAP Port"
                    type="number"
                    value={String(form.imap_port || '')}
                    onChange={(e) => updateField('imap_port', parseInt(e.target.value) || undefined)}
                    placeholder="993"
                  />
                  <Input
                    label="Daily Send Limit"
                    type="number"
                    value={String(form.daily_send_limit || 200)}
                    onChange={(e) => updateField('daily_send_limit', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-subtle">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Connecting...' : editId ? 'Update Account' : showGmailGuide ? 'Connect Gmail' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
