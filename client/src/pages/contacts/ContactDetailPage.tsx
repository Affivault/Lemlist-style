import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../../api/contacts.api';
import { analyticsApi } from '../../api/analytics.api';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate, formatDateTime, getInitials } from '../../lib/utils';
import {
  ArrowLeft,
  Trash2,
  Mail,
  Building2,
  Briefcase,
  Phone,
  Linkedin,
  Globe,
  Send,
  MousePointerClick,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const activityIcons: Record<string, React.ElementType> = {
  sent: Send,
  delivered: Mail,
  opened: Mail,
  clicked: MousePointerClick,
  replied: MessageSquare,
  bounced: AlertTriangle,
  error: AlertTriangle,
};

const activityColors: Record<string, string> = {
  sent: 'text-[var(--text-secondary)]',
  delivered: 'text-[var(--success)]',
  opened: 'text-[var(--success)]',
  clicked: 'text-[var(--text-secondary)]',
  replied: 'text-[var(--text-primary)]',
  bounced: 'text-[var(--error)]',
  error: 'text-[var(--error)]',
};

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsApi.get(id!),
    enabled: !!id,
  });

  const { data: timeline } = useQuery({
    queryKey: ['contact-timeline', id],
    queryFn: () => analyticsApi.contactTimeline(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => contactsApi.delete(id!),
    onSuccess: () => {
      toast.success('Contact deleted');
      navigate('/contacts');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!contact) {
    return <div className="text-center text-[var(--text-secondary)]">Contact not found</div>;
  }

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/contacts')}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contacts
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-primary)] font-medium">
            {getInitials(contact.first_name, contact.last_name, contact.email)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">{fullName || contact.email}</h1>
            {fullName && <p className="text-sm text-[var(--text-secondary)]">{contact.email}</p>}
            <div className="flex items-center gap-2 mt-1">
              {contact.tags?.map((tag: any) => (
                <span
                  key={tag.id}
                  className="inline-flex px-1.5 py-0.5 text-xs rounded"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
              {contact.is_unsubscribed && (
                <span className="text-xs text-[var(--warning)]">Unsubscribed</span>
              )}
              {contact.is_bounced && (
                <span className="text-xs text-[var(--error)]">Bounced</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm('Delete this contact?')) deleteMutation.mutate();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--error)] hover:text-[var(--error)] border border-[var(--error)]/30 rounded-md hover:bg-[var(--error)]/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md p-5">
          <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">Contact Info</h2>
          <div className="space-y-3">
            <InfoRow icon={Mail} label="Email" value={contact.email} />
            {contact.company && <InfoRow icon={Building2} label="Company" value={contact.company} />}
            {contact.job_title && <InfoRow icon={Briefcase} label="Job Title" value={contact.job_title} />}
            {contact.phone && <InfoRow icon={Phone} label="Phone" value={contact.phone} />}
            {contact.linkedin_url && <InfoRow icon={Linkedin} label="LinkedIn" value={contact.linkedin_url} isLink />}
            {contact.website && <InfoRow icon={Globe} label="Website" value={contact.website} isLink />}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
            <p>Source: {contact.source}</p>
            <p>Created: {formatDate(contact.created_at)}</p>
            <p>Updated: {formatDate(contact.updated_at)}</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md p-5">
          <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">Activity</h2>
          {!timeline || timeline.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((item: any) => {
                const Icon = activityIcons[item.activity_type] || Send;
                const color = activityColors[item.activity_type] || 'text-[var(--text-secondary)]';
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)]">
                        <span className="capitalize">{item.activity_type}</span>
                        {item.step_subject && (
                          <span className="text-[var(--text-secondary)]"> - {item.step_subject}</span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {item.campaign_name} · {formatDateTime(item.occurred_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  isLink,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-[var(--text-secondary)] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-[var(--text-secondary)]">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--text-primary)] hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-[var(--text-primary)]">{value}</p>
        )}
      </div>
    </div>
  );
}
