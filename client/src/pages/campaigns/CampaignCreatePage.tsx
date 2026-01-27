import { useState, useEffect } from 'react';
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
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Mail,
  Clock,
  Save,
  Rocket,
  Users,
  Check,
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

export function CampaignCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState<CreateCampaignInput>({
    name: '',
    timezone: 'UTC',
    send_window_start: '09:00',
    send_window_end: '17:00',
    send_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  });

  // Steps state
  const [steps, setSteps] = useState<Array<CreateStepInput & { id?: string }>>([]);
  const [editingStep, setEditingStep] = useState<number | null>(null);

  // Contact selection
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');

  // Current wizard step
  const [wizardStep, setWizardStep] = useState(0);

  // Load existing campaign for edit
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

      // Save steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepData = { ...step, step_order: i };
        if (step.id && isEdit) {
          await campaignsApi.updateStep(campaignId, step.id, stepData);
        } else {
          await campaignsApi.addStep(campaignId, stepData);
        }
      }

      // Add contacts
      if (selectedContactIds.length > 0) {
        await campaignsApi.addContacts(campaignId, selectedContactIds);
      }

      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success(isEdit ? 'Campaign updated' : 'Campaign created');
      navigate(`/campaigns/${campaignId}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to save'),
  });

  const addStep = (type: StepType) => {
    const newStep: CreateStepInput = {
      step_type: type,
      step_order: steps.length,
      subject: type === StepType.Email ? '' : undefined,
      body_html: type === StepType.Email ? '' : undefined,
      delay_days: type === StepType.Delay ? 1 : 0,
      delay_hours: 0,
      delay_minutes: 0,
      skip_if_replied: true,
    };
    setSteps([...steps, newStep]);
    if (type === StepType.Email) setEditingStep(steps.length);
  };

  const updateStep = (index: number, updates: Partial<CreateStepInput>) => {
    setSteps(steps.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
    if (editingStep === index) setEditingStep(null);
  };

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleSave = () => {
    if (!campaignForm.name) {
      toast.error('Campaign name is required');
      return;
    }
    createCampaignMutation.mutate(campaignForm);
  };

  if (isEdit && loadingCampaign) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const contacts = contactsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSave} disabled={createCampaignMutation.isPending}>
            <Save className="h-4 w-4" />
            {createCampaignMutation.isPending ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit Campaign' : 'New Campaign'}
      </h1>

      {/* Wizard Steps */}
      <div className="flex gap-2">
        {['Settings', 'Sequence', 'Contacts'].map((label, i) => (
          <button
            key={label}
            onClick={() => setWizardStep(i)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              wizardStep === i
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
              {i + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Step 1: Campaign Settings */}
      {wizardStep === 0 && (
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Campaign Settings</h2>
          <Input
            label="Campaign Name"
            value={campaignForm.name}
            onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
            required
          />
          <Select
            label="SMTP Account"
            value={campaignForm.smtp_account_id || ''}
            onChange={(e) => setCampaignForm({ ...campaignForm, smtp_account_id: e.target.value || undefined })}
            options={[
              { value: '', label: 'Select an account...' },
              ...(smtpAccounts || []).map((a: SmtpAccount) => ({
                value: a.id,
                label: `${a.label} (${a.email_address})`,
              })),
            ]}
          />
          <Input
            label="Timezone"
            value={campaignForm.timezone || 'UTC'}
            onChange={(e) => setCampaignForm({ ...campaignForm, timezone: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Send Window Start"
              type="time"
              value={campaignForm.send_window_start || '09:00'}
              onChange={(e) => setCampaignForm({ ...campaignForm, send_window_start: e.target.value })}
            />
            <Input
              label="Send Window End"
              type="time"
              value={campaignForm.send_window_end || '17:00'}
              onChange={(e) => setCampaignForm({ ...campaignForm, send_window_end: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Send Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const current = campaignForm.send_days || [];
                    setCampaignForm({
                      ...campaignForm,
                      send_days: current.includes(day)
                        ? current.filter((d) => d !== day)
                        : [...current, day],
                    });
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    (campaignForm.send_days || []).includes(day)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setWizardStep(1)}>Next: Sequence</Button>
          </div>
        </div>
      )}

      {/* Step 2: Sequence Builder */}
      {wizardStep === 1 && (
        <div className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Email Sequence</h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => addStep(StepType.Email)}>
                <Mail className="h-4 w-4" />
                Add Email
              </Button>
              <Button variant="secondary" size="sm" onClick={() => addStep(StepType.Delay)}>
                <Clock className="h-4 w-4" />
                Add Delay
              </Button>
            </div>
          </div>

          {steps.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Add email and delay steps to build your sequence.
            </p>
          ) : (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 cursor-grab text-gray-400" />
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {index + 1}
                      </span>
                      {step.step_type === 'email' ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary-500" />
                          <span className="font-medium text-gray-900">
                            {step.subject || 'Untitled Email'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-gray-900">
                            Wait {step.delay_days || 0}d {step.delay_hours || 0}h {step.delay_minutes || 0}m
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {step.step_type === 'email' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStep(editingStep === index ? null : index)}
                        >
                          {editingStep === index ? 'Close' : 'Edit'}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => removeStep(index)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Email editor */}
                  {step.step_type === 'email' && editingStep === index && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <Input
                        label="Subject"
                        value={step.subject || ''}
                        onChange={(e) => updateStep(index, { subject: e.target.value })}
                        placeholder="Email subject line..."
                      />
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Body (HTML)</label>
                        <textarea
                          className="input-field min-h-[200px] font-mono text-sm"
                          value={step.body_html || ''}
                          onChange={(e) => updateStep(index, { body_html: e.target.value })}
                          placeholder="<p>Hi {{first_name}},</p>..."
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Use {'{{first_name}}'}, {'{{last_name}}'}, {'{{company}}'}, {'{{email}}'} for personalization.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={step.skip_if_replied !== false}
                          onChange={(e) => updateStep(index, { skip_if_replied: e.target.checked })}
                          className="rounded"
                        />
                        Skip if contact already replied
                      </label>
                    </div>
                  )}

                  {/* Delay editor */}
                  {step.step_type === 'delay' && (
                    <div className="mt-3 flex gap-3">
                      <Input
                        label="Days"
                        type="number"
                        value={String(step.delay_days || 0)}
                        onChange={(e) => updateStep(index, { delay_days: parseInt(e.target.value) || 0 })}
                        className="w-24"
                      />
                      <Input
                        label="Hours"
                        type="number"
                        value={String(step.delay_hours || 0)}
                        onChange={(e) => updateStep(index, { delay_hours: parseInt(e.target.value) || 0 })}
                        className="w-24"
                      />
                      <Input
                        label="Minutes"
                        type="number"
                        value={String(step.delay_minutes || 0)}
                        onChange={(e) => updateStep(index, { delay_minutes: parseInt(e.target.value) || 0 })}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => setWizardStep(0)}>
              Back: Settings
            </Button>
            <Button onClick={() => setWizardStep(2)}>Next: Contacts</Button>
          </div>
        </div>
      )}

      {/* Step 3: Select Contacts */}
      {wizardStep === 2 && (
        <div className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Add Contacts ({selectedContactIds.length} selected)
            </h2>
            <Button variant="secondary" size="sm" onClick={() => setShowContactModal(true)}>
              <Users className="h-4 w-4" />
              Select Contacts
            </Button>
          </div>

          {selectedContactIds.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No contacts selected. Click "Select Contacts" to add people to this campaign.
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              {selectedContactIds.length} contacts will receive this campaign.
            </p>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => setWizardStep(1)}>
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
          <Input
            placeholder="Search contacts..."
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
          />
          <div className="max-h-96 overflow-y-auto">
            {contacts.map((contact: ContactWithTags) => (
              <label
                key={contact.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedContactIds.includes(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.email}
                  </p>
                  <p className="text-xs text-gray-500">{contact.email}</p>
                </div>
                {contact.company && (
                  <span className="text-xs text-gray-400">{contact.company}</span>
                )}
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowContactModal(false)}>
              Done ({selectedContactIds.length} selected)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
