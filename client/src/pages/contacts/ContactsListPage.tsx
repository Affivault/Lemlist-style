import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { contactsApi, tagsApi } from '../../api/contacts.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { SearchInput } from '../../components/shared/SearchInput';
import { formatDate } from '../../lib/utils';
import {
  Users,
  Plus,
  Upload,
  Tag,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
  Mail,
  MoreHorizontal,
  FileSpreadsheet,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateContactInput, ContactWithTags } from '@lemlist/shared';
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
      // Auto-map common fields
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

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">Manage your leads and prospects in one place.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowImportModal(true)}
            className="border-gray-200 hover:border-gray-300"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/30"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats */}
      {totalContacts > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Contacts</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalContacts.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">With Company</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {contacts.filter((c: ContactWithTags) => c.company).length}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <Tag className="h-5 w-5 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Tagged</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {contacts.filter((c: ContactWithTags) => c.tags && c.tags.length > 0).length}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
        <SearchInput
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Search by name, email, or company..."
        />
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {search ? 'No contacts found' : 'No contacts yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {search
                ? 'Try adjusting your search terms.'
                : 'Add contacts manually or import from a CSV file to get started.'}
            </p>
            {!search && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/30"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Contact
                </Button>
                <Button variant="secondary" onClick={() => setShowImportModal(true)}>
                  <FileSpreadsheet className="h-4 w-4" />
                  Import from CSV
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
                        Contact
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {contacts.map((contact: ContactWithTags) => (
                    <tr
                      key={contact.id}
                      className="group cursor-pointer hover:bg-gray-50/50 transition-colors duration-150"
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                            {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || '-'}
                            </p>
                            {contact.job_title && (
                              <p className="text-xs text-gray-400">{contact.job_title}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {contact.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {contact.company ? (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {contact.company}
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {contact.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium"
                              style={{ backgroundColor: tag.color + '15', color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                          {contact.tags && contact.tags.length > 2 && (
                            <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">
                              +{contact.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                          {contact.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{formatDate(contact.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(contact)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this contact?')) deleteMutation.mutate(contact.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * DEFAULT_PAGE_SIZE + 1} to {Math.min(page * DEFAULT_PAGE_SIZE, totalContacts)} of {totalContacts} contacts
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showCreateModal} onClose={closeCreateModal} title={editId ? 'Edit Contact' : 'Add Contact'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="contact@company.com"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.first_name || ''}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              placeholder="John"
            />
            <Input
              label="Last Name"
              value={form.last_name || ''}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              placeholder="Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company"
              value={form.company || ''}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Acme Inc."
            />
            <Input
              label="Job Title"
              value={form.job_title || ''}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              placeholder="CEO"
            />
          </div>
          <Input
            label="Phone"
            value={form.phone || ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 234 567 8900"
          />
          <Input
            label="LinkedIn URL"
            value={form.linkedin_url || ''}
            onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/johndoe"
          />
          <Input
            label="Website"
            value={form.website || ''}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://company.com"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={closeCreateModal}>Cancel</Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
            >
              {createMutation.isPending ? 'Saving...' : editId ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import CSV Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Contacts from CSV" size="lg">
        <div className="space-y-5">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors">
            <FileSpreadsheet className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">
              {importFile ? importFile.name : 'Drag and drop your CSV file here, or click to browse'}
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="secondary" size="sm">
              <Upload className="h-4 w-4" />
              Select File
            </Button>
          </div>

          {csvHeaders.length > 0 && (
            <>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Column Mapping</h4>
                <p className="text-xs text-gray-500 mb-4">Map CSV columns to contact fields. Leave blank to skip a column.</p>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-3 bg-gray-50 rounded-xl p-4">
                {csvHeaders.map((header) => (
                  <div key={header} className="flex items-center gap-3">
                    <span className="w-36 truncate text-sm font-medium text-gray-700">{header}</span>
                    <span className="text-gray-300">&rarr;</span>
                    <select
                      className="flex-1 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowImportModal(false)}>Cancel</Button>
            <Button
              disabled={!importFile || importMutation.isPending}
              onClick={() => importFile && importMutation.mutate({ file: importFile, mapping: columnMapping })}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
            >
              {importMutation.isPending ? 'Importing...' : 'Import Contacts'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
