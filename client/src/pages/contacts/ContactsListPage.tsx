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
  ArrowUpRight,
  MoreHorizontal,
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

const LIST_COLORS = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
];

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
  const [listForm, setListForm] = useState({ name: '', description: '', color: LIST_COLORS[0].value });
  const [editingList, setEditingList] = useState<ContactList | null>(null);

  const activeListId = searchParams.get('list') || null;

  // Queries
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

  // Mutations
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
    mutationFn: (input: { name: string; description?: string; color?: string }) =>
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

  // Helpers
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEditId(null);
    setForm({ ...emptyContact });
  };

  const closeListModal = () => {
    setShowListModal(false);
    setEditingList(null);
    setListForm({ name: '', description: '', color: LIST_COLORS[0].value });
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
    <div className="flex gap-8">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          {/* Lists */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-tertiary uppercase tracking-widest">Lists</span>
              <button
                onClick={() => setShowListModal(true)}
                className="p-1 text-tertiary hover:text-violet-400 rounded transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setSearchParams({})}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                  !activeListId
                    ? "text-white bg-gradient-to-r from-violet-500/20 to-pink-500/10 border border-violet-500/30"
                    : "text-secondary hover:text-primary hover:bg-surface"
                )}
              >
                <Users className="h-4 w-4" />
                <span className="flex-1 text-left">All Contacts</span>
                <span className="text-[11px] text-tertiary">{stats?.total || 0}</span>
              </button>
              {lists?.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSearchParams({ list: list.id })}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group",
                    activeListId === list.id
                      ? "text-white bg-gradient-to-r from-violet-500/20 to-pink-500/10 border border-violet-500/30"
                      : "text-secondary hover:text-primary hover:bg-surface"
                  )}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: list.color }}
                  />
                  <span className="flex-1 text-left truncate">{list.name}</span>
                  <span className="text-[11px] text-tertiary">{list.contact_count || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Create list */}
          <button
            onClick={() => setShowListModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-4 border border-dashed border-subtle rounded-xl text-[13px] text-secondary hover:text-violet-400 hover:border-violet-500/30 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create new list</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">{currentListName}</h1>
            <p className="text-secondary mt-1">{totalContacts} contacts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-secondary"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button onClick={handleExport} className="btn-secondary">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-solid"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
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
          <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/30">
            <span className="text-[13px] font-medium text-primary">{selectedContacts.size} selected</span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setShowAddToListModal(true)}
                className="btn-secondary text-[12px] h-8"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Add to list
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedContacts.size} contacts?`)) {
                    bulkDeleteMutation.mutate(Array.from(selectedContacts));
                  }
                }}
                className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
              <button
                onClick={() => setSelectedContacts(new Set())}
                className="p-1.5 text-secondary hover:text-primary rounded transition-colors"
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
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-subtle">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-1">No contacts yet</h3>
            <p className="text-[13px] text-secondary mb-6">Get started by adding contacts or importing a CSV file.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowCreateModal(true)} className="btn-solid">
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
          <div className="rounded-xl border border-subtle overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-subtle bg-surface">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-subtle"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-tertiary uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-tertiary uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-tertiary uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-tertiary uppercase tracking-wider">Added</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={cn(
                      "group hover:bg-surface/50 transition-colors",
                      selectedContacts.has(contact.id) && "bg-violet-500/5"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={() => toggleSelectContact(contact.id)}
                        className="rounded border-subtle"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                        className="text-[13px] font-medium text-primary hover:text-violet-400 transition-colors"
                      >
                        {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || '—'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-secondary">{contact.email}</td>
                    <td className="px-4 py-3 text-[13px] text-secondary">{contact.company || '—'}</td>
                    <td className="px-4 py-3 text-[13px] text-tertiary">{formatDate(contact.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(contact)}
                          className="p-1.5 text-secondary hover:text-violet-400 rounded transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this contact?')) deleteMutation.mutate(contact.id);
                          }}
                          className="p-1.5 text-secondary hover:text-red-400 rounded transition-colors"
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
          <div className="flex items-center justify-between mt-6">
            <p className="text-[13px] text-secondary">
              Showing {(page - 1) * DEFAULT_PAGE_SIZE + 1} - {Math.min(page * DEFAULT_PAGE_SIZE, totalContacts)} of {totalContacts}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 text-secondary hover:text-primary disabled:opacity-50 border border-subtle rounded-lg hover:bg-surface transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[13px] text-secondary px-2">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 text-secondary hover:text-primary disabled:opacity-50 border border-subtle rounded-lg hover:bg-surface transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCreateModal} />
          <div className="relative bg-surface border border-subtle rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-subtle">
              <h2 className="text-lg font-semibold text-primary">{editId ? 'Edit Contact' : 'Add Contact'}</h2>
              <button onClick={closeCreateModal} className="p-1 text-secondary hover:text-primary rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="p-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-primary mb-1.5">Email</label>
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
                  <label className="block text-[13px] font-medium text-primary mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={form.first_name || ''}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="John"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-primary mb-1.5">Last Name</label>
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
                <label className="block text-[13px] font-medium text-primary mb-1.5">Company</label>
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
                <button type="submit" disabled={createMutation.isPending} className="btn-solid">
                  {createMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImportModal(false)} />
          <div className="relative bg-surface border border-subtle rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-subtle">
              <h2 className="text-lg font-semibold text-primary">Import Contacts</h2>
              <button onClick={() => setShowImportModal(false)} className="p-1 text-secondary hover:text-primary rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="relative border border-dashed border-subtle rounded-xl p-8 text-center hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer">
                <Upload className="h-10 w-10 text-violet-400 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-[14px] font-medium text-primary mb-1">
                  {importFile ? importFile.name : 'Drop your CSV file here'}
                </p>
                <p className="text-[12px] text-tertiary">or click to browse</p>
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
                      <span className="w-28 truncate text-[13px] text-primary">{header}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-tertiary flex-shrink-0" />
                      <select
                        className="flex-1 h-8 px-2 text-[13px] bg-elevated border border-subtle rounded-lg text-primary"
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
                  className="btn-solid"
                >
                  {importMutation.isPending ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeListModal} />
          <div className="relative bg-surface border border-subtle rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-subtle">
              <h2 className="text-lg font-semibold text-primary">{editingList ? 'Edit List' : 'Create List'}</h2>
              <button onClick={closeListModal} className="p-1 text-secondary hover:text-primary rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createListMutation.mutate(listForm); }} className="p-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-primary mb-1.5">Name</label>
                <input
                  type="text"
                  value={listForm.name}
                  onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                  placeholder="Hot Leads"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-primary mb-2">Color</label>
                <div className="flex gap-2">
                  {LIST_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setListForm({ ...listForm, color: color.value })}
                      className={cn(
                        "w-8 h-8 rounded-lg transition-all",
                        listForm.color === color.value && "ring-2 ring-offset-2 ring-offset-surface ring-white"
                      )}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeListModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={createListMutation.isPending} className="btn-solid">
                  {createListMutation.isPending ? 'Saving...' : editingList ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddToListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddToListModal(false)} />
          <div className="relative bg-surface border border-subtle rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-subtle">
              <h2 className="text-lg font-semibold text-primary">Add to List</h2>
              <button onClick={() => setShowAddToListModal(false)} className="p-1 text-secondary hover:text-primary rounded transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-[13px] text-secondary mb-4">Add {selectedContacts.size} contacts to a list</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {lists?.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => addToListMutation.mutate({ listId: list.id, contactIds: Array.from(selectedContacts) })}
                    disabled={addToListMutation.isPending}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-hover transition-colors disabled:opacity-50"
                  >
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: list.color }} />
                    <span className="flex-1 text-left text-[13px] font-medium text-primary">{list.name}</span>
                    <span className="text-[11px] text-tertiary">{list.contact_count}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setShowAddToListModal(false); setShowListModal(true); }}
                className="w-full flex items-center justify-center gap-2 mt-4 py-3 border border-dashed border-subtle rounded-xl text-[13px] text-secondary hover:text-violet-400 hover:border-violet-500/30 transition-colors"
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
