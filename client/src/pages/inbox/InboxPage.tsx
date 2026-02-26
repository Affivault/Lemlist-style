import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inboxApi } from '../../api/inbox.api';
import { smtpApi } from '../../api/smtp.api';
import { templateApi } from '../../api/template.api';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { RichTextEditor, useRichTextEditorRef } from '../../components/ui/RichTextEditor';
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
  Sparkles,
  RefreshCw,
  Pencil,
  Trash2,
  MailPlus,
  ArrowLeft,
  CheckCheck,
  Eye,
  EyeOff,
  ChevronDown,
  AtSign,
  Tag,
  Wand2,
  Loader2,
  Clock,
  Maximize2,
  Minimize2,
  Calendar,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────── */
type Folder = 'inbox' | 'starred' | 'sent' | 'archived';

interface SmtpAccount {
  id: string;
  email_address: string;
  label?: string;
  is_active: boolean;
  is_verified: boolean;
}

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
  smtp_account_id?: string | null;
  smtp_email?: string | null;
  smtp_label?: string | null;
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
  meeting: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Meeting Booked' },
  objection: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Objection' },
  not_now: { bg: 'bg-slate-500/10', text: 'text-slate-500', label: 'Not Interested' },
  unsubscribe: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Unsubscribe' },
  out_of_office: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Out of Office' },
  bounce: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Bounce' },
  other: { bg: 'bg-slate-500/10', text: 'text-slate-500', label: 'Other' },
};

const TAG_OPTIONS = [
  { value: 'all', label: 'All Tags' },
  { value: 'interested', label: 'Interested' },
  { value: 'meeting', label: 'Meeting Booked' },
  { value: 'not_now', label: 'Not Interested' },
  { value: 'objection', label: 'Objection' },
  { value: 'out_of_office', label: 'Out of Office' },
  { value: 'unsubscribe', label: 'Unsubscribe' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'other', label: 'Other' },
];

/* ─── Email HTML Renderer (sandboxed iframe) ──────── */
function EmailBody({ html, text }: { html: string | null; text: string | null }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200);

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

/* ─── Sender Dropdown ─────────────────────────────── */
function SenderSelect({ accounts, value, onChange }: {
  accounts: SmtpAccount[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (accounts.length === 0) {
    return (
      <div className="text-xs text-[var(--error)]">No SMTP accounts configured</div>
    );
  }
  if (accounts.length === 1) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
        <AtSign className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
        <span>{accounts[0].label || accounts[0].email_address}</span>
        <span className="text-xs text-[var(--text-tertiary)]">&lt;{accounts[0].email_address}&gt;</span>
      </div>
    );
  }
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-transparent text-sm text-[var(--text-primary)] outline-none pr-6 cursor-pointer w-full"
      >
        {accounts.map(a => (
          <option key={a.id} value={a.id}>
            {a.label ? `${a.label} (${a.email_address})` : a.email_address}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)] pointer-events-none" />
    </div>
  );
}

/* ─── Compose Modal ───────────────────────────────── */
function ComposeModal({ onClose, onSend, onSchedule, sending, smtpAccounts, templates }: {
  onClose: () => void;
  onSend: (data: { to: string; subject: string; body: string; body_html?: string; smtp_account_id?: string }) => void;
  onSchedule: (data: { to: string; subject: string; body: string; body_html?: string; smtp_account_id?: string; scheduled_at: string }) => void;
  sending?: boolean;
  smtpAccounts: SmtpAccount[];
  templates?: { id: string; name: string; subject: string; body_html: string }[];
}) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [senderId, setSenderId] = useState(smtpAccounts[0]?.id || '');
  const [expanded, setExpanded] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const editor = useRichTextEditorRef();

  const canSend = to && subject && !editor.isEmpty && !sending && smtpAccounts.length > 0;

  const handleSchedule = (scheduledAt: string) => {
    if (to && subject && !editor.isEmpty) {
      onSchedule({ to, subject, body: editor.text, body_html: editor.html, smtp_account_id: senderId || undefined, scheduled_at: scheduledAt });
      setShowSchedule(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex ${expanded ? 'items-center justify-center' : 'items-end justify-end'} p-6`}>
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div
        className={`relative bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-2xl flex flex-col transition-all duration-200 ${
          expanded ? 'w-[800px] max-h-[80vh]' : 'w-[620px] max-h-[85vh]'
        }`}
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] rounded-t-xl">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">New Message</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              title={expanded ? 'Minimize' : 'Expand'}
            >
              {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="border-b border-[var(--border-subtle)]">
          <div className="flex items-center px-4 py-2 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-medium text-[var(--text-tertiary)] w-12">From</span>
            <SenderSelect accounts={smtpAccounts} value={senderId} onChange={setSenderId} />
          </div>
          <div className="flex items-center px-4 py-2 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-medium text-[var(--text-tertiary)] w-12">To</span>
            <input value={to} onChange={e => setTo(e.target.value)} className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none" placeholder="recipient@example.com" />
          </div>
          <div className="flex items-center px-4 py-2">
            <span className="text-xs font-medium text-[var(--text-tertiary)] w-12">Subject</span>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none" placeholder="Subject" />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <RichTextEditor
            placeholder="Write your message..."
            onChange={editor.handleChange}
            onTemplateSelect={(t) => { if (t.subject) setSubject(t.subject); }}
            templates={templates}
            minHeight={expanded ? '300px' : '200px'}
            autoFocus
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (canSend) {
                  onSend({ to, subject, body: editor.text, body_html: editor.html, smtp_account_id: senderId || undefined });
                }
              }}
              disabled={!canSend}
              className="flex items-center gap-2 px-4 py-2 rounded-l-lg bg-[var(--text-primary)] text-[var(--bg-app)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? 'Sending...' : 'Send'}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                disabled={!canSend}
                className="flex items-center gap-1 px-2 py-2 rounded-r-lg bg-[var(--text-primary)] text-[var(--bg-app)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 border-l border-[var(--bg-app)]/20"
                title="Schedule send"
              >
                <Clock className="h-3.5 w-3.5" />
                <ChevronDown className="h-3 w-3" />
              </button>
              {showSchedule && <ScheduleSendPicker onSchedule={handleSchedule} onClose={() => setShowSchedule(false)} />}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── AI Reply Assist Bar ─────────────────────────── */
function AiAssistBar({ messageId, onInsert }: { messageId: string; onInsert: (html: string) => void }) {
  const [prompt, setPrompt] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const aiMut = useMutation({
    mutationFn: ({ id, prompt }: { id: string; prompt: string }) => inboxApi.aiReplyAssist(id, prompt),
    onSuccess: (data) => {
      onInsert(data.html);
      setPrompt('');
      setIsOpen(false);
      toast.success('AI reply generated');
    },
    onError: () => toast.error('Failed to generate AI reply'),
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"
      >
        <Wand2 className="h-3.5 w-3.5" />
        AI Assist
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--accent)]/5">
      <Wand2 className="h-4 w-4 text-[var(--accent)] flex-shrink-0" />
      <input
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && prompt.trim() && !aiMut.isPending) {
            aiMut.mutate({ id: messageId, prompt: prompt.trim() });
          }
          if (e.key === 'Escape') setIsOpen(false);
        }}
        placeholder="Describe your reply... e.g. 'Accept the meeting' or 'Politely decline'"
        className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
        autoFocus
      />
      <button
        onClick={() => {
          if (prompt.trim() && !aiMut.isPending) {
            aiMut.mutate({ id: messageId, prompt: prompt.trim() });
          }
        }}
        disabled={!prompt.trim() || aiMut.isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {aiMut.isPending ? (
          <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
        ) : (
          <><Sparkles className="h-3 w-3" /> Generate</>
        )}
      </button>
      <button
        onClick={() => setIsOpen(false)}
        className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Schedule Send Picker ────────────────────────── */
function ScheduleSendPicker({ onSchedule, onClose }: { onSchedule: (date: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('09:00');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const presets = useMemo(() => {
    const now = new Date();
    const today = new Date(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonday = new Date(now);
    nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));

    const fmt = (d: Date, h: number, m: number) => {
      const dt = new Date(d);
      dt.setHours(h, m, 0, 0);
      return dt;
    };

    const items: { label: string; sublabel: string; date: Date }[] = [];

    // Tomorrow morning
    const tomMorn = fmt(tomorrow, 8, 0);
    items.push({
      label: 'Tomorrow morning',
      sublabel: tomMorn.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ', 8:00 AM',
      date: tomMorn,
    });

    // Tomorrow afternoon
    const tomAfter = fmt(tomorrow, 13, 0);
    items.push({
      label: 'Tomorrow afternoon',
      sublabel: tomAfter.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ', 1:00 PM',
      date: tomAfter,
    });

    // Next Monday morning (if not already Monday)
    if (now.getDay() !== 1) {
      const monMorn = fmt(nextMonday, 8, 0);
      items.push({
        label: 'Monday morning',
        sublabel: monMorn.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ', 8:00 AM',
        date: monMorn,
      });
    }

    return items;
  }, []);

  const handleCustomSchedule = () => {
    if (!customDate) return;
    const dt = new Date(`${customDate}T${customTime}:00`);
    if (dt <= new Date()) return;
    onSchedule(dt.toISOString());
  };

  return (
    <div ref={ref} className="absolute bottom-full left-0 mb-2 w-72 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="px-3 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <p className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
          Schedule Send
        </p>
      </div>

      {/* Presets */}
      <div className="py-1">
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => onSchedule(p.date.toISOString())}
            className="w-full text-left px-3 py-2 hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-between"
          >
            <span className="text-sm text-[var(--text-primary)]">{p.label}</span>
            <span className="text-[11px] text-[var(--text-tertiary)]">{p.sublabel}</span>
          </button>
        ))}
      </div>

      {/* Custom picker */}
      <div className="px-3 py-3 border-t border-[var(--border-subtle)]">
        <p className="text-[11px] font-medium text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">Pick date & time</p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setCustomDate(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          />
          <input
            type="time"
            value={customTime}
            onChange={e => setCustomTime(e.target.value)}
            className="w-24 px-2 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          />
        </div>
        <button
          onClick={handleCustomSchedule}
          disabled={!customDate}
          className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          <Calendar className="h-3 w-3" />
          Schedule
        </button>
      </div>
    </div>
  );
}

/* ─── Tag Filter Dropdown ─────────────────────────── */
function TagFilterDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = TAG_OPTIONS.find(t => t.value === value) || TAG_OPTIONS[0];
  const intentColor = value !== 'all' ? INTENT_COLORS[value] : null;

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
          value !== 'all'
            ? `${intentColor?.bg || 'bg-[var(--bg-elevated)]'} ${intentColor?.text || 'text-[var(--text-primary)]'}`
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
        }`}
      >
        <Tag className="h-3 w-3" />
        {selected.label}
        <ChevronDown className="h-2.5 w-2.5" />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-44 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-lg overflow-hidden z-50">
          {TAG_OPTIONS.map(opt => {
            const ic = opt.value !== 'all' ? INTENT_COLORS[opt.value] : null;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${
                  value === opt.value ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {ic && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'currentColor' }} />}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main InboxPage ──────────────────────────────── */
export function InboxPage() {
  const qc = useQueryClient();
  const [folder, setFolder] = useState<Folder>('inbox');
  const [tagFilter, setTagFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyMode, setReplyMode] = useState<'reply' | 'forward' | null>(null);
  const [forwardTo, setForwardTo] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replySenderId, setReplySenderId] = useState('');
  const [showReplySchedule, setShowReplySchedule] = useState(false);
  const replyEditor = useRichTextEditorRef();

  /* ── SMTP accounts for sender selection ── */
  const { data: smtpAccountsRaw } = useQuery({
    queryKey: ['smtp-accounts'],
    queryFn: smtpApi.list,
  });
  const smtpAccounts: SmtpAccount[] = (smtpAccountsRaw || []).filter((a: any) => a.is_active);

  /* ── Email templates for insertion ── */
  const { data: emailTemplates } = useQuery({
    queryKey: ['templates', 'emails'],
    queryFn: () => templateApi.listEmails(),
  });
  const templates = (emailTemplates || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    subject: t.subject,
    body_html: t.body_html,
  }));

  /* ── Queries ── */
  const { data: messagesData, isLoading, isFetching } = useQuery({
    queryKey: ['inbox', folder, tagFilter, search],
    queryFn: () => inboxApi.list({
      limit: 50,
      folder,
      sara_intent: tagFilter !== 'all' ? tagFilter : undefined,
      search: search || undefined,
    }),
  });

  const messages: Message[] = Array.isArray(messagesData?.data) ? messagesData.data : [];

  const { data: selectedMsg } = useQuery({
    queryKey: ['inbox', 'detail', selectedId],
    queryFn: () => inboxApi.get(selectedId!),
    enabled: !!selectedId,
  });

  /* ── Thread / conversation history ── */
  const { data: threadMessages } = useQuery({
    queryKey: ['inbox', 'thread', selectedId],
    queryFn: () => inboxApi.getThread(selectedId!),
    enabled: !!selectedId,
  });
  const thread: Message[] = Array.isArray(threadMessages) ? threadMessages : [];

  /* ── Invalidation ── */
  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['inbox'] });
  }, [qc]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['inbox'] });
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
      const prevList = qc.getQueryData(['inbox', folder, tagFilter, search]);
      qc.setQueryData(['inbox', folder, tagFilter, search], (old: any) => {
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
      if (context?.prevList) qc.setQueryData(['inbox', folder, tagFilter, search], context.prevList);
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
    mutationFn: ({ id, body, smtp_account_id, body_html }: { id: string; body: string; smtp_account_id?: string; body_html?: string }) => inboxApi.reply(id, body, smtp_account_id, body_html),
    onSuccess: () => { invalidate(); setReplyMode(null); setReplySenderId(''); toast.success('Reply sent'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to send reply'),
  });

  const forwardMut = useMutation({
    mutationFn: ({ id, to, note, smtp_account_id, body_html }: { id: string; to: string; note?: string; smtp_account_id?: string; body_html?: string }) => inboxApi.forward(id, to, note, smtp_account_id, body_html),
    onSuccess: () => { invalidate(); setReplyMode(null); setForwardTo(''); setReplySenderId(''); toast.success('Forwarded'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to forward'),
  });

  const composeMut = useMutation({
    mutationFn: inboxApi.compose,
    onSuccess: () => { invalidate(); setShowCompose(false); toast.success('Message sent'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to send — check your SMTP accounts'),
  });

  const scheduleComposeMut = useMutation({
    mutationFn: inboxApi.scheduleSend,
    onSuccess: (data) => {
      invalidate();
      setShowCompose(false);
      const dt = new Date(data.scheduled_at);
      toast.success(`Email scheduled for ${dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to schedule email'),
  });

  const scheduleReplyMut = useMutation({
    mutationFn: ({ id, body, scheduled_at, smtp_account_id, body_html }: { id: string; body: string; scheduled_at: string; smtp_account_id?: string; body_html?: string }) =>
      inboxApi.scheduleReply(id, body, scheduled_at, smtp_account_id, body_html),
    onSuccess: (data) => {
      invalidate();
      setReplyMode(null);
      setReplySenderId('');
      const dt = new Date(data.scheduled_at);
      toast.success(`Reply scheduled for ${dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to schedule reply'),
  });

  /* ── Handlers ── */
  const selectMessage = useCallback((msg: Message) => {
    setSelectedId(msg.id);
    setReplyMode(null);
    setReplySenderId(msg.smtp_account_id || smtpAccounts[0]?.id || '');
    if (!msg.is_read) markReadMut.mutate(msg.id);
  }, [markReadMut, smtpAccounts]);

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

  // Reset forward to field when switching modes
  useEffect(() => {
    if (!replyMode) setForwardTo('');
  }, [replyMode]);

  const currentMsg: Message | null = (selectedMsg as Message) || messages.find(m => m.id === selectedId) || null;
  const unreadCount = messages.filter(m => !m.is_read).length;

  const isInArchived = folder === 'archived';
  const archiveLabel = isInArchived ? 'Move to Inbox' : 'Archive';
  const ArchiveIcon = isInArchived ? ArchiveRestore : Archive;

  const folders: { id: Folder; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCount || undefined },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'sent', label: 'Sent', icon: SendHorizontal },
    { id: 'archived', label: 'Archived', icon: Archive },
  ];

  // Handler to insert AI-generated content into the reply editor
  const handleAiInsert = useCallback((html: string) => {
    // Dispatch a custom event that the RichTextEditor can listen to
    // For now we use a simpler approach - set content via editor ref
    const event = new CustomEvent('ai-reply-insert', { detail: { html } });
    window.dispatchEvent(event);
  }, []);

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
                  onClick={() => { setFolder(f.id); setSelectedId(null); setTagFilter('all'); }}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
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
            <div className="flex-1" />
            <TagFilterDropdown value={tagFilter} onChange={v => { setTagFilter(v); setSelectedId(null); }} />
          </div>

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
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {search ? 'Try a different search term' : tagFilter !== 'all' ? `No messages tagged as "${TAG_OPTIONS.find(t => t.value === tagFilter)?.label}"` : `Your ${folder} is empty`}
                </p>
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
                        <p className="text-[11px] text-[var(--text-tertiary)] truncate">{msgSnippet(msg)}</p>
                        {(msg.smtp_email || msg.sara_intent || msg.campaign_name) && (
                          <div className="flex items-center gap-1 mt-1 overflow-hidden">
                            {msg.smtp_email && !isOutbound && (
                              <span className="text-[9px] font-medium px-1.5 py-px rounded bg-blue-500/8 text-blue-600 truncate max-w-[80px]" title={`Delivered to ${msg.smtp_email}`}>
                                {msg.smtp_label || msg.smtp_email.split('@')[0]}
                              </span>
                            )}
                            {msg.sara_intent && msg.sara_intent !== 'scheduled' && (
                              <span className={`text-[9px] font-semibold px-1.5 py-px rounded truncate max-w-[80px] ${(INTENT_COLORS[msg.sara_intent] || INTENT_COLORS.other).bg} ${(INTENT_COLORS[msg.sara_intent] || INTENT_COLORS.other).text}`}>
                                {(INTENT_COLORS[msg.sara_intent] || INTENT_COLORS.other).label}
                              </span>
                            )}
                            {msg.campaign_name && (
                              <span className="text-[9px] font-medium px-1.5 py-px rounded bg-[var(--bg-elevated)] text-[var(--text-tertiary)] truncate max-w-[80px]">{msg.campaign_name}</span>
                            )}
                          </div>
                        )}
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
                <button onClick={() => { setReplyMode('reply'); setReplySenderId(currentMsg.smtp_account_id || smtpAccounts[0]?.id || ''); }} title="Reply" className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  <Reply className="h-4 w-4" />
                </button>
                <button onClick={() => { setReplyMode('forward'); setForwardTo(''); setReplySenderId(currentMsg.smtp_account_id || smtpAccounts[0]?.id || ''); }} title="Forward" className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
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
              </div>

              {/* Email content */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-6">
                  {/* Conversation header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-1">
                      <h1 className="text-xl font-semibold text-[var(--text-primary)] leading-tight">
                        {currentMsg.contact_name || currentMsg.from_email?.split('@')[0] || 'Conversation'}
                      </h1>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        {thread.length > 1 ? `${thread.length} messages` : '1 message'}
                        {currentMsg.contact_email && ` · ${currentMsg.contact_email}`}
                      </p>
                    </div>
                    {currentMsg.sara_intent && (() => {
                      const intentInfo = INTENT_COLORS[currentMsg.sara_intent] || INTENT_COLORS.other;
                      return (
                        <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${intentInfo.bg} ${intentInfo.text}`}>
                          <Tag className="h-3 w-3" />
                          {intentInfo.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Conversation thread */}
                  <div className="space-y-3">
                    {(thread.length > 0 ? thread : [currentMsg]).map((msg) => {
                      const isOutbound = msg.direction === 'outbound';
                      const isCurrent = msg.id === selectedId;
                      return (
                        <div
                          key={msg.id}
                          id={`msg-${msg.id}`}
                          className={`rounded-xl border overflow-hidden transition-all ${
                            isCurrent
                              ? isOutbound
                                ? 'border-[var(--accent)]/30 bg-[var(--bg-surface)]'
                                : 'border-[var(--accent)]/30 bg-[var(--bg-elevated)]'
                              : isOutbound
                                ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                                : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'
                          }`}
                          style={{ boxShadow: isCurrent ? '0 0 0 1px var(--accent)' : 'var(--shadow-card)' }}
                        >
                          {/* Sender header */}
                          <div className={`flex items-start gap-3 p-4 border-b border-[var(--border-subtle)] ${
                            !isOutbound ? 'bg-[var(--bg-elevated)]' : ''
                          }`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${
                              isOutbound ? 'bg-[var(--accent)]/10 border-[var(--accent)]/20' : 'bg-[var(--bg-surface)] border-[var(--border-default)]'
                            }`}>
                              {isOutbound ? (
                                <SendHorizontal className="h-3.5 w-3.5 text-[var(--accent)]" />
                              ) : (
                                <span className="text-xs font-semibold text-[var(--text-primary)]">{senderInitial(msg)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-[var(--text-primary)]">
                                  {isOutbound ? 'You' : senderName(msg)}
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)]">
                                  &lt;{msg.from_email}&gt;
                                </span>
                                {isOutbound && (
                                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">Sent</span>
                                )}
                                {!isOutbound && (
                                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--text-tertiary)]/10 text-[var(--text-tertiary)]">Received</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-xs text-[var(--text-tertiary)]">to {msg.to_email}</span>
                                {msg.subject && (
                                  <>
                                    <span className="text-xs text-[var(--text-tertiary)]">&middot;</span>
                                    <span className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">{msg.subject}</span>
                                  </>
                                )}
                                {msg.campaign_name && (
                                  <>
                                    <span className="text-xs text-[var(--text-tertiary)]">&middot;</span>
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">{msg.campaign_name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[11px] text-[var(--text-tertiary)]">{formatFullDate(msg.received_at)}</span>
                            </div>
                          </div>

                          {/* Email body */}
                          <div className="p-0">
                            <ErrorBoundary fallback={
                              <div className="p-6 text-sm text-[var(--text-secondary)]">
                                <p>{msg.body_text ? stripHtml(msg.body_text) : '(Unable to render email content)'}</p>
                              </div>
                            }>
                              <EmailBody html={msg.body_html} text={msg.body_text} />
                            </ErrorBoundary>
                          </div>
                        </div>
                      );
                    })}
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
                      {/* Sender selection */}
                      <div className="flex items-center px-4 py-2 border-b border-[var(--border-subtle)]">
                        <span className="text-xs font-medium text-[var(--text-tertiary)] w-12">From</span>
                        <SenderSelect accounts={smtpAccounts} value={replySenderId} onChange={setReplySenderId} />
                      </div>
                      {replyMode === 'forward' && (
                        <div className="flex items-center px-4 py-2 border-b border-[var(--border-subtle)]">
                          <span className="text-xs font-medium text-[var(--text-tertiary)] w-12">To</span>
                          <input value={forwardTo} onChange={e => setForwardTo(e.target.value)} className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none" placeholder="recipient@example.com" />
                        </div>
                      )}
                      <RichTextEditor
                        placeholder={replyMode === 'reply' ? 'Write your reply...' : 'Add a note (optional)...'}
                        onChange={replyEditor.handleChange}
                        templates={templates}
                        minHeight="140px"
                        autoFocus
                      />
                      {/* AI Assist Bar */}
                      {replyMode === 'reply' && (
                        <AiAssistBar
                          messageId={currentMsg.id}
                          onInsert={handleAiInsert}
                        />
                      )}
                      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const sid = replySenderId || undefined;
                              if (replyMode === 'reply' && !replyEditor.isEmpty) replyMut.mutate({ id: currentMsg.id, body: replyEditor.text, body_html: replyEditor.html, smtp_account_id: sid });
                              else if (replyMode === 'forward' && forwardTo.trim()) forwardMut.mutate({ id: currentMsg.id, to: forwardTo, note: replyEditor.text || undefined, body_html: replyEditor.html || undefined, smtp_account_id: sid });
                            }}
                            disabled={
                              (replyMode === 'reply' ? replyEditor.isEmpty || replyMut.isPending : !forwardTo.trim() || forwardMut.isPending)
                            }
                            className="flex items-center gap-2 px-4 py-2 rounded-l-lg bg-[var(--text-primary)] text-[var(--bg-app)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                          >
                            <Send className="h-3.5 w-3.5" />
                            {replyMut.isPending || forwardMut.isPending ? 'Sending...' : replyMode === 'reply' ? 'Send Reply' : 'Forward'}
                          </button>
                          {replyMode === 'reply' && (
                            <div className="relative">
                              <button
                                onClick={() => setShowReplySchedule(!showReplySchedule)}
                                disabled={replyEditor.isEmpty || replyMut.isPending}
                                className="flex items-center gap-1 px-2 py-2 rounded-r-lg bg-[var(--text-primary)] text-[var(--bg-app)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 border-l border-[var(--bg-app)]/20"
                                title="Schedule send"
                              >
                                <Clock className="h-3.5 w-3.5" />
                                <ChevronDown className="h-3 w-3" />
                              </button>
                              {showReplySchedule && (
                                <ScheduleSendPicker
                                  onSchedule={(scheduledAt) => {
                                    const sid = replySenderId || undefined;
                                    scheduleReplyMut.mutate({ id: currentMsg.id, body: replyEditor.text, body_html: replyEditor.html, smtp_account_id: sid, scheduled_at: scheduledAt });
                                    setShowReplySchedule(false);
                                  }}
                                  onClose={() => setShowReplySchedule(false)}
                                />
                              )}
                            </div>
                          )}
                        </div>
                        <button onClick={() => setReplyMode(null)} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">Discard</button>
                      </div>
                    </div>
                  )}

                  {/* Quick action buttons */}
                  {!replyMode && (
                    <div className="mt-4 flex items-center gap-2">
                      <button onClick={() => { setReplyMode('reply'); setReplySenderId(currentMsg.smtp_account_id || smtpAccounts[0]?.id || ''); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors">
                        <Reply className="h-4 w-4" />Reply
                      </button>
                      <button onClick={() => { setReplyMode('forward'); setForwardTo(''); setReplySenderId(currentMsg.smtp_account_id || smtpAccounts[0]?.id || ''); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors">
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
                <p className="text-sm text-[var(--text-secondary)] max-w-xs">Choose a conversation from the left to read and reply.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSend={data => composeMut.mutate(data)}
          onSchedule={data => scheduleComposeMut.mutate(data)}
          sending={composeMut.isPending || scheduleComposeMut.isPending}
          smtpAccounts={smtpAccounts}
          templates={templates}
        />
      )}
    </div>
  );
}
