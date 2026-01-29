import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inboxApi } from '../../api/inbox.api';
import { saraApi } from '../../api/sara.api';
import {
  Inbox,
  Mail,
  MailOpen,
  CheckCheck,
  Bot,
  CheckCircle2,
  XCircle,
  Edit3,
  Send,
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  MessageSquare,
  Zap,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { cn, formatDateTime } from '../../lib/utils';
import toast from 'react-hot-toast';
import type { InboxMessageWithContext } from '@lemlist/shared';

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Bot }> = {
  interested: { label: 'Interested', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: TrendingUp },
  meeting: { label: 'Meeting', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Users },
  objection: { label: 'Objection', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
  not_now: { label: 'Not Now', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: Clock },
  unsubscribe: { label: 'Unsubscribe', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
  out_of_office: { label: 'Out of Office', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: Clock },
  bounce: { label: 'Bounce', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: AlertTriangle },
  other: { label: 'Other', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: MessageSquare },
};

const ACTION_LABELS: Record<string, { label: string; icon: typeof Bot }> = {
  reply: { label: 'Approve & Send', icon: Send },
  unsubscribe: { label: 'Confirm Unsubscribe', icon: XCircle },
  stop_sequence: { label: 'Stop Sequence', icon: AlertTriangle },
  archive: { label: 'Archive', icon: CheckCircle2 },
  escalate: { label: 'Needs Review', icon: Sparkles },
};

type ViewMode = 'action_cards' | 'classic';
type FilterTab = 'all' | 'unread' | 'needs_action';

export function InboxPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('action_cards');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedReply, setEditedReply] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inbox', filter],
    queryFn: () => inboxApi.list({ is_read: filter === 'unread' ? false : undefined }),
  });

  const { data: selectedMessage } = useQuery({
    queryKey: ['inbox-detail', selectedId],
    queryFn: () => inboxApi.get(selectedId!),
    enabled: !!selectedId && viewMode === 'classic',
  });

  const { data: saraStats } = useQuery({
    queryKey: ['sara-stats'],
    queryFn: saraApi.getStats,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => inboxApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => inboxApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
      toast.success('All marked as read');
    },
  });

  const classifyMutation = useMutation({
    mutationFn: (id: string) => saraApi.classify(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
      queryClient.invalidateQueries({ queryKey: ['sara-stats'] });
      toast.success('Classified by SARA');
    },
    onError: () => toast.error('Classification failed'),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply?: string }) => saraApi.approve(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
      queryClient.invalidateQueries({ queryKey: ['sara-stats'] });
      toast.success('Reply approved & queued');
      setEditingId(null);
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => saraApi.dismiss(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
      queryClient.invalidateQueries({ queryKey: ['sara-stats'] });
      toast.success('Dismissed');
    },
  });

  const messages: InboxMessageWithContext[] = data?.data || [];
  const filteredMessages = filter === 'needs_action'
    ? messages.filter((m: any) => m.sara_status === 'pending_review' && m.sara_intent)
    : messages;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Inbox className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Unified Inbox</h1>
            <p className="text-sm text-slate-400">
              {saraStats?.pending_review ? `${saraStats.pending_review} replies need action` : 'All replies in one place'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg bg-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('action_cards')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                viewMode === 'action_cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Bot className="inline h-3.5 w-3.5 mr-1" />
              Action Cards
            </button>
            <button
              onClick={() => setViewMode('classic')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                viewMode === 'classic'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Mail className="inline h-3.5 w-3.5 mr-1" />
              Classic
            </button>
          </div>
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-0">
        {([
          { value: 'all', label: 'All Messages' },
          { value: 'unread', label: 'Unread' },
          { value: 'needs_action', label: 'Needs Action', count: saraStats?.pending_review },
        ] as const).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
              filter === tab.value
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            {tab.label}
            {tab.count ? (
              <span className="ml-2 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 mb-4">
            <Inbox className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No messages</h3>
          <p className="text-sm text-slate-400">
            {filter === 'needs_action'
              ? 'No replies need your attention right now.'
              : 'Replies from your campaigns will appear here.'}
          </p>
        </div>
      ) : viewMode === 'action_cards' ? (
        /* ========== ACTION CARDS VIEW ========== */
        <div className="space-y-3">
          {filteredMessages.map((msg: any) => {
            const intent = msg.sara_intent;
            const intentConfig = intent ? (INTENT_CONFIG[intent] || INTENT_CONFIG.other) : null;
            const IntentIcon = intentConfig?.icon || MessageSquare;
            const actionConfig = msg.sara_action ? ACTION_LABELS[msg.sara_action] : null;
            const isExpanded = expandedId === msg.id;
            const isEditing = editingId === msg.id;
            const hasSara = !!msg.sara_intent;

            return (
              <div
                key={msg.id}
                className={cn(
                  'rounded-xl border overflow-hidden transition-colors',
                  !msg.is_read
                    ? 'bg-slate-800/70 border-indigo-500/20'
                    : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50'
                )}
              >
                {/* Card Header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : msg.id);
                    if (!msg.is_read) markReadMutation.mutate(msg.id);
                  }}
                >
                  {/* Unread dot */}
                  {!msg.is_read && (
                    <div className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                  )}

                  {/* Intent Badge */}
                  {intentConfig ? (
                    <div className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs shrink-0', intentConfig.bg)}>
                      <IntentIcon className={cn('h-3.5 w-3.5', intentConfig.color)} />
                      <span className={intentConfig.color}>{intentConfig.label}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-600/30 bg-slate-700/30 px-2.5 py-1 text-xs text-slate-400 shrink-0">
                      <Mail className="h-3.5 w-3.5" />
                      Unclassified
                    </div>
                  )}

                  {/* Confidence */}
                  {msg.sara_confidence && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-400" />
                      <span className="text-xs text-slate-400">{((msg.sara_confidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                  )}

                  {/* Contact info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm truncate', !msg.is_read ? 'font-semibold text-white' : 'text-slate-200')}>
                        {msg.contact_name || msg.from_email}
                      </span>
                      {msg.campaign_name && (
                        <span className="text-[10px] text-slate-500 bg-slate-700/50 rounded px-1.5 py-0.5">{msg.campaign_name}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{msg.subject || '(No subject)'}</p>
                  </div>

                  {/* Suggested action badge */}
                  {actionConfig && msg.sara_status === 'pending_review' && (
                    <span className="text-[10px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5 shrink-0">
                      {actionConfig.label}
                    </span>
                  )}

                  {/* Time */}
                  <span className="text-xs text-slate-500 shrink-0">{formatDateTime(msg.received_at)}</span>

                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </div>

                {/* Expanded Card Content */}
                {isExpanded && (
                  <div className="border-t border-slate-700/50 p-4 space-y-4">
                    {/* Original message */}
                    <div>
                      <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Reply</h4>
                      <div className="rounded-lg bg-slate-900/50 border border-slate-700/30 p-3 text-sm text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {msg.body_text || msg.body_html || '(empty)'}
                      </div>
                    </div>

                    {/* SARA section */}
                    {hasSara && msg.sara_draft_reply && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4 text-violet-400" />
                          <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">SARA Suggested Reply</h4>
                        </div>
                        {isEditing ? (
                          <textarea
                            value={editedReply}
                            onChange={(e) => setEditedReply(e.target.value)}
                            rows={5}
                            className="w-full rounded-lg bg-slate-900/50 border border-indigo-500/30 p-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60 resize-none"
                          />
                        ) : (
                          <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-3 text-sm text-slate-300 whitespace-pre-wrap">
                            {msg.sara_draft_reply}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Classify button for unclassified messages */}
                    {!hasSara && (
                      <button
                        onClick={() => classifyMutation.mutate(msg.id)}
                        disabled={classifyMutation.isPending}
                        className="flex items-center gap-2 rounded-lg bg-violet-600/20 border border-violet-500/30 px-4 py-2 text-sm text-violet-300 hover:bg-violet-600/30 transition-colors"
                      >
                        <Bot className="h-4 w-4" />
                        Classify with SARA
                      </button>
                    )}

                    {/* Action buttons for pending review */}
                    {hasSara && msg.sara_status === 'pending_review' && (
                      <div className="flex items-center gap-2 pt-1">
                        {msg.sara_action === 'reply' && msg.sara_draft_reply && (
                          <>
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  approveMutation.mutate({ id: msg.id, reply: editedReply });
                                } else {
                                  approveMutation.mutate({ id: msg.id });
                                }
                              }}
                              disabled={approveMutation.isPending}
                              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-medium text-white hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-sm"
                            >
                              <Send className="h-4 w-4" />
                              {isEditing ? 'Send Edited Reply' : 'Approve & Send'}
                            </button>
                            {!isEditing && (
                              <button
                                onClick={() => { setEditingId(msg.id); setEditedReply(msg.sara_draft_reply || ''); }}
                                className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-600"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit
                              </button>
                            )}
                            {isEditing && (
                              <button
                                onClick={() => { setEditingId(null); setEditedReply(''); }}
                                className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-600"
                              >
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                        {(msg.sara_action === 'unsubscribe' || msg.sara_action === 'stop_sequence') && (
                          <button
                            onClick={() => approveMutation.mutate({ id: msg.id })}
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2 text-sm font-medium text-white hover:from-orange-500 hover:to-orange-400 transition-all"
                          >
                            <XCircle className="h-4 w-4" />
                            {msg.sara_action === 'unsubscribe' ? 'Confirm Unsubscribe' : 'Confirm Stop'}
                          </button>
                        )}
                        {msg.sara_action === 'archive' && (
                          <button
                            onClick={() => approveMutation.mutate({ id: msg.id })}
                            className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-600"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => dismissMutation.mutate(msg.id)}
                          disabled={dismissMutation.isPending}
                          className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-red-600/20 hover:text-red-300 transition-colors ml-auto"
                        >
                          <XCircle className="h-4 w-4" />
                          Dismiss
                        </button>
                      </div>
                    )}

                    {/* Status for already-actioned messages */}
                    {hasSara && msg.sara_status && msg.sara_status !== 'pending_review' && (
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Status: <span className="text-slate-400 capitalize">{msg.sara_status.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ========== CLASSIC TWO-PANE VIEW ========== */
        <div className="flex gap-4" style={{ height: 'calc(100vh - 240px)' }}>
          <div className="w-1/3 overflow-y-auto rounded-xl bg-slate-800/50 border border-slate-700/50">
            {filteredMessages.map((msg: any) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelectedId(msg.id);
                  if (!msg.is_read) markReadMutation.mutate(msg.id);
                }}
                className={cn(
                  'w-full border-b border-slate-700/30 p-4 text-left transition-colors hover:bg-slate-700/30',
                  selectedId === msg.id ? 'bg-indigo-500/10' : '',
                  !msg.is_read ? 'bg-slate-700/20' : ''
                )}
              >
                <div className="flex items-center gap-2">
                  {!msg.is_read ? (
                    <Mail className="h-4 w-4 shrink-0 text-indigo-400" />
                  ) : (
                    <MailOpen className="h-4 w-4 shrink-0 text-slate-500" />
                  )}
                  <span className={cn('truncate text-sm', !msg.is_read ? 'font-semibold text-white' : 'text-slate-300')}>
                    {msg.contact_name || msg.from_email}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-slate-400">{msg.subject || '(No subject)'}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{formatDateTime(msg.received_at)}</span>
                  {msg.sara_intent && (
                    <span className={cn('text-[10px] rounded px-1.5 py-0.5 border', (INTENT_CONFIG[msg.sara_intent] || INTENT_CONFIG.other).bg, (INTENT_CONFIG[msg.sara_intent] || INTENT_CONFIG.other).color)}>
                      {(INTENT_CONFIG[msg.sara_intent] || INTENT_CONFIG.other).label}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
            {selectedMessage ? (
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedMessage.subject || '(No subject)'}</h2>
                <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                  <span>From: {selectedMessage.from_email}</span>
                  <span>{formatDateTime(selectedMessage.received_at)}</span>
                </div>
                <hr className="my-4 border-slate-700/50" />
                <div className="prose prose-invert max-w-none">
                  {selectedMessage.body_html ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-slate-300">{selectedMessage.body_text || 'No content'}</pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                Select a message to read
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
