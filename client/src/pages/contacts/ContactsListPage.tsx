import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { contactsApi, listsApi } from '../../api/contacts.api';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate, cn } from '../../lib/utils';
import {
  Plus,
  Upload,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Users,
  FolderOpen,
  Pencil,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateContactInput, ContactWithTags, ContactList } from '@lemlist/shared';
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [form, setForm] = useState<CreateContactInput>({ ...emptyContact });
  const [editId, setEditId] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [listForm, setListForm] = useState({ name: '', description: '' });
  const [editingList, setEditingList] = useState<ContactList | null>(null);

  const activeListId = searchParams.get('list') || null;

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ['contacts', page, search, activeListId],
    queryFn: () => contactsApi.list({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: search || undefined,
      list_id: activeListId || undefined,
    }),
  });

  const { data: lists } = useQuery({
    queryKey: ['lists'],
    queryFn: listsApi.list,
  });

  const { data: stats } = useQuery({
    queryKey: ['contact-stats'],
    queryFn: contactsApi.getStats,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateContactInput) =>
      editId ? contactsApi.update(editId, input) : contactsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
      toast.success(editId ? 'Contact updated' : 'Contact created');
      closeCreateModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: contactsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
      toast.success('Contact deleted');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => contactsApi.bulkDelete(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
      toast.success(`Deleted ${result.deleted} contacts`);
      setSelectedContacts(new Set());
    },
  });

  const createListMutation = useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      editingList ? listsApi.update(editingList.id, input) : listsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success(editingList ? 'List updated' : 'List created');
      closeListModal();
    },
  });

  const addToListMutation = useMutation({
    mutationFn: ({ listId, contactIds }: { listId: string; contactIds: string[] }) =>
      listsApi.addContacts(listId, contactIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success(`Added ${result.success} contacts to list`);
      setShowAddToListModal(false);
      setSelectedContacts(new Set());
    },
  });

  const importMutation = useMutation({
    mutationFn: ({ file, mapping }: { file: File; mapping: Record<string, string> }) =>
      contactsApi.import(file, mapping),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
      toast.success(`Imported ${result.imported} contacts`);
      setShowImportModal(false);
      setImportFile(null);
      setCsvHeaders([]);
      setColumnMapping({});
    },
  });

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEditId(null);
    setForm({ ...emptyContact });
  };

  const closeListModal = () => {
    setShowListModal(false);
    setEditingList(null);
    setListForm({ name: '', description: '' });
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
        else if (lower === 'first name' || lower === 'first_name') autoMap[h] = 'first_name';
        else if (lower === 'last name' || lower === 'last_name') autoMap[h] = 'last_name';
        else if (lower.includes('company')) autoMap[h] = 'company';
        else if (lower.includes('title')) autoMap[h] = 'job_title';
        else if (lower.includes('phone')) autoMap[h] = 'phone';
      }
      setColumnMapping(autoMap);
    };
    reader.readAsText(file);
  };

  const handleExport = async () => {
    try {
      const ids = selectedContacts.size > 0 ? Array.from(selectedContacts) : undefined;
      const blob = await contactsApi.export(ids, 'csv');
      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Contacts exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const toggleSelectContact = (id: string) => {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const contacts = contactsData?.data || [];
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map((c) => c.id)));
    }
  };

  const contacts = contactsData?.data || [];
  const totalPages = contactsData?.total_pages || 1;
  const totalContacts = contactsData?.total || 0;
  const allSelected = contacts.length > 0 && selectedContacts.size === contacts.length;
  const someSelected = selectedContacts.size > 0;

  const currentListName = activeListId && lists
    ? lists.find((l) => l.id === activeListId)?.name || 'List'
    : 'All Contacts';

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0">
        <div className="sticky top-20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Lists</span>
            <button
              onClick={() => setShowListModal(true)}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setSearchParams({})}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                !activeListId
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              <Users className="h-4 w-4" strokeWidth={1.5} />
              <span className="flex-1 text-left">All Contacts</span>
              <span className="text-xs text-[var(--text-tertiary)]">{stats?.total || 0}</span>
            </button>
            {lists?.map((list) => (
              <button
                key={list.id}
                onClick={() => setSearchParams({ list: list.id })}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeListId === list.id
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <FolderOpen className="h-4 w-4" strokeWidth={1.5} />
                <span className="flex-1 text-left truncate">{list.name}</span>
                <span className="text-xs text-[var(--text-tertiary)]">{list.contact_count || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">{currentListName}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{totalContacts} contacts</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImportModal(true)} className="btn-secondary">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button onClick={handleExport} className="btn-secondary">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search contacts..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Bulk actions */}
        {someSelected && (
          <div className="flex items-center gap-4 mb-4 p-3 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <span className="text-sm font-medium text-[var(--text-primary)]">{selectedContacts.size} selected</span>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setShowAddToListModal(true)} className="btn-secondary text-sm h-8">
                <FolderOpen className="h-3.5 w-3.5" />
                Add to list
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedContacts.size} contacts?`)) {
                    bulkDeleteMutation.mutate(Array.from(selectedContacts));
                  }
                }}
                className="btn-danger text-sm h-8"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
              <button
                onClick={() => setSelectedContacts(new Set())}
                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-[var(--border-subtle)]">
            <Users className="h-10 w-10 text-[var(--text-tertiary)] mb-4" strokeWidth={1.5} />
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">No contacts yet</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Get started by adding contacts or importing a CSV file.</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                <Plus className="h-4 w-4" />
                Add Contact
              </button>
              <button onClick={() => setShowImportModal(true)} className="btn-secondary">
                <Upload className="h-4 w-4" />
                Import CSV
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-[var(--border-default)]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Added</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={cn(
                      "group hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-subtle)] last:border-b-0",
                      selectedContacts.has(contact.id) && "bg-[var(--bg-elevated)]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={() => toggleSelectContact(contact.id)}
                        className="rounded border-[var(--border-default)]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                        className="text-sm font-medium text-[var(--text-primary)] hover:underline"
                      >
                        {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || '—'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{contact.email}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{contact.company || '—'}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-tertiary)]">{formatDate(contact.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(contact)}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this contact?')) deleteMutation.mutate(contact.id);
                          }}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--error)] rounded transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Showing {(page - 1) * DEFAULT_PAGE_SIZE + 1} - {Math.min(page * DEFAULT_PAGE_SIZE, totalContacts)} of {totalContacts}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 border border-[var(--border-subtle)] rounded-md hover:bg-[var(--bg-hover)] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-[var(--text-secondary)] px-2">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 border border-[var(--border-subtle)] rounded-md hover:bg-[var(--bg-hover)] transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Contact Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeCreateModal} />
          <div className="relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{editId ? 'Edit Contact' : 'Add Contact'}</h2>
              <button onClick={closeCreateModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@company.com"
                  required
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">First Name</label>
                  <input
                    type="text"
                    value={form.first_name || ''}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="John"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={form.last_name || ''}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Doe"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Company</label>
                <input
                  type="text"
                  value={form.company || ''}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Acme Inc."
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeCreateModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                  {createMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowImportModal(false)} />
          <div className="relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Import Contacts</h2>
              <button onClick={() => setShowImportModal(false)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="relative border border-dashed border-[var(--border-default)] rounded-lg p-8 text-center hover:border-[var(--border-strong)] transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  {importFile ? importFile.name : 'Drop your CSV file here'}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {csvHeaders.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {csvHeaders.map((header) => (
                    <div key={header} className="flex items-center gap-3">
                      <span className="w-28 truncate text-sm text-[var(--text-primary)]">{header}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
                      <select
                        className="flex-1 h-8 px-2 text-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-md text-[var(--text-primary)]"
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
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowImportModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  disabled={!importFile || importMutation.isPending}
                  onClick={() => importFile && importMutation.mutate({ file: importFile, mapping: columnMapping })}
                  className="btn-primary"
                >
                  {importMutation.isPending ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create List Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeListModal} />
          <div className="relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg w-full max-w-sm shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{editingList ? 'Edit List' : 'Create List'}</h2>
              <button onClick={closeListModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createListMutation.mutate(listForm); }} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Name</label>
                <input
                  type="text"
                  value={listForm.name}
                  onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                  placeholder="Hot Leads"
                  required
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeListModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={createListMutation.isPending} className="btn-primary">
                  {createListMutation.isPending ? 'Saving...' : editingList ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to List Modal */}
      {showAddToListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddToListModal(false)} />
          <div className="relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg w-full max-w-sm shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add to List</h2>
              <button onClick={() => setShowAddToListModal(false)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-[var(--text-secondary)] mb-4">Add {selectedContacts.size} contacts to a list</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {lists?.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => addToListMutation.mutate({ listId: list.id, contactIds: Array.from(selectedContacts) })}
                    disabled={addToListMutation.isPending}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
                  >
                    <FolderOpen className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <span className="flex-1 text-left text-sm font-medium text-[var(--text-primary)]">{list.name}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{list.contact_count}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setShowAddToListModal(false); setShowListModal(true); }}
                className="w-full flex items-center justify-center gap-2 mt-4 py-2 border border-dashed border-[var(--border-default)] rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create new list
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
