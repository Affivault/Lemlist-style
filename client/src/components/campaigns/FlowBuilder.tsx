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
} from 'lucide-react';
import { StepType } from '@lemlist/shared';
import type { CreateStepInput } from '@lemlist/shared';
import { cn } from '../../lib/utils';

export type FlowStepType = 'email' | 'delay' | 'condition';

export interface FlowStep extends CreateStepInput {
  id?: string;
  conditionType?: 'opened' | 'clicked' | 'replied' | 'not_opened' | 'not_clicked';
  conditionBranch?: 'yes' | 'no';
}

interface FlowBuilderProps {
  steps: FlowStep[];
  onStepsChange: (steps: FlowStep[]) => void;
  onEditStep: (index: number) => void;
  editingStep: number | null;
}

const stepTypeConfig = {
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
};

const conditionOptions = [
  { value: 'opened', label: 'Email Opened', icon: Eye, description: 'Contact opened the previous email' },
  { value: 'clicked', label: 'Link Clicked', icon: MousePointerClick, description: 'Contact clicked a link' },
  { value: 'replied', label: 'Reply Received', icon: MessageSquare, description: 'Contact replied to the email' },
  { value: 'not_opened', label: 'Not Opened', icon: Eye, description: 'Contact did not open the email' },
  { value: 'not_clicked', label: 'Not Clicked', icon: MousePointerClick, description: 'Contact did not click' },
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
}: {
  step: FlowStep;
  index: number;
  totalSteps: number;
  isEditing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const config = stepTypeConfig[step.step_type as keyof typeof stepTypeConfig];
  const Icon = config.icon;

  const getStepSummary = () => {
    if (step.step_type === 'email') {
      return step.subject || 'Untitled Email';
    }
    const parts = [];
    if (step.delay_days) parts.push(`${step.delay_days} day${step.delay_days !== 1 ? 's' : ''}`);
    if (step.delay_hours) parts.push(`${step.delay_hours} hour${step.delay_hours !== 1 ? 's' : ''}`);
    if (step.delay_minutes) parts.push(`${step.delay_minutes} min`);
    return parts.length > 0 ? `Wait ${parts.join(', ')}` : 'No delay set';
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
              </div>
              <p className="text-sm text-gray-500 truncate">{getStepSummary()}</p>

              {/* Email preview */}
              {step.step_type === 'email' && step.body_html && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 line-clamp-2 border border-gray-100">
                  {step.body_html.replace(/<[^>]*>/g, '').slice(0, 120)}...
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
              {step.step_type === 'email' && (
                <button
                  type="button"
                  onClick={onEdit}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isEditing
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
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
      skip_if_replied: true,
    };

    if (atIndex !== undefined) {
      const newSteps = [...steps];
      newSteps.splice(atIndex, 0, newStep);
      onStepsChange(newSteps);
      if (type === StepType.Email) onEditStep(atIndex);
    } else {
      onStepsChange([...steps, newStep]);
      if (type === StepType.Email) onEditStep(steps.length);
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

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center py-12">
        {/* Start node */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 mb-4">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold text-gray-900 mb-1">Campaign Start</p>
        <p className="text-sm text-gray-400 mb-6">Add your first step to begin building the sequence</p>

        <div className="flex gap-4">
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
