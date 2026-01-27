import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smtpApi } from '../../api/smtp.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/shared/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { Mail, Plus, Trash2, TestTube, CheckCircle, XCircle } from 'lucide-react';
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

export function SmtpAccountsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateSmtpAccountInput>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);

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
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">SMTP Accounts</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {(!accounts || accounts.length === 0) ? (
        <EmptyState
          icon={Mail}
          title="No SMTP accounts"
          description="Add an email account to start sending campaigns."
          actionLabel="Add Account"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid gap-4">
          {accounts.map((account: SmtpAccount) => (
            <div key={account.id} className="card flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-gray-100 p-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{account.label}</h3>
                    {account.is_verified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Unverified</Badge>
                    )}
                    {!account.is_active && <Badge variant="danger">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">{account.email_address}</p>
                  <p className="text-xs text-gray-400">
                    {account.smtp_host}:{account.smtp_port} &middot; {account.sends_today}/{account.daily_send_limit} sent today &middot; Added {formatDate(account.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => testMutation.mutate(account.id)}
                  disabled={testMutation.isPending}
                >
                  <TestTube className="h-4 w-4" />
                  Test
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openEdit(account)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this SMTP account?')) deleteMutation.mutate(account.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editId ? 'Edit SMTP Account' : 'Add SMTP Account'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Label" value={form.label} onChange={(e) => updateField('label', e.target.value)} required />
            <Input label="Email Address" type="email" value={form.email_address} onChange={(e) => updateField('email_address', e.target.value)} required />
          </div>

          <Select
            label="Provider Preset"
            options={[
              { value: '', label: 'Custom' },
              ...SMTP_PRESETS.map((p) => ({ value: p.name, label: p.name })),
            ]}
            onChange={(e) => applyPreset(e.target.value)}
          />

          <h4 className="font-medium text-gray-700">SMTP Settings</h4>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Host" value={form.smtp_host} onChange={(e) => updateField('smtp_host', e.target.value)} required />
            <Input label="Port" type="number" value={String(form.smtp_port)} onChange={(e) => updateField('smtp_port', parseInt(e.target.value))} required />
            <Input label="Username" value={form.smtp_user} onChange={(e) => updateField('smtp_user', e.target.value)} required />
          </div>
          <Input label="Password" type="password" value={form.smtp_pass} onChange={(e) => updateField('smtp_pass', e.target.value)} required={!editId} />

          <h4 className="font-medium text-gray-700">IMAP Settings (for inbox sync)</h4>
          <div className="grid grid-cols-3 gap-4">
            <Input label="IMAP Host" value={form.imap_host || ''} onChange={(e) => updateField('imap_host', e.target.value)} />
            <Input label="IMAP Port" type="number" value={String(form.imap_port || '')} onChange={(e) => updateField('imap_port', parseInt(e.target.value) || undefined)} />
            <Input label="Daily Send Limit" type="number" value={String(form.daily_send_limit || 200)} onChange={(e) => updateField('daily_send_limit', parseInt(e.target.value))} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
