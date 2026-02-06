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
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Unified Inbox</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {saraStats?.pending_review ? `${saraStats.pending_review} replies need action` : 'All replies in one place'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-0.5">
            <button
              onClick={() => setViewMode('action_cards')}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-medium transition-all',
                viewMode === 'action_cards' ? 'bg-[var(--accent)] text-[var(--bg-app)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <Bot className="inline h-3.5 w-3.5 mr-1" />
              Actions
            </button>
            <button
              onClick={() => setViewMode('classic')}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-medium transition-all',
                viewMode === 'classic' ? 'bg-[var(--accent)] text-[var(--bg-app)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <Mail className="inline h-3.5 w-3.5 mr-1" />
              Classic
            </button>
          </div>
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
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
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
              filter === tab.value ? 'border-[var(--text-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
            {tab.count ? (
              <span className="ml-2 rounded-full bg-[var(--bg-elevated)] text-[var(--text-primary)] px-2 py-0.5 text-xs">{tab.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--text-primary)]" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-[var(--border-subtle)] rounded-lg">
          <div className="w-12 h-12 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center mb-3">
            <Inbox className="h-6 w-6 text-[var(--text-tertiary)]" />
          </div>
          <h3 className="font-medium text-[var(--text-primary)] mb-1">No messages</h3>
          <p className="text-sm text-[var(--text-secondary)]">
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
                  'rounded-lg border overflow-hidden transition-colors',
                  !msg.is_read ? 'bg-[var(--bg-surface)] border-[var(--border-default)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
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
                  {!msg.is_read && <div className="h-2 w-2 rounded-full bg-[var(--text-primary)] shrink-0" />}

                  {intentConfig ? (
                    <div className={cn('flex items-center gap-1.5 rounded border px-2 py-1 text-xs shrink-0', intentConfig.bg)}>
                      <IntentIcon className={cn('h-3.5 w-3.5', intentConfig.color)} />
                      <span className={intentConfig.color}>{intentConfig.label}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text-secondary)] shrink-0">
                      <Mail className="h-3.5 w-3.5" />
                      Unclassified
                    </div>
                  )}

                  {msg.sara_confidence && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-[var(--text-secondary)]" />
                      <span className="text-xs text-[var(--text-tertiary)]">{((msg.sara_confidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm truncate', !msg.is_read ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>
                        {msg.contact_name || msg.from_email}
                      </span>
                      {msg.campaign_name && (
                        <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] rounded px-1.5 py-0.5">{msg.campaign_name}</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{msg.subject || '(No subject)'}</p>
                  </div>

                  {actionConfig && msg.sara_status === 'pending_review' && (
                    <span className="text-[10px] font-medium text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full px-2 py-0.5 shrink-0">
                      {actionConfig.label}
                    </span>
                  )}

                  <span className="text-xs text-[var(--text-tertiary)] shrink-0">{formatDateTime(msg.received_at)}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-[var(--text-secondary)] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-[var(--border-subtle)] p-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Reply</h4>
                      <div className="rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 text-sm text-[var(--text-secondary)] whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {msg.body_text || msg.body_html || '(empty)'}
                      </div>
                    </div>

                    {hasSara && msg.sara_draft_reply && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4 text-[var(--text-primary)]" />
                          <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">SARA Suggested Reply</h4>
                        </div>
                        {isEditing ? (
                          <textarea
                            value={editedReply}
                            onChange={(e) => setEditedReply(e.target.value)}
                            rows={5}
                            className="w-full rounded-md bg-[var(--bg-elevated)] border border-[var(--border-default)] p-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
                          />
                        ) : (
                          <div className="rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                            {msg.sara_draft_reply}
                          </div>
                        )}
                      </div>
                    )}

                    {!hasSara && (
                      <button
                        onClick={() => classifyMutation.mutate(msg.id)}
                        disabled={classifyMutation.isPending}
                        className="flex items-center gap-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-default)] px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <Bot className="h-4 w-4" />
                        Classify with SARA
                      </button>
                    )}

                    {hasSara && msg.sara_status === 'pending_review' && (
                      <div className="flex items-center gap-2 pt-1">
                        {msg.sara_action === 'reply' && msg.sara_draft_reply && (
                          <>
                            <button
                              onClick={() => {
                                if (isEditing) approveMutation.mutate({ id: msg.id, reply: editedReply });
                                else approveMutation.mutate({ id: msg.id });
                              }}
                              disabled={approveMutation.isPending}
                              className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--bg-app)] hover:bg-[var(--accent-hover)] transition-colors"
                            >
                              <Send className="h-4 w-4" />
                              {isEditing ? 'Send Edited Reply' : 'Approve & Send'}
                            </button>
                            {!isEditing && (
                              <button
                                onClick={() => { setEditingId(msg.id); setEditedReply(msg.sara_draft_reply || ''); }}
                                className="flex items-center gap-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit
                              </button>
                            )}
                            {isEditing && (
                              <button onClick={() => { setEditingId(null); setEditedReply(''); }} className="flex items-center gap-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                        {(msg.sara_action === 'unsubscribe' || msg.sara_action === 'stop_sequence') && (
                          <button
                            onClick={() => approveMutation.mutate({ id: msg.id })}
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-2 rounded-md bg-[var(--warning)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            {msg.sara_action === 'unsubscribe' ? 'Confirm Unsubscribe' : 'Confirm Stop'}
                          </button>
                        )}
                        {msg.sara_action === 'archive' && (
                          <button onClick={() => approveMutation.mutate({ id: msg.id })} className="flex items-center gap-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <CheckCircle2 className="h-4 w-4" />
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => dismissMutation.mutate(msg.id)}
                          disabled={dismissMutation.isPending}
                          className="flex items-center gap-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--error-bg)] hover:text-[var(--error)] transition-colors ml-auto"
                        >
                          <XCircle className="h-4 w-4" />
                          Dismiss
                        </button>
                      </div>
                    )}

                    {hasSara && msg.sara_status && msg.sara_status !== 'pending_review' && (
                      <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Status: <span className="text-[var(--text-secondary)] capitalize">{msg.sara_status.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-4" style={{ height: 'calc(100vh - 240px)' }}>
          <div className="w-1/3 overflow-y-auto rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            {filteredMessages.map((msg: any) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelectedId(msg.id);
                  if (!msg.is_read) markReadMutation.mutate(msg.id);
                }}
                className={cn(
                  'w-full border-b border-[var(--border-subtle)] p-4 text-left transition-colors hover:bg-[var(--bg-hover)]',
                  selectedId === msg.id ? 'bg-[var(--bg-elevated)]' : '',
                  !msg.is_read ? 'bg-[var(--bg-elevated)]' : ''
                )}
              >
                <div className="flex items-center gap-2">
                  {!msg.is_read ? <Mail className="h-4 w-4 shrink-0 text-[var(--text-primary)]" /> : <MailOpen className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />}
                  <span className={cn('truncate text-sm', !msg.is_read ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>
                    {msg.contact_name || msg.from_email}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--text-tertiary)]">{msg.subject || '(No subject)'}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-tertiary)]">{formatDateTime(msg.received_at)}</span>
                  {msg.sara_intent && (
                    <span className={cn('text-[10px] rounded px-1.5 py-0.5 border', (INTENT_CONFIG[msg.sara_intent] || INTENT_CONFIG.other).bg, (INTENT_CONFIG[msg.sara_intent] || INTENT_CONFIG.other).color)}>
                      {(INTENT_CONFIG[msg.sara_intent] || INTENT_CONFIG.other).label}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6">
            {selectedMessage ? (
              <div>
                <h2 className="font-medium text-[var(--text-primary)]">{selectedMessage.subject || '(No subject)'}</h2>
                <div className="mt-2 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                  <span>From: {selectedMessage.from_email}</span>
                  <span>{formatDateTime(selectedMessage.received_at)}</span>
                </div>
                <hr className="my-4 border-[var(--border-subtle)]" />
                <div className="prose max-w-none">
                  {selectedMessage.body_html ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{selectedMessage.body_text || 'No content'}</pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--text-tertiary)]">Select a message to read</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
