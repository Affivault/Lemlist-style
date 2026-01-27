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
import { Users, Plus, Upload, Tag, Trash2 } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      <SearchInput
        value={search}
        onChange={(val) => { setSearch(val); setPage(1); }}
        placeholder="Search contacts..."
      />

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts"
          description="Add contacts manually or import from a CSV file."
          actionLabel="Add Contact"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact: ContactWithTags) => (
                  <tr
                    key={contact.id}
                    className="cursor-pointer border-b border-gray-50 hover:bg-gray-50"
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{contact.email}</td>
                    <td className="px-4 py-3 text-gray-600">{contact.company || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{contact.source}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(contact.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(contact)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this contact?')) deleteMutation.mutate(contact.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showCreateModal} onClose={closeCreateModal} title={editId ? 'Edit Contact' : 'Add Contact'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Last Name" value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Company" value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <Input label="Job Title" value={form.job_title || ''} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
          </div>
          <Input label="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="LinkedIn URL" value={form.linkedin_url || ''} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
          <Input label="Website" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeCreateModal}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import CSV Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Contacts from CSV" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
            <input type="file" accept=".csv" onChange={handleFileSelect} className="text-sm" />
          </div>

          {csvHeaders.length > 0 && (
            <>
              <h4 className="font-medium text-gray-700">Column Mapping</h4>
              <p className="text-xs text-gray-500">Map CSV columns to contact fields. Leave blank to skip a column.</p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {csvHeaders.map((header) => (
                  <div key={header} className="flex items-center gap-3">
                    <span className="w-40 truncate text-sm text-gray-600">{header}</span>
                    <span className="text-gray-400">&rarr;</span>
                    <select
                      className="input-field flex-1"
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

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowImportModal(false)}>Cancel</Button>
            <Button
              disabled={!importFile || importMutation.isPending}
              onClick={() => importFile && importMutation.mutate({ file: importFile, mapping: columnMapping })}
            >
              {importMutation.isPending ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
