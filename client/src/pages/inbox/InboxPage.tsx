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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn, formatDateTime } from '../../lib/utils';
import toast from 'react-hot-toast';
import type { InboxMessageWithContext } from '@lemlist/shared';

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Bot }> = {
  interested: { label: 'Interested', color: 'text-[var(--success)]', bg: 'bg-[var(--success-bg)] border-[var(--success)]/20', icon: TrendingUp },
  meeting: { label: 'Meeting', color: 'text-[var(--info)]', bg: 'bg-[var(--info-bg)] border-[var(--info)]/20', icon: Users },
  objection: { label: 'Objection', color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-bg)] border-[var(--warning)]/20', icon: AlertTriangle },
  not_now: { label: 'Not Now', color: 'text-[var(--text-secondary)]', bg: 'bg-[var(--bg-elevated)] border-[var(--border-subtle)]', icon: Clock },
  unsubscribe: { label: 'Unsubscribe', color: 'text-[var(--error)]', bg: 'bg-[var(--error-bg)] border-[var(--error)]/20', icon: XCircle },
  out_of_office: { label: 'Out of Office', color: 'text-[var(--text-secondary)]', bg: 'bg-[var(--bg-elevated)] border-[var(--border-subtle)]', icon: Clock },
  bounce: { label: 'Bounce', color: 'text-[var(--error)]', bg: 'bg-[var(--error-bg)] border-[var(--error)]/20', icon: AlertTriangle },
  other: { label: 'Other', color: 'text-[var(--text-secondary)]', bg: 'bg-[var(--bg-elevated)] border-[var(--border-subtle)]', icon: MessageSquare },
};

const ACTION_LABELS: Record<string, { label: string; icon: typeof Bot }> = {
  reply: { label: 'Approve & Send', icon: Send },
  unsubscribe: { label: 'Confirm Unsubscribe', icon: XCircle },
  stop_sequence: { label: 'Stop Sequence', icon: AlertTriangle },
  archive: { label: 'Archive', icon: CheckCircle2 },
  escalate: { label: 'Needs Review', icon: AlertTriangle },
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
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-lg text-[var(--text-primary)]">Unified Inbox</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {saraStats?.pending_review ? (
              <>
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-xs font-semibold px-1.5 mr-1.5">
                  {saraStats.pending_review}
                </span>
                replies need your action
              </>
            ) : (
              'All replies in one place'
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Segmented Control */}
          <div className="flex items-center rounded-lg bg-[var(--bg-elevated)] p-1 gap-0.5">
            <button
              onClick={() => setViewMode('action_cards')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-all duration-200',
                viewMode === 'action_cards'
                  ? 'bg-[var(--brand)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              )}
            >
              <Bot className="h-3.5 w-3.5" />
              Actions
            </button>
            <button
              onClick={() => setViewMode('classic')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-all duration-200',
                viewMode === 'classic'
                  ? 'bg-[var(--brand)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              )}
            >
              <Mail className="h-3.5 w-3.5" />
              Classic
            </button>
          </div>
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="btn-secondary flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-all duration-200"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-subtle)]">
        {([
          { value: 'all', label: 'All Messages' },
          { value: 'unread', label: 'Unread' },
          { value: 'needs_action', label: 'Needs Action', count: saraStats?.pending_review },
        ] as const).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 -mb-px',
              filter === tab.value
                ? 'border-[var(--brand)] text-[var(--brand)]'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-subtle)]'
            )}
          >
            {tab.label}
            {'count' in tab && tab.count ? (
              <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-[11px] font-semibold px-1.5">
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--brand)]" />
            <span className="text-sm text-[var(--text-tertiary)]">Loading messages...</span>
          </div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)]">
          <div className="w-14 h-14 rounded-xl bg-[var(--brand-subtle)] flex items-center justify-center mb-4">
            <Inbox className="h-7 w-7 text-[var(--brand)]" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">No messages</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-xs">
            {filter === 'needs_action' ? 'No replies need your attention right now.' : 'Replies from your campaigns will appear here.'}
          </p>
        </div>
      ) : viewMode === 'action_cards' ? (
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
                  'rounded-xl border overflow-hidden transition-all duration-200 shadow-card',
                  !msg.is_read
                    ? 'bg-[var(--bg-surface)] border-[var(--border-default)] shadow-card-hover'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:shadow-card-hover'
                )}
              >
                {/* Card Header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer group"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : msg.id);
                    if (!msg.is_read) markReadMutation.mutate(msg.id);
                  }}
                >
                  {!msg.is_read && <div className="h-2.5 w-2.5 rounded-full bg-[var(--brand)] shrink-0 ring-4 ring-[var(--brand-subtle)]" />}

                  {intentConfig ? (
                    <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shrink-0', intentConfig.bg)}>
                      <IntentIcon className={cn('h-3.5 w-3.5', intentConfig.color)} />
                      <span className={intentConfig.color}>{intentConfig.label}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] shrink-0">
                      <Mail className="h-3.5 w-3.5" />
                      Unclassified
                    </div>
                  )}

                  {msg.sara_confidence && (
                    <div className="flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5">
                      <Zap className="h-3 w-3 text-[var(--warning)]" />
                      <span className="text-[11px] font-medium text-[var(--text-tertiary)]">{((msg.sara_confidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm truncate', !msg.is_read ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>
                        {msg.contact_name || msg.from_email}
                      </span>
                      {msg.campaign_name && (
                        <span className="text-[10px] font-medium text-[var(--text-tertiary)] bg-[var(--bg-elevated)] rounded-full px-2 py-0.5 border border-[var(--border-subtle)]">
                          {msg.campaign_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{msg.subject || '(No subject)'}</p>
                  </div>

                  {actionConfig && msg.sara_status === 'pending_review' && (
                    <span className="text-[10px] font-semibold text-[var(--brand)] bg-[var(--brand-subtle)] border border-[var(--brand)]/20 rounded-full px-2.5 py-1 shrink-0">
                      {actionConfig.label}
                    </span>
                  )}

                  <span className="text-xs text-[var(--text-tertiary)] shrink-0 tabular-nums">{formatDateTime(msg.received_at)}</span>
                  <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center group-hover:bg-[var(--bg-elevated)] transition-colors">
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-[var(--text-secondary)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[var(--border-subtle)] px-5 py-5 space-y-5">
                    {/* Reply Section */}
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-2.5">Reply</h4>
                      <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 text-sm text-[var(--text-secondary)] whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed">
                        {msg.body_text || msg.body_html || '(empty)'}
                      </div>
                    </div>

                    {/* SARA Suggested Reply */}
                    {hasSara && msg.sara_draft_reply && (
                      <div className="relative rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                        {/* Gradient accent bar */}
                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--brand)] to-[var(--brand)]/40" />
                        <div className="pl-5 pr-4 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[var(--brand-subtle)]">
                              <Bot className="h-3.5 w-3.5 text-[var(--brand)]" />
                            </div>
                            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">SARA Suggested Reply</h4>
                          </div>
                          {isEditing ? (
                            <textarea
                              value={editedReply}
                              onChange={(e) => setEditedReply(e.target.value)}
                              rows={5}
                              className="w-full rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] p-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] resize-none transition-all leading-relaxed"
                            />
                          ) : (
                            <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                              {msg.sara_draft_reply}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Classify Button */}
                    {!hasSara && (
                      <button
                        onClick={() => classifyMutation.mutate(msg.id)}
                        disabled={classifyMutation.isPending}
                        className="flex items-center gap-2 rounded-lg bg-[var(--brand-subtle)] border border-[var(--brand)]/20 px-4 py-2.5 text-sm font-medium text-[var(--brand)] hover:bg-[var(--brand)]/15 transition-all duration-200 disabled:opacity-50"
                      >
                        <Bot className="h-4 w-4" />
                        Classify with SARA
                      </button>
                    )}

                    {/* Action Buttons */}
                    {hasSara && msg.sara_status === 'pending_review' && (
                      <div className="flex items-center gap-2.5 pt-1">
                        {msg.sara_action === 'reply' && msg.sara_draft_reply && (
                          <>
                            <button
                              onClick={() => {
                                if (isEditing) approveMutation.mutate({ id: msg.id, reply: editedReply });
                                else approveMutation.mutate({ id: msg.id });
                              }}
                              disabled={approveMutation.isPending}
                              className="btn-brand flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                            >
                              <Send className="h-4 w-4" />
                              {isEditing ? 'Send Edited Reply' : 'Approve & Send'}
                            </button>
                            {!isEditing && (
                              <button
                                onClick={() => { setEditingId(msg.id); setEditedReply(msg.sara_draft_reply || ''); }}
                                className="btn-secondary flex items-center gap-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)] transition-all duration-200"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit
                              </button>
                            )}
                            {isEditing && (
                              <button
                                onClick={() => { setEditingId(null); setEditedReply(''); }}
                                className="btn-secondary flex items-center gap-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)] transition-all duration-200"
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
                            className="flex items-center gap-2 rounded-lg bg-[var(--warning)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 shadow-sm transition-all duration-200 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            {msg.sara_action === 'unsubscribe' ? 'Confirm Unsubscribe' : 'Confirm Stop'}
                          </button>
                        )}
                        {msg.sara_action === 'archive' && (
                          <button
                            onClick={() => approveMutation.mutate({ id: msg.id })}
                            className="btn-secondary flex items-center gap-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)] transition-all duration-200"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => dismissMutation.mutate(msg.id)}
                          disabled={dismissMutation.isPending}
                          className="flex items-center gap-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--error-bg)] hover:text-[var(--error)] hover:border-[var(--error)]/20 transition-all duration-200 ml-auto disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Dismiss
                        </button>
                      </div>
                    )}

                    {/* Completed Status */}
                    {hasSara && msg.sara_status && msg.sara_status !== 'pending_review' && (
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <div className="flex items-center gap-1.5 rounded-full bg-[var(--success-bg)] border border-[var(--success)]/20 px-2.5 py-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                          <span className="text-[var(--success)] font-medium capitalize">{msg.sara_status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Classic View */
        <div className="flex gap-4" style={{ height: 'calc(100vh - 260px)' }}>
          {/* Message List Panel */}
          <div className="w-1/3 overflow-y-auto rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-card">
            {filteredMessages.map((msg: any) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelectedId(msg.id);
                  if (!msg.is_read) markReadMutation.mutate(msg.id);
                }}
                className={cn(
                  'w-full border-b border-[var(--border-subtle)] px-4 py-3.5 text-left transition-all duration-200 hover:bg-[var(--bg-hover)]',
                  selectedId === msg.id ? 'bg-[var(--brand-subtle)] border-l-2 border-l-[var(--brand)]' : '',
                  !msg.is_read && selectedId !== msg.id ? 'bg-[var(--bg-elevated)]' : ''
                )}
              >
                <div className="flex items-center gap-2.5">
                  {!msg.is_read ? (
                    <div className="relative shrink-0">
                      <Mail className="h-4 w-4 text-[var(--brand)]" />
                      <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--brand)]" />
                    </div>
                  ) : (
                    <MailOpen className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
                  )}
                  <span className={cn('truncate text-sm', !msg.is_read ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>
                    {msg.contact_name || msg.from_email}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--text-tertiary)] pl-6.5">{msg.subject || '(No subject)'}</p>
                <div className="mt-1.5 flex items-center gap-2 pl-6.5">
                  <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums">{formatDateTime(msg.received_at)}</span>
                  {msg.sara_intent && (
                    <span className={cn('text-[10px] font-medium rounded-full px-2 py-0.5 border', (INTENT_CONFIG[msg.sara_intent] || INTENT_CONFIG.other).bg, (INTENT_CONFIG[msg.sara_intent] || INTENT_CONFIG.other).color)}>
                      {(INTENT_CONFIG[msg.sara_intent] || INTENT_CONFIG.other).label}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Message Detail Panel */}
          <div className="flex-1 overflow-y-auto rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-card">
            {selectedMessage ? (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">{selectedMessage.subject || '(No subject)'}</h2>
                <div className="mt-3 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-subtle)] flex items-center justify-center">
                      <span className="text-xs font-semibold text-[var(--brand)]">
                        {(selectedMessage.from_email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-[var(--text-primary)]">{selectedMessage.from_email}</span>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)] tabular-nums ml-auto">{formatDateTime(selectedMessage.received_at)}</span>
                </div>
                <hr className="my-5 border-[var(--border-subtle)]" />
                <div className="prose max-w-none">
                  {selectedMessage.body_html ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
                      {selectedMessage.body_text || 'No content'}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
                    <Mail className="h-6 w-6 text-[var(--text-tertiary)]" />
                  </div>
                  <p className="text-sm text-[var(--text-tertiary)]">Select a message to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
