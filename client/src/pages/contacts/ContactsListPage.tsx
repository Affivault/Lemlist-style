import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { contactsApi, tagsApi, listsApi, segmentsApi } from '../../api/contacts.api';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate, cn } from '../../lib/utils';
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
  Filter,
  UserMinus,
  AlertTriangle,
  Pencil,
  LayoutGrid,
  LayoutList,
  Columns3,
  MoreHorizontal,
  Mail,
  Building2,
  Phone,
  Globe,
  Linkedin,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Hash,
  FolderOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateContactInput, ContactWithTags, ContactList, Tag } from '@lemlist/shared';
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
  { name: 'Emerald', value: '#10B981', bg: 'from-emerald-500/20 to-emerald-500/5' },
  { name: 'Blue', value: '#3B82F6', bg: 'from-blue-500/20 to-blue-500/5' },
  { name: 'Violet', value: '#8B5CF6', bg: 'from-violet-500/20 to-violet-500/5' },
  { name: 'Pink', value: '#EC4899', bg: 'from-pink-500/20 to-pink-500/5' },
  { name: 'Amber', value: '#F59E0B', bg: 'from-amber-500/20 to-amber-500/5' },
  { name: 'Red', value: '#EF4444', bg: 'from-red-500/20 to-red-500/5' },
  { name: 'Cyan', value: '#06B6D4', bg: 'from-cyan-500/20 to-cyan-500/5' },
  { name: 'Lime', value: '#84CC16', bg: 'from-lime-500/20 to-lime-500/5' },
];

type ViewMode = 'all' | 'list' | 'segment' | 'unsubscribed' | 'bounced';
type DisplayMode = 'table' | 'cards' | 'board';

// Contact Card Component with hover preview
function ContactCard({
  contact,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onVerify,
  isVerifying,
}: {
  contact: ContactWithTags;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onVerify: () => void;
  isVerifying: boolean;
}) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewTimeout = useRef<NodeJS.Timeout | null>(null);

  const initials = contact.first_name
    ? `${contact.first_name[0]}${contact.last_name?.[0] || ''}`
    : contact.email[0].toUpperCase();

  const dcsScore = (contact as any).dcs_score;

  const handleMouseEnter = () => {
    setShowActions(true);
    previewTimeout.current = setTimeout(() => setShowPreview(true), 600);
  };

  const handleMouseLeave = () => {
    setShowActions(false);
    setShowPreview(false);
    if (previewTimeout.current) clearTimeout(previewTimeout.current);
  };

  return (
    <div
      className={cn(
        "group relative bg-surface rounded-xl border transition-all duration-300 cursor-pointer overflow-visible",
        selected
          ? "border-brand ring-2 ring-brand/20 scale-[1.02]"
          : "border-subtle hover:border-default hover:shadow-xl hover:shadow-black/8 hover:-translate-y-1"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hover preview panel */}
      {showPreview && (
        <div className="absolute left-full top-0 ml-3 z-50 w-72 animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="bg-surface border border-subtle rounded-xl shadow-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center text-brand font-semibold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-primary truncate">
                  {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'No name'}
                </h4>
                <p className="text-xs text-secondary truncate">{contact.job_title || 'No title'}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-secondary">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-secondary">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-2 text-secondary">
                  <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{contact.company}</span>
                </div>
              )}
              {contact.linkedin_url && (
                <div className="flex items-center gap-2 text-secondary">
                  <Linkedin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate text-brand">{contact.linkedin_url.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                </div>
              )}
            </div>

            {dcsScore !== null && dcsScore !== undefined && (
              <div className={cn(
                "flex items-center justify-between p-2.5 rounded-lg",
                dcsScore >= 70 ? "bg-emerald-500/10" :
                dcsScore >= 40 ? "bg-amber-500/10" : "bg-red-500/10"
              )}>
                <span className="text-xs font-medium text-secondary">Deliverability Score</span>
                <span className={cn(
                  "text-sm font-bold",
                  dcsScore >= 70 ? "text-emerald-600" :
                  dcsScore >= 40 ? "text-amber-600" : "text-red-600"
                )}>{dcsScore}/100</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-subtle">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/contacts/${contact.id}`); }}
                className="flex-1 px-3 py-2 text-xs font-medium text-primary bg-hover rounded-lg hover:bg-hover/80 transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight className="h-3 w-3" />
                View Profile
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="flex-1 px-3 py-2 text-xs font-medium text-brand bg-brand/10 rounded-lg hover:bg-brand/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selection checkbox */}
      <div
        className={cn(
          "absolute top-3 left-3 z-10 transition-all duration-200",
          selected || showActions ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        <div className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
          selected
            ? "bg-brand border-brand shadow-lg shadow-brand/30"
            : "border-subtle bg-surface/90 backdrop-blur-sm hover:border-secondary"
        )}>
          {selected && <CheckCircle2 className="h-3 w-3 text-white" />}
        </div>
      </div>

      {/* Quick actions */}
      <div className={cn(
        "absolute top-3 right-3 z-10 flex items-center gap-1 transition-all duration-200",
        showActions ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
      )}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1.5 rounded-lg bg-surface/90 backdrop-blur-sm border border-subtle text-secondary hover:text-primary hover:bg-hover transition-all duration-200 hover:scale-110"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 rounded-lg bg-surface/90 backdrop-blur-sm border border-subtle text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 hover:scale-110"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-5" onClick={() => navigate(`/contacts/${contact.id}`)}>
        {/* Avatar and name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center text-brand font-semibold text-lg transition-transform duration-300 group-hover:scale-105">
              {initials}
            </div>
            {dcsScore !== null && dcsScore !== undefined && (
              <div className={cn(
                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-surface shadow-sm transition-transform duration-300 group-hover:scale-110",
                dcsScore >= 70 ? "bg-emerald-500 text-white" :
                dcsScore >= 40 ? "bg-amber-500 text-white" :
                "bg-red-500 text-white"
              )}>
                {dcsScore}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-primary truncate">
              {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'No name'}
            </h3>
            {contact.job_title && (
              <p className="text-sm text-secondary truncate">{contact.job_title}</p>
            )}
            <p className="text-sm text-tertiary truncate mt-0.5">{contact.email}</p>
          </div>
        </div>

        {/* Company */}
        {contact.company && (
          <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-hover/50 transition-colors duration-200 group-hover:bg-hover">
            <Building2 className="h-4 w-4 text-secondary flex-shrink-0" />
            <span className="text-sm text-primary truncate">{contact.company}</span>
          </div>
        )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {contact.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full transition-transform duration-200 hover:scale-105"
                style={{ backgroundColor: tag.color + '15', color: tag.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </span>
            ))}
            {contact.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs text-secondary bg-hover rounded-full">
                +{contact.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-subtle">
          <div className="flex items-center gap-3 text-xs text-tertiary">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(contact.created_at)}
            </span>
          </div>
          {dcsScore === null || dcsScore === undefined ? (
            <button
              onClick={(e) => { e.stopPropagation(); onVerify(); }}
              disabled={isVerifying}
              className="text-xs font-medium text-brand hover:text-brand-hover transition-all duration-200 flex items-center gap-1 hover:scale-105"
            >
              {isVerifying ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Verifying</>
              ) : (
                <><Sparkles className="h-3 w-3" /> Verify</>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1 transition-transform duration-200 group-hover:scale-110">
              {dcsScore >= 70 ? (
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              ) : dcsScore >= 40 ? (
                <ShieldAlert className="h-4 w-4 text-amber-500" />
              ) : (
                <ShieldX className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  active,
  onClick
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left w-full",
        active
          ? "border-brand bg-brand/5"
          : "border-subtle hover:border-default hover:bg-hover/50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        `bg-gradient-to-br ${color}`
      )}>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold text-primary">{value.toLocaleString()}</p>
        <p className="text-xs text-secondary">{label}</p>
      </div>
    </button>
  );
}

export function ContactsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('cards');
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

  // View state from URL
  const viewMode = (searchParams.get('view') as ViewMode) || 'all';
  const activeListId = searchParams.get('list') || null;
  const activeSegmentId = searchParams.get('segment') || null;

  // Fetch data
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts', page, search, viewMode, activeListId, activeSegmentId],
    queryFn: () => contactsApi.list({
      page,
      limit: displayMode === 'cards' ? 12 : DEFAULT_PAGE_SIZE,
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
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Contacts</h1>
          <p className="text-secondary mt-1">Manage and organize your contact database</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-secondary hover:text-primary border border-subtle rounded-xl hover:bg-hover transition-all"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-secondary hover:text-primary border border-subtle rounded-xl hover:bg-hover transition-all"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-brand text-white rounded-xl hover:bg-brand-hover transition-all shadow-lg shadow-brand/20"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Contacts"
          value={stats?.total || 0}
          color="from-blue-500/20 to-blue-500/5"
          active={viewMode === 'all' && !activeListId}
          onClick={() => setView('all')}
        />
        <StatCard
          icon={CheckCircle2}
          label="Verified"
          value={stats?.verified || 0}
          color="from-emerald-500/20 to-emerald-500/5"
          active={false}
          onClick={() => {}}
        />
        <StatCard
          icon={UserMinus}
          label="Unsubscribed"
          value={stats?.unsubscribed || 0}
          color="from-amber-500/20 to-amber-500/5"
          active={viewMode === 'unsubscribed'}
          onClick={() => setView('unsubscribed')}
        />
        <StatCard
          icon={AlertTriangle}
          label="Bounced"
          value={stats?.bounced || 0}
          color="from-red-500/20 to-red-500/5"
          active={viewMode === 'bounced'}
          onClick={() => setView('bounced')}
        />
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-6">
          {/* Lists */}
          <div className="bg-surface rounded-2xl border border-subtle p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-brand" />
                Lists
              </h3>
              <button
                onClick={() => setShowListModal(true)}
                className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-hover transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {lists?.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setView('list', list.id)}
                  className={cn(
                    "group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    activeListId === list.id
                      ? "bg-brand/10 text-brand"
                      : "text-primary hover:bg-hover"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-md flex-shrink-0"
                    style={{ backgroundColor: list.color }}
                  />
                  <span className="flex-1 text-left truncate">{list.name}</span>
                  <span className="text-xs text-secondary tabular-nums">{list.contact_count || 0}</span>
                  {!list.is_default && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditList(list); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-secondary hover:text-primary transition-all"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </button>
              ))}
              {(!lists || lists.length === 0) && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-2xl bg-hover flex items-center justify-center mx-auto mb-3">
                    <FolderOpen className="h-6 w-6 text-secondary" />
                  </div>
                  <p className="text-sm text-secondary mb-2">No lists yet</p>
                  <button
                    onClick={() => setShowListModal(true)}
                    className="text-sm font-medium text-brand hover:text-brand-hover"
                  >
                    Create your first list
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Segments */}
          {segments && segments.length > 0 && (
            <div className="bg-surface rounded-2xl border border-subtle p-4">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-violet-500" />
                Segments
              </h3>
              <div className="space-y-1">
                {segments.map((segment) => (
                  <button
                    key={segment.id}
                    onClick={() => setView('segment', undefined, segment.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                      activeSegmentId === segment.id
                        ? "bg-violet-500/10 text-violet-600"
                        : "text-primary hover:bg-hover"
                    )}
                  >
                    <Zap className="h-4 w-4 flex-shrink-0" style={{ color: segment.color }} />
                    <span className="flex-1 text-left truncate">{segment.name}</span>
                    <span className="text-xs text-secondary tabular-nums">{segment.cached_count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="bg-surface rounded-2xl border border-subtle p-4">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                <Hash className="h-4 w-4 text-pink-500" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: tag.color + '15', color: tag.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email, or company..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-surface border border-subtle rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
              />
            </div>

            {/* View mode switcher */}
            <div className="flex items-center bg-surface border border-subtle rounded-xl p-1">
              <button
                onClick={() => setDisplayMode('cards')}
                className={cn(
                  "p-2.5 rounded-lg transition-all",
                  displayMode === 'cards' ? "bg-brand text-white" : "text-secondary hover:text-primary"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDisplayMode('table')}
                className={cn(
                  "p-2.5 rounded-lg transition-all",
                  displayMode === 'table' ? "bg-brand text-white" : "text-secondary hover:text-primary"
                )}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {someSelected && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-brand/5 border border-brand/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <p className="font-semibold text-primary">{selectedContacts.size} selected</p>
                  <p className="text-xs text-secondary">Choose an action below</p>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddToListModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-surface border border-subtle rounded-xl hover:bg-hover transition-all"
                >
                  <FolderOpen className="h-4 w-4" />
                  Add to list
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${selectedContacts.size} contacts? This cannot be undone.`)) {
                      bulkDeleteMutation.mutate(Array.from(selectedContacts));
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedContacts(new Set())}
                  className="p-2 text-secondary hover:text-primary rounded-xl hover:bg-hover transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {contactsLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="text-sm text-secondary mt-4">Loading contacts...</p>
              </div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-brand" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {search ? 'No contacts found' : 'No contacts yet'}
                </h3>
                <p className="text-secondary mb-6">
                  {search
                    ? 'Try adjusting your search terms or filters.'
                    : 'Get started by adding contacts manually or importing from a CSV file.'}
                </p>
                {!search && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-brand text-white rounded-xl hover:bg-brand-hover transition-all shadow-lg shadow-brand/20"
                    >
                      <Plus className="h-4 w-4" />
                      Add Contact
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-primary bg-surface border border-subtle rounded-xl hover:bg-hover transition-all"
                    >
                      <Upload className="h-4 w-4" />
                      Import CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : displayMode === 'cards' ? (
            /* Card View */
            <div className="grid grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  selected={selectedContacts.has(contact.id)}
                  onSelect={() => toggleSelectContact(contact.id)}
                  onEdit={() => openEdit(contact)}
                  onDelete={() => {
                    if (confirm('Delete this contact?')) deleteMutation.mutate(contact.id);
                  }}
                  onVerify={() => verifyMutation.mutate(contact.id)}
                  isVerifying={verifyingIds.has(contact.id)}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-surface border border-subtle rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-subtle bg-hover/30">
                    <th className="px-4 py-4 text-left w-12">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-subtle"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Company</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Tags</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Score</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Added</th>
                    <th className="px-4 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {contacts.map((contact: ContactWithTags) => (
                    <tr
                      key={contact.id}
                      className={cn(
                        "group hover:bg-hover/50 cursor-pointer transition-colors",
                        selectedContacts.has(contact.id) && "bg-brand/5"
                      )}
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.id)}
                          onChange={() => toggleSelectContact(contact.id)}
                          className="rounded border-subtle"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center text-brand font-semibold">
                            {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-primary">
                              {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'No name'}
                            </p>
                            <p className="text-sm text-secondary">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {contact.company ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-secondary" />
                            <span className="text-sm text-primary">{contact.company}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-tertiary">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md"
                              style={{ backgroundColor: tag.color + '15', color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                          {contact.tags && contact.tags.length > 2 && (
                            <span className="text-xs text-secondary">+{contact.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        {(contact as any).dcs_score != null ? (
                          <div className="flex items-center gap-2">
                            {(contact as any).dcs_score >= 70 ? (
                              <div className="flex items-center gap-1.5 text-emerald-600">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-sm font-medium">{(contact as any).dcs_score}</span>
                              </div>
                            ) : (contact as any).dcs_score >= 40 ? (
                              <div className="flex items-center gap-1.5 text-amber-600">
                                <ShieldAlert className="h-4 w-4" />
                                <span className="text-sm font-medium">{(contact as any).dcs_score}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-600">
                                <ShieldX className="h-4 w-4" />
                                <span className="text-sm font-medium">{(contact as any).dcs_score}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => verifyMutation.mutate(contact.id)}
                            disabled={verifyingIds.has(contact.id)}
                            className="text-sm font-medium text-brand hover:text-brand-hover transition-colors flex items-center gap-1.5"
                          >
                            {verifyingIds.has(contact.id) ? (
                              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying</>
                            ) : (
                              <><Sparkles className="h-3.5 w-3.5" /> Verify</>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary">{formatDate(contact.created_at)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(contact)}
                            className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-hover transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this contact?')) deleteMutation.mutate(contact.id);
                            }}
                            className="p-2 text-secondary hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <p className="text-sm text-secondary">
                Showing {(page - 1) * (displayMode === 'cards' ? 12 : DEFAULT_PAGE_SIZE) + 1} - {Math.min(page * (displayMode === 'cards' ? 12 : DEFAULT_PAGE_SIZE), totalContacts)} of {totalContacts}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2.5 text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-subtle hover:bg-hover transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          "w-10 h-10 text-sm font-medium rounded-xl transition-all",
                          page === pageNum
                            ? "bg-brand text-white"
                            : "text-secondary hover:text-primary hover:bg-hover"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2.5 text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-subtle hover:bg-hover transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Contact Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCreateModal} />
          <div className="relative bg-surface border border-subtle rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-primary">{editId ? 'Edit Contact' : 'Add Contact'}</h2>
                  <p className="text-sm text-secondary mt-1">Fill in the contact details below</p>
                </div>
                <button onClick={closeCreateModal} className="p-2 text-secondary hover:text-primary rounded-xl hover:bg-hover transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@company.com"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm bg-surface border border-subtle rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">First Name</label>
                  <input
                    type="text"
                    value={form.first_name || ''}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="John"
                    className="w-full px-4 py-3 text-sm bg-surface border border-subtle rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Last Name</label>
                  <input
                    type="text"
                    value={form.last_name || ''}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Doe"
                    className="w-full px-4 py-3 text-sm bg-surface border border-subtle rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                    <input
                      type="text"
                      value={form.company || ''}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Acme Inc."
                      className="w-full pl-10 pr-4 py-3 text-sm bg-surface border border-subtle rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Job Title</label>
                  <input
                    type="text"
                    value={form.job_title || ''}
                    onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                    placeholder="CEO"
                    className="w-full px-4 py-3 text-sm bg-surface border border-subtle rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                  <input
                    type="text"
                    value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-surface border border-subtle rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-5 py-2.5 text-sm font-medium text-secondary hover:text-primary rounded-xl hover:bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2.5 text-sm font-medium bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-50 transition-all shadow-lg shadow-brand/20"
                >
                  {createMutation.isPending ? 'Saving...' : editId ? 'Update Contact' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImportModal(false)} />
          <div className="relative bg-surface border border-subtle rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-primary">Import Contacts</h2>
                  <p className="text-sm text-secondary mt-1">Upload a CSV file to bulk import contacts</p>
                </div>
                <button onClick={() => setShowImportModal(false)} className="p-2 text-secondary hover:text-primary rounded-xl hover:bg-hover transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative border-2 border-dashed border-subtle rounded-2xl p-8 text-center hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-brand" />
                </div>
                <p className="text-sm font-medium text-primary mb-1">
                  {importFile ? importFile.name : 'Drop your CSV file here'}
                </p>
                <p className="text-xs text-secondary">or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {csvHeaders.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-primary mb-3">Map columns to contact fields:</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl border border-subtle p-3">
                    {csvHeaders.map((header) => (
                      <div key={header} className="flex items-center gap-3">
                        <span className="w-32 truncate text-sm text-primary">{header}</span>
                        <ArrowUpRight className="h-4 w-4 text-secondary flex-shrink-0" />
                        <select
                          className="flex-1 px-3 py-2 text-sm bg-surface border border-subtle rounded-xl text-primary focus:outline-none focus:border-brand transition-colors"
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

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-secondary hover:text-primary rounded-xl hover:bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!importFile || importMutation.isPending}
                  onClick={() => importFile && importMutation.mutate({ file: importFile, mapping: columnMapping })}
                  className="px-5 py-2.5 text-sm font-medium bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-50 transition-all shadow-lg shadow-brand/20"
                >
                  {importMutation.isPending ? 'Importing...' : 'Import Contacts'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit List Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeListModal} />
          <div className="relative bg-surface border border-subtle rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-primary">{editingList ? 'Edit List' : 'Create List'}</h2>
                  <p className="text-sm text-secondary mt-1">Organize your contacts into groups</p>
                </div>
                <button onClick={closeListModal} className="p-2 text-secondary hover:text-primary rounded-xl hover:bg-hover transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createListMutation.mutate(listForm);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Name</label>
                <input
                  type="text"
                  value={listForm.name}
                  onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                  placeholder="e.g., Hot Leads"
                  required
                  className="w-full px-4 py-3 text-sm bg-surface border border-subtle rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Description</label>
                <input
                  type="text"
                  value={listForm.description}
                  onChange={(e) => setListForm({ ...listForm, description: e.target.value })}
                  placeholder="A brief description of this list"
                  className="w-full px-4 py-3 text-sm bg-surface border border-subtle rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-3">Color</label>
                <div className="flex gap-2">
                  {LIST_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setListForm({ ...listForm, color: color.value })}
                      className={cn(
                        "w-10 h-10 rounded-xl transition-all",
                        listForm.color === color.value && "ring-2 ring-offset-2 ring-brand scale-110"
                      )}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4">
                {editingList && !editingList.is_default ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this list? Contacts will not be deleted.')) {
                        deleteListMutation.mutate(editingList.id);
                        closeListModal();
                      }
                    }}
                    className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                  >
                    Delete list
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeListModal}
                    className="px-5 py-2.5 text-sm font-medium text-secondary hover:text-primary rounded-xl hover:bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createListMutation.isPending}
                    className="px-5 py-2.5 text-sm font-medium bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-50 transition-all shadow-lg shadow-brand/20"
                  >
                    {createListMutation.isPending ? 'Saving...' : editingList ? 'Update' : 'Create List'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to List Modal */}
      {showAddToListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddToListModal(false)} />
          <div className="relative bg-surface border border-subtle rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-primary">Add to List</h2>
                  <p className="text-sm text-secondary mt-1">
                    Add {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''} to a list
                  </p>
                </div>
                <button onClick={() => setShowAddToListModal(false)} className="p-2 text-secondary hover:text-primary rounded-xl hover:bg-hover transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lists?.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => addToListMutation.mutate({ listId: list.id, contactIds: Array.from(selectedContacts) })}
                    disabled={addToListMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-hover transition-colors disabled:opacity-50"
                  >
                    <div
                      className="w-4 h-4 rounded-md flex-shrink-0"
                      style={{ backgroundColor: list.color }}
                    />
                    <span className="flex-1 font-medium text-primary">{list.name}</span>
                    <span className="text-sm text-secondary">{list.contact_count} contacts</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-subtle">
                <button
                  onClick={() => { setShowAddToListModal(false); setShowListModal(true); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-brand hover:text-brand-hover rounded-xl hover:bg-brand/5 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Create new list
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
