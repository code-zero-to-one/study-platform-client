'use client';

import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common/ui/(shadcn)/ui/dropdown-menu';
import ToggleButton from '@/components/common/ui/toggle/button';

// 필터 옵션 타입
export interface StudyFilterValues {
  type: string[];
  targetRoles: string[];
  method: string[];
  experienceLevels: string[];
  recruiting: boolean;
}

interface StudyFilterProps {
  values: StudyFilterValues;
  onChange: (values: StudyFilterValues) => void;
}

// 스터디 유형 옵션
const STUDY_TYPE_OPTIONS = [
  { value: 'PROJECT', label: '프로젝트' },
  { value: 'SEMINAR', label: '세미나' },
  { value: 'CHALLENGE', label: '챌린지' },
  { value: 'BOOK_STUDY', label: '북스터디' },
  { value: 'LECTURE_STUDY', label: '강의스터디' },
] as const;

// 포지션 옵션
const POSITION_OPTIONS = [
  { value: 'BACKEND', label: '백엔드' },
  { value: 'FRONTEND', label: '프론트엔드' },
  { value: 'PLANNER', label: '기획자' },
  { value: 'DESIGNER', label: '디자이너' },
] as const;

// 진행 방식 옵션
const METHOD_OPTIONS = [
  { value: 'ONLINE', label: '온라인' },
  { value: 'OFFLINE', label: '오프라인' },
  { value: 'HYBRID', label: '병행' },
] as const;

// 경험 레벨 옵션
const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: '입문자' },
  { value: 'JOB_SEEKER', label: '취준생' },
  { value: 'JUNIOR', label: '주니어' },
  { value: 'MIDDLE', label: '미들' },
  { value: 'SENIOR', label: '시니어' },
] as const;

interface FilterDropdownProps {
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  selected: string[];
  onChange: (values: string[]) => void;
}

function FilterDropdown({
  label,
  options,
  selected,
  onChange,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = useCallback(
    (value: string) => {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    },
    [selected, onChange],
  );

  const hasSelection = selected.length > 0;

  const selectedLabels = selected
    .map((v) => options.find((option) => option.value === v)?.label)
    .filter(Boolean)
    .join(', ');

  const displayLabel = hasSelection ? `${label}: ${selectedLabels}` : label;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={[
            'flex items-center gap-50 rounded-full border px-200 py-100 whitespace-nowrap',
            hasSelection
              ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
              : 'border-border-default bg-fill-neutral-subtle-default text-text-default',
          ].join(' ')}
        >
          <span className="font-designer-14m">{displayLabel}</span>
          {open ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="shadow-2 rounded-100 border-border-default bg-background-default flex min-w-[160px] flex-col gap-50 border p-50"
        align="start"
      >
        {options.map((option) => {
          const isSelected = selected.includes(option.value);

          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={(e) => {
                e.preventDefault();
                toggleOption(option.value);
              }}
              className={[
                'rounded-100 cursor-pointer px-150 py-100',
                'data-[highlighted]:bg-fill-neutral-subtle-pressed',
                isSelected ? 'bg-fill-brand-subtle-default' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'font-designer-14m',
                  isSelected ? 'text-text-brand' : 'text-text-subtle',
                ].join(' ')}
              >
                {option.label}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function StudyFilter({ values, onChange }: StudyFilterProps) {
  const handleTypeChange = useCallback(
    (type: string[]) => {
      onChange({ ...values, type });
    },
    [values, onChange],
  );

  const handleTargetRolesChange = useCallback(
    (targetRoles: string[]) => {
      onChange({ ...values, targetRoles });
    },
    [values, onChange],
  );

  const handleMethodChange = useCallback(
    (method: string[]) => {
      onChange({ ...values, method });
    },
    [values, onChange],
  );

  const handleExperienceLevelsChange = useCallback(
    (experienceLevels: string[]) => {
      onChange({ ...values, experienceLevels });
    },
    [values, onChange],
  );

  const handleRecruitingChange = useCallback(
    (pressed: boolean) => {
      onChange({ ...values, recruiting: pressed });
    },
    [values, onChange],
  );

  const handleReset = useCallback(() => {
    onChange({
      type: [],
      targetRoles: [],
      method: [],
      experienceLevels: [],
      recruiting: true, // 기본값: 모집 중만 보기
    });
  }, [onChange]);

  // recruiting은 기본값이므로 필터로 간주하지 않음
  const hasAnyFilter =
    values.type.length > 0 ||
    values.targetRoles.length > 0 ||
    values.method.length > 0 ||
    values.experienceLevels.length > 0 ||
    !values.recruiting; // recruiting이 false면 필터 적용 중

  return (
    <div className="flex flex-wrap items-center gap-100">
      <FilterDropdown
        label="스터디 유형"
        options={STUDY_TYPE_OPTIONS}
        selected={values.type}
        onChange={handleTypeChange}
      />

      <FilterDropdown
        label="직무"
        options={POSITION_OPTIONS}
        selected={values.targetRoles}
        onChange={handleTargetRolesChange}
      />

      <FilterDropdown
        label="진행 방식"
        options={METHOD_OPTIONS}
        selected={values.method}
        onChange={handleMethodChange}
      />

      <FilterDropdown
        label="스터디 대상"
        options={EXPERIENCE_LEVEL_OPTIONS}
        selected={values.experienceLevels}
        onChange={handleExperienceLevelsChange}
      />

      <ToggleButton
        size="md"
        variant="round"
        color="primary"
        pressed={values.recruiting}
        onPressedChange={handleRecruitingChange}
      >
        모집 중만 보기
      </ToggleButton>

      {hasAnyFilter && (
        <button
          type="button"
          onClick={handleReset}
          className="text-text-subtle font-designer-14m flex items-center gap-50 px-100"
        >
          <RotateCcw className="size-4" />
          초기화
        </button>
      )}
    </div>
  );
}
