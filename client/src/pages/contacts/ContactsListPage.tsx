import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { contactsApi, tagsApi } from '../../api/contacts.api';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import {
  Plus,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateContactInput, ContactWithTags } from '@lemlist/shared';
import { verificationApi } from '../../api/verification.api';
import { DEFAULT_PAGE_SIZE } from '../../lib/constants';

const emptyContact: CreateContactInput = {
  email: '',
  first_name: '',
  last_name: '',
  company: '',
  job_title: '',
  phone: '',
  linkedin_url: '',
  website: '',
};

export function ContactsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [form, setForm] = useState<CreateContactInput>({ ...emptyContact });
  const [editId, setEditId] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', page, search],
    queryFn: () => contactsApi.list({ page, limit: DEFAULT_PAGE_SIZE, search: search || undefined }),
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateContactInput) =>
      editId ? contactsApi.update(editId, input) : contactsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success(editId ? 'Contact updated' : 'Contact created');
      closeCreateModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: contactsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted');
    },
  });

  const [verifyingIds, setVerifyingIds] = useState<Set<string>>(new Set());

  const verifyMutation = useMutation({
    mutationFn: (contactId: string) => verificationApi.verifyContact(contactId),
    onMutate: (contactId) => {
      setVerifyingIds((prev) => new Set(prev).add(contactId));
    },
    onSuccess: (_data, contactId) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact verified');
      setVerifyingIds((prev) => { const next = new Set(prev); next.delete(contactId); return next; });
    },
    onError: (err: any, contactId) => {
      toast.error(err.response?.data?.error || 'Verification failed');
      setVerifyingIds((prev) => { const next = new Set(prev); next.delete(contactId); return next; });
    },
  });

  const importMutation = useMutation({
    mutationFn: ({ file, mapping }: { file: File; mapping: Record<string, string> }) =>
      contactsApi.import(file, mapping),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success(`Imported ${result.imported} contacts (${result.errors} errors)`);
      setShowImportModal(false);
      setImportFile(null);
      setCsvHeaders([]);
      setColumnMapping({});
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Import failed'),
  });

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEditId(null);
    setForm({ ...emptyContact });
  };

  const openEdit = (contact: ContactWithTags) => {
    setEditId(contact.id);
    setForm({
      email: contact.email,
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      company: contact.company || '',
      job_title: contact.job_title || '',
      phone: contact.phone || '',
      linkedin_url: contact.linkedin_url || '',
      website: contact.website || '',
    });
    setShowCreateModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const firstLine = text.split('\n')[0];
      const headers = firstLine.split(',').map((h) => h.trim().replace(/"/g, ''));
      setCsvHeaders(headers);
      const autoMap: Record<string, string> = {};
      for (const h of headers) {
        const lower = h.toLowerCase();
        if (lower.includes('email')) autoMap[h] = 'email';
        else if (lower === 'first name' || lower === 'first_name' || lower === 'firstname') autoMap[h] = 'first_name';
        else if (lower === 'last name' || lower === 'last_name' || lower === 'lastname') autoMap[h] = 'last_name';
        else if (lower.includes('company')) autoMap[h] = 'company';
        else if (lower.includes('title') || lower.includes('job')) autoMap[h] = 'job_title';
        else if (lower.includes('phone')) autoMap[h] = 'phone';
        else if (lower.includes('linkedin')) autoMap[h] = 'linkedin_url';
        else if (lower.includes('website') || lower.includes('url')) autoMap[h] = 'website';
      }
      setColumnMapping(autoMap);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const contacts = data?.data || [];
  const totalPages = data?.total_pages || 1;
  const totalContacts = data?.total || 0;

  // Calculate stats
  const withCompany = contacts.filter((c: ContactWithTags) => c.company).length;
  const verified = contacts.filter((c: ContactWithTags) => (c as any).dcs_score != null).length;

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
        <h1 className="text-2xl font-semibold text-primary">Contacts</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:text-primary border border-subtle rounded-md hover:bg-hover transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-brand text-primary rounded-md hover:bg-brand-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Inline Stats */}
      {totalContacts > 0 && (
        <p className="text-sm text-secondary">
          {totalContacts.toLocaleString()} contacts
          {withCompany > 0 && <span> · {withCompany} with company</span>}
          {verified > 0 && <span> · {verified} verified</span>}
        </p>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search contacts..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      {contacts.length === 0 ? (
        <div className="bg-surface border border-subtle rounded-md p-12 text-center">
          <p className="text-primary font-medium mb-1">
            {search ? 'No contacts found' : 'No contacts yet'}
          </p>
          <p className="text-sm text-secondary mb-4">
            {search ? 'Try adjusting your search.' : 'Add contacts manually or import from CSV.'}
          </p>
          {!search && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-brand text-primary rounded-md hover:bg-brand-hover transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Contact
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:text-primary border border-subtle rounded-md hover:bg-hover transition-colors"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface border border-subtle rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-subtle">
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Tags</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Added</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {contacts.map((contact: ContactWithTags) => (
                <tr
                  key={contact.id}
                  className="group hover:bg-hover cursor-pointer transition-colors"
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-sm font-medium">
                        {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-primary font-medium">
                          {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || '-'}
                        </p>
                        {contact.job_title && (
                          <p className="text-xs text-secondary">{contact.job_title}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary">{contact.email}</td>
                  <td className="px-4 py-3 text-sm text-secondary">{contact.company || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex px-1.5 py-0.5 text-xs rounded"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {contact.tags && contact.tags.length > 2 && (
                        <span className="text-xs text-secondary">+{contact.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {(contact as any).dcs_score != null ? (
                      <div className="flex items-center gap-1.5">
                        {(contact as any).dcs_score >= 70 ? (
                          <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                        ) : (contact as any).dcs_score >= 40 ? (
                          <ShieldAlert className="h-3.5 w-3.5 text-yellow-500" />
                        ) : (
                          <ShieldX className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className="text-sm text-primary">{(contact as any).dcs_score}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => verifyMutation.mutate(contact.id)}
                        disabled={verifyingIds.has(contact.id)}
                        className="text-xs text-brand hover:text-brand-hover disabled:opacity-50 transition-colors"
                      >
                        {verifyingIds.has(contact.id) ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Verifying
                          </span>
                        ) : (
                          'Verify'
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary">{contact.source}</td>
                  <td className="px-4 py-3 text-sm text-secondary">{formatDate(contact.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(contact)}
                        className="p-1.5 text-secondary hover:text-primary rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this contact?')) deleteMutation.mutate(contact.id);
                        }}
                        className="p-1.5 text-secondary hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-subtle">
              <p className="text-sm text-secondary">
                {(page - 1) * DEFAULT_PAGE_SIZE + 1}-{Math.min(page * DEFAULT_PAGE_SIZE, totalContacts)} of {totalContacts}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm text-secondary">{page} / {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={closeCreateModal} />
          <div className="relative bg-surface border border-subtle rounded-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-primary">{editId ? 'Edit Contact' : 'Add Contact'}</h2>
              <button onClick={closeCreateModal} className="text-secondary hover:text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-secondary mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@company.com"
                  required
                  className="w-full px-3 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-secondary mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={form.first_name || ''}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="John"
                    className="w-full px-3 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={form.last_name || ''}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Doe"
                    className="w-full px-3 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-secondary mb-1.5">Company</label>
                  <input
                    type="text"
                    value={form.company || ''}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Acme Inc."
                    className="w-full px-3 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary mb-1.5">Job Title</label>
                  <input
                    type="text"
                    value={form.job_title || ''}
                    onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                    placeholder="CEO"
                    className="w-full px-3 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1.5">Phone</label>
                <input
                  type="text"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1.5">LinkedIn URL</label>
                <input
                  type="text"
                  value={form.linkedin_url || ''}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/johndoe"
                  className="w-full px-3 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1.5">Website</label>
                <input
                  type="text"
                  value={form.website || ''}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://company.com"
                  className="w-full px-3 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-subtle">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-3 py-1.5 text-sm bg-brand text-primary rounded-md hover:bg-brand-hover disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowImportModal(false)} />
          <div className="relative bg-surface border border-subtle rounded-lg w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-primary">Import Contacts</h2>
              <button onClick={() => setShowImportModal(false)} className="text-secondary hover:text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative border border-dashed border-subtle rounded-md p-8 text-center hover:border-brand/50 transition-colors">
                <Upload className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="text-sm text-secondary mb-2">
                  {importFile ? importFile.name : 'Drop CSV file here or click to browse'}
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {csvHeaders.length > 0 && (
                <div>
                  <p className="text-sm text-secondary mb-3">Map columns to contact fields:</p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {csvHeaders.map((header) => (
                      <div key={header} className="flex items-center gap-3">
                        <span className="w-32 truncate text-sm text-primary">{header}</span>
                        <span className="text-secondary">-&gt;</span>
                        <select
                          className="flex-1 px-2 py-1.5 text-sm bg-surface border border-subtle rounded-md text-primary focus:outline-none focus:border-brand transition-colors"
                          value={columnMapping[header] || ''}
                          onChange={(e) => setColumnMapping({ ...columnMapping, [header]: e.target.value })}
                        >
                          <option value="">Skip</option>
                          <option value="email">Email</option>
                          <option value="first_name">First Name</option>
                          <option value="last_name">Last Name</option>
                          <option value="company">Company</option>
                          <option value="job_title">Job Title</option>
                          <option value="phone">Phone</option>
                          <option value="linkedin_url">LinkedIn URL</option>
                          <option value="website">Website</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-subtle">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!importFile || importMutation.isPending}
                  onClick={() => importFile && importMutation.mutate({ file: importFile, mapping: columnMapping })}
                  className="px-3 py-1.5 text-sm bg-brand text-primary rounded-md hover:bg-brand-hover disabled:opacity-50 transition-colors"
                >
                  {importMutation.isPending ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
