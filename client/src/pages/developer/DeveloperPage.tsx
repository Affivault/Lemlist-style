import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhookApi } from '../../api/webhook.api';
import { apikeyApi } from '../../api/apikey.api';
import { WebhookEventType } from '@lemlist/shared';
import {
  Code2,
  Webhook,
  Key,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  Clock,
  AlertTriangle,
  Zap,
  X,
} from 'lucide-react';
import { cn, formatDateTime } from '../../lib/utils';
import toast from 'react-hot-toast';

const ALL_EVENTS = Object.values(WebhookEventType);
const EVENT_CATEGORIES: Record<string, string[]> = {
  'Contacts': ALL_EVENTS.filter(e => e.startsWith('contact.') || e.startsWith('lead.')),
  'Campaigns': ALL_EVENTS.filter(e => e.startsWith('campaign.') || e.startsWith('sequence.')),
  'Email': ALL_EVENTS.filter(e => e.startsWith('email.')),
  'SARA': ALL_EVENTS.filter(e => e.startsWith('sara.')),
  'System': ALL_EVENTS.filter(e => e.startsWith('account.')),
};

type Tab = 'webhooks' | 'api-keys';

export function DeveloperPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('webhooks');

  // --- Webhook state ---
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookLabel, setWebhookLabel] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
  const [showDeliveries, setShowDeliveries] = useState<string | null>(null);

  // --- API Key state ---
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Queries
  const { data: endpoints, isLoading: loadingEndpoints } = useQuery({
    queryKey: ['webhook-endpoints'],
    queryFn: webhookApi.listEndpoints,
    enabled: tab === 'webhooks',
  });

  const { data: deliveries } = useQuery({
    queryKey: ['webhook-deliveries', showDeliveries],
    queryFn: () => webhookApi.getDeliveries(showDeliveries || undefined, 20),
    enabled: !!showDeliveries,
  });

  const { data: apiKeys, isLoading: loadingKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: apikeyApi.list,
    enabled: tab === 'api-keys',
  });

  // Mutations
  const createEndpointMutation = useMutation({
    mutationFn: () => webhookApi.createEndpoint({ url: webhookUrl, label: webhookLabel || undefined, events: webhookEvents }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      toast.success('Webhook created');
      setShowCreateWebhook(false);
      setWebhookUrl('');
      setWebhookLabel('');
      setWebhookEvents([]);
    },
    onError: () => toast.error('Failed to create webhook'),
  });

  const deleteEndpointMutation = useMutation({
    mutationFn: webhookApi.deleteEndpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      toast.success('Webhook deleted');
    },
  });

  const testEndpointMutation = useMutation({
    mutationFn: webhookApi.testEndpoint,
    onSuccess: (result) => {
      if (result.success) toast.success(`Test passed (${result.status_code})`);
      else toast.error(`Test failed (${result.status_code || 'no response'})`);
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: () => apikeyApi.create({ name: keyName }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setNewRawKey(data.raw_key);
      setKeyName('');
      toast.success('API key created');
    },
    onError: () => toast.error('Failed to create key'),
  });

  const revokeKeyMutation = useMutation({
    mutationFn: apikeyApi.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Key revoked');
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: apikeyApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Key deleted');
    },
  });

  function toggleEvent(event: string) {
    setWebhookEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
          <Code2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Developer</h1>
          <p className="text-sm text-slate-400">Webhooks, API keys, and integrations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-0">
        <button
          onClick={() => setTab('webhooks')}
          className={cn('flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all',
            tab === 'webhooks' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Webhook className="h-4 w-4" />
          Webhooks
        </button>
        <button
          onClick={() => setTab('api-keys')}
          className={cn('flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all',
            tab === 'api-keys' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Key className="h-4 w-4" />
          API Keys
        </button>
      </div>

      {/* ========== WEBHOOKS TAB ========== */}
      {tab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Receive real-time notifications when events happen in SkySend.</p>
            <button
              onClick={() => setShowCreateWebhook(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Webhook
            </button>
          </div>

          {/* Create Form */}
          {showCreateWebhook && (
            <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">New Webhook Endpoint</h3>
                <button onClick={() => setShowCreateWebhook(false)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Endpoint URL</label>
                  <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://your-server.com/webhook" className="w-full rounded-lg bg-slate-900/50 border border-slate-700/50 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Label</label>
                  <input type="text" value={webhookLabel} onChange={(e) => setWebhookLabel(e.target.value)} placeholder="My CRM Integration" className="w-full rounded-lg bg-slate-900/50 border border-slate-700/50 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-2 block">Subscribe to events</label>
                <div className="space-y-3">
                  {Object.entries(EVENT_CATEGORIES).map(([category, events]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-slate-400 mb-1">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {events.map((event) => (
                          <button
                            key={event}
                            onClick={() => toggleEvent(event)}
                            className={cn(
                              'rounded-lg border px-2.5 py-1 text-xs transition-all',
                              webhookEvents.includes(event)
                                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                                : 'bg-slate-700/30 border-slate-600/30 text-slate-400 hover:text-white'
                            )}
                          >
                            {event}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => createEndpointMutation.mutate()}
                disabled={!webhookUrl || webhookEvents.length === 0 || createEndpointMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 transition-all"
              >
                <Plus className="h-4 w-4" />
                Create Webhook
              </button>
            </div>
          )}

          {/* Endpoints list */}
          {loadingEndpoints ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : !endpoints || endpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Webhook className="h-10 w-10 text-slate-500 mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">No webhooks configured</h3>
              <p className="text-sm text-slate-400">Add a webhook to receive real-time event notifications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {endpoints.map((ep) => (
                <div key={ep.id} className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-2.5 w-2.5 rounded-full', ep.is_active ? 'bg-emerald-400' : 'bg-slate-500')} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white">{ep.label}</h4>
                      <p className="text-xs text-slate-400 truncate font-mono">{ep.url}</p>
                    </div>
                    <span className="text-xs text-slate-500">{ep.events.length} events</span>
                    <button onClick={() => testEndpointMutation.mutate(ep.id)} className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Test
                    </button>
                    <button onClick={() => setShowDeliveries(showDeliveries === ep.id ? null : ep.id)} className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Logs
                    </button>
                    <button onClick={() => deleteEndpointMutation.mutate(ep.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {/* Delivery logs */}
                  {showDeliveries === ep.id && deliveries && (
                    <div className="mt-3 border-t border-slate-700/30 pt-3 space-y-2 max-h-60 overflow-y-auto">
                      {deliveries.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-2">No deliveries yet</p>
                      ) : deliveries.map((d) => (
                        <div key={d.id} className="flex items-center gap-3 text-xs">
                          {d.success ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                          <span className="text-slate-300 font-mono">{d.event_type}</span>
                          <span className="text-slate-500">{d.status_code || 'ERR'}</span>
                          <span className="text-slate-500 ml-auto">{formatDateTime(d.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== API KEYS TAB ========== */}
      {tab === 'api-keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Manage API keys for headless access to SkySend.</p>
            <button
              onClick={() => setShowCreateKey(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Key
            </button>
          </div>

          {/* New key created - show once */}
          {newRawKey && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">API key created. Copy it now - it will not be shown again.</span>
              </div>
              <div className="flex items-center gap-2">
                <code className={cn('flex-1 rounded-lg bg-slate-900/80 px-3 py-2 text-sm font-mono', showKey ? 'text-white' : 'text-slate-500')}>
                  {showKey ? newRawKey : newRawKey.substring(0, 16) + '••••••••••••••••'}
                </code>
                <button onClick={() => setShowKey(!showKey)} className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600">
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(newRawKey); toast.success('Copied!'); }}
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <button onClick={() => { setNewRawKey(null); setShowKey(false); }} className="text-xs text-slate-400 hover:text-white">
                Dismiss
              </button>
            </div>
          )}

          {/* Create form */}
          {showCreateKey && !newRawKey && (
            <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">New API Key</h3>
                <button onClick={() => setShowCreateKey(false)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Key Name</label>
                <input type="text" value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g. Production CRM" className="w-full rounded-lg bg-slate-900/50 border border-slate-700/50 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <button
                onClick={() => createKeyMutation.mutate()}
                disabled={!keyName || createKeyMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-all"
              >
                <Key className="h-4 w-4" />
                Generate Key
              </button>
            </div>
          )}

          {/* Keys list */}
          {loadingKeys ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : !apiKeys || apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Key className="h-10 w-10 text-slate-500 mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">No API keys</h3>
              <p className="text-sm text-slate-400">Create an API key to access SkySend programmatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 flex items-center gap-4">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', key.is_active ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                    <Key className={cn('h-4 w-4', key.is_active ? 'text-emerald-400' : 'text-red-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white">{key.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">{key.key_prefix}••••••••</p>
                  </div>
                  <div className="text-right">
                    <span className={cn('text-xs rounded-full px-2 py-0.5', key.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
                      {key.is_active ? 'Active' : 'Revoked'}
                    </span>
                    {key.last_used_at && (
                      <p className="text-[10px] text-slate-500 mt-1">Last used {formatDateTime(key.last_used_at)}</p>
                    )}
                  </div>
                  {key.is_active && (
                    <button
                      onClick={() => revokeKeyMutation.mutate(key.id)}
                      className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-orange-500/10 hover:text-orange-400 text-xs flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" /> Revoke
                    </button>
                  )}
                  <button
                    onClick={() => deleteKeyMutation.mutate(key.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
