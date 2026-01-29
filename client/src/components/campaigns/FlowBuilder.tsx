import { useState, useCallback } from 'react';
import {
  Mail,
  Clock,
  Trash2,
  GripVertical,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  MousePointerClick,
  MessageSquare,
  ArrowDown,
  Sparkles,
  Settings,
  SkipForward,
  GitBranch,
  Webhook,
  ShieldCheck,
  Brain,
} from 'lucide-react';
import { StepType, ConditionField, ConditionOperator } from '@lemlist/shared';
import type { CreateStepInput } from '@lemlist/shared';
import { cn } from '../../lib/utils';

export type FlowStepType = 'email' | 'delay' | 'condition' | 'webhook_wait';

export interface FlowStep extends CreateStepInput {
  id?: string;
}

interface FlowBuilderProps {
  steps: FlowStep[];
  onStepsChange: (steps: FlowStep[]) => void;
  onEditStep: (index: number) => void;
  editingStep: number | null;
}

const stepTypeConfig: Record<string, {
  icon: any;
  label: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  gradient: string;
  ring: string;
}> = {
  email: {
    icon: Mail,
    label: 'Email',
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    gradient: 'from-indigo-500 to-indigo-600',
    ring: 'ring-indigo-500/20',
  },
  delay: {
    icon: Clock,
    label: 'Delay',
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500',
    ring: 'ring-amber-500/20',
  },
  condition: {
    icon: GitBranch,
    label: 'Condition',
    color: 'violet',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-600',
    gradient: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-500/20',
  },
  webhook_wait: {
    icon: Webhook,
    label: 'Webhook Wait',
    color: 'cyan',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    gradient: 'from-cyan-500 to-teal-600',
    ring: 'ring-cyan-500/20',
  },
};

const conditionFieldOptions = [
  { value: ConditionField.Opened, label: 'Email Opened', icon: Eye },
  { value: ConditionField.Clicked, label: 'Link Clicked', icon: MousePointerClick },
  { value: ConditionField.Replied, label: 'Reply Received', icon: MessageSquare },
  { value: ConditionField.SaraIntent, label: 'SARA Intent', icon: Brain },
  { value: ConditionField.DcsScore, label: 'DCS Score', icon: ShieldCheck },
  { value: ConditionField.WebhookReceived, label: 'Webhook Received', icon: Webhook },
];

const conditionOperatorOptions = [
  { value: ConditionOperator.IsTrue, label: 'Is True' },
  { value: ConditionOperator.IsFalse, label: 'Is False' },
  { value: ConditionOperator.Equals, label: 'Equals' },
  { value: ConditionOperator.NotEquals, label: 'Not Equals' },
  { value: ConditionOperator.GreaterThan, label: 'Greater Than' },
  { value: ConditionOperator.LessThan, label: 'Less Than' },
  { value: ConditionOperator.Contains, label: 'Contains' },
];

interface AddStepMenuProps {
  onAdd: (type: StepType) => void;
  showAbove?: boolean;
}

function AddStepMenu({ onAdd, showAbove }: AddStepMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex justify-center">
      {/* Connector line */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gray-200" />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 my-2"
      >
        <Plus className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className={cn(
            "absolute z-30 w-56 bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 py-2 animate-fade-in",
            showAbove ? "bottom-full mb-2" : "top-full mt-2"
          )}>
            <p className="px-3 pb-2 pt-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Add Step
            </p>
            <button
              type="button"
              onClick={() => { onAdd(StepType.Email); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <Mail className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Email Step</p>
                <p className="text-xs text-gray-400">Send a personalized email</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { onAdd(StepType.Delay); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Wait / Delay</p>
                <p className="text-xs text-gray-400">Wait before the next step</p>
              </div>
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              type="button"
              onClick={() => { onAdd(StepType.Condition); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-violet-50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <GitBranch className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Condition</p>
                <p className="text-xs text-gray-400">If/else branch logic</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { onAdd(StepType.WebhookWait); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-cyan-50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white">
                <Webhook className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Webhook Wait</p>
                <p className="text-xs text-gray-400">Wait for external event</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FlowNode({
  step,
  index,
  totalSteps,
  isEditing,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdate,
}: {
  step: FlowStep;
  index: number;
  totalSteps: number;
  isEditing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdate: (updates: Partial<FlowStep>) => void;
}) {
  const config = stepTypeConfig[step.step_type] || stepTypeConfig.email;
  const Icon = config.icon;

  const getStepSummary = () => {
    if (step.step_type === 'email') {
      return step.subject || 'Untitled Email';
    }
    if (step.step_type === 'delay') {
      const parts = [];
      if (step.delay_days) parts.push(`${step.delay_days} day${step.delay_days !== 1 ? 's' : ''}`);
      if (step.delay_hours) parts.push(`${step.delay_hours} hour${step.delay_hours !== 1 ? 's' : ''}`);
      if (step.delay_minutes) parts.push(`${step.delay_minutes} min`);
      return parts.length > 0 ? `Wait ${parts.join(', ')}` : 'No delay set';
    }
    if (step.step_type === 'condition') {
      const field = conditionFieldOptions.find((f) => f.value === step.condition_field);
      const op = conditionOperatorOptions.find((o) => o.value === step.condition_operator);
      if (field && op) {
        const valueStr = step.condition_value ? ` "${step.condition_value}"` : '';
        return `If ${field.label} ${op.label}${valueStr}`;
      }
      return 'Configure condition...';
    }
    if (step.step_type === 'webhook_wait') {
      return step.webhook_event
        ? `Wait for: ${step.webhook_event} (${step.webhook_timeout_hours || 72}h timeout)`
        : 'Configure webhook event...';
    }
    return '';
  };

  return (
    <div className="relative">
      {/* Node Card */}
      <div
        className={cn(
          'group relative mx-auto max-w-xl rounded-2xl border-2 bg-white shadow-card transition-all duration-300',
          isEditing
            ? `border-${config.color}-400 shadow-lg ring-4 ${config.ring}`
            : `border-gray-100 hover:border-${config.color}-200 hover:shadow-card-hover`
        )}
      >
        {/* Step Number Badge */}
        <div className={cn(
          'absolute -top-3 left-6 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r',
          config.gradient
        )}>
          <span>Step {index + 1}</span>
          <span className="opacity-70">/ {totalSteps}</span>
        </div>

        <div className="p-5 pt-6">
          <div className="flex items-start gap-4">
            {/* Drag Handle & Icon */}
            <div className="flex flex-col items-center gap-1">
              <button type="button" className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </button>
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                config.gradient
              )}>
                <Icon className="h-6 w-6" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{config.label}</h3>
                {step.step_type === 'email' && step.skip_if_replied !== false && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <SkipForward className="h-3 w-3" />
                    Skip if replied
                  </span>
                )}
                {step.step_type === 'condition' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600 border border-violet-200">
                    <GitBranch className="h-3 w-3" />
                    If/Else
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{getStepSummary()}</p>

              {/* Email preview */}
              {step.step_type === 'email' && step.body_html && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 line-clamp-2 border border-gray-100">
                  {step.body_html.replace(/<[^>]*>/g, '').slice(0, 120)}...
                </div>
              )}

              {/* Condition inline config */}
              {step.step_type === 'condition' && isEditing && (
                <div className="mt-3 p-4 bg-violet-50/50 rounded-xl border border-violet-200 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Condition Field</label>
                    <select
                      value={step.condition_field || ''}
                      onChange={(e) => onUpdate({ condition_field: e.target.value })}
                      className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    >
                      <option value="">Select field...</option>
                      {conditionFieldOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Operator</label>
                      <select
                        value={step.condition_operator || ''}
                        onChange={(e) => onUpdate({ condition_operator: e.target.value })}
                        className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      >
                        <option value="">Select...</option>
                        {conditionOperatorOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
                      <input
                        type="text"
                        value={step.condition_value || ''}
                        onChange={(e) => onUpdate({ condition_value: e.target.value })}
                        placeholder="e.g., interested"
                        className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <div className="flex-1 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                      <p className="text-xs font-semibold text-emerald-700">True Branch</p>
                      <p className="text-xs text-emerald-600">Next step</p>
                    </div>
                    <div className="flex-1 p-2 bg-red-50 rounded-lg border border-red-200 text-center">
                      <p className="text-xs font-semibold text-red-700">False Branch</p>
                      <p className="text-xs text-red-600">Skip to end</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Webhook wait inline config */}
              {step.step_type === 'webhook_wait' && isEditing && (
                <div className="mt-3 p-4 bg-cyan-50/50 rounded-xl border border-cyan-200 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Webhook Event</label>
                    <input
                      type="text"
                      value={step.webhook_event || ''}
                      onChange={(e) => onUpdate({ webhook_event: e.target.value })}
                      placeholder="e.g., payment.completed"
                      className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Timeout (hours)</label>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={step.webhook_timeout_hours || 72}
                      onChange={(e) => onUpdate({ webhook_timeout_hours: parseInt(e.target.value) || 72 })}
                      className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                    <p className="text-xs text-gray-400 mt-1">Contact proceeds to next step after timeout if webhook not received.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={index === totalSteps - 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              {(step.step_type === 'email' || step.step_type === 'condition' || step.step_type === 'webhook_wait') && (
                <button
                  type="button"
                  onClick={onEdit}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isEditing
                      ? `bg-${config.color}-100 text-${config.color}-600`
                      : `text-gray-500 hover:text-${config.color}-600 hover:bg-${config.color}-50`
                  )}
                >
                  {isEditing ? 'Close' : 'Edit'}
                </button>
              )}
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlowBuilder({ steps, onStepsChange, onEditStep, editingStep }: FlowBuilderProps) {
  const addStep = useCallback((type: StepType, atIndex?: number) => {
    const newStep: FlowStep = {
      step_type: type,
      step_order: steps.length,
      subject: type === StepType.Email ? '' : undefined,
      body_html: type === StepType.Email ? '' : undefined,
      delay_days: type === StepType.Delay ? 1 : 0,
      delay_hours: 0,
      delay_minutes: 0,
      skip_if_replied: type === StepType.Email ? true : undefined,
      condition_field: type === StepType.Condition ? '' : undefined,
      condition_operator: type === StepType.Condition ? '' : undefined,
      condition_value: type === StepType.Condition ? '' : undefined,
      webhook_event: type === StepType.WebhookWait ? '' : undefined,
      webhook_timeout_hours: type === StepType.WebhookWait ? 72 : undefined,
    };

    if (atIndex !== undefined) {
      const newSteps = [...steps];
      newSteps.splice(atIndex, 0, newStep);
      onStepsChange(newSteps);
      if (type === StepType.Email || type === StepType.Condition || type === StepType.WebhookWait) onEditStep(atIndex);
    } else {
      onStepsChange([...steps, newStep]);
      if (type === StepType.Email || type === StepType.Condition || type === StepType.WebhookWait) onEditStep(steps.length);
    }
  }, [steps, onStepsChange, onEditStep]);

  const removeStep = useCallback((index: number) => {
    onStepsChange(steps.filter((_, i) => i !== index));
    if (editingStep === index) onEditStep(-1);
  }, [steps, onStepsChange, editingStep, onEditStep]);

  const moveStep = useCallback((from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const newSteps = [...steps];
    const [moved] = newSteps.splice(from, 1);
    newSteps.splice(to, 0, moved);
    onStepsChange(newSteps);
    if (editingStep === from) onEditStep(to);
  }, [steps, onStepsChange, editingStep, onEditStep]);

  const updateStep = useCallback((index: number, updates: Partial<FlowStep>) => {
    onStepsChange(steps.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  }, [steps, onStepsChange]);

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center py-12">
        {/* Start node */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 mb-4">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold text-gray-900 mb-1">Campaign Start</p>
        <p className="text-sm text-gray-400 mb-6">Add your first step to begin building the sequence</p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            type="button"
            onClick={() => addStep(StepType.Email)}
            className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white group-hover:shadow-lg transition-shadow">
              <Mail className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Email</p>
              <p className="text-xs text-gray-400">Send a personalized message</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => addStep(StepType.Delay)}
            className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border-2 border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white group-hover:shadow-lg transition-shadow">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Delay</p>
              <p className="text-xs text-gray-400">Wait before next step</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => addStep(StepType.Condition)}
            className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border-2 border-dashed border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all duration-200 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white group-hover:shadow-lg transition-shadow">
              <GitBranch className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Condition</p>
              <p className="text-xs text-gray-400">If/else branching</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-6">
      {/* Start Node */}
      <div className="flex justify-center mb-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20">
          <Sparkles className="h-4 w-4" />
          Campaign Start
        </div>
      </div>

      {/* Steps */}
      {steps.map((step, index) => (
        <div key={index}>
          {/* Add step between nodes */}
          <AddStepMenu onAdd={(type) => addStep(type, index)} />

          {/* Flow Node */}
          <FlowNode
            step={step}
            index={index}
            totalSteps={steps.length}
            isEditing={editingStep === index}
            onEdit={() => onEditStep(editingStep === index ? -1 : index)}
            onRemove={() => removeStep(index)}
            onMoveUp={() => moveStep(index, index - 1)}
            onMoveDown={() => moveStep(index, index + 1)}
            onUpdate={(updates) => updateStep(index, updates)}
          />
        </div>
      ))}

      {/* Add step at end */}
      <AddStepMenu onAdd={(type) => addStep(type)} showAbove />

      {/* End Node */}
      <div className="flex justify-center mt-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-600 text-sm font-semibold">
          <Settings className="h-4 w-4" />
          Campaign End
        </div>
      </div>
    </div>
  );
}
