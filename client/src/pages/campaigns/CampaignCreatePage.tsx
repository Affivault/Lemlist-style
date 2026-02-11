import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../../api/campaigns.api';
import { smtpApi } from '../../api/smtp.api';
import { contactsApi } from '../../api/contacts.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { FlowBuilder } from '../../components/campaigns/FlowBuilder';
import { PersonalizationDropdown } from '../../components/campaigns/PersonalizationDropdown';
import type { FlowStep } from '../../components/campaigns/FlowBuilder';
import {
  ArrowLeft,
  Mail,
  Clock,
  Save,
  Users,
  Check,
  Settings,
  Layers,
  UserPlus,
  CheckCircle2,
  Search,
  Building2,
  ChevronRight,
  SkipForward,
  Gauge,
  Shield,
  Eye,
  MousePointerClick,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type {
  CreateCampaignInput,
  CreateStepInput,
  CampaignStep,
  SmtpAccount,
  ContactWithTags,
} from '@lemlist/shared';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WIZARD_STEPS = [
  { label: 'Settings', icon: Settings },
  { label: 'Sequence', icon: Layers },
  { label: 'Contacts', icon: Users },
];

export function CampaignCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [campaignForm, setCampaignForm] = useState<CreateCampaignInput>({
    name: '',
    timezone: 'UTC',
    send_window_start: '09:00',
    send_window_end: '17:00',
    send_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    daily_limit: 50,
    delay_between_emails: 60,
    stop_on_reply: true,
    track_opens: true,
    track_clicks: true,
  });

  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [wizardStep, setWizardStep] = useState(0);

  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [activeField, setActiveField] = useState<'subject' | 'body'>('body');

  const { data: existingCampaign, isLoading: loadingCampaign } = useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignsApi.get(id!),
    enabled: isEdit,
  });

  const { data: smtpAccounts } = useQuery({
    queryKey: ['smtp-accounts'],
    queryFn: smtpApi.list,
  });

  const { data: contactsData } = useQuery({
    queryKey: ['contacts', 'select', contactSearch],
    queryFn: () => contactsApi.list({ limit: 50, search: contactSearch || undefined }),
  });

  const { data: campaignContacts } = useQuery({
    queryKey: ['campaign-contacts', id],
    queryFn: () => campaignsApi.getContacts(id!, { limit: 100 }),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingCampaign) {
      setCampaignForm({
        name: existingCampaign.name,
        smtp_account_id: existingCampaign.smtp_account_id || undefined,
        timezone: existingCampaign.timezone,
        send_window_start: existingCampaign.send_window_start || '09:00',
        send_window_end: existingCampaign.send_window_end || '17:00',
        send_days: existingCampaign.send_days,
        daily_limit: existingCampaign.daily_limit ?? 50,
        delay_between_emails: existingCampaign.delay_between_emails ?? 60,
        stop_on_reply: existingCampaign.stop_on_reply ?? true,
        track_opens: existingCampaign.track_opens ?? true,
        track_clicks: existingCampaign.track_clicks ?? true,
      });
      if (existingCampaign.steps) {
        setSteps(
          existingCampaign.steps.map((s: CampaignStep) => ({
            id: s.id,
            step_type: s.step_type,
            step_order: s.step_order,
            subject: s.subject || '',
            body_html: s.body_html || '',
            body_text: s.body_text || '',
            delay_days: s.delay_days,
            delay_hours: s.delay_hours,
            delay_minutes: s.delay_minutes,
            skip_if_replied: s.skip_if_replied,
          }))
        );
      }
    }
  }, [existingCampaign]);

  useEffect(() => {
    if (campaignContacts?.data) {
      setSelectedContactIds(campaignContacts.data.map((cc: any) => cc.contact_id));
    }
  }, [campaignContacts]);

  const createCampaignMutation = useMutation({
    mutationFn: (input: CreateCampaignInput) =>
      isEdit ? campaignsApi.update(id!, input) : campaignsApi.create(input),
    onSuccess: async (campaign) => {
      const campaignId = isEdit ? id! : campaign.id;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepData = { ...step, step_order: i };
        if (step.id && isEdit) {
          await campaignsApi.updateStep(campaignId, step.id, stepData);
        } else {
          await campaignsApi.addStep(campaignId, stepData);
        }
      }

      if (selectedContactIds.length > 0) {
        await campaignsApi.addContacts(campaignId, selectedContactIds);
      }

      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success(isEdit ? 'Campaign updated' : 'Campaign created');
      navigate(`/campaigns/${campaignId}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to save'),
  });

  const updateStep = (index: number, updates: Partial<CreateStepInput>) => {
    setSteps(steps.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((cid) => cid !== contactId) : [...prev, contactId]
    );
  };

  const handleSave = () => {
    if (!campaignForm.name) {
      toast.error('Campaign name is required');
      setWizardStep(0);
      return;
    }
    createCampaignMutation.mutate(campaignForm);
  };

  const insertPersonalization = (tag: string) => {
    if (editingStep === null) return;
    const step = steps[editingStep];
    if (!step || step.step_type !== 'email') return;

    if (activeField === 'subject') {
      const input = subjectRef.current;
      if (input) {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const current = step.subject || '';
        const newValue = current.slice(0, start) + tag + current.slice(end);
        updateStep(editingStep, { subject: newValue });
        setTimeout(() => {
          input.selectionStart = input.selectionEnd = start + tag.length;
          input.focus();
        }, 0);
      }
    } else {
      const textarea = bodyRef.current;
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const current = step.body_html || '';
        const newValue = current.slice(0, start) + tag + current.slice(end);
        updateStep(editingStep, { body_html: newValue });
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + tag.length;
          textarea.focus();
        }, 0);
      }
    }
  };

  if (isEdit && loadingCampaign) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const contacts = contactsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </button>
        <Button
          variant="secondary"
          onClick={handleSave}
          disabled={createCampaignMutation.isPending}
        >
          <Save className="h-4 w-4" />
          {createCampaignMutation.isPending ? 'Saving...' : 'Save Draft'}
        </Button>
      </div>

      <h1 className="text-2xl font-semibold text-primary">
        {isEdit ? 'Edit Campaign' : 'Create Campaign'}
      </h1>

      {/* Wizard Steps */}
      <div className="flex gap-2">
        {WIZARD_STEPS.map((ws, i) => {
          const StepIcon = ws.icon;
          return (
            <button
              key={ws.label}
              onClick={() => setWizardStep(i)}
              className={`flex-1 flex items-center gap-3 rounded-md px-4 py-3 text-left transition-colors ${
                wizardStep === i
                  ? 'bg-[var(--text-primary)] text-[var(--bg-app)]'
                  : i < wizardStep
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)]'
                  : 'bg-surface border border-subtle text-secondary hover:bg-hover'
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
                wizardStep === i ? 'bg-white/20' : i < wizardStep ? 'bg-[var(--bg-hover)]' : 'bg-elevated'
              }`}>
                {i < wizardStep ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-medium">Step {i + 1}: {ws.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step 1: Campaign Settings */}
      {wizardStep === 0 && (
        <div className="rounded-lg border border-subtle bg-surface">
          <div className="p-5 border-b border-subtle">
            <h2 className="font-medium text-primary">Campaign Settings</h2>
            <p className="text-sm text-secondary mt-1">Configure your campaign</p>
          </div>
          <div className="p-5 space-y-4">
            <Input
              label="Campaign Name"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              placeholder="e.g., Q1 Outreach"
              required
            />
            <Select
              label="Sending Account (SMTP)"
              value={campaignForm.smtp_account_id || ''}
              onChange={(e) => setCampaignForm({ ...campaignForm, smtp_account_id: e.target.value || undefined })}
              options={[
                { value: '', label: 'Select an SMTP account...' },
                ...(smtpAccounts || []).map((a: SmtpAccount) => ({
                  value: a.id,
                  label: `${a.label} (${a.email_address})`,
                })),
              ]}
            />
            <div className="border-t border-subtle pt-4">
              <h3 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary" />
                Sending Schedule
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Input label="Timezone" value={campaignForm.timezone || 'UTC'} onChange={(e) => setCampaignForm({ ...campaignForm, timezone: e.target.value })} />
                <Input label="Start Time" type="time" value={campaignForm.send_window_start || '09:00'} onChange={(e) => setCampaignForm({ ...campaignForm, send_window_start: e.target.value })} />
                <Input label="End Time" type="time" value={campaignForm.send_window_end || '17:00'} onChange={(e) => setCampaignForm({ ...campaignForm, send_window_end: e.target.value })} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Active Days</label>
                <div className="flex gap-2">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const current = campaignForm.send_days || [];
                        setCampaignForm({
                          ...campaignForm,
                          send_days: current.includes(day) ? current.filter((d: string) => d !== day) : [...current, day],
                        });
                      }}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                        (campaignForm.send_days || []).includes(day)
                          ? 'bg-[var(--text-primary)] text-[var(--bg-app)]'
                          : 'bg-elevated text-secondary hover:text-primary'
                      }`}
                    >
                      {DAY_LABELS[i]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sending Controls */}
            <div className="border-t border-subtle pt-4">
              <h3 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-secondary" />
                Sending Controls
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Daily Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.daily_limit ?? 50}
                    onChange={(e) => setCampaignForm({ ...campaignForm, daily_limit: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-default bg-surface px-3 py-2 text-sm text-primary focus:border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--border-subtle)]"
                  />
                  <p className="text-xs text-tertiary mt-1">Max emails per day. 0 = unlimited.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Delay Between Emails</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={campaignForm.delay_between_emails ?? 60}
                      onChange={(e) => setCampaignForm({ ...campaignForm, delay_between_emails: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-md border border-default bg-surface px-3 py-2 text-sm text-primary focus:border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--border-subtle)]"
                    />
                    <span className="text-sm text-secondary whitespace-nowrap">seconds</span>
                  </div>
                  <p className="text-xs text-tertiary mt-1">Gap between each email send.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-md bg-elevated cursor-pointer hover:bg-hover transition-colors">
                  <input
                    type="checkbox"
                    checked={campaignForm.stop_on_reply !== false}
                    onChange={(e) => setCampaignForm({ ...campaignForm, stop_on_reply: e.target.checked })}
                    className="h-4 w-4 rounded border-default bg-surface text-[var(--text-primary)] focus:ring-[var(--border-default)]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-secondary" />
                      Stop on reply
                    </p>
                    <p className="text-xs text-tertiary">Stop sending to a contact once they reply</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-md bg-elevated cursor-pointer hover:bg-hover transition-colors">
                  <input
                    type="checkbox"
                    checked={campaignForm.track_opens !== false}
                    onChange={(e) => setCampaignForm({ ...campaignForm, track_opens: e.target.checked })}
                    className="h-4 w-4 rounded border-default bg-surface text-[var(--text-primary)] focus:ring-[var(--border-default)]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-secondary" />
                      Track opens
                    </p>
                    <p className="text-xs text-tertiary">Inject a tracking pixel to detect email opens</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-md bg-elevated cursor-pointer hover:bg-hover transition-colors">
                  <input
                    type="checkbox"
                    checked={campaignForm.track_clicks !== false}
                    onChange={(e) => setCampaignForm({ ...campaignForm, track_clicks: e.target.checked })}
                    className="h-4 w-4 rounded border-default bg-surface text-[var(--text-primary)] focus:ring-[var(--border-default)]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                      <MousePointerClick className="h-3.5 w-3.5 text-secondary" />
                      Track clicks
                    </p>
                    <p className="text-xs text-tertiary">Rewrite links to track click-throughs</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end p-5 border-t border-subtle">
            <Button onClick={() => setWizardStep(1)}>
              Next: Build Sequence
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Sequence Builder */}
      {wizardStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-lg border border-subtle bg-surface">
            <div className="p-5 border-b border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-primary">Campaign Flow</h2>
                  <p className="text-sm text-secondary mt-1">Build your email sequence</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-elevated)]">
                    <Mail className="h-3 w-3" />
                    {steps.filter(s => s.step_type === 'email').length} Emails
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)]">
                    <Clock className="h-3 w-3" />
                    {steps.filter(s => s.step_type === 'delay').length} Delays
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <FlowBuilder
                steps={steps}
                onStepsChange={setSteps}
                onEditStep={(i) => setEditingStep(i === -1 ? null : i)}
                editingStep={editingStep}
              />
            </div>
          </div>

          {/* Email Editor */}
          <div className="lg:col-span-2">
            {editingStep !== null && steps[editingStep]?.step_type === 'email' ? (
              <div className="rounded-lg border border-subtle bg-surface sticky top-20">
                <div className="p-4 border-b border-subtle bg-[var(--bg-elevated)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-primary">Edit Email</h3>
                      <p className="text-xs text-secondary">Step {editingStep + 1}</p>
                    </div>
                    <PersonalizationDropdown onInsert={insertPersonalization} />
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">Subject</label>
                    <input
                      ref={subjectRef}
                      type="text"
                      value={steps[editingStep].subject || ''}
                      onChange={(e) => updateStep(editingStep, { subject: e.target.value })}
                      onFocus={() => setActiveField('subject')}
                      placeholder="e.g., Quick question about {{company}}"
                      className="w-full rounded-md border border-default bg-surface px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--border-subtle)]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-secondary">Body</label>
                      <PersonalizationDropdown onInsert={insertPersonalization} variant="icon" />
                    </div>
                    <textarea
                      ref={bodyRef}
                      className="w-full min-h-[250px] rounded-md border border-default bg-surface p-3 text-sm text-primary placeholder:text-tertiary focus:border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--border-subtle)] font-mono"
                      value={steps[editingStep].body_html || ''}
                      onChange={(e) => updateStep(editingStep, { body_html: e.target.value })}
                      onFocus={() => setActiveField('body')}
                      placeholder={`<p>Hi {{first_name}},</p>\n\n<p>I noticed that {{company}} is...</p>`}
                    />
                  </div>
                  <label className="flex items-center gap-3 p-3 rounded-md bg-elevated cursor-pointer hover:bg-hover transition-colors">
                    <input
                      type="checkbox"
                      checked={steps[editingStep].skip_if_replied !== false}
                      onChange={(e) => updateStep(editingStep, { skip_if_replied: e.target.checked })}
                      className="h-4 w-4 rounded border-default bg-surface text-[var(--text-primary)] focus:ring-[var(--border-default)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                        <SkipForward className="h-3.5 w-3.5 text-secondary" />
                        Skip if replied
                      </p>
                      <p className="text-xs text-tertiary">Don't send if the contact already replied</p>
                    </div>
                  </label>
                </div>
              </div>
            ) : editingStep !== null && steps[editingStep]?.step_type === 'delay' ? (
              <div className="rounded-lg border border-subtle bg-surface sticky top-20">
                <div className="p-4 border-b border-subtle bg-[var(--bg-elevated)]">
                  <h3 className="font-medium text-primary">Configure Delay</h3>
                  <p className="text-xs text-secondary">Step {editingStep + 1}</p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-secondary mb-1">Days</label>
                      <input type="number" min="0" value={steps[editingStep].delay_days || 0} onChange={(e) => updateStep(editingStep, { delay_days: parseInt(e.target.value) || 0 })} className="w-full rounded-md border border-default bg-surface px-3 py-2 text-center text-sm font-medium text-primary focus:border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--border-subtle)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-secondary mb-1">Hours</label>
                      <input type="number" min="0" max="23" value={steps[editingStep].delay_hours || 0} onChange={(e) => updateStep(editingStep, { delay_hours: parseInt(e.target.value) || 0 })} className="w-full rounded-md border border-default bg-surface px-3 py-2 text-center text-sm font-medium text-primary focus:border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--border-subtle)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-secondary mb-1">Minutes</label>
                      <input type="number" min="0" max="59" value={steps[editingStep].delay_minutes || 0} onChange={(e) => updateStep(editingStep, { delay_minutes: parseInt(e.target.value) || 0 })} className="w-full rounded-md border border-default bg-surface px-3 py-2 text-center text-sm font-medium text-primary focus:border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--border-subtle)]" />
                    </div>
                  </div>
                  <div className="rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3">
                    <p className="text-xs text-[var(--text-secondary)]">Tip: A 1-3 day delay between emails typically performs best.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-subtle bg-surface p-6 text-center sticky top-20">
                <div className="w-12 h-12 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-[var(--text-secondary)]" />
                </div>
                <h3 className="font-medium text-primary mb-1">Step Editor</h3>
                <p className="text-sm text-secondary">Click "Edit" on an email step to customize it here.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex justify-between">
            <Button variant="secondary" onClick={() => setWizardStep(0)}>
              <ArrowLeft className="h-4 w-4" />
              Back: Settings
            </Button>
            <Button onClick={() => setWizardStep(2)}>
              Next: Select Contacts
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Select Contacts */}
      {wizardStep === 2 && (
        <div className="rounded-lg border border-subtle bg-surface">
          <div className="p-5 border-b border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium text-primary">Select Recipients</h2>
                <p className="text-sm text-secondary mt-1">Choose contacts for this campaign</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-elevated)]">
                  <Users className="h-3 w-3" />
                  {selectedContactIds.length} selected
                </span>
                <Button variant="secondary" size="sm" onClick={() => setShowContactModal(true)}>
                  <UserPlus className="h-4 w-4" />
                  Add Contacts
                </Button>
              </div>
            </div>
          </div>
          <div className="p-5">
            {selectedContactIds.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-[var(--text-secondary)]" />
                </div>
                <h3 className="font-medium text-primary mb-1">No contacts selected</h3>
                <p className="text-sm text-secondary mb-4">Click "Add Contacts" to choose recipients.</p>
                <Button onClick={() => setShowContactModal(true)}>
                  <UserPlus className="h-4 w-4" />
                  Select Contacts
                </Button>
              </div>
            ) : (
              <div className="rounded-md bg-[var(--bg-elevated)] border border-[var(--border-default)] p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-[var(--text-primary)] mx-auto mb-2" />
                <p className="font-medium text-[var(--text-primary)]">{selectedContactIds.length} contacts ready</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">These contacts will receive all {steps.filter(s => s.step_type === 'email').length} emails.</p>
              </div>
            )}
          </div>
          <div className="flex justify-between p-5 border-t border-subtle">
            <Button variant="secondary" onClick={() => setWizardStep(1)}>
              <ArrowLeft className="h-4 w-4" />
              Back: Sequence
            </Button>
            <Button onClick={handleSave} disabled={createCampaignMutation.isPending}>
              <Save className="h-4 w-4" />
              {createCampaignMutation.isPending ? 'Saving...' : 'Save Campaign'}
            </Button>
          </div>
        </div>
      )}

      {/* Contact Selection Modal */}
      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title="Select Contacts" size="lg">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
            <input type="text" placeholder="Search by name, email, or company..." value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} className="w-full rounded-md border border-default bg-surface pl-10 pr-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-[var(--border-subtle)]" />
          </div>
          <div className="max-h-[350px] overflow-y-auto rounded-md border border-subtle">
            {contacts.map((contact: ContactWithTags) => (
              <label key={contact.id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-hover border-b border-subtle last:border-0 transition-colors">
                <input type="checkbox" checked={selectedContactIds.includes(contact.id)} onChange={() => toggleContact(contact.id)} className="h-4 w-4 rounded border-default bg-surface text-[var(--text-primary)] focus:ring-[var(--border-default)]" />
                <div className="w-8 h-8 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-primary)] text-xs font-medium">
                  {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">{[contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.email}</p>
                  <p className="text-xs text-tertiary">{contact.email}</p>
                </div>
                {contact.company && (
                  <span className="flex items-center gap-1 text-xs text-tertiary">
                    <Building2 className="h-3 w-3" />
                    {contact.company}
                  </span>
                )}
              </label>
            ))}
            {contacts.length === 0 && <p className="p-6 text-center text-sm text-tertiary">No contacts found</p>}
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-secondary">{selectedContactIds.length} selected</p>
            <Button onClick={() => setShowContactModal(false)}>
              <Check className="h-4 w-4" />
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
