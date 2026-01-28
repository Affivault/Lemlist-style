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
import { Badge } from '../../components/ui/Badge';
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
  Shield,
  Zap,
  Settings,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { SmtpAccount, CreateSmtpAccountInput } from '@lemlist/shared';
import { SMTP_PRESETS } from '@lemlist/shared';
import { useAuth } from '../../context/AuthContext';

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

export function SmtpAccountsPage() {
  const queryClient = useQueryClient();
  const { signInWithOAuth } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateSmtpAccountInput>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  const handleQuickConnect = async () => {
    setConnectingGoogle(true);
    try {
      const { error } = await signInWithOAuth('google');
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Connecting to Google...');
      }
    } finally {
      setConnectingGoogle(false);
    }
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
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to save'),
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
    setEditId(null);
    setForm({ ...emptyForm });
  };

  const openEdit = (account: SmtpAccount) => {
    setEditId(account.id);
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
    createMutation.mutate(form);
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Loading your SMTP accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMTP Accounts</h1>
          <p className="text-gray-500 mt-1">Manage your email sending accounts and credentials.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/smtp-accounts/guide"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <HelpCircle className="h-4 w-4" />
            Setup Guide
          </Link>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/30"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Quick Connect Section */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Quick Connect
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Connect your Google email with one click
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Recommended
          </span>
        </div>

        <button
          onClick={handleQuickConnect}
          disabled={connectingGoogle}
          className="group relative overflow-hidden w-full flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-red-50/30 to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </div>
          <div className="relative flex-1 text-left">
            <p className="font-semibold text-gray-900">Connect Gmail</p>
            <p className="text-sm text-gray-500">Use Google Workspace or Gmail to start sending</p>
          </div>
          {connectingGoogle ? (
            <Spinner size="sm" />
          ) : (
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
          )}
        </button>

        <p className="mt-4 text-xs text-gray-400 text-center">
          OAuth connection provides secure access without sharing your password
        </p>
      </div>

      {/* Stats */}
      {accounts && accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Server className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Accounts</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{accounts.length}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Verified</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {accounts.filter((a: SmtpAccount) => a.is_verified).length}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-cyan-50">
                <Activity className="h-5 w-5 text-cyan-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Emails Sent Today</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {accounts.reduce((sum: number, a: SmtpAccount) => sum + a.sends_today, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Empty State or List */}
      {(!accounts || accounts.length === 0) ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center mb-6">
              <Mail className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No SMTP accounts yet</h3>
            <p className="text-gray-500 mb-6">
              Connect your email provider to start sending campaigns. We support Gmail, Outlook, and any SMTP server.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/30"
              >
                <Plus className="h-4 w-4" />
                Add Your First Account
              </Button>
              <Link
                to="/smtp-accounts/guide"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Read the setup guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account: SmtpAccount) => (
            <div
              key={account.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-5">
                  <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center ${
                    account.is_verified
                      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100'
                      : 'bg-gradient-to-br from-amber-50 to-amber-100'
                  }`}>
                    <Mail className={`h-6 w-6 ${account.is_verified ? 'text-emerald-600' : 'text-amber-600'}`} />
                    {account.is_verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{account.label}</h3>
                      {account.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <XCircle className="h-3 w-3" />
                          Unverified
                        </span>
                      )}
                      {!account.is_active && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-1">{account.email_address}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Server className="h-3.5 w-3.5" />
                        {account.smtp_host}:{account.smtp_port}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" />
                        {account.sends_today}/{account.daily_send_limit} today
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => testMutation.mutate(account.id)}
                    disabled={testMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <TestTube className="h-4 w-4" />
                    Test
                  </button>
                  <button
                    onClick={() => openEdit(account)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this SMTP account?')) deleteMutation.mutate(account.id);
                    }}
                    className="flex items-center justify-center w-10 h-10 text-gray-400 bg-gray-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Usage Progress Bar */}
              <div className="px-6 pb-5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Daily usage</span>
                  <span>{Math.round((account.sends_today / account.daily_send_limit) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((account.sends_today / account.daily_send_limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editId ? 'Edit SMTP Account' : 'Add SMTP Account'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
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
              onChange={(e) => updateField('email_address', e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <Select
            label="Provider Preset"
            options={[
              { value: '', label: 'Custom Configuration' },
              ...SMTP_PRESETS.map((p) => ({ value: p.name, label: p.name })),
            ]}
            onChange={(e) => applyPreset(e.target.value)}
          />

          <div className="border-t border-gray-100 pt-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Server className="h-4 w-4 text-gray-400" />
              SMTP Settings
            </h4>
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

          <div className="border-t border-gray-100 pt-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              IMAP Settings (for inbox sync)
            </h4>
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

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
            >
              {createMutation.isPending ? 'Saving...' : editId ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
