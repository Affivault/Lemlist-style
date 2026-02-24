import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inboxApi } from '../../api/inbox.api';
import { saraApi } from '../../api/sara.api';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import toast from 'react-hot-toast';
import {
  Search,
  Star,
  Archive,
  ArchiveRestore,
  Reply,
  Forward,
  Send,
  X,
  Inbox,
  SendHorizontal,
  MailOpen,
  Bot,
  Sparkles,
  Check,
  XCircle,
  Edit3,
  RefreshCw,
  Pencil,
  Trash2,
  MailPlus,
  ArrowLeft,
  CheckCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────── */
type Folder = 'inbox' | 'starred' | 'sent' | 'archived';
type SaraFilter = 'all' | 'pending_review' | 'approved' | 'dismissed';

interface Message {
  id: string;
  from_email: string;
  to_email: string;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  is_read: boolean;
  is_starred?: boolean;
  is_archived?: boolean;
  direction?: string;
  received_at: string;
  contact_name: string | null;
  contact_email?: string | null;
  campaign_name: string | null;
  campaign_id: string | null;
  sara_intent: string | null;
  sara_confidence: number | null;
  sara_draft_reply: string | null;
  sara_action: string | null;
  sara_status: string;
}

/* ─── Helpers ──────────────────────────────────────── */
function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function senderInitial(msg: Message): string {
  const name = msg.contact_name || msg.from_email || '';
  return (name[0] || '?').toUpperCase();
}

function senderName(msg: Message): string {
  return msg.contact_name || msg.from_email?.split('@')[0] || 'Unknown';
}

/** Strip HTML tags and decode common entities for plain-text snippet */
function stripHtml(str: string): string {
  return str
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function msgSnippet(msg: Message): string {
  const raw = msg.body_text || msg.body_html || '';
  const text = stripHtml(raw);
  return text.slice(0, 120).trim() || '(no content)';
}

const INTENT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  interested: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Interested' },
  meeting: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Meeting' },
  objection: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Objection' },
  not_now: { bg: 'bg-slate-500/10', text: 'text-slate-500', label: 'Not Now' },
  unsubscribe: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Unsubscribe' },
  out_of_office: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Out of Office' },
  bounce: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Bounce' },
  other: { bg: 'bg-slate-500/10', text: 'text-slate-500', label: 'Other' },
};

/* ─── Email HTML Renderer (sandboxed iframe) ──────── */
function EmailBody({ html, text }: { html: string | null; text: string | null }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200);

  // Build the full HTML document for the iframe
  const srcDoc = useMemo(() => {
    let bodyContent: string;
    if (html) {
      bodyContent = html;
    } else {
      const escaped = (text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      bodyContent = `<div style="white-space:pre-wrap;">${escaped}</div>`;
    }

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>
body {
  margin: 0;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.65;
  color: #1a1a1a;
  word-wrap: break-word;
  overflow-wrap: break-word;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; height: auto; display: block; }
a { color: #1a73e8; text-decoration: none; }
a:hover { text-decoration: underline; }
blockquote { margin: 8px 0; padding-left: 12px; border-left: 3px solid #dadce0; color: #5f6368; }
pre { white-space: pre-wrap; font-size: 13px; background: #f8f9fa; padding: 12px; border-radius: 8px; }
table { border-collapse: collapse; max-width: 100%; }
hr { border: none; border-top: 1px solid #e0e0e0; margin: 16px 0; }
p { margin: 0 0 12px; }
h1, h2, h3, h4 { margin: 0 0 8px; }
</style></head><body>${bodyContent}</body></html>`;
  }, [html, text]);

  // Auto-resize iframe to fit content
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const resize = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc?.body) {
          const h = doc.body.scrollHeight;
          if (h > 0) setHeight(h + 32);
        }
      } catch { /* cross-origin safety */ }
    };

    iframe.addEventListener('load', resize);
    const timer = setTimeout(resize, 500);

    return () => {
      iframe.removeEventListener('load', resize);
      clearTimeout(timer);
    };
  }, [srcDoc]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      sandbox="allow-same-origin"
      className="w-full border-0"
      style={{ height: `${height}px`, minHeight: '80px' }}
      title="Email content"
    />
  );
}

/* ─── Compose Modal ───────────────────────────────── */
function ComposeModal({ onClose, onSend, sending }: {
  onClose: () => void;
  onSend: (data: { to: string; subject: string; body: string }) => void;
  sending?: boolean;
}) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-[560px] bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-2xl flex flex-col max-h-[80vh]" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] rounded-t-xl">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">New Message</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-b border-[var(--border-subtle)]">
          <div className="flex items-center px-4 py-2 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-medium text-[var(--text-tertiary)] w-12">To</span>
            <input value={to} onChange={e => setTo(e.target.value)} className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none" placeholder="recipient@example.com" />
          </div>
          <div className="flex items-center px-4 py-2">
            <span className="text-xs font-medium text-[var(--text-tertiary)] w-12">Subject</span>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none" placeholder="Subject" />
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full h-full min-h-[200px] p-4 bg-transparent text-sm text-[var(--text-primary)] outline-none resize-none" placeholder="Write your message..." />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => { if (to && subject && body) onSend({ to, subject, body }); }}
            disabled={!to || !subject || !body || sending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-app)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            {sending ? 'Sending...' : 'Send'}
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SARA Panel ──────────────────────────────────── */
function SaraPanel({
  message,
  onApprove,
  onDismiss,
  onClassify,
  stats,
}: {
  message: Message | null;
  onApprove: (id: string, editedReply?: string) => void;
  onDismiss: (id: string) => void;
  onClassify: (id: string) => void;
  stats: any;
}) {
  const [editing, setEditing] = useState(false);
  const [editedReply, setEditedReply] = useState('');

  useEffect(() => {
    if (message?.sara_draft_reply) setEditedReply(message.sara_draft_reply);
    setEditing(false);
  }, [message?.id]);

  const intent = message?.sara_intent ? INTENT_COLORS[message.sara_intent] || INTENT_COLORS.other : null;
  const hasSara = message && message.sara_intent;
  const isPending = message?.sara_status === 'pending_review';

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-[var(--bg-elevated)]">
          <Bot className="h-4 w-4 text-[var(--text-primary)]" />
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">SARA AI</span>
        <Sparkles className="h-3 w-3 text-[var(--text-tertiary)]" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {stats && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Pending', value: stats.pending_review || 0 },
              { label: 'Approved', value: stats.approved_today || 0 },
              { label: 'Sent', value: stats.sent_today || 0 },
              { label: 'Dismissed', value: stats.dismissed_today || 0 },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wide">{s.label}</p>
                <p className="text-lg font-semibold text-[var(--text-primary)] mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {message ? (
          <div className="space-y-3">
            <div className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Analysis</div>

            {hasSara ? (
              <>
                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Intent</span>
                    {intent && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${intent.bg} ${intent.text}`}>
                        {intent.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--border-subtle)]">
                      <div className="h-1.5 rounded-full bg-[var(--text-primary)] transition-all" style={{ width: `${(message.sara_confidence || 0) * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-medium text-[var(--text-tertiary)]">{Math.round((message.sara_confidence || 0) * 100)}%</span>
                  </div>
                </div>

                {message.sara_action && (
                  <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Suggested Action</span>
                    <p className="text-sm text-[var(--text-primary)] mt-1 capitalize">{message.sara_action.replace('_', ' ')}</p>
                  </div>
                )}

                {message.sara_draft_reply && (
                  <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Draft Reply</span>
                      {isPending && (
                        <button onClick={() => setEditing(!editing)} className="text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                          <Edit3 className="h-3 w-3" />
                          {editing ? 'Cancel' : 'Edit'}
                        </button>
                      )}
                    </div>
                    {editing ? (
                      <textarea value={editedReply} onChange={e => setEditedReply(e.target.value)} rows={4} className="w-full text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-2 text-[var(--text-primary)] outline-none resize-none" />
                    ) : (
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{message.sara_draft_reply}</p>
                    )}
                  </div>
                )}

                {isPending && (
                  <div className="flex gap-2">
                    <button onClick={() => onApprove(message.id, editing ? editedReply : undefined)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-app)] text-xs font-medium hover:opacity-90 transition-opacity">
                      <Check className="h-3.5 w-3.5" />
                      Approve & Send
                    </button>
                    <button onClick={() => onDismiss(message.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                      <XCircle className="h-3.5 w-3.5" />
                      Dismiss
                    </button>
                  </div>
                )}

                {!isPending && message.sara_status !== 'pending_review' && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                    message.sara_status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                    message.sara_status === 'sent' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    <CheckCheck className="h-3.5 w-3.5" />
                    {message.sara_status === 'approved' ? 'Approved' : message.sara_status === 'sent' ? 'Sent' : 'Dismissed'}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-[var(--text-tertiary)] mb-3">Not yet classified</p>
                <button onClick={() => onClassify(message.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors mx-auto">
                  <Sparkles className="h-3.5 w-3.5" />
                  Classify with SARA
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-3 border border-[var(--border-subtle)]">
              <Bot className="h-5 w-5 text-[var(--text-tertiary)]" />
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">Select a message to see<br/>SARA&apos;s analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main InboxPage ──────────────────────────────── */
export function InboxPage() {
  const qc = useQueryClient();
  const [folder, setFolder] = useState<Folder>('inbox');
  const [saraFilter, setSaraFilter] = useState<SaraFilter>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showSara, setShowSara] = useState(true);
  const [replyMode, setReplyMode] = useState<'reply' | 'forward' | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  /* ── Queries ── */
  const { data: messagesData, isLoading, isFetching } = useQuery({
    queryKey: ['inbox', folder, saraFilter, search],
    queryFn: () => inboxApi.list({
      limit: 50,
      folder,
      sara_status: saraFilter !== 'all' ? saraFilter : undefined,
      search: search || undefined,
    }),
  });

  const messages: Message[] = Array.isArray(messagesData?.data) ? messagesData.data : [];

  const { data: selectedMsg } = useQuery({
    queryKey: ['inbox', 'detail', selectedId],
    queryFn: () => inboxApi.get(selectedId!),
    enabled: !!selectedId,
  });

  const { data: saraStats } = useQuery({
    queryKey: ['sara', 'stats'],
    queryFn: () => saraApi.getStats(),
  });

  /* ── Invalidation ── */
  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['inbox'] });
    qc.invalidateQueries({ queryKey: ['sara'] });
  }, [qc]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['inbox'] });
    await qc.invalidateQueries({ queryKey: ['sara'] });
    setIsRefreshing(false);
  }, [qc]);

  /* ── Select next message after removal ── */
  const selectNextMessage = useCallback((removedId: string) => {
    const idx = messages.findIndex(m => m.id === removedId);
    if (idx >= 0 && messages.length > 1) {
      const next = messages[idx + 1] || messages[idx - 1];
      setSelectedId(next?.id || null);
    } else {
      setSelectedId(null);
    }
  }, [messages]);

  /* ── Mutations ── */
  const markReadMut = useMutation({
    mutationFn: inboxApi.markRead,
    onSuccess: invalidate,
  });

  const markUnreadMut = useMutation({
    mutationFn: inboxApi.markUnread,
    onSuccess: invalidate,
  });

  const markAllReadMut = useMutation({
    mutationFn: inboxApi.markAllRead,
    onSuccess: () => {
      invalidate();
      toast.success('All marked as read');
    },
  });

  const toggleStarMut = useMutation({
    mutationFn: inboxApi.toggleStar,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['inbox'] });
      const prevList = qc.getQueryData(['inbox', folder, saraFilter, search]);
      qc.setQueryData(['inbox', folder, saraFilter, search], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((m: Message) =>
            m.id === id ? { ...m, is_starred: !m.is_starred } : m
          ),
        };
      });
      const prevDetail = qc.getQueryData(['inbox', 'detail', id]);
      if (prevDetail) {
        qc.setQueryData(['inbox', 'detail', id], (old: any) =>
          old ? { ...old, is_starred: !old.is_starred } : old
        );
      }
      return { prevList, prevDetail };
    },
    onError: (_err, id, context) => {
      if (context?.prevList) qc.setQueryData(['inbox', folder, saraFilter, search], context.prevList);
      if (context?.prevDetail) qc.setQueryData(['inbox', 'detail', id], context.prevDetail);
      toast.error('Failed to toggle star');
    },
    onSettled: () => invalidate(),
  });

  const archiveMut = useMutation({
    mutationFn: inboxApi.archive,
    onSuccess: (_data, id) => {
      selectNextMessage(id);
      invalidate();
      toast.success('Archived');
    },
    onError: () => toast.error('Failed to archive'),
  });

  const unarchiveMut = useMutation({
    mutationFn: inboxApi.unarchive,
    onSuccess: (_data, id) => {
      selectNextMessage(id);
      invalidate();
      toast.success('Moved to Inbox');
    },
    onError: () => toast.error('Failed to unarchive'),
  });

  const replyMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => inboxApi.reply(id, body),
    onSuccess: () => { invalidate(); setReplyMode(null); setReplyBody(''); toast.success('Reply sent'); },
    onError: () => toast.error('Failed to send reply'),
  });

  const forwardMut = useMutation({
    mutationFn: ({ id, to, note }: { id: string; to: string; note?: string }) => inboxApi.forward(id, to, note),
    onSuccess: () => { invalidate(); setReplyMode(null); setReplyBody(''); setForwardTo(''); toast.success('Forwarded'); },
    onError: () => toast.error('Failed to forward'),
  });

  const composeMut = useMutation({
    mutationFn: inboxApi.compose,
    onSuccess: () => { invalidate(); setShowCompose(false); toast.success('Message sent'); },
    onError: () => toast.error('Failed to send'),
  });

  const classifyMut = useMutation({
    mutationFn: saraApi.classify,
    onSuccess: () => { invalidate(); toast.success('Classified'); },
    onError: () => toast.error('Classification failed'),
  });

  const approveMut = useMutation({
    mutationFn: ({ id, editedReply }: { id: string; editedReply?: string }) => saraApi.approve(id, editedReply),
    onSuccess: () => { invalidate(); toast.success('Approved & queued'); },
    onError: () => toast.error('Failed to approve'),
  });

  const dismissMut = useMutation({
    mutationFn: saraApi.dismiss,
    onSuccess: () => { invalidate(); toast.success('Dismissed'); },
    onError: () => toast.error('Failed to dismiss'),
  });

  /* ── Handlers ── */
  const selectMessage = useCallback((msg: Message) => {
    setSelectedId(msg.id);
    setReplyMode(null);
    setReplyBody('');
    if (!msg.is_read) markReadMut.mutate(msg.id);
  }, [markReadMut]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setSelectedId(null);
  }, [searchInput]);

  const handleArchiveToggle = useCallback((msg: Message) => {
    if (folder === 'archived' || msg.is_archived) {
      unarchiveMut.mutate(msg.id);
    } else {
      archiveMut.mutate(msg.id);
    }
  }, [folder, archiveMut, unarchiveMut]);

  useEffect(() => {
    if (replyMode && replyRef.current) replyRef.current.focus();
  }, [replyMode]);

  const currentMsg: Message | null = (selectedMsg as Message) || messages.find(m => m.id === selectedId) || null;
  const unreadCount = messages.filter(m => !m.is_read).length;
  const pendingCount = saraStats?.pending_review || 0;

  const isInArchived = folder === 'archived';
  const archiveLabel = isInArchived ? 'Move to Inbox' : 'Archive';
  const ArchiveIcon = isInArchived ? ArchiveRestore : Archive;

  const folders: { id: Folder; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCount || undefined },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'sent', label: 'Sent', icon: SendHorizontal },
    { id: 'archived', label: 'Archived', icon: Archive },
  ];

  return (
    <div className="-mx-8 -my-6" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="h-full flex bg-[var(--bg-app)]">

        {/* ── Left: Message List ── */}
        <div className="flex flex-col border-r border-[var(--border-subtle)]" style={{ width: '380px', minWidth: '340px' }}>
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <button onClick={() => setShowCompose(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-app)] text-xs font-semibold hover:opacity-90 transition-opacity">
              <Pencil className="h-3.5 w-3.5" />
              Compose
            </button>
            <div className="flex-1" />
            <button
              onClick={() => markAllReadMut.mutate()}
              disabled={markAllReadMut.isPending}
              title="Mark all read"
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isFetching}
              title="Refresh"
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${(isRefreshing || isFetching) ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search messages..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--text-primary)] transition-colors" />
              {search && (
                <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[var(--bg-hover)]">
                  <X className="h-3 w-3 text-[var(--text-tertiary)]" />
                </button>
              )}
            </div>
          </form>

          {/* Folders */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            {folders.map(f => {
              const FolderIcon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => { setFolder(f.id); setSelectedId(null); setSaraFilter('all'); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    folder === f.id
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <FolderIcon className="h-3.5 w-3.5" />
                  {f.label}
                  {f.count ? <span className="ml-0.5 text-[10px] bg-[var(--text-primary)] text-[var(--bg-app)] rounded-full px-1.5 py-px font-bold">{f.count}</span> : null}
                </button>
              );
            })}
          </div>

          {/* SARA filter */}
          {folder === 'inbox' && pendingCount > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <Bot className="h-3 w-3 text-[var(--text-tertiary)] mr-1" />
              {(['all', 'pending_review'] as const).map(sf => (
                <button key={sf} onClick={() => setSaraFilter(sf)} className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${saraFilter === sf ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}>
                  {sf === 'all' ? 'All' : `Pending (${pendingCount})`}
                </button>
              ))}
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><Spinner size="md" /></div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-3 border border-[var(--border-subtle)]">
                  <MailOpen className="h-5 w-5 text-[var(--text-tertiary)]" />
                </div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">No messages</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{search ? 'Try a different search term' : `Your ${folder} is empty`}</p>
              </div>
            ) : (
              messages.map(msg => {
                const isSelected = msg.id === selectedId;
                const isOutbound = msg.direction === 'outbound';
                return (
                  <button
                    key={msg.id}
                    onClick={() => selectMessage(msg)}
                    className={`w-full text-left px-3 py-3 border-b border-[var(--border-subtle)] transition-all duration-100 ${
                      isSelected ? 'bg-[var(--bg-elevated)]' : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border ${
                          isOutbound ? 'bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)]' : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                        }`}>
                          {isOutbound ? <SendHorizontal className="h-3.5 w-3.5" /> : senderInitial(msg)}
                        </div>
                        {!msg.is_read && !isOutbound && (
                          <div className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 rounded-full bg-[var(--accent)] border-2 border-[var(--bg-surface)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-[13px] truncate ${msg.is_read ? 'font-medium text-[var(--text-secondary)]' : 'font-semibold text-[var(--text-primary)]'}`}>
                            {isOutbound ? `To: ${msg.to_email?.split('@')[0]}` : senderName(msg)}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {msg.is_starred && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                            <span className="text-[11px] text-[var(--text-tertiary)]">{timeAgo(msg.received_at)}</span>
                          </div>
                        </div>
                        <p className={`text-[12px] truncate mb-0.5 ${msg.is_read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] font-medium'}`}>
                          {msg.subject || '(no subject)'}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] text-[var(--text-tertiary)] truncate flex-1">{msgSnippet(msg)}</p>
                          {msg.sara_intent && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${(INTENT_COLORS[msg.sara_intent] || INTENT_COLORS.other).bg} ${(INTENT_COLORS[msg.sara_intent] || INTENT_COLORS.other).text}`}>
                              {(INTENT_COLORS[msg.sara_intent] || INTENT_COLORS.other).label}
                            </span>
                          )}
                          {msg.campaign_name && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)] flex-shrink-0 max-w-[80px] truncate">{msg.campaign_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Center: Email Detail ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-surface)]">
          {currentMsg ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--border-subtle)]">
                <button onClick={() => setSelectedId(null)} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors lg:hidden">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex-1" />
                <button onClick={() => { setReplyMode('reply'); setReplyBody(''); }} title="Reply" className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  <Reply className="h-4 w-4" />
                </button>
                <button onClick={() => { setReplyMode('forward'); setReplyBody(''); setForwardTo(''); }} title="Forward" className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  <Forward className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleStarMut.mutate(currentMsg.id)}
                  title={currentMsg.is_starred ? 'Unstar' : 'Star'}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Star className={`h-4 w-4 ${currentMsg.is_starred ? 'text-amber-400 fill-amber-400' : ''}`} />
                </button>
                <button
                  onClick={() => handleArchiveToggle(currentMsg)}
                  title={archiveLabel}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ArchiveIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => currentMsg.is_read ? markUnreadMut.mutate(currentMsg.id) : markReadMut.mutate(currentMsg.id)}
                  title={currentMsg.is_read ? 'Mark unread' : 'Mark read'}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {currentMsg.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />
                <button onClick={() => setShowSara(!showSara)} title={showSara ? 'Hide SARA' : 'Show SARA'} className={`p-2 rounded-lg transition-colors ${showSara ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]'}`}>
                  <Bot className="h-4 w-4" />
                </button>
              </div>

              {/* Email content */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-6">
                  {/* Subject line */}
                  <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-4 leading-tight">{currentMsg.subject || '(no subject)'}</h1>

                  {/* SARA banner */}
                  {currentMsg.sara_intent && currentMsg.sara_status === 'pending_review' && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] mb-4">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--bg-surface)]"><Bot className="h-4 w-4 text-[var(--text-primary)]" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text-primary)]">
                          SARA classified as <span className={`${(INTENT_COLORS[currentMsg.sara_intent] || INTENT_COLORS.other).text} font-semibold`}>{(INTENT_COLORS[currentMsg.sara_intent] || INTENT_COLORS.other).label}</span>
                          <span className="text-[var(--text-tertiary)] ml-1">({Math.round((currentMsg.sara_confidence || 0) * 100)}%)</span>
                        </p>
                        {currentMsg.sara_draft_reply && <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">Draft: {currentMsg.sara_draft_reply}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => approveMut.mutate({ id: currentMsg.id })} className="px-2.5 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-app)] text-[11px] font-semibold hover:opacity-90">Approve</button>
                        <button onClick={() => dismissMut.mutate(currentMsg.id)} className="px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">Dismiss</button>
                      </div>
                    </div>
                  )}

                  {/* Email message card */}
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                    {/* Sender header */}
                    <div className="flex items-start gap-3 p-4 border-b border-[var(--border-subtle)]">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{senderInitial(currentMsg)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">{senderName(currentMsg)}</span>
                          <span className="text-xs text-[var(--text-tertiary)]">&lt;{currentMsg.from_email}&gt;</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-[var(--text-tertiary)]">to {currentMsg.to_email?.split('@')[0]}</span>
                          {currentMsg.campaign_name && (
                            <>
                              <span className="text-xs text-[var(--text-tertiary)]">&middot;</span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">{currentMsg.campaign_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[var(--text-tertiary)]">{formatFullDate(currentMsg.received_at)}</span>
                        <button onClick={() => toggleStarMut.mutate(currentMsg.id)} className="p-1.5 rounded hover:bg-[var(--bg-hover)]">
                          <Star className={`h-4 w-4 ${currentMsg.is_starred ? 'text-amber-400 fill-amber-400' : 'text-[var(--text-tertiary)]'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Email body - rendered in sandboxed iframe */}
                    <div className="p-0">
                      <ErrorBoundary fallback={
                        <div className="p-6 text-sm text-[var(--text-secondary)]">
                          <p>{currentMsg.body_text ? stripHtml(currentMsg.body_text) : '(Unable to render email content)'}</p>
                        </div>
                      }>
                        <EmailBody html={currentMsg.body_html} text={currentMsg.body_text} />
                      </ErrorBoundary>
                    </div>
                  </div>

                  {/* Reply / Forward composer */}
                  {replyMode && (
                    <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                        <div className="flex items-center gap-2">
                          {replyMode === 'reply' ? <Reply className="h-4 w-4 text-[var(--text-tertiary)]" /> : <Forward className="h-4 w-4 text-[var(--text-tertiary)]" />}
                          <span className="text-sm font-medium text-[var(--text-primary)]">{replyMode === 'reply' ? 'Reply' : 'Forward'}</span>
                          {replyMode === 'reply' && <span className="text-xs text-[var(--text-tertiary)]">to {currentMsg.from_email}</span>}
                        </div>
                        <button onClick={() => setReplyMode(null)} className="p-1 rounded hover:bg-[var(--bg-hover)]"><X className="h-4 w-4 text-[var(--text-tertiary)]" /></button>
                      </div>
                      {replyMode === 'forward' && (
                        <div className="flex items-center px-4 py-2 border-b border-[var(--border-subtle)]">
                          <span className="text-xs font-medium text-[var(--text-tertiary)] w-12">To</span>
                          <input value={forwardTo} onChange={e => setForwardTo(e.target.value)} className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none" placeholder="recipient@example.com" />
                        </div>
                      )}
                      <textarea ref={replyRef} value={replyBody} onChange={e => setReplyBody(e.target.value)} rows={6} className="w-full p-4 bg-transparent text-sm text-[var(--text-primary)] outline-none resize-none" placeholder={replyMode === 'reply' ? 'Write your reply...' : 'Add a note (optional)...'} />
                      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
                        <button
                          onClick={() => {
                            if (replyMode === 'reply' && replyBody.trim()) replyMut.mutate({ id: currentMsg.id, body: replyBody });
                            else if (replyMode === 'forward' && forwardTo.trim()) forwardMut.mutate({ id: currentMsg.id, to: forwardTo, note: replyBody || undefined });
                          }}
                          disabled={
                            (replyMode === 'reply' ? !replyBody.trim() || replyMut.isPending : !forwardTo.trim() || forwardMut.isPending)
                          }
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-app)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {replyMut.isPending || forwardMut.isPending ? 'Sending...' : replyMode === 'reply' ? 'Send Reply' : 'Forward'}
                        </button>
                        <button onClick={() => setReplyMode(null)} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">Discard</button>
                      </div>
                    </div>
                  )}

                  {/* Quick action buttons */}
                  {!replyMode && (
                    <div className="mt-4 flex items-center gap-2">
                      <button onClick={() => { setReplyMode('reply'); setReplyBody(''); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors">
                        <Reply className="h-4 w-4" />Reply
                      </button>
                      <button onClick={() => { setReplyMode('forward'); setReplyBody(''); setForwardTo(''); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors">
                        <Forward className="h-4 w-4" />Forward
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
                  <MailPlus className="h-7 w-7 text-[var(--text-tertiary)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">Select a message</h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-xs">Choose a conversation from the left to read, reply, or manage with SARA AI.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: SARA Panel ── */}
        {showSara && (
          <div className="border-l border-[var(--border-subtle)] bg-[var(--bg-surface)]" style={{ width: '280px' }}>
            <SaraPanel
              message={currentMsg}
              stats={saraStats}
              onApprove={(id, editedReply) => approveMut.mutate({ id, editedReply })}
              onDismiss={id => dismissMut.mutate(id)}
              onClassify={id => classifyMut.mutate(id)}
            />
          </div>
        )}
      </div>

      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSend={data => composeMut.mutate(data)}
          sending={composeMut.isPending}
        />
      )}
    </div>
  );
}
