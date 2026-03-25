'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Tooltip from '@/components/common/ui/tooltip';

export type FieldRequirementState =
  | 'required'
  | 'optional'
  | 'applicationRequired';

const FIELD_REQUIREMENT_META: Record<
  FieldRequirementState,
  { label: string; className: string; tooltip?: string }
> = {
  required: {
    label: '필수',
    className: 'text-text-error',
  },
  optional: {
    label: '선택',
    className: 'text-text-subtle',
  },
  applicationRequired: {
    label: '신청 필수',
    className: 'text-text-brand',
    tooltip: '멘티의 신청을 받으려면 필수적으로 입력해야 합니다.',
  },
};

interface FieldRequirementBadgeProps {
  state: FieldRequirementState;
}

export default function FieldRequirementBadge({
  state,
}: FieldRequirementBadgeProps) {
  const meta = FIELD_REQUIREMENT_META[state];
  const badge = (
    <span
      className={cn(
        'font-designer-12r border-border-subtle rounded-500 border px-75 py-25',
        meta.className,
      )}
      tabIndex={meta.tooltip ? 0 : undefined}
    >
      {meta.label}
    </span>
  );

  if (!meta.tooltip) {
    return badge;
  }

  return (
    <Tooltip
      trigger={badge}
      value={
        <p className="font-designer-12r leading-relaxed">{meta.tooltip}</p>
      }
      side="top"
      contentClassName="max-w-240 rounded-100"
    />
  );
}
