'use client';

import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Eye,
  Info,
  MessageCircle,
  Monitor,
  Phone,
  RotateCcw,
  Star,
  UserRound,
  Users,
} from 'lucide-react';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Controller, type FieldPath, useController } from 'react-hook-form';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import ChipButton from '@/components/common/ui/chip/chip-button';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import FormSectionCard from '@/components/common/ui/form/form-section-card';
import SelectableTagsInput from '@/components/common/ui/form/multi-item-selector';
import { BaseInput } from '@/components/common/ui/input';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import Tooltip from '@/components/common/ui/tooltip';
import { normalizeMentorProfileKeywordValues } from '@/features/mentoring/model/mentor-registration-keywords';
import {
  CONSULTING_DURATION_DROPDOWN_OPTIONS,
  MENTOR_APPEAL_LINE_PRESETS,
} from '@/features/mentoring/model/mentor-setting-options';
import {
  createDefaultMentorSettings,
  getMentorScheduleDraftErrors,
} from '@/features/mentoring/model/mentor-settings';
import MentorCareerEntriesEditor from '@/features/mentoring/ui/registration/mentor-career-entries-editor';
import MentorMarkdownEditor from '@/features/mentoring/ui/registration/mentor-markdown-editor';
import WeeklyScheduleGrid from '@/features/mentoring/ui/settings/weekly-schedule-grid';
import { normalizeMentorMarkdownContent } from '@/types/mentoring/markdown';
import {
  type MentorRegistrationFormProps,
  type MentorRegistrationMethodField,
  type MentorRegistrationScheduleDraftState,
  type MentorRegistrationStepId,
  type MentorRegistrationVisibleStepId,
  MENTOR_REGISTRATION_STEP_IDS,
  normalizeMentorRegistrationStepId,
} from '@/types/mentoring/registration-view';
import { WEEKDAY_KEYS } from '@/types/mentoring/settings';
import {
  APPEAL_LINE_MAX_LENGTH,
  createEmptyMentorScheduleDrafts,
  INTERVIEW_QUESTION_TEXTAREA_MAX_LENGTH,
  mentorRegistrationSchema,
  MENTOR_SKILL_TAG_MAX_LENGTH,
  MENTORING_TITLE_MAX_LENGTH,
  type MentorRegistrationFormInputValues,
} from '@/types/schemas/mentor-registration-schema';

const METHOD_FIELDS: MentorRegistrationMethodField[] = [
  {
    enabledField: 'noteEnabled',
    priceField: 'notePrice',
    label: '쪽지상담',
    description:
      '미리 질문/고민/자료를 전달하고 텍스트로 빠르게 답변받는 비동기 상담입니다.',
    policySummary: '결제 후 멘토의 첫 답장이 수락 처리됩니다.',
  },
  {
    enabledField: 'simpleEnabled',
    priceField: 'simplePrice',
    label: '간편상담',
    description:
      '허들을 낮춘 빠른 상담 방식입니다. 질문/자료를 선제출하고 15분 내 핵심 피드백을 받습니다.',
    policySummary:
      '결제 후 멘토 수락이 필요하며, 48시간 내 미응답 시 자동 거절됩니다.',
  },
  {
    enabledField: 'deepEnabled',
    priceField: 'deepPrice',
    durationField: 'deepDurationMinutes',
    label: '심층상담',
    description:
      '화면/코드를 함께 보며 피드백을 주고받는 방식입니다. 30/60/90분 중 선택합니다.',
    policySummary:
      '결제 후 멘토 수락이 필요하며, 48시간 내 미응답 시 자동 거절됩니다.',
  },
  {
    enabledField: 'offlineEnabled',
    priceField: 'offlinePrice',
    durationField: 'offlineDurationMinutes',
    label: '대면상담',
    description:
      '커피챗/심층 상담 방식입니다. 필요 시 세일즈 제안 목적 상담으로도 활용할 수 있습니다.',
    policySummary:
      '결제 후 멘토 수락이 필요하며, 48시간 내 미응답 시 자동 거절됩니다.',
  },
];

const MIN_MENTORING_PRICE = 3000;
const MAX_MENTORING_PRICE = 1_000_000;
const PRICE_INPUT_STEP = 1000;
const PRICE_INPUT_CLASS =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';
const INTERVIEW_QUESTION_PLACEHOLDER =
  '예) 이력서/포트폴리오 링크를 미리 공유해주세요.\n예) 상담에서 다루고 싶은 질문 2~3개를 정리해주세요.\n예) 사전 과제/코드가 있다면 레포지토리 링크를 남겨주세요.';

type FieldRequirementState = 'required' | 'optional' | 'applicationRequired';

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

const FieldRequirementBadge = ({ state }: { state: FieldRequirementState }) => {
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
      contentClassName="max-w-[240px] rounded-100"
    />
  );
};

const METHOD_ICON_MAP: Record<
  MentorRegistrationMethodField['enabledField'],
  ReactNode
> = {
  noteEnabled: <MessageCircle className="h-16 w-16" />,
  simpleEnabled: <Phone className="h-16 w-16" />,
  deepEnabled: <Monitor className="h-16 w-16" />,
  offlineEnabled: <Users className="h-16 w-16" />,
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

const isUserFacingValidationMessage = (message: string): boolean => {
  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return false;
  }

  return !trimmed.startsWith('Invalid input:');
};

const collectErrorMessages = (value: unknown): string[] => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const messages: string[] = [];
  const visited = new WeakSet<object>();
  const queue: unknown[] = [value];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || typeof node !== 'object') {
      continue;
    }

    if (visited.has(node)) {
      continue;
    }
    visited.add(node);

    if (Array.isArray(node)) {
      queue.push(...node);
      continue;
    }

    if (!isPlainObject(node)) {
      continue;
    }

    const message = node.message;
    if (typeof message === 'string') {
      const trimmed = message.trim();
      if (isUserFacingValidationMessage(trimmed)) {
        messages.push(trimmed);
      }
    }

    Object.entries(node).forEach(([key, child]) => {
      if (key === 'ref') {
        return;
      }
      queue.push(child);
    });
  }

  return messages;
};

const normalizeInterviewQuestions = (value: string): string[] => {
  return value
    .split('\n')
    .map((question) => question.trim())
    .filter((question) => question.length > 0);
};

const toInterviewQuestionList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

const DEFAULT_SCHEDULE = createDefaultMentorSettings().schedule;

interface InterviewQuestionsTextareaProps {
  value: string[];
  onChange: (value: string[]) => void;
}

interface SelectionOption {
  value: string;
  label: string;
}

interface MentorRegistrationStepMeta {
  id: MentorRegistrationVisibleStepId;
  title: string;
  description: string;
  previewSection?: 'headline' | 'methods' | 'description' | 'interview';
}

const MENTOR_REGISTRATION_STEPS: MentorRegistrationStepMeta[] = [
  {
    id: MENTOR_REGISTRATION_STEP_IDS.basicInformation,
    title: '기본정보',
    description: '멘티가 가장 먼저 확인하는 핵심 소개를 입력합니다.',
    previewSection: 'headline',
  },
  {
    id: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
    title: '멘토정보',
    description: '포지션, 핵심 키워드, 주요 이력을 설정합니다.',
    previewSection: 'headline',
  },
  {
    id: MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
    title: '멘토 소개',
    description: '멘토 소개와 상담 전 준비사항을 함께 작성합니다.',
    previewSection: 'description',
  },
  {
    id: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
    title: '가격/시간',
    description:
      '상담 방식과 금액을 먼저 정하면 다음 단계의 스케줄 필요 여부가 결정됩니다.',
    previewSection: 'methods',
  },
  {
    id: MENTOR_REGISTRATION_STEP_IDS.schedule,
    title: '스케줄 설정',
    description:
      '간편/심층/대면 상담을 켠 경우에만 상담 가능 시간을 30분 단위로 고릅니다.',
    previewSection: 'methods',
  },
  {
    id: MENTOR_REGISTRATION_STEP_IDS.settlement,
    title: '정산정보 (추후 제공)',
    description: '정산정보 기능은 추후 제공 예정입니다.',
  },
];

const STEP_FIELD_PATHS: Record<
  MentorRegistrationStepId,
  FieldPath<MentorRegistrationFormInputValues>[]
> = {
  [MENTOR_REGISTRATION_STEP_IDS.basicInformation]: [
    'mentoringTitle',
    'appealLine',
    'listVisible',
  ],
  [MENTOR_REGISTRATION_STEP_IDS.mentorInformation]: [
    'jobGroup',
    'jobTitle',
    'careerYears',
    'careerEntries',
    'skillTags',
  ],
  [MENTOR_REGISTRATION_STEP_IDS.mentorDescription]: [
    'detailedDescription',
    'interviewQuestions',
  ],
  [MENTOR_REGISTRATION_STEP_IDS.schedule]: ['schedule'],
  [MENTOR_REGISTRATION_STEP_IDS.pricingAndTime]: [
    'noteEnabled',
    'notePrice',
    'simpleEnabled',
    'simplePrice',
    'deepEnabled',
    'deepPrice',
    'deepDurationMinutes',
    'offlineEnabled',
    'offlinePrice',
    'offlineDurationMinutes',
  ],
  [MENTOR_REGISTRATION_STEP_IDS.settlement]: [],
};

const FIELD_PATH_TO_STEP_ID: Record<string, MentorRegistrationStepId> = {
  mentoringTitle: MENTOR_REGISTRATION_STEP_IDS.basicInformation,
  appealLine: MENTOR_REGISTRATION_STEP_IDS.basicInformation,
  listVisible: MENTOR_REGISTRATION_STEP_IDS.basicInformation,
  jobGroup: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  jobTitle: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  careerYears: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  careerEntries: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  skillTags: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  noteEnabled: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  notePrice: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  simpleEnabled: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  simplePrice: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  deepEnabled: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  deepPrice: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  deepDurationMinutes: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  offlineEnabled: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  offlinePrice: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  offlineDurationMinutes: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  detailedDescription: MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
  interviewQuestions: MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
  schedule: MENTOR_REGISTRATION_STEP_IDS.schedule,
};

const areSameScheduleDrafts = (
  left: ReturnType<typeof createEmptyMentorScheduleDrafts>,
  right: ReturnType<typeof createEmptyMentorScheduleDrafts>,
) => {
  return WEEKDAY_KEYS.every((day) => {
    if (left[day].length !== right[day].length) {
      return false;
    }

    return left[day].every((draft, index) => draft === right[day][index]);
  });
};

const collectFirstErrorFieldPath = (
  value: unknown,
  parentPath = '',
): string | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const child of value) {
      const nextPath = collectFirstErrorFieldPath(child, parentPath);
      if (nextPath) {
        return nextPath;
      }
    }

    return undefined;
  }

  if (!isPlainObject(value)) {
    return undefined;
  }

  if (typeof value.message === 'string' && parentPath.length > 0) {
    return parentPath;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === 'ref' || key === 'message') {
      continue;
    }

    const nextPath = collectFirstErrorFieldPath(
      child,
      parentPath.length > 0 ? `${parentPath}.${key}` : key,
    );

    if (nextPath) {
      return nextPath;
    }
  }

  return undefined;
};

const resolveStepIdFromFieldPath = (
  fieldPath: string | undefined,
): MentorRegistrationStepId | undefined => {
  if (!fieldPath) {
    return undefined;
  }

  const [topLevelField] = fieldPath.split('.');

  return FIELD_PATH_TO_STEP_ID[topLevelField];
};

interface RegistrationStepNavigatorProps {
  steps: MentorRegistrationStepMeta[];
  currentStepId: MentorRegistrationVisibleStepId;
  onSelectStep: (stepId: MentorRegistrationVisibleStepId) => void;
}

const RegistrationStepNavigator = ({
  steps,
  currentStepId,
  onSelectStep,
}: RegistrationStepNavigatorProps) => {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <section className="rounded-200 border-border-subtle bg-background-default mb-200 border px-150 py-150 sm:px-200 sm:py-175">
      <div className="mb-125">
        <p className="font-designer-13r text-text-subtle">
          {currentStepIndex + 1} / {steps.length} 단계
        </p>
      </div>
      <div className="flex gap-75 overflow-x-auto pb-25">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId;
          const isCompleted = index < currentStepIndex;

          return (
            <button
              key={step.id}
              type="button"
              className={cn(
                'rounded-150 min-w-[132px] border px-125 py-100 text-left transition-colors',
                isActive
                  ? 'border-border-brand bg-fill-brand-subtle-default'
                  : 'border-border-subtle bg-background-default hover:border-border-default hover:bg-background-alternative',
              )}
              onClick={() => onSelectStep(step.id)}
            >
              <p
                className={cn(
                  'font-designer-12b mb-25',
                  isActive || isCompleted
                    ? 'text-text-brand'
                    : 'text-text-subtle',
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </p>
              <p className="font-designer-13b text-text-default whitespace-nowrap">
                {step.title}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

type PublicExposureStatus = 'pending' | 'ready' | 'hidden';

const PUBLIC_EXPOSURE_STATUS_META: Record<
  PublicExposureStatus,
  { label: string; className: string }
> = {
  pending: {
    label: '작성 전',
    className: 'border-border-subtle bg-background-default text-text-subtle',
  },
  ready: {
    label: '가능',
    className:
      'border-border-brand bg-fill-brand-subtle-default text-text-brand',
  },
  hidden: {
    label: '비노출',
    className:
      'border-border-default bg-background-alternative text-text-subtle',
  },
};

const PublicExposureStatusBadge = ({
  status,
}: {
  status: PublicExposureStatus;
}) => {
  const meta = PUBLIC_EXPOSURE_STATUS_META[status];

  return (
    <span
      className={cn(
        'font-designer-12b rounded-500 border px-100 py-25',
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
};

interface PublicExposureGuideCardProps {
  listVisible: boolean;
  isListExposureReady: boolean;
  isDetailExposureReady: boolean;
  isApplicationRequirementReady: boolean;
}

const PublicExposureGuideCard = ({
  listVisible,
  isListExposureReady,
  isDetailExposureReady,
  isApplicationRequirementReady,
}: PublicExposureGuideCardProps) => {
  const summary = !isListExposureReady
    ? '기본정보와 멘토정보를 입력하면 저장 후 멘토링 목록에 준비중으로 먼저 노출됩니다.'
    : !listVisible
      ? '기본정보와 멘토정보는 완료됐지만 현재 목록 비노출 상태입니다. 목록 노출을 켜면 저장 후 준비중으로 노출됩니다.'
      : '지금 저장하면 멘토링 목록에 준비중으로 먼저 노출됩니다.';
  const listStatus: PublicExposureStatus = !isListExposureReady
    ? 'pending'
    : listVisible
      ? 'ready'
      : 'hidden';
  const detailStatus: PublicExposureStatus = !isDetailExposureReady
    ? 'pending'
    : listVisible
      ? 'ready'
      : 'hidden';
  const applicationStatus: PublicExposureStatus = !isApplicationRequirementReady
    ? 'pending'
    : listVisible
      ? 'ready'
      : 'hidden';
  const items: Array<{
    key: string;
    title: string;
    description: string;
    status: PublicExposureStatus;
  }> = [
    {
      key: 'list',
      title: '목록 공개',
      description:
        '기본정보와 멘토정보를 저장하면 멘토링 목록에 준비중으로 노출됩니다.',
      status: listStatus,
    },
    {
      key: 'detail',
      title: '상세 공개',
      description: '멘토소개까지 입력하면 멘토 상세 본문도 함께 공개됩니다.',
      status: detailStatus,
    },
    {
      key: 'apply',
      title: '신청 준비',
      description:
        '스케줄과 가격/시간, 정산정보를 입력하면 멘토링 진행이 가능해집니다.',
      status: applicationStatus,
    },
  ];

  return (
    <section className="rounded-200 border-border-subtle bg-background-default mb-200 border px-150 py-150 sm:px-200 sm:py-175">
      <div className="flex items-start gap-100">
        <Info className="text-text-brand mt-[2px] h-16 w-16 shrink-0" />
        <div className="min-w-0">
          <p className="font-designer-13b text-text-default">공개 흐름 안내</p>
          <p className="font-designer-13r text-text-subtle mt-25 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
      <div className="mt-150 grid grid-cols-1 gap-100 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-150 border-border-subtle bg-background-alternative border px-150 py-150"
          >
            <div className="mb-75 flex items-center justify-between gap-100">
              <p className="font-designer-13b text-text-default">
                {item.title}
              </p>
              <PublicExposureStatusBadge status={item.status} />
            </div>
            <p className="font-designer-12r text-text-subtle leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

interface RegistrationStepFooterProps {
  currentStepIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

const RegistrationStepFooter = ({
  currentStepIndex,
  totalSteps,
  onPrevious,
  onNext,
}: RegistrationStepFooterProps) => {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div className="border-border-subtle mt-200 flex justify-end gap-100 border-t pt-200">
      <Button
        type="button"
        color="secondary"
        size="medium"
        disabled={isFirstStep}
        onClick={onPrevious}
      >
        <ChevronLeft className="mr-50 h-14 w-14" />
        이전
      </Button>
      {!isLastStep && (
        <Button type="button" color="primary" size="medium" onClick={onNext}>
          다음
          <ChevronRight className="ml-50 h-14 w-14" />
        </Button>
      )}
    </div>
  );
};

const InterviewQuestionsTextarea = ({
  value,
  onChange,
}: InterviewQuestionsTextareaProps) => {
  const safeValue = toInterviewQuestionList(value);
  const valueText = safeValue.join('\n');
  const [draftText, setDraftText] = useState(valueText);
  const lastCommittedValueTextRef = useRef(valueText);

  useEffect(() => {
    if (valueText === lastCommittedValueTextRef.current) {
      return;
    }

    setDraftText(valueText);
    lastCommittedValueTextRef.current = valueText;
  }, [valueText]);

  const handleChange = (nextText: string) => {
    setDraftText(nextText);

    const nextQuestions = normalizeInterviewQuestions(nextText);
    lastCommittedValueTextRef.current = nextQuestions.join('\n');
    onChange(nextQuestions);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.stopPropagation();
    }
  };

  return (
    <BorderedTextarea
      value={draftText}
      onChange={(event) => handleChange(event.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={INTERVIEW_QUESTION_PLACEHOLDER}
      maxLength={INTERVIEW_QUESTION_TEXTAREA_MAX_LENGTH}
    />
  );
};

export default function MentorRegistrationForm({
  form,
  options,
  persistedPredefinedCoreKeywords = [],
  onCancel,
  onSubmit,
  isSaving = false,
  initialStepId,
  externalSaveBlockingMessage,
  onStepChange,
  onScheduleDraftStateChange,
}: MentorRegistrationFormProps) {
  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;
  const { field: mentorDescriptionField } = useController({
    name: 'detailedDescription',
    control,
    defaultValue: '',
  });
  const { field: interviewQuestionsField } = useController({
    name: 'interviewQuestions',
    control,
    defaultValue: [],
  });
  const { field: scheduleField } = useController({
    name: 'schedule',
    control,
    defaultValue: DEFAULT_SCHEDULE,
  });

  const dirtyValidationOptions = {
    shouldValidate: true,
    shouldDirty: true,
  } as const;

  const jobGroup = watch('jobGroup');
  const jobTitle = watch('jobTitle');
  const careerYears = watch('careerYears');
  const profileKeywords = watch('skillTags');
  const scheduleDrafts = watch('scheduleDrafts');
  const currentScheduleDrafts =
    scheduleDrafts ?? createEmptyMentorScheduleDrafts();
  const watchedFormValues = watch();
  const currentFormValues = useMemo<MentorRegistrationFormInputValues>(
    () => ({
      ...watchedFormValues,
      detailedDescription: mentorDescriptionField.value ?? '',
      interviewQuestions: interviewQuestionsField.value ?? [],
      schedule: scheduleField.value ?? DEFAULT_SCHEDULE,
      scheduleDrafts: currentScheduleDrafts,
    }),
    [
      currentScheduleDrafts,
      interviewQuestionsField.value,
      mentorDescriptionField.value,
      scheduleField.value,
      watchedFormValues,
    ],
  );
  const deferredFormValues = useDeferredValue(currentFormValues);
  const noteEnabled = watch('noteEnabled');
  const listVisible = watch('listVisible');
  const simpleEnabled = watch('simpleEnabled');
  const deepEnabled = watch('deepEnabled');
  const offlineEnabled = watch('offlineEnabled');
  const methodEnabledState: Record<
    MentorRegistrationMethodField['enabledField'],
    boolean
  > = {
    noteEnabled,
    simpleEnabled,
    deepEnabled,
    offlineEnabled,
  };
  const selectableJobGroupOptions = useMemo(() => {
    return options.jobGroups
      .filter((option) => option.active)
      .map((option) => ({
        value: option.code,
        label: option.label,
      }));
  }, [options.jobGroups]);
  const jobGroupLabelMap = useMemo(
    () =>
      new Map(options.jobGroups.map((option) => [option.code, option.label])),
    [options.jobGroups],
  );
  const jobGroupOptions = useMemo(() => {
    if (
      !jobGroup ||
      selectableJobGroupOptions.some((option) => option.value === jobGroup)
    ) {
      return selectableJobGroupOptions;
    }

    return [
      ...selectableJobGroupOptions,
      {
        value: jobGroup,
        label: `${jobGroupLabelMap.get(jobGroup) ?? jobGroup} (재선택 필요)`,
      },
    ];
  }, [jobGroup, jobGroupLabelMap, selectableJobGroupOptions]);
  const jobTitleLabelMap = useMemo(
    () =>
      new Map(options.jobTitles.map((option) => [option.code, option.label])),
    [options.jobTitles],
  );
  const careerLabelMap = useMemo(
    () => new Map(options.careers.map((option) => [option.code, option.label])),
    [options.careers],
  );
  const maxSelectableCoreKeywordCount = Math.max(
    1,
    options.maxCoreKeywordCount,
  );
  const registeredCoreKeywordLabelMap = useMemo(() => {
    const labelMap = new Map(
      options.selectableCoreKeywords.map((keyword) => [
        keyword.code.toLowerCase(),
        keyword.label,
      ]),
    );

    persistedPredefinedCoreKeywords.forEach((keyword) => {
      const normalizedCode = keyword.code.toLowerCase();

      if (!labelMap.has(normalizedCode)) {
        labelMap.set(normalizedCode, keyword.label);
      }
    });

    return labelMap;
  }, [options.selectableCoreKeywords, persistedPredefinedCoreKeywords]);
  const selectableJobTitleOptions = useMemo(
    () =>
      options.jobTitles
        .filter((option) => option.active && option.jobGroupCode === jobGroup)
        .map((option) => ({
          value: option.code,
          label: option.label,
        })),
    [jobGroup, options.jobTitles],
  );
  const jobTitleOptions = useMemo(() => {
    if (
      !jobTitle ||
      selectableJobTitleOptions.some((option) => option.value === jobTitle)
    ) {
      return selectableJobTitleOptions;
    }

    return [
      ...selectableJobTitleOptions,
      {
        value: jobTitle,
        label: `${jobTitleLabelMap.get(jobTitle) ?? jobTitle} (재선택 필요)`,
      },
    ];
  }, [jobTitle, jobTitleLabelMap, selectableJobTitleOptions]);
  const selectableCareerOptions = useMemo(
    () =>
      options.careers
        .filter((option) => option.active)
        .map((option) => ({
          value: option.code,
          label: option.label,
        })),
    [options.careers],
  );
  const careerOptions = useMemo(() => {
    if (
      !careerYears ||
      selectableCareerOptions.some((option) => option.value === careerYears)
    ) {
      return selectableCareerOptions;
    }

    return [
      ...selectableCareerOptions,
      {
        value: careerYears,
        label: `${careerLabelMap.get(careerYears) ?? careerYears} (재선택 필요)`,
      },
    ];
  }, [careerLabelMap, careerYears, selectableCareerOptions]);
  const selectableCoreKeywordOptions = useMemo(
    () =>
      options.selectableCoreKeywords
        .filter((keyword) => {
          if (!keyword.active) {
            return false;
          }

          const matchesJobGroup =
            keyword.jobGroupCodes.length === 0 ||
            keyword.jobGroupCodes.includes(jobGroup);
          const matchesJobTitle =
            keyword.jobTitleCodes.length === 0 ||
            keyword.jobTitleCodes.includes(jobTitle);

          return matchesJobGroup && matchesJobTitle;
        })
        .map((keyword) => ({
          value: keyword.code,
          label: keyword.label,
        })),
    [jobGroup, jobTitle, options.selectableCoreKeywords],
  );
  const additionalSelectedCoreKeywordOptions = useMemo(() => {
    const appendedOptions: SelectionOption[] = [];
    const seenValues = new Set(
      selectableCoreKeywordOptions.map((option) => option.value.toLowerCase()),
    );

    profileKeywords.forEach((keyword) => {
      const normalizedKeyword = keyword.toLowerCase();

      if (seenValues.has(normalizedKeyword)) {
        return;
      }

      const label = registeredCoreKeywordLabelMap.get(normalizedKeyword);
      if (!label) {
        return;
      }

      seenValues.add(normalizedKeyword);
      appendedOptions.push({
        value: keyword,
        label: `${label} (재선택 필요)`,
      });
    });

    return appendedOptions;
  }, [
    profileKeywords,
    registeredCoreKeywordLabelMap,
    selectableCoreKeywordOptions,
  ]);
  const visibleCoreKeywordOptions = useMemo(
    () => [
      ...selectableCoreKeywordOptions,
      ...additionalSelectedCoreKeywordOptions,
    ],
    [additionalSelectedCoreKeywordOptions, selectableCoreKeywordOptions],
  );
  const coreKeywordValueSet = useMemo(
    () =>
      new Set(
        selectableCoreKeywordOptions.map((option) =>
          option.value.toLowerCase(),
        ),
      ),
    [selectableCoreKeywordOptions],
  );
  const normalizeProfileKeywordSelection = useCallback(
    (nextProfileKeywords: string[]) =>
      normalizeMentorProfileKeywordValues({
        profileKeywords: nextProfileKeywords,
        registrationOptions: options,
        persistedPredefinedCoreKeywords,
      }),
    [options, persistedPredefinedCoreKeywords],
  );
  const validJobGroupSet = useMemo(
    () => new Set(selectableJobGroupOptions.map((option) => option.value)),
    [selectableJobGroupOptions],
  );
  const validJobTitleSet = useMemo(
    () => new Set(selectableJobTitleOptions.map((option) => option.value)),
    [selectableJobTitleOptions],
  );
  const validCareerSet = useMemo(
    () => new Set(selectableCareerOptions.map((option) => option.value)),
    [selectableCareerOptions],
  );
  const jobGroupSelectionMessage = useMemo(() => {
    if (!jobGroup || validJobGroupSet.has(jobGroup)) {
      return undefined;
    }

    return `선택한 직군 "${jobGroupLabelMap.get(jobGroup) ?? jobGroup}"이 현재 옵션과 맞지 않아 다시 선택해야 합니다.`;
  }, [jobGroup, jobGroupLabelMap, validJobGroupSet]);
  const jobTitleSelectionMessage = useMemo(() => {
    if (!jobTitle || validJobTitleSet.has(jobTitle)) {
      return undefined;
    }

    return `선택한 직무 "${jobTitleLabelMap.get(jobTitle) ?? jobTitle}"가 현재 직군과 맞지 않아 다시 선택해야 합니다.`;
  }, [jobTitle, jobTitleLabelMap, validJobTitleSet]);
  const careerSelectionMessage = useMemo(() => {
    if (!careerYears || validCareerSet.has(careerYears)) {
      return undefined;
    }

    return `선택한 경력 "${careerLabelMap.get(careerYears) ?? careerYears}"가 현재 옵션과 맞지 않아 다시 선택해야 합니다.`;
  }, [careerLabelMap, careerYears, validCareerSet]);
  const deprecatedRegisteredCoreKeywords = useMemo(
    () =>
      profileKeywords.filter((keyword: string) => {
        const normalizedKeyword = keyword.toLowerCase();

        return (
          registeredCoreKeywordLabelMap.has(normalizedKeyword) &&
          !coreKeywordValueSet.has(normalizedKeyword)
        );
      }),
    [coreKeywordValueSet, profileKeywords, registeredCoreKeywordLabelMap],
  );
  const deprecatedCoreKeywordMessage =
    deprecatedRegisteredCoreKeywords.length > 0
      ? '현재 직군/직무와 맞지 않는 핵심 키워드가 있어 다시 선택해야 합니다.'
      : undefined;
  const coreKeywordLimitMessage =
    profileKeywords.length > maxSelectableCoreKeywordCount
      ? `핵심 키워드는 최대 ${maxSelectableCoreKeywordCount}개까지만 저장할 수 있습니다.`
      : undefined;
  const mentorPositionErrorMessage =
    errors.jobGroup?.message ??
    jobGroupSelectionMessage ??
    errors.jobTitle?.message ??
    jobTitleSelectionMessage ??
    errors.careerYears?.message ??
    careerSelectionMessage;
  const skillTagErrorMessage =
    errors.skillTags?.message ??
    coreKeywordLimitMessage ??
    deprecatedCoreKeywordMessage;
  const selectionValidationMessages = [
    jobGroupSelectionMessage,
    jobTitleSelectionMessage,
    careerSelectionMessage,
    deprecatedCoreKeywordMessage,
    coreKeywordLimitMessage,
  ].filter((message): message is string => Boolean(message));
  const needsSchedule = simpleEnabled || deepEnabled || offlineEnabled;
  const isBasicInformationReady =
    currentFormValues.mentoringTitle.trim().length > 0 &&
    currentFormValues.appealLine.trim().length > 0;
  const hasSelectedSkillTags = currentFormValues.skillTags.some(
    (tag) => tag.trim().length > 0,
  );
  const isMentorInformationReady =
    currentFormValues.jobGroup.trim().length > 0 &&
    currentFormValues.jobTitle.trim().length > 0 &&
    currentFormValues.careerYears.trim().length > 0 &&
    hasSelectedSkillTags &&
    !jobGroupSelectionMessage &&
    !jobTitleSelectionMessage &&
    !careerSelectionMessage &&
    !deprecatedCoreKeywordMessage &&
    !coreKeywordLimitMessage;
  const isListExposureReady =
    isBasicInformationReady && isMentorInformationReady;
  const isDetailExposureReady =
    isListExposureReady &&
    normalizeMentorMarkdownContent(currentFormValues.detailedDescription)
      .length > 0;
  const hasScheduleReady = WEEKDAY_KEYS.some(
    (day) => (currentFormValues.schedule.weekly[day] ?? []).length > 0,
  );
  const isScheduleRequirementReady = !needsSchedule || hasScheduleReady;
  const hasPricingReady = METHOD_FIELDS.some((field) => {
    const enabled = currentFormValues[field.enabledField];
    const price = currentFormValues[field.priceField];

    return enabled === true && typeof price === 'number' && price > 0;
  });
  const isSettlementReady = false;
  const isApplicationRequirementReady =
    isDetailExposureReady &&
    isScheduleRequirementReady &&
    hasPricingReady &&
    isSettlementReady;
  const scheduleDraftErrors = useMemo(
    () => getMentorScheduleDraftErrors(currentScheduleDrafts),
    [currentScheduleDrafts],
  );
  const interviewQuestionError =
    (errors.interviewQuestions?.message as string | undefined) ??
    (errors.interviewQuestions?.[0]?.message as string | undefined);
  const rawScheduleDraftMessages = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(scheduleDraftErrors).filter(
            (message) => message.trim().length > 0,
          ),
        ),
      ),
    [scheduleDraftErrors],
  );
  const scheduleDraftMessages = useMemo(
    () => (needsSchedule ? rawScheduleDraftMessages : []),
    [needsSchedule, rawScheduleDraftMessages],
  );
  const validationResult = useMemo(
    () => mentorRegistrationSchema.safeParse(deferredFormValues),
    [deferredFormValues],
  );
  const normalizedExternalSaveBlockingMessage =
    externalSaveBlockingMessage?.trim();
  const isFormValid = validationResult.success;
  const isScheduleDraftValid = scheduleDraftMessages.length === 0;
  const isSelectionValid = selectionValidationMessages.length === 0;
  const isFormInteractionDisabled = isSaving || isSubmitting;
  const isSaveDisabled =
    Boolean(normalizedExternalSaveBlockingMessage) ||
    !isSelectionValid ||
    !isFormValid ||
    !isScheduleDraftValid ||
    isFormInteractionDisabled;
  const saveDisabledReasons = useMemo(() => {
    if (isFormInteractionDisabled) {
      return ['저장 요청을 처리하는 중입니다. 잠시만 기다려주세요.'];
    }

    if (normalizedExternalSaveBlockingMessage) {
      return [normalizedExternalSaveBlockingMessage];
    }

    if (!isSelectionValid) {
      return selectionValidationMessages.slice(0, 3);
    }

    if (!isScheduleDraftValid) {
      return scheduleDraftMessages.slice(0, 3);
    }

    if (isFormValid) {
      return [];
    }

    if (!validationResult.success) {
      const messages = Array.from(
        new Set(
          validationResult.error.issues
            .map((issue) => issue.message.trim())
            .filter((message) => isUserFacingValidationMessage(message)),
        ),
      ).slice(0, 3);

      if (messages.length > 0) {
        return messages;
      }
    }

    const messages = Array.from(new Set(collectErrorMessages(errors))).slice(
      0,
      3,
    );

    if (messages.length > 0) {
      return messages;
    }

    return ['필수 항목을 다시 확인해주세요.'];
  }, [
    errors,
    isFormValid,
    isFormInteractionDisabled,
    isScheduleDraftValid,
    isSelectionValid,
    normalizedExternalSaveBlockingMessage,
    scheduleDraftMessages,
    selectionValidationMessages,
    validationResult,
  ]);
  const visibleSaveDisabledReasons = saveDisabledReasons.filter(
    (reason) => reason.trim().length > 0,
  );
  const saveHelperText = isSaveDisabled
    ? normalizedExternalSaveBlockingMessage
      ? normalizedExternalSaveBlockingMessage
      : !isSelectionValid
        ? '옵션이 바뀌어 다시 선택이 필요한 항목이 있습니다.'
        : !isListExposureReady
          ? '기본정보와 멘토정보를 입력하면 저장 버튼이 활성화되고, 저장 후 멘토링 목록에 준비중으로 노출됩니다.'
          : !listVisible
            ? '현재 목록 비노출 상태입니다. 저장은 가능하지만, 목록에 공개하려면 목록 노출을 켜야 합니다.'
            : '현재 단계까지 저장할 수 있습니다.'
    : !isListExposureReady
      ? '저장 후 공개 흐름은 상단 안내를 확인해주세요.'
      : listVisible
        ? '지금 저장하면 멘토링 목록에 준비중으로 먼저 노출됩니다.'
        : '지금 저장하면 비노출 상태로 저장됩니다. 목록에 보이게 하려면 목록 노출을 켜주세요.';

  useEffect(() => {
    const normalizedProfileKeywords =
      normalizeProfileKeywordSelection(profileKeywords);
    const hasSameProfileKeywords =
      normalizedProfileKeywords.length === profileKeywords.length &&
      normalizedProfileKeywords.every(
        (keyword, index) => keyword === profileKeywords[index],
      );

    if (hasSameProfileKeywords) {
      return;
    }

    setValue('skillTags', normalizedProfileKeywords, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [normalizeProfileKeywordSelection, profileKeywords, setValue]);

  const [currentStepId, setCurrentStepId] =
    useState<MentorRegistrationVisibleStepId>(
      initialStepId
        ? normalizeMentorRegistrationStepId(initialStepId)
        : MENTOR_REGISTRATION_STEPS[0].id,
    );

  useEffect(() => {
    const normalizedInitialStepId = initialStepId
      ? normalizeMentorRegistrationStepId(initialStepId)
      : undefined;

    if (!normalizedInitialStepId || normalizedInitialStepId === currentStepId) {
      return;
    }

    setCurrentStepId(normalizedInitialStepId);
  }, [currentStepId, initialStepId]);

  const moveToStep = (stepId: MentorRegistrationStepId) => {
    const normalizedStepId = normalizeMentorRegistrationStepId(stepId);

    setCurrentStepId(normalizedStepId);
    onStepChange?.(normalizedStepId);
  };

  const currentStepIndex = Math.max(
    0,
    MENTOR_REGISTRATION_STEPS.findIndex((step) => step.id === currentStepId),
  );
  const currentStep = MENTOR_REGISTRATION_STEPS[currentStepIndex];
  const moveToPreviousStep = () => {
    if (currentStepIndex === 0) {
      return;
    }

    moveToStep(MENTOR_REGISTRATION_STEPS[currentStepIndex - 1].id);
  };

  const validateStepAtIndex = async (
    stepIndex: number,
    shouldFocus: boolean,
  ): Promise<boolean> => {
    const step = MENTOR_REGISTRATION_STEPS[stepIndex];
    if (!step) {
      return true;
    }

    if (
      step.id === MENTOR_REGISTRATION_STEP_IDS.schedule &&
      !isScheduleDraftValid
    ) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.schedule);

      return false;
    }

    if (
      step.id === MENTOR_REGISTRATION_STEP_IDS.mentorInformation &&
      !isSelectionValid
    ) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.mentorInformation);

      return false;
    }

    const fieldPaths = STEP_FIELD_PATHS[step.id];

    if (fieldPaths.length === 0) {
      return true;
    }

    const isValid = await trigger(fieldPaths, { shouldFocus });

    if (!isValid) {
      moveToStep(step.id);
    }

    return isValid;
  };

  const moveToStepIfStepsValid = async (targetStepIndex: number) => {
    if (targetStepIndex <= currentStepIndex) {
      moveToStep(MENTOR_REGISTRATION_STEPS[targetStepIndex].id);

      return;
    }

    for (let stepIndex = 0; stepIndex < targetStepIndex; stepIndex += 1) {
      const isStepValid = await validateStepAtIndex(stepIndex, true);

      if (!isStepValid) {
        return;
      }
    }

    moveToStep(MENTOR_REGISTRATION_STEPS[targetStepIndex].id);
  };

  const moveToNextStep = async () => {
    if (currentStepIndex >= MENTOR_REGISTRATION_STEPS.length - 1) {
      return;
    }

    await moveToStepIfStepsValid(currentStepIndex + 1);
  };

  const handleSelectStep = async (stepId: MentorRegistrationStepId) => {
    const targetStepIndex = MENTOR_REGISTRATION_STEPS.findIndex(
      (step) => step.id === stepId,
    );

    if (targetStepIndex < 0) {
      return;
    }

    await moveToStepIfStepsValid(targetStepIndex);
  };

  const handleScheduleDraftStateChange = (
    nextState: MentorRegistrationScheduleDraftState,
  ) => {
    if (!areSameScheduleDrafts(currentScheduleDrafts, nextState.drafts)) {
      setValue('scheduleDrafts', nextState.drafts, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    onScheduleDraftStateChange?.(nextState);
  };

  const routeToFirstInvalidStep = (nextErrors: unknown) => {
    if (!isScheduleDraftValid) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.schedule);

      return;
    }

    if (!isSelectionValid) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.mentorInformation);

      return;
    }

    const invalidFieldPath = collectFirstErrorFieldPath(nextErrors);
    const invalidStepId = resolveStepIdFromFieldPath(invalidFieldPath);

    if (!invalidStepId) {
      return;
    }

    moveToStep(invalidStepId);
  };

  const handleValidSubmit = (values: Parameters<typeof onSubmit>[0]) => {
    if (normalizedExternalSaveBlockingMessage) {
      return;
    }

    if (!isSelectionValid) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.mentorInformation);

      return;
    }

    if (!isScheduleDraftValid) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.schedule);

      return;
    }

    if (isFormInteractionDisabled) {
      return;
    }

    onSubmit(values);
  };

  const stepFooter = (
    <RegistrationStepFooter
      currentStepIndex={currentStepIndex}
      totalSteps={MENTOR_REGISTRATION_STEPS.length}
      onPrevious={moveToPreviousStep}
      onNext={(): void => {
        moveToNextStep().catch((): undefined => undefined);
      }}
    />
  );

  const currentStepCard = (() => {
    if (currentStep.id === MENTOR_REGISTRATION_STEP_IDS.basicInformation) {
      return (
        <div data-form-preview-section="headline">
          <FormSectionCard
            className="h-full"
            title={
              <span className="inline-flex items-center gap-75">
                <UserRound className="text-text-brand h-18 w-18" />
                기본정보
              </span>
            }
            description="멘티가 목록과 상세에서 가장 먼저 확인하는 기본 소개입니다."
            bodyClassName="space-y-200"
          >
            <section className="space-y-100">
              <div>
                <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                  <Star className="text-text-subtle h-14 w-14" />
                  멘토링 명
                  <FieldRequirementBadge state="required" />
                </p>
                <p className="font-designer-12r text-text-subtle">
                  멘토링 목록 카드 제목으로 노출됩니다.
                </p>
              </div>
              <BaseInput
                placeholder="예) 개발자 취업 / 면접 / 이직 / 커리어 멘토링"
                maxLength={MENTORING_TITLE_MAX_LENGTH}
                {...register('mentoringTitle')}
              />
              <FieldErrorText message={errors.mentoringTitle?.message} />
              <p className="font-designer-12r text-text-subtle">
                멘토링명은 최대 {MENTORING_TITLE_MAX_LENGTH}자까지 입력할 수
                있습니다.
              </p>
            </section>

            <section className="border-border-subtle space-y-100 border-t pt-200">
              <div>
                <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                  <MessageCircle className="text-text-subtle h-14 w-14" />한 줄
                  어필
                  <FieldRequirementBadge state="required" />
                </p>
                <p className="font-designer-12r text-text-subtle">
                  상세 헤더의 빨간 강조 문구로 실시간 반영됩니다.
                </p>
              </div>
              <BaseInput
                placeholder="예) 금융권 대기업 / 네카라쿠배 / 쿠팡"
                maxLength={APPEAL_LINE_MAX_LENGTH}
                {...register('appealLine')}
              />
              <FieldErrorText message={errors.appealLine?.message} />
              <div className="rounded-100 bg-background-alternative p-125">
                <div className="flex flex-wrap gap-100">
                  {MENTOR_APPEAL_LINE_PRESETS.map((preset) => (
                    <ChipButton
                      key={preset}
                      type="button"
                      variant="preset"
                      onClick={() =>
                        setValue('appealLine', preset, dirtyValidationOptions)
                      }
                    >
                      {preset}
                    </ChipButton>
                  ))}
                </div>
              </div>
              <p className="font-designer-12r text-text-subtle">
                멘토링 목록 카드와 상세 헤더에서 강조 노출됩니다.
              </p>
            </section>
            <section className="border-border-subtle space-y-100 border-t pt-200">
              <div className="flex items-start justify-between gap-100">
                <div>
                  <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                    <Eye className="text-text-subtle h-14 w-14" />
                    멘토링 목록 노출
                    <FieldRequirementBadge state="required" />
                  </p>
                  <p className="font-designer-12r text-text-subtle">
                    비노출로 설정하면 멘토링 목록/상세에서 보이지 않습니다.
                  </p>
                </div>
                <label className="font-designer-13r text-text-subtle inline-flex items-center gap-75">
                  <input
                    type="checkbox"
                    className="border-border-default rounded-50 accent-fill-brand-default-default size-200 border"
                    {...register('listVisible')}
                  />
                  노출
                </label>
              </div>
              <p className="font-designer-12r text-text-subtle">
                {listVisible
                  ? '현재 멘토링 목록에 노출됩니다.'
                  : '현재 멘토링 목록 비노출 상태입니다.'}
              </p>
            </section>
            {stepFooter}
          </FormSectionCard>
        </div>
      );
    }

    if (currentStep.id === MENTOR_REGISTRATION_STEP_IDS.mentorInformation) {
      return (
        <div data-form-preview-section="headline">
          <FormSectionCard
            className="h-full"
            title={
              <span className="inline-flex items-center gap-75">
                <Users className="text-text-brand h-18 w-18" />
                멘토정보
              </span>
            }
            description="멘토 포지션, 핵심 키워드, 주요 이력을 설정합니다."
            bodyClassName="space-y-200"
          >
            <section className="space-y-100">
              <div>
                <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                  <Users className="text-text-subtle h-14 w-14" />
                  멘토 포지션
                  <FieldRequirementBadge state="required" />
                </p>
                <p className="font-designer-12r text-text-subtle">
                  직군, 직무, 경력 조합으로 탐색 필터에 노출됩니다.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-150 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-3">
                <Controller
                  name="jobGroup"
                  control={control}
                  render={({ field }) => (
                    <SingleDropdown
                      options={jobGroupOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? '')}
                      placeholder="멘토 직군"
                    />
                  )}
                />
                <Controller
                  name="jobTitle"
                  control={control}
                  render={({ field }) => (
                    <SingleDropdown
                      options={jobTitleOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? '')}
                      placeholder={
                        jobGroup ? '멘토 직무' : '먼저 멘토 직군 선택'
                      }
                      disabled={!jobGroup}
                    />
                  )}
                />
                <Controller
                  name="careerYears"
                  control={control}
                  render={({ field }) => (
                    <SingleDropdown
                      options={careerOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? '')}
                      placeholder="멘토 경력"
                    />
                  )}
                />
              </div>
              <FieldErrorText message={mentorPositionErrorMessage} />
            </section>

            <section className="border-border-subtle space-y-100 border-t pt-200">
              <div>
                <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                  <Star className="text-text-subtle h-14 w-14" />
                  핵심 키워드
                  <FieldRequirementBadge state="required" />
                </p>
                <p className="font-designer-12r text-text-subtle">
                  등록 화면에는 운영 키워드만 노출됩니다. 직접 추가한 키워드는
                  현재 멘토 프로필에 저장되어 공개 화면에만 노출되고, 다른
                  멘토의 등록 옵션으로 바로 추가되지는 않습니다.
                </p>
              </div>
              <Controller
                name="skillTags"
                control={control}
                render={({ field }) => (
                  <SelectableTagsInput
                    value={field.value}
                    onChange={(nextProfileKeywords) =>
                      field.onChange(
                        normalizeProfileKeywordSelection(nextProfileKeywords),
                      )
                    }
                    maxSelectable={maxSelectableCoreKeywordCount}
                    maxCustomLength={MENTOR_SKILL_TAG_MAX_LENGTH}
                    options={visibleCoreKeywordOptions}
                    allowCustom
                  />
                )}
              />
              <FieldErrorText message={skillTagErrorMessage} />
            </section>

            <MentorCareerEntriesEditor form={form} />
            {stepFooter}
          </FormSectionCard>
        </div>
      );
    }

    if (currentStep.id === MENTOR_REGISTRATION_STEP_IDS.pricingAndTime) {
      return (
        <div data-form-preview-section="methods">
          <FormSectionCard
            title={
              <span className="inline-flex items-center gap-75">
                <Phone className="text-text-brand h-18 w-18" />
                가격 / 시간
                <FieldRequirementBadge state="applicationRequired" />
              </span>
            }
            description="상담 방식과 가격을 먼저 정하면 다음 단계에서 스케줄이 필요한지 바로 판단할 수 있습니다."
          >
            <div className="rounded-125 border-border-warning bg-background-accent-yellow-subtle mb-200 border px-150 py-125">
              <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                <Phone className="text-text-warning h-14 w-14" />첫 멘토링은
                간편상담으로 시작해보세요.
              </p>
              <p className="font-designer-13r text-text-subtle leading-relaxed">
                쪽지/간편 포맷은 멘티의 시작 허들을 낮출 수 있습니다. 신청서에서
                질문/고민/자료를 먼저 받아 빠르게 답변할 수 있도록 운영해보세요.
              </p>
            </div>

            <div className="mt-200 grid grid-cols-1 gap-150 lg:grid-cols-2">
              {METHOD_FIELDS.map((field) => {
                const enabled = methodEnabledState[field.enabledField];
                const priceErrorMessage = errors[field.priceField]?.message as
                  | string
                  | undefined;
                const durationErrorMessage = field.durationField
                  ? (errors[field.durationField]?.message as string | undefined)
                  : undefined;

                return (
                  <article
                    key={field.enabledField}
                    className={cn(
                      'rounded-100 border-border-default border p-150',
                      enabled
                        ? 'bg-background-default'
                        : 'bg-background-alternative opacity-80',
                    )}
                  >
                    <div className="mb-125 flex items-start justify-between gap-150">
                      <div>
                        <p className="font-designer-16b text-text-default flex items-center gap-75">
                          <span className="text-text-brand">
                            {METHOD_ICON_MAP[field.enabledField]}
                          </span>
                          {field.label}
                          <FieldRequirementBadge state="optional" />
                        </p>
                        <p className="font-designer-13r text-text-subtle mt-25">
                          {field.description}
                        </p>
                        <p className="font-designer-12r text-text-subtle mt-50 leading-relaxed">
                          {field.policySummary}
                        </p>
                      </div>
                      <ChipButton
                        type="button"
                        onClick={() =>
                          setValue(field.enabledField, !enabled, {
                            ...dirtyValidationOptions,
                          })
                        }
                        variant="state"
                        active={enabled}
                        className="shrink-0 whitespace-nowrap"
                      >
                        {enabled ? '활성' : '비활성'}
                      </ChipButton>
                    </div>

                    <div>
                      <p className="font-designer-13r text-text-subtle mb-50 flex items-center gap-50">
                        <Star className="h-12 w-12" />
                        회당 가격 (원)
                      </p>
                      <BaseInput
                        type="number"
                        min={MIN_MENTORING_PRICE}
                        max={MAX_MENTORING_PRICE}
                        step={PRICE_INPUT_STEP}
                        disabled={!enabled}
                        className={PRICE_INPUT_CLASS}
                        {...register(field.priceField)}
                        placeholder="가격(원)"
                      />
                      <FieldErrorText message={priceErrorMessage} />
                    </div>

                    {field.durationField && (
                      <div className="mt-125">
                        <p className="font-designer-13r text-text-subtle mb-50 flex items-center gap-50">
                          <RotateCcw className="h-12 w-12" />
                          상담 시간
                        </p>
                        <Controller
                          name={field.durationField}
                          control={control}
                          render={({ field: durationField }) => (
                            <SingleDropdown
                              options={
                                field.durationOptions ??
                                CONSULTING_DURATION_DROPDOWN_OPTIONS
                              }
                              value={String(durationField.value)}
                              onChange={(value) =>
                                durationField.onChange(Number(value ?? '60'))
                              }
                              placeholder="상담 시간"
                            />
                          )}
                        />
                        <FieldErrorText message={durationErrorMessage} />
                      </div>
                    )}

                    {field.enabledField === 'simpleEnabled' && (
                      <p className="font-designer-12r text-text-subtle mt-100">
                        간편상담은 15분 고정으로 운영됩니다.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
            <FieldErrorText message={errors.noteEnabled?.message} />
            {stepFooter}
          </FormSectionCard>
        </div>
      );
    }

    if (currentStep.id === MENTOR_REGISTRATION_STEP_IDS.mentorDescription) {
      return (
        <div data-form-preview-section="description">
          <FormSectionCard
            title={
              <span className="inline-flex items-center gap-75">
                <MessageCircle className="text-text-brand h-18 w-18" />
                멘토 소개
                <FieldRequirementBadge state="applicationRequired" />
              </span>
            }
            description="마크다운으로 소개를 작성하면 멘토 상세페이지 본문이 공개됩니다."
          >
            <MentorMarkdownEditor
              value={mentorDescriptionField.value}
              onChange={mentorDescriptionField.onChange}
              placeholder="멘토 소개, 전문 분야, 상담 범위를 자유롭게 작성해주세요."
            />
            <FieldErrorText message={errors.detailedDescription?.message} />
            <section className="border-border-subtle space-y-100 border-t pt-200">
              <div>
                <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                  <CircleCheck className="text-text-subtle h-14 w-14" />
                  상담 전 준비사항
                  <FieldRequirementBadge state="optional" />
                </p>
                <p className="font-designer-12r text-text-subtle">
                  멘티가 상담 전에 준비하거나 전달해야 할 내용이 있다면 한 줄에
                  하나씩 작성해주세요.
                </p>
              </div>
              <InterviewQuestionsTextarea
                value={toInterviewQuestionList(interviewQuestionsField.value)}
                onChange={interviewQuestionsField.onChange}
              />
              <p className="font-designer-12r text-text-subtle mt-75">
                최대 8개까지 작성할 수 있습니다.
              </p>
              <FieldErrorText message={interviewQuestionError} />
            </section>
            {stepFooter}
          </FormSectionCard>
        </div>
      );
    }

    if (currentStep.id === MENTOR_REGISTRATION_STEP_IDS.schedule) {
      return (
        <div data-form-preview-section="methods">
          <FormSectionCard
            title={
              <span className="inline-flex items-center gap-75">
                <RotateCcw className="text-text-brand h-18 w-18" />
                스케줄 설정
                <FieldRequirementBadge state="applicationRequired" />
              </span>
            }
            description="가격/시간에서 간편상담, 심층상담, 대면상담을 켠 경우에만 상담 가능한 요일/시간(30분 단위)을 선택해주세요. 쪽지만 활성화하면 스케줄 없이 저장할 수 있습니다."
          >
            <WeeklyScheduleGrid
              value={scheduleField.value ?? DEFAULT_SCHEDULE}
              onChange={scheduleField.onChange}
              initialTextDrafts={currentScheduleDrafts}
              onDraftStateChange={handleScheduleDraftStateChange}
            />
            {(needsSchedule || !isScheduleDraftValid) && (
              <FieldErrorText
                message={
                  scheduleDraftMessages[0] ??
                  (errors.schedule?.message as string | undefined)
                }
              />
            )}
            {stepFooter}
          </FormSectionCard>
        </div>
      );
    }

    if (currentStep.id === MENTOR_REGISTRATION_STEP_IDS.settlement) {
      return (
        <FormSectionCard
          title={
            <span className="inline-flex items-center gap-75">
              <Info className="text-text-brand h-18 w-18" />
              정산정보 (추후 제공)
            </span>
          }
          description="정산정보 기능은 아직 제공하지 않습니다."
        >
          <div className="rounded-150 border-border-subtle bg-background-alternative border px-200 py-175">
            <div className="flex flex-col gap-75">
              <p className="font-designer-14b text-text-default">
                정산정보는 추후 제공 예정입니다.
              </p>
              <p className="font-designer-12r text-text-subtle">
                현재는 기본정보, 멘토정보, 멘토소개, 가격/시간, 스케줄설정까지
                저장할 수 있으며 정산정보 등록 기능은 아직 열려 있지 않습니다.
              </p>
              <p className="font-designer-12r text-text-subtle">
                멘티 신청 기능도 정산정보 지원과 함께 추후 제공될 예정입니다.
              </p>
            </div>
          </div>
          {stepFooter}
        </FormSectionCard>
      );
    }

    const unreachableStepId: never = currentStep.id;

    return unreachableStepId;
  })();

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit, routeToFirstInvalidStep)}
      className="space-y-225 pb-500"
    >
      <fieldset
        disabled={isFormInteractionDisabled}
        className={cn(
          'm-0 min-w-0 space-y-225 border-0 p-0',
          isFormInteractionDisabled && 'pointer-events-none',
        )}
      >
        <PublicExposureGuideCard
          listVisible={listVisible}
          isListExposureReady={isListExposureReady}
          isDetailExposureReady={isDetailExposureReady}
          isApplicationRequirementReady={isApplicationRequirementReady}
        />
        <RegistrationStepNavigator
          steps={MENTOR_REGISTRATION_STEPS}
          currentStepId={currentStep.id}
          onSelectStep={handleSelectStep}
        />
        <div className="min-h-[420px]">{currentStepCard}</div>

        <div className="bg-background-default/95 border-border-subtle supports-[backdrop-filter]:bg-background-default/85 sticky bottom-0 z-20 border-t px-150 py-125 backdrop-blur">
          <div className="flex flex-col gap-100">
            <div className="flex flex-col gap-100 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-designer-12r text-text-subtle">
                {saveHelperText}
              </p>
              <div className="flex w-full gap-100 sm:w-auto">
                <Button
                  type="button"
                  color="secondary"
                  size="large"
                  className="flex-1 sm:flex-none"
                  onClick={onCancel}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  size="large"
                  className="flex-1 sm:flex-none"
                  disabled={isSaveDisabled}
                >
                  {isSaving || isSubmitting ? '저장 중...' : '저장하기'}
                </Button>
              </div>
            </div>
            {isSaveDisabled && visibleSaveDisabledReasons.length > 0 && (
              <div className="rounded-100 border-border-warning bg-background-accent-yellow-subtle border px-125 py-100">
                <div className="flex flex-col gap-25">
                  {visibleSaveDisabledReasons.map((reason) => (
                    <p
                      key={reason}
                      className="font-designer-12r text-text-subtle"
                    >
                      • {reason}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </fieldset>
    </form>
  );
}
