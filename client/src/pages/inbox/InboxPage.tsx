import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inboxApi } from '../../api/inbox.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { formatDateTime } from '../../lib/utils';
import { Inbox, Mail, MailOpen, CheckCheck } from 'lucide-react';
import type { InboxMessageWithContext } from '@lemlist/shared';

export function InboxPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inbox', filter],
    queryFn: () => inboxApi.list({ is_read: filter === 'unread' ? false : undefined }),
  });

  const { data: selectedMessage } = useQuery({
    queryKey: ['inbox', selectedId],
    queryFn: () => inboxApi.get(selectedId!),
    enabled: !!selectedId,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => inboxApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => inboxApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });

  const handleSelect = (message: InboxMessageWithContext) => {
    setSelectedId(message.id);
    if (!message.is_read) {
      markReadMutation.mutate(message.id);
    }
  };

  const messages = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          <Button variant="ghost" size="sm" onClick={() => markAllReadMutation.mutate()}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        </div>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No messages"
          description="Replies from your campaign contacts will appear here."
        />
      ) : (
        <div className="flex gap-4" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Message list */}
          <div className="w-1/3 overflow-y-auto rounded-lg border border-gray-200 bg-white">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={`w-full border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 ${
                  selectedId === msg.id ? 'bg-primary-50' : ''
                } ${!msg.is_read ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {!msg.is_read ? (
                    <Mail className="h-4 w-4 shrink-0 text-primary-600" />
                  ) : (
                    <MailOpen className="h-4 w-4 shrink-0 text-gray-400" />
                  )}
                  <span className={`truncate text-sm ${!msg.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {msg.contact_name || msg.from_email}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">{msg.subject || '(No subject)'}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatDateTime(msg.received_at)}</span>
                  {msg.campaign_name && (
                    <Badge variant="info">{msg.campaign_name}</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-6">
            {selectedMessage ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedMessage.subject || '(No subject)'}
                </h2>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span>From: {selectedMessage.from_email}</span>
                  <span>To: {selectedMessage.to_email}</span>
                  <span>{formatDateTime(selectedMessage.received_at)}</span>
                </div>
                {selectedMessage.campaign_name && (
                  <div className="mt-2">
                    <Badge variant="info">Campaign: {selectedMessage.campaign_name}</Badge>
                  </div>
                )}
                <hr className="my-4" />
                <div className="prose max-w-none">
                  {selectedMessage.body_html ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {selectedMessage.body_text || 'No content'}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Select a message to read
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
