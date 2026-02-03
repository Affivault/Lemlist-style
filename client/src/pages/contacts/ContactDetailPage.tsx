import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../../api/contacts.api';
import { analyticsApi } from '../../api/analytics.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
  sent: 'text-blue-400',
  delivered: 'text-green-400',
  opened: 'text-green-500',
  clicked: 'text-purple-400',
  replied: 'text-indigo-400',
  bounced: 'text-red-400',
  error: 'text-red-400',
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
    return <div className="text-center text-slate-400">Contact not found</div>;
  }

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/contacts')}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contacts
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-lg font-semibold text-indigo-400">
            {getInitials(contact.first_name, contact.last_name, contact.email)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{fullName || contact.email}</h1>
            {fullName && <p className="text-slate-400">{contact.email}</p>}
            <div className="mt-1 flex gap-2">
              {contact.tags?.map((tag: any) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
              {contact.is_unsubscribed && <Badge variant="warning">Unsubscribed</Badge>}
              {contact.is_bounced && <Badge variant="danger">Bounced</Badge>}
            </div>
          </div>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (confirm('Delete this contact?')) deleteMutation.mutate();
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-800 space-y-4 p-5 lg:col-span-1">
          <h2 className="font-semibold text-white">Contact Info</h2>
          <div className="space-y-3 text-sm">
            <InfoRow icon={Mail} label="Email" value={contact.email} />
            {contact.company && <InfoRow icon={Building2} label="Company" value={contact.company} />}
            {contact.job_title && <InfoRow icon={Briefcase} label="Job Title" value={contact.job_title} />}
            {contact.phone && <InfoRow icon={Phone} label="Phone" value={contact.phone} />}
            {contact.linkedin_url && <InfoRow icon={Linkedin} label="LinkedIn" value={contact.linkedin_url} isLink />}
            {contact.website && <InfoRow icon={Globe} label="Website" value={contact.website} isLink />}
          </div>
          <hr className="border-slate-800" />
          <div className="text-xs text-slate-500">
            <p>Source: {contact.source}</p>
            <p>Created: {formatDate(contact.created_at)}</p>
            <p>Updated: {formatDate(contact.updated_at)}</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-800 p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-white">Activity Timeline</h2>
          {!timeline || timeline.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((item: any) => {
                const Icon = activityIcons[item.activity_type] || Send;
                const color = activityColors[item.activity_type] || 'text-slate-500';
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <span className="font-medium capitalize">{item.activity_type}</span>
                        {item.step_subject && (
                          <span className="text-slate-400"> &mdash; {item.step_subject}</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.campaign_name} &middot; {formatDateTime(item.occurred_at)}
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
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            {value}
          </a>
        ) : (
          <p className="text-slate-300">{value}</p>
        )}
      </div>
    </div>
  );
}
