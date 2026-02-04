import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { contactsApi, tagsApi, listsApi, segmentsApi } from '../../api/contacts.api';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import {
  Plus,
  Upload,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  Search,
  X,
  Users,
  List,
  Filter,
  MoreHorizontal,
  Check,
  Tag,
  UserMinus,
  AlertTriangle,
  FolderPlus,
  ChevronDown,
  Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateContactInput, ContactWithTags, ContactList, SavedSegment } from '@lemlist/shared';
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

const LIST_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16'
];

type ViewMode = 'all' | 'list' | 'segment' | 'unsubscribed' | 'bounced';

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
  const [listForm, setListForm] = useState({ name: '', description: '', color: LIST_COLORS[0] });
  const [editingList, setEditingList] = useState<ContactList | null>(null);

  // View state from URL
  const viewMode = (searchParams.get('view') as ViewMode) || 'all';
  const activeListId = searchParams.get('list') || null;
  const activeSegmentId = searchParams.get('segment') || null;

  // Fetch data
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts', page, search, viewMode, activeListId, activeSegmentId],
    queryFn: () => contactsApi.list({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: search || undefined,
      list_id: activeListId || undefined,
      is_unsubscribed: viewMode === 'unsubscribed' ? true : undefined,
      is_bounced: viewMode === 'bounced' ? true : undefined,
    }),
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.list,
  });

  const { data: lists } = useQuery({
    queryKey: ['lists'],
    queryFn: listsApi.list,
  });

  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: segmentsApi.list,
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
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to save list'),
  });

  const deleteListMutation = useMutation({
    mutationFn: listsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('List deleted');
      if (activeListId) {
        setSearchParams({});
      }
    },
  });

  const addToListMutation = useMutation({
    mutationFn: ({ listId, contactIds }: { listId: string; contactIds: string[] }) =>
      listsApi.addContacts(listId, contactIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success(`Added ${result.success} contacts to list`);
      setShowAddToListModal(false);
      setSelectedContacts(new Set());
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
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
      toast.success(`Imported ${result.imported} contacts (${result.errors} errors)`);
      setShowImportModal(false);
      setImportFile(null);
      setCsvHeaders([]);
      setColumnMapping({});
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Import failed'),
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
    setListForm({ name: '', description: '', color: LIST_COLORS[0] });
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

  const openEditList = (list: ContactList) => {
    setEditingList(list);
    setListForm({ name: list.name, description: list.description || '', color: list.color });
    setShowListModal(true);
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

  const setView = (view: ViewMode, listId?: string, segmentId?: string) => {
    const params: Record<string, string> = {};
    if (view !== 'all') params.view = view;
    if (listId) params.list = listId;
    if (segmentId) params.segment = segmentId;
    setSearchParams(params);
    setPage(1);
    setSelectedContacts(new Set());
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

  // Computed values
  const contacts = contactsData?.data || [];
  const totalPages = contactsData?.total_pages || 1;
  const totalContacts = contactsData?.total || 0;
  const allSelected = contacts.length > 0 && selectedContacts.size === contacts.length;
  const someSelected = selectedContacts.size > 0;

  const currentViewName = useMemo(() => {
    if (activeListId && lists) {
      const list = lists.find((l) => l.id === activeListId);
      return list?.name || 'List';
    }
    if (activeSegmentId && segments) {
      const segment = segments.find((s) => s.id === activeSegmentId);
      return segment?.name || 'Segment';
    }
    if (viewMode === 'unsubscribed') return 'Unsubscribed';
    if (viewMode === 'bounced') return 'Bounced';
    return 'All Contacts';
  }, [viewMode, activeListId, activeSegmentId, lists, segments]);

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-subtle pr-4 mr-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Overview */}
          <div>
            <h3 className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Overview</h3>
            <div className="space-y-1">
              <button
                onClick={() => setView('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  viewMode === 'all' && !activeListId && !activeSegmentId
                    ? 'bg-brand/10 text-brand'
                    : 'text-primary hover:bg-hover'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Contacts
                </span>
                <span className="text-xs text-secondary">{stats?.total || 0}</span>
              </button>
              <button
                onClick={() => setView('unsubscribed')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  viewMode === 'unsubscribed'
                    ? 'bg-brand/10 text-brand'
                    : 'text-primary hover:bg-hover'
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserMinus className="h-4 w-4" />
                  Unsubscribed
                </span>
                <span className="text-xs text-secondary">{stats?.unsubscribed || 0}</span>
              </button>
              <button
                onClick={() => setView('bounced')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  viewMode === 'bounced'
                    ? 'bg-brand/10 text-brand'
                    : 'text-primary hover:bg-hover'
                }`}
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Bounced
                </span>
                <span className="text-xs text-secondary">{stats?.bounced || 0}</span>
              </button>
            </div>
          </div>

          {/* Lists */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-secondary uppercase tracking-wider">Lists</h3>
              <button
                onClick={() => setShowListModal(true)}
                className="p-1 text-secondary hover:text-primary rounded transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {lists?.map((list) => (
                <div
                  key={list.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                    activeListId === list.id
                      ? 'bg-brand/10 text-brand'
                      : 'text-primary hover:bg-hover'
                  }`}
                  onClick={() => setView('list', list.id)}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-3 w-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: list.color }}
                    />
                    <span className="truncate">{list.name}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-secondary">{list.contact_count || 0}</span>
                    {!list.is_default && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditList(list); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-secondary hover:text-primary transition-opacity"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(!lists || lists.length === 0) && (
                <p className="text-xs text-secondary px-3 py-2">No lists yet</p>
              )}
            </div>
          </div>

          {/* Segments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-secondary uppercase tracking-wider">Segments</h3>
            </div>
            <div className="space-y-1">
              {segments?.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => setView('segment', undefined, segment.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSegmentId === segment.id
                      ? 'bg-brand/10 text-brand'
                      : 'text-primary hover:bg-hover'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Filter className="h-4 w-4 flex-shrink-0" style={{ color: segment.color }} />
                    <span className="truncate">{segment.name}</span>
                  </span>
                  <span className="text-xs text-secondary">{segment.cached_count}</span>
                </button>
              ))}
              {(!segments || segments.length === 0) && (
                <p className="text-xs text-secondary px-3 py-2">No segments yet</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1.5 px-1">
              {tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex px-2 py-0.5 text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
              {(!tags || tags.length === 0) && (
                <p className="text-xs text-secondary">No tags yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-primary">{currentViewName}</h1>
            <p className="text-sm text-secondary">{totalContacts.toLocaleString()} contacts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:text-primary border border-subtle rounded-md hover:bg-hover transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:text-primary border border-subtle rounded-md hover:bg-hover transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-brand text-white rounded-md hover:bg-brand-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Search and bulk actions */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          {someSelected && (
            <div className="flex items-center gap-2 bg-surface border border-subtle rounded-md px-3 py-1.5">
              <span className="text-sm text-primary">{selectedContacts.size} selected</span>
              <div className="h-4 w-px bg-subtle" />
              <button
                onClick={() => setShowAddToListModal(true)}
                className="text-sm text-secondary hover:text-primary transition-colors"
              >
                Add to list
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedContacts.size} contacts?`)) {
                    bulkDeleteMutation.mutate(Array.from(selectedContacts));
                  }
                }}
                className="text-sm text-red-500 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedContacts(new Set())}
                className="p-1 text-secondary hover:text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {contactsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-secondary" />
              </div>
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
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-brand text-white rounded-md hover:bg-brand-hover transition-colors"
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
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 bg-surface border border-subtle rounded-md overflow-hidden flex flex-col">
              <div className="overflow-auto flex-1">
                <table className="w-full">
                  <thead className="sticky top-0 bg-surface z-10">
                    <tr className="border-b border-subtle">
                      <th className="px-4 py-3 text-left w-10">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          className="rounded border-subtle"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Tags</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">Added</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle">
                    {contacts.map((contact: ContactWithTags) => (
                      <tr
                        key={contact.id}
                        className={`group hover:bg-hover cursor-pointer transition-colors ${
                          selectedContacts.has(contact.id) ? 'bg-brand/5' : ''
                        }`}
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedContacts.has(contact.id)}
                            onChange={() => toggleSelectContact(contact.id)}
                            className="rounded border-subtle"
                          />
                        </td>
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
                        <td className="px-4 py-3 text-sm text-secondary">{formatDate(contact.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEdit(contact)}
                              className="p-1.5 text-secondary hover:text-primary rounded transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-subtle bg-surface">
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
          </div>
        )}
      </div>

      {/* Create/Edit Contact Modal */}
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
                  className="px-3 py-1.5 text-sm bg-brand text-white rounded-md hover:bg-brand-hover disabled:opacity-50 transition-colors"
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
                        <span className="text-secondary">→</span>
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
                  className="px-3 py-1.5 text-sm bg-brand text-white rounded-md hover:bg-brand-hover disabled:opacity-50 transition-colors"
                >
                  {importMutation.isPending ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit List Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={closeListModal} />
          <div className="relative bg-surface border border-subtle rounded-lg w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-primary">{editingList ? 'Edit List' : 'Create List'}</h2>
              <button onClick={closeListModal} className="text-secondary hover:text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createListMutation.mutate(listForm);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-secondary mb-1.5">Name</label>
                <input
                  type="text"
                  value={listForm.name}
                  onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                  placeholder="e.g., Hot Leads"
                  required
                  className="w-full px-3 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1.5">Description (optional)</label>
                <input
                  type="text"
                  value={listForm.description}
                  onChange={(e) => setListForm({ ...listForm, description: e.target.value })}
                  placeholder="A brief description"
                  className="w-full px-3 py-2 text-sm bg-surface border border-subtle rounded-md text-primary placeholder:text-secondary focus:outline-none focus:border-brand transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1.5">Color</label>
                <div className="flex gap-2">
                  {LIST_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setListForm({ ...listForm, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        listForm.color === color ? 'ring-2 ring-offset-2 ring-brand scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-subtle">
                {editingList && !editingList.is_default ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this list?')) {
                        deleteListMutation.mutate(editingList.id);
                        closeListModal();
                      }
                    }}
                    className="text-sm text-red-500 hover:text-red-400 transition-colors"
                  >
                    Delete list
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeListModal}
                    className="px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createListMutation.isPending}
                    className="px-3 py-1.5 text-sm bg-brand text-white rounded-md hover:bg-brand-hover disabled:opacity-50 transition-colors"
                  >
                    {createListMutation.isPending ? 'Saving...' : editingList ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to List Modal */}
      {showAddToListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowAddToListModal(false)} />
          <div className="relative bg-surface border border-subtle rounded-lg w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-primary">Add to List</h2>
              <button onClick={() => setShowAddToListModal(false)} className="text-secondary hover:text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-secondary mb-4">
              Select a list to add {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''} to:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lists?.map((list) => (
                <button
                  key={list.id}
                  onClick={() => addToListMutation.mutate({ listId: list.id, contactIds: Array.from(selectedContacts) })}
                  disabled={addToListMutation.isPending}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left hover:bg-hover transition-colors disabled:opacity-50"
                >
                  <div
                    className="h-4 w-4 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: list.color }}
                  />
                  <span className="text-sm text-primary">{list.name}</span>
                  <span className="text-xs text-secondary ml-auto">{list.contact_count} contacts</span>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-subtle">
              <button
                onClick={() => { setShowAddToListModal(false); setShowListModal(true); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-brand hover:text-brand-hover transition-colors"
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
