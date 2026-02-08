'use client';

import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/(shadcn)/ui/dropdown-menu';
import ToggleButton from '@/components/ui/toggle/button';

// 필터 옵션 타입
export interface StudyFilterValues {
  type: string[];
  targetRoles: string[];
  method: string[];
  experienceLevels: string[];
  status: string[];
}

interface StudyFilterProps {
  values: StudyFilterValues;
  onChange: (values: StudyFilterValues) => void;
  studyCategory?: 'GROUP' | 'PREMIUM'; // 추가: 스터디 카테고리
}

// 그룹스터디 유형 옵션 (멘토링 제외)
const GROUP_STUDY_TYPE_OPTIONS = [
  { value: 'PROJECT', label: '프로젝트' },
  { value: 'SEMINAR', label: '세미나' },
  { value: 'CHALLENGE', label: '챌린지' },
  { value: 'BOOK_STUDY', label: '북스터디' },
  { value: 'LECTURE_STUDY', label: '강의스터디' },
] as const;

// 멘토스터디 유형 옵션 (멘토링 포함)
const PREMIUM_STUDY_TYPE_OPTIONS = [
  { value: 'PROJECT', label: '프로젝트' },
  { value: 'MENTORING', label: '멘토링' },
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

// 스터디 대상 (경력 여부) 옵션
const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: '입문자' },
  { value: 'JOB_SEEKER', label: '취준생' },
  { value: 'JUNIOR', label: '주니어' },
  { value: 'MIDDLE', label: '미들' },
  { value: 'SENIOR', label: '시니어' },
] as const;

// 진행 상태 옵션
const STATUS_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'RECRUITING', label: '모집 중' },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'COMPLETED', label: '종료' },
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

  // 선택된 값들의 라벨을 표시
  const getDisplayLabel = () => {
    if (selected.length === 0) return label;
    const selectedLabels = selected
      .map((val) => options.find((opt) => opt.value === val)?.label)
      .filter(Boolean)
      .join(', ');

    return `${label}: ${selectedLabels}`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={[
            'flex h-500 items-center gap-50 rounded-full border px-200 py-100 whitespace-nowrap',
            hasSelection
              ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
              : 'border-border-default bg-fill-neutral-subtle-default text-text-default',
          ].join(' ')}
        >
          <span className="font-designer-14m">{getDisplayLabel()}</span>
          {open ? (
            <ChevronUp className="size-4 flex-shrink-0" />
          ) : (
            <ChevronDown className="size-4 flex-shrink-0" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="shadow-2 rounded-100 border-border-default z-50 flex min-w-[160px] flex-col gap-50 border !bg-white p-50"
        align="start"
        sideOffset={4}
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

export default function StudyFilter({
  values,
  onChange,
  studyCategory = 'GROUP',
}: StudyFilterProps) {
  // 스터디 카테고리에 따라 다른 옵션 사용
  const studyTypeOptions =
    studyCategory === 'PREMIUM'
      ? PREMIUM_STUDY_TYPE_OPTIONS
      : GROUP_STUDY_TYPE_OPTIONS;

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

  const handleStatusChange = useCallback(
    (status: string[]) => {
      onChange({ ...values, status });
    },
    [values, onChange],
  );

  const handleReset = useCallback(() => {
    onChange({
      type: [],
      targetRoles: [],
      method: [],
      experienceLevels: [],
      status: ['RECRUITING'], // 기본값: 모집 중
    });
  }, [onChange]);

  // status가 기본값(RECRUITING만 선택)이 아니거나 다른 필터가 적용되었을 때
  const hasAnyFilter =
    values.type.length > 0 ||
    values.targetRoles.length > 0 ||
    values.method.length > 0 ||
    values.experienceLevels.length > 0 ||
    values.status.length !== 1 ||
    values.status[0] !== 'RECRUITING';

  return (
    <div className="flex flex-wrap items-center gap-100">
      <FilterDropdown
        label="스터디 유형"
        options={studyTypeOptions}
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

      <FilterDropdown
        label="진행 상태"
        options={STATUS_OPTIONS}
        selected={values.status}
        onChange={handleStatusChange}
      />

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
