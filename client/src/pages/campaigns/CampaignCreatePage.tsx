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
  Sparkles,
  SkipForward,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StepType } from '@lemlist/shared';
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
  { label: 'Settings', icon: Settings, description: 'Campaign configuration' },
  { label: 'Sequence', icon: Layers, description: 'Build email flow' },
  { label: 'Contacts', icon: Users, description: 'Select recipients' },
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
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Loading campaign...</p>
        </div>
      </div>
    );
  }

  const contacts = contactsData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
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

      <h1 className="text-3xl font-bold text-gray-900">
        {isEdit ? 'Edit Campaign' : 'Create Campaign'}
      </h1>

      {/* Wizard Steps */}
      <div className="flex gap-3">
        {WIZARD_STEPS.map((ws, i) => {
          const StepIcon = ws.icon;
          return (
            <button
              key={ws.label}
              onClick={() => setWizardStep(i)}
              className={`flex-1 flex items-center gap-3 rounded-xl px-5 py-4 text-left transition-all duration-200 ${
                wizardStep === i
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : i < wizardStep
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                wizardStep === i ? 'bg-white/20' : i < wizardStep ? 'bg-emerald-100' : 'bg-gray-100'
              }`}>
                {i < wizardStep ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold">Step {i + 1}: {ws.label}</p>
                <p className={`text-xs ${wizardStep === i ? 'text-white/70' : 'text-gray-400'}`}>{ws.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step 1: Campaign Settings */}
      {wizardStep === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-lg font-semibold text-gray-900">Campaign Settings</h2>
            <p className="text-sm text-gray-500">Configure your campaign name, sending account, and schedule.</p>
          </div>
          <div className="p-6 space-y-5">
            <Input
              label="Campaign Name"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              placeholder="e.g., Q1 Outreach - Tech Companies"
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
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                Sending Schedule
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Input label="Timezone" value={campaignForm.timezone || 'UTC'} onChange={(e) => setCampaignForm({ ...campaignForm, timezone: e.target.value })} />
                <Input label="Send Window Start" type="time" value={campaignForm.send_window_start || '09:00'} onChange={(e) => setCampaignForm({ ...campaignForm, send_window_start: e.target.value })} />
                <Input label="Send Window End" type="time" value={campaignForm.send_window_end || '17:00'} onChange={(e) => setCampaignForm({ ...campaignForm, send_window_end: e.target.value })} />
              </div>
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">Active Days</label>
                <div className="flex gap-2">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const current = campaignForm.send_days || [];
                        setCampaignForm({
                          ...campaignForm,
                          send_days: current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
                        });
                      }}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        (campaignForm.send_days || []).includes(day)
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {DAY_LABELS[i]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Deliverability Section */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
                Deliverability
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DCS Threshold (Deliverability Confidence Score)
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Only send to contacts with a verification score at or above this threshold. Set to 0 to disable filtering.
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={(campaignForm as any).dcs_threshold || 0}
                    onChange={(e) => setCampaignForm({ ...campaignForm, dcs_threshold: parseInt(e.target.value) } as any)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className={`flex items-center justify-center w-16 h-10 rounded-xl text-sm font-bold ${
                    ((campaignForm as any).dcs_threshold || 0) >= 70
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : ((campaignForm as any).dcs_threshold || 0) >= 40
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {(campaignForm as any).dcs_threshold || 0}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-1">
                  <span>No filter</span>
                  <span>Strict</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50/50">
            <Button onClick={() => setWizardStep(1)} className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/30">
              Next: Build Sequence
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Sequence Builder */}
      {wizardStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Campaign Flow</h2>
                  <p className="text-sm text-gray-500">Build your email sequence visually</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium">
                    <Mail className="h-3.5 w-3.5" />
                    {steps.filter(s => s.step_type === 'email').length} Emails
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {steps.filter(s => s.step_type === 'delay').length} Delays
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50/30">
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
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden sticky top-20">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Edit Email</h3>
                      <p className="text-xs text-gray-500">Step {editingStep + 1}</p>
                    </div>
                    <PersonalizationDropdown onInsert={insertPersonalization} />
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                    <input
                      ref={subjectRef}
                      type="text"
                      value={steps[editingStep].subject || ''}
                      onChange={(e) => updateStep(editingStep, { subject: e.target.value })}
                      onFocus={() => setActiveField('subject')}
                      placeholder="e.g., Quick question about {{company}}"
                      className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Email Body</label>
                      <PersonalizationDropdown onInsert={insertPersonalization} variant="icon" />
                    </div>
                    <textarea
                      ref={bodyRef}
                      className="w-full min-h-[300px] rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                      value={steps[editingStep].body_html || ''}
                      onChange={(e) => updateStep(editingStep, { body_html: e.target.value })}
                      onFocus={() => setActiveField('body')}
                      placeholder={`<p>Hi {{first_name}},</p>\n\n<p>I noticed that {{company}} is...</p>\n\n<p>Best,\n{{sender_name}}</p>`}
                    />
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={steps[editingStep].skip_if_replied !== false}
                        onChange={(e) => updateStep(editingStep, { skip_if_replied: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <SkipForward className="h-4 w-4 text-gray-400" />
                          Skip if replied
                        </p>
                        <p className="text-xs text-gray-400">Don't send if the contact already replied</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ) : editingStep !== null && steps[editingStep]?.step_type === 'delay' ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden sticky top-20">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
                  <h3 className="font-semibold text-gray-900">Configure Delay</h3>
                  <p className="text-xs text-gray-500">Step {editingStep + 1}</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Days</label>
                      <input type="number" min="0" value={steps[editingStep].delay_days || 0} onChange={(e) => updateStep(editingStep, { delay_days: parseInt(e.target.value) || 0 })} className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-center text-lg font-semibold text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Hours</label>
                      <input type="number" min="0" max="23" value={steps[editingStep].delay_hours || 0} onChange={(e) => updateStep(editingStep, { delay_hours: parseInt(e.target.value) || 0 })} className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-center text-lg font-semibold text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Minutes</label>
                      <input type="number" min="0" max="59" value={steps[editingStep].delay_minutes || 0} onChange={(e) => updateStep(editingStep, { delay_minutes: parseInt(e.target.value) || 0 })} className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-center text-lg font-semibold text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-amber-800"><strong>Tip:</strong> A 1-3 day delay between emails typically performs best for cold outreach.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center sticky top-20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-7 w-7 text-indigo-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Step Editor</h3>
                <p className="text-sm text-gray-400 mb-4">Click "Edit" on an email step in the flow to customize its content here.</p>
                <p className="text-xs text-gray-300">Use the personalization dropdown to insert dynamic variables.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex justify-between">
            <Button variant="secondary" onClick={() => setWizardStep(0)}>
              <ArrowLeft className="h-4 w-4" />
              Back: Settings
            </Button>
            <Button onClick={() => setWizardStep(2)} className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/30">
              Next: Select Contacts
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Select Contacts */}
      {wizardStep === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Select Recipients</h2>
                <p className="text-sm text-gray-500">Choose which contacts will receive this campaign.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  {selectedContactIds.length} selected
                </span>
                <Button variant="secondary" size="sm" onClick={() => setShowContactModal(true)}>
                  <UserPlus className="h-4 w-4" />
                  Add Contacts
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {selectedContactIds.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts selected</h3>
                <p className="text-gray-500 mb-6">Click "Add Contacts" to choose people who will receive this campaign.</p>
                <Button onClick={() => setShowContactModal(true)} className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/30">
                  <UserPlus className="h-4 w-4" />
                  Select Contacts
                </Button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-emerald-900">{selectedContactIds.length} contacts ready</p>
                <p className="text-sm text-emerald-600 mt-1">These contacts will receive all {steps.filter(s => s.step_type === 'email').length} emails in your sequence.</p>
              </div>
            )}
          </div>
          <div className="flex justify-between p-6 border-t border-gray-100 bg-gray-50/50">
            <Button variant="secondary" onClick={() => setWizardStep(1)}>
              <ArrowLeft className="h-4 w-4" />
              Back: Sequence
            </Button>
            <Button onClick={handleSave} disabled={createCampaignMutation.isPending} className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/30">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by name, email, or company..." value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
          <div className="max-h-[400px] overflow-y-auto rounded-xl border border-gray-100">
            {contacts.map((contact: ContactWithTags) => (
              <label key={contact.id} className="flex cursor-pointer items-center gap-4 p-4 hover:bg-indigo-50/50 border-b border-gray-50 last:border-0 transition-colors">
                <input type="checkbox" checked={selectedContactIds.includes(contact.id)} onChange={() => toggleContact(contact.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{[contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.email}</p>
                  <p className="text-xs text-gray-500">{contact.email}</p>
                </div>
                {contact.company && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Building2 className="h-3.5 w-3.5" />
                    {contact.company}
                  </span>
                )}
              </label>
            ))}
            {contacts.length === 0 && <p className="p-8 text-center text-sm text-gray-400">No contacts found</p>}
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">{selectedContactIds.length} selected</p>
            <Button onClick={() => setShowContactModal(false)} className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400">
              <Check className="h-4 w-4" />
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
