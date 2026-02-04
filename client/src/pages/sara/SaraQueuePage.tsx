import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saraApi } from '../../api/sara.api';
import {
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Send,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  TrendingUp,
  Users,
  Zap,
  Inbox,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Bot }> = {
  interested: { label: 'Interested', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: TrendingUp },
  meeting: { label: 'Meeting', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Users },
  objection: { label: 'Objection', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
  not_now: { label: 'Not Now', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: Clock },
  unsubscribe: { label: 'Unsubscribe', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
  out_of_office: { label: 'Out of Office', color: 'text-secondary', bg: 'bg-slate-500/10 border-slate-500/20', icon: Clock },
  bounce: { label: 'Bounce', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: AlertTriangle },
  other: { label: 'Other', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: MessageSquare },
};

const STATUS_TABS = [
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'sent', label: 'Sent' },
  { value: 'dismissed', label: 'Dismissed' },
];

export function SaraQueuePage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [intentFilter, setIntentFilter] = useState<string | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedReply, setEditedReply] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['sara-stats'],
    queryFn: saraApi.getStats,
  });

  const { data: queue, isLoading } = useQuery({
    queryKey: ['sara-queue', statusFilter, intentFilter],
    queryFn: () => saraApi.getQueue({
      status: statusFilter,
      intent: intentFilter,
      limit: 50,
    }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply?: string }) => saraApi.approve(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sara-queue'] });
      queryClient.invalidateQueries({ queryKey: ['sara-stats'] });
      toast.success('Reply approved');
      setEditingId(null);
    },
    onError: () => toast.error('Failed to approve'),
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => saraApi.dismiss(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sara-queue'] });
      queryClient.invalidateQueries({ queryKey: ['sara-stats'] });
      toast.success('Reply dismissed');
    },
    onError: () => toast.error('Failed to dismiss'),
  });

  const messages = queue?.messages || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">SARA</h1>
              <p className="text-sm text-secondary">SkySend Autonomous Reply Agent</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['sara-queue'] });
            queryClient.invalidateQueries({ queryKey: ['sara-stats'] });
          }}
          className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2 text-sm text-secondary hover:bg-elevated transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-violet-600/20 to-violet-600/5 border border-violet-500/20 p-4">
          <div className="flex items-center gap-2 text-violet-400 mb-1">
            <Inbox className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-2xl font-bold text-primary">{stats?.pending_review ?? 0}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/20 p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Approved Today</span>
          </div>
          <p className="text-2xl font-bold text-primary">{stats?.approved_today ?? 0}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20 p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Send className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Sent Today</span>
          </div>
          <p className="text-2xl font-bold text-primary">{stats?.sent_today ?? 0}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-slate-600/20 to-slate-600/5 border border-slate-500/20 p-4">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Dismissed Today</span>
          </div>
          <p className="text-2xl font-bold text-primary">{stats?.dismissed_today ?? 0}</p>
        </div>
      </div>

      {/* Intent Distribution */}
      {stats?.top_intents && stats.top_intents.length > 0 && (
        <div className="rounded-xl bg-surface border border-subtle p-4">
          <h3 className="text-sm font-medium text-secondary mb-3">Intent Distribution</h3>
          <div className="flex gap-3 flex-wrap">
            {stats.top_intents.map((item) => {
              const config = INTENT_CONFIG[item.intent] || INTENT_CONFIG.other;
              return (
                <button
                  key={item.intent}
                  onClick={() => setIntentFilter(intentFilter === item.intent ? undefined : item.intent)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all',
                    intentFilter === item.intent
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                      : config.bg + ' ' + config.color + ' hover:opacity-80'
                  )}
                >
                  <config.icon className="h-3.5 w-3.5" />
                  {config.label}
                  <span className="font-bold">{item.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Tabs + Filter */}
      <div className="flex items-center gap-2 border-b border-subtle pb-0">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
              statusFilter === tab.value
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-secondary hover:text-primary hover:border-default'
            )}
          >
            {tab.label}
            {tab.value === 'pending_review' && stats?.pending_review ? (
              <span className="ml-2 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
                {stats.pending_review}
              </span>
            ) : null}
          </button>
        ))}
        {intentFilter && (
          <button
            onClick={() => setIntentFilter(undefined)}
            className="ml-auto flex items-center gap-1 rounded-lg bg-indigo-600/20 px-3 py-1 text-xs text-indigo-300 hover:bg-indigo-600/30"
          >
            <Filter className="h-3 w-3" />
            {INTENT_CONFIG[intentFilter]?.label || intentFilter}
            <XCircle className="h-3 w-3 ml-1" />
          </button>
        )}
      </div>

      {/* Queue Messages */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface mb-4">
            <Bot className="h-8 w-8 text-tertiary" />
          </div>
          <h3 className="text-lg font-medium text-primary mb-1">No messages in queue</h3>
          <p className="text-sm text-secondary">
            {statusFilter === 'pending_review'
              ? 'All caught up! No replies need your attention right now.'
              : `No ${STATUS_TABS.find(t => t.value === statusFilter)?.label.toLowerCase()} messages found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg: any) => {
            const intentConfig = INTENT_CONFIG[msg.sara_intent] || INTENT_CONFIG.other;
            const IntentIcon = intentConfig.icon;
            const isExpanded = expandedId === msg.id;
            const isEditing = editingId === msg.id;

            return (
              <div
                key={msg.id}
                className="rounded-xl bg-surface border border-subtle overflow-hidden hover:border-default transition-colors"
              >
                {/* Message Header */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                >
                  {/* Intent Badge */}
                  <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm', intentConfig.bg)}>
                    <IntentIcon className={cn('h-4 w-4', intentConfig.color)} />
                    <span className={intentConfig.color}>{intentConfig.label}</span>
                  </div>

                  {/* Confidence */}
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-sm text-secondary">
                      {((msg.sara_confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* From */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary truncate">
                        {msg.contacts?.first_name
                          ? `${msg.contacts.first_name} ${msg.contacts.last_name || ''}`
                          : msg.from_email}
                      </span>
                      {msg.contacts?.company && (
                        <span className="text-xs text-tertiary">@ {msg.contacts.company}</span>
                      )}
                    </div>
                    <p className="text-xs text-secondary truncate mt-0.5">
                      {msg.subject || '(no subject)'}
                    </p>
                  </div>

                  {/* Campaign */}
                  {msg.campaigns?.name && (
                    <span className="text-xs text-tertiary bg-elevated/50 rounded px-2 py-1">
                      {msg.campaigns.name}
                    </span>
                  )}

                  {/* Expand */}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-secondary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-secondary" />
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-subtle p-4 space-y-4">
                    {/* Original Message */}
                    <div>
                      <h4 className="text-xs font-medium uppercase tracking-wider text-tertiary mb-2">
                        Original Reply
                      </h4>
                      <div className="rounded-lg bg-app border border-subtle p-3 text-sm text-secondary whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {msg.body_text || msg.body_html || '(empty message)'}
                      </div>
                    </div>

                    {/* SARA Draft Reply */}
                    {msg.sara_draft_reply && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4 text-violet-400" />
                          <h4 className="text-xs font-medium uppercase tracking-wider text-tertiary">
                            SARA&apos;s Suggested Reply
                          </h4>
                        </div>
                        {isEditing ? (
                          <textarea
                            value={editedReply}
                            onChange={(e) => setEditedReply(e.target.value)}
                            rows={6}
                            className="w-full rounded-lg bg-app border border-indigo-500/30 p-3 text-sm text-secondary focus:outline-none focus:border-indigo-500/60 resize-none"
                          />
                        ) : (
                          <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-3 text-sm text-secondary whitespace-pre-wrap">
                            {msg.sara_draft_reply}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Bar */}
                    {statusFilter === 'pending_review' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            if (isEditing) {
                              approveMutation.mutate({ id: msg.id, reply: editedReply });
                            } else {
                              approveMutation.mutate({ id: msg.id });
                            }
                          }}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-medium text-primary hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-sm"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {isEditing ? 'Send Edited' : 'Approve & Send'}
                        </button>
                        {msg.sara_draft_reply && !isEditing && (
                          <button
                            onClick={() => {
                              setEditingId(msg.id);
                              setEditedReply(msg.sara_draft_reply || '');
                            }}
                            className="flex items-center gap-2 rounded-lg bg-elevated px-4 py-2 text-sm font-medium text-secondary hover:bg-hover transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit Reply
                          </button>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditedReply('');
                            }}
                            className="flex items-center gap-2 rounded-lg bg-elevated px-4 py-2 text-sm font-medium text-secondary hover:bg-hover transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => dismissMutation.mutate(msg.id)}
                          disabled={dismissMutation.isPending}
                          className="flex items-center gap-2 rounded-lg bg-elevated px-4 py-2 text-sm font-medium text-secondary hover:bg-red-600/20 hover:text-red-300 hover:border-red-500/30 transition-colors ml-auto"
                        >
                          <XCircle className="h-4 w-4" />
                          Dismiss
                        </button>
                      </div>
                    )}

                    {/* Recommended Action */}
                    {msg.sara_action && (
                      <div className="flex items-center gap-2 text-xs text-tertiary pt-1">
                        <ArrowRight className="h-3 w-3" />
                        Recommended action: <span className="text-secondary font-medium">{msg.sara_action}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
