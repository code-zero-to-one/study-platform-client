'use client';

import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { type DateRange } from 'react-day-picker';
import {
  getMentorDisplayTitle,
  getMethodLabel,
  getMentorSettings,
} from '@/features/mentoring/model/mentor-profile-utils';
import {
  extractMentoringTimeSlotStart,
  filterMentoringTimeSlotsByWeekday,
  getWeekdayKeyFromDate,
  hasAnyWeeklyScheduleSlots,
  parseDurationLabelToMinutes,
  toTimeRangeLabel,
} from '@/features/mentoring/model/mentor-settings';
import {
  buildMentoringRequestMessage,
  createMentoringRequestRichTextBlock,
  getMentoringRequestAttachedFileNames,
  getMentoringRequestReferenceLinks,
  getMentoringRequestTextLength,
  hasMentoringRequestAttachment,
  sanitizeMentoringRequestContents,
  type MentoringRequestContentBlock,
} from '@/features/mentoring/model/request-content';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import { useMentorOperationStore } from '@/stores/useMentorOperationStore';
import { useUserStore } from '@/stores/useUserStore';
import type { MentorOperationStatus } from '@/types/mentoring/admin-domain';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import type { MentoringPaymentMode } from '@/types/mentoring/management-domain';

type TossPaymentMethod = 'CARD' | 'VIRTUAL_ACCOUNT';

export type MentoringApplyPaymentMethod = TossPaymentMethod | 'MANUAL_TRANSFER';

export interface MentoringApplyPaymentMethodOption {
  id: MentoringApplyPaymentMethod;
  label: string;
  title: string;
  description: string;
  helper: string;
  paymentMode: MentoringPaymentMode;
  requiresMemo: boolean;
  flowLabel: string;
  submitLabel: string;
}

const PAYMENT_METHOD_OPTIONS: MentoringApplyPaymentMethodOption[] = [
  {
    id: 'CARD',
    label: '신용카드 결제',
    title: '카드 결제',
    description: '결제 완료 즉시 신청이 접수됩니다.',
    helper: '결제 완료 내역이 자동 반영됩니다.',
    paymentMode: 'TOSS_PAYMENTS',
    requiresMemo: false,
    flowLabel: '카드 결제',
    submitLabel: '결제하고 신청하기',
  },
  {
    id: 'VIRTUAL_ACCOUNT',
    label: '무통장 입금 (가상계좌)',
    title: '가상계좌 결제',
    description: '가상계좌 발급 후 신청이 접수됩니다.',
    helper: '입금 확인 내역이 자동 반영됩니다.',
    paymentMode: 'TOSS_PAYMENTS',
    requiresMemo: false,
    flowLabel: '가상계좌 발급',
    submitLabel: '가상계좌 발급 후 신청하기',
  },
  {
    id: 'MANUAL_TRANSFER',
    label: '수동 계좌이체',
    title: '수동결제 신청',
    description: '멘토와 합의한 방식으로 입금 후 신청을 접수합니다.',
    helper: '멘토가 입금 확인 후 신청을 수락할 수 있습니다.',
    paymentMode: 'MANUAL_TRANSFER',
    requiresMemo: true,
    flowLabel: '수동 확인',
    submitLabel: '수동결제로 신청하기',
  },
];

const PAYMENT_METHOD_COPY_MAP: Record<
  MentoringApplyPaymentMethod,
  MentoringApplyPaymentMethodOption
> = {
  CARD: PAYMENT_METHOD_OPTIONS[0],
  VIRTUAL_ACCOUNT: PAYMENT_METHOD_OPTIONS[1],
  MANUAL_TRANSFER: PAYMENT_METHOD_OPTIONS[2],
};

const getOperationBlockMessage = (status: MentorOperationStatus) => {
  if (status === 'REQUESTS_PAUSED') {
    return '관리자 조치로 신규 신청이 일시 중지된 멘토입니다.';
  }

  return '관리자 조치로 운영 정지된 멘토입니다.';
};

interface UseMentoringApplyControllerParams {
  mentor: MentorProfile;
  selectedMethod: MentoringMethodType;
}

export interface MentoringApplyControllerState {
  selectedDate: Date | undefined;
  selectedTime: string;
  requestContents: MentoringRequestContentBlock[];
  paymentMemo: string;
  selectedPaymentMethod: MentoringApplyPaymentMethod;
  isSubmitting: boolean;
}

export interface MentoringApplyControllerActions {
  onDatePickerSelect: (nextDate: Date | DateRange | undefined) => void;
  onTimeSelect: (timeSlot: string) => void;
  onRequestContentsChange: (
    nextContents: MentoringRequestContentBlock[],
  ) => void;
  onPaymentMemoChange: (nextPaymentMemo: string) => void;
  onPaymentMethodSelect: (
    nextPaymentMethod: MentoringApplyPaymentMethod,
  ) => void;
  onSubmit: () => Promise<void>;
}

export interface MentoringApplyControllerViewModel {
  selectedOption: MentorProfile['methods'][MentoringMethodType];
  needsSchedule: boolean;
  requiresAttachment: boolean;
  minSelectableDate: Date;
  availableTimeSlots: string[];
  scheduleStepNumber: number;
  messageStepNumber: number;
  requestTextLength: number;
  isRequestTextTooShort: boolean;
  shouldShowAttachmentError: boolean;
  needsPaymentMemo: boolean;
  shouldShowPaymentMemoError: boolean;
  paymentMethodOptions: MentoringApplyPaymentMethodOption[];
  selectedPaymentMethodCopy: MentoringApplyPaymentMethodOption;
  isRequestBlockedByOperation: boolean;
  operationBlockedMessage: string | undefined;
  operationBlockedReason: string | undefined;
  applicantName: string;
  applicantPhone: string;
  submitButtonLabel: string;
  isSubmitDisabled: boolean;
  isAttachmentReady: boolean;
  isPaymentMemoReady: boolean;
  isDateDisabled: (date: Date) => boolean;
}

export interface MentoringApplyControllerResult {
  state: MentoringApplyControllerState;
  actions: MentoringApplyControllerActions;
  viewModel: MentoringApplyControllerViewModel;
}

export const useMentoringApplyController = ({
  mentor,
  selectedMethod,
}: UseMentoringApplyControllerParams): MentoringApplyControllerResult => {
  const router = useRouter();
  const { memberId } = useAuthReady();
  const createRequest = useMentoringManagementStore(
    (storeState) => storeState.createRequest,
  );
  const mentorOperationRecord = useMentorOperationStore(
    (storeState) => storeState.recordsByMentorId[mentor.id],
  );
  const mentorOperationHydrated = useMentorOperationStore(
    (storeState) => storeState.hasHydrated,
  );
  const { showToast } = useToastStore();
  const { memberName, nickname, tel } = useUserStore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [requestContents, setRequestContents] = useState<
    MentoringRequestContentBlock[]
  >([createMentoringRequestRichTextBlock()]);
  const [paymentMemo, setPaymentMemo] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<MentoringApplyPaymentMethod>('CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);

  const selectedOption = mentor.methods[selectedMethod];
  const mentorSettings = getMentorSettings(mentor);
  const needsSchedule = selectedOption.requiresSchedule;
  const requiresAttachment = selectedMethod === 'note';
  const methodDurationMinutes =
    parseDurationLabelToMinutes(selectedOption.durationLabel) ??
    mentorSettings.deepDurationMinutes;
  const minSelectableDate = dayjs().add(3, 'day').startOf('day');
  const hasWeeklySchedule = hasAnyWeeklyScheduleSlots(mentorSettings.schedule);
  const selectedPaymentMethodCopy =
    PAYMENT_METHOD_COPY_MAP[selectedPaymentMethod];
  const paymentMode = selectedPaymentMethodCopy.paymentMode;
  const needsPaymentMemo = selectedPaymentMethodCopy.requiresMemo;

  const selectedWeekday = selectedDate
    ? getWeekdayKeyFromDate(selectedDate)
    : undefined;

  const scheduleBasedTimeRanges = useMemo(() => {
    const scheduleBasedSlots = selectedWeekday
      ? (mentorSettings.schedule.weekly[selectedWeekday] ?? [])
      : [];

    return scheduleBasedSlots.map((slot) =>
      toTimeRangeLabel(slot, methodDurationMinutes),
    );
  }, [mentorSettings.schedule.weekly, methodDurationMinutes, selectedWeekday]);

  const legacyTimeRanges = useMemo(() => {
    if (!selectedWeekday) {
      return [];
    }

    return filterMentoringTimeSlotsByWeekday({
      timeSlots: selectedOption.timeSlots,
      weekday: selectedWeekday,
      durationMinutes: methodDurationMinutes,
    });
  }, [methodDurationMinutes, selectedOption.timeSlots, selectedWeekday]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    if (scheduleBasedTimeRanges.length > 0) {
      return scheduleBasedTimeRanges;
    }

    if (hasWeeklySchedule) {
      return [];
    }

    return legacyTimeRanges;
  }, [
    hasWeeklySchedule,
    legacyTimeRanges,
    scheduleBasedTimeRanges,
    selectedDate,
  ]);

  const requestTextLength = useMemo(() => {
    return getMentoringRequestTextLength(requestContents);
  }, [requestContents]);
  const hasAttachment = useMemo(() => {
    return hasMentoringRequestAttachment(requestContents);
  }, [requestContents]);
  const requestMessage = useMemo(() => {
    return buildMentoringRequestMessage(requestContents);
  }, [requestContents]);
  const attachedFileNames = useMemo(() => {
    return getMentoringRequestAttachedFileNames(requestContents);
  }, [requestContents]);
  const referenceLinks = useMemo(() => {
    return getMentoringRequestReferenceLinks(requestContents);
  }, [requestContents]);

  const isValidForm = useMemo(() => {
    const hasMessage = requestTextLength >= 10;
    const isAttachmentValid = requiresAttachment ? hasAttachment : true;
    const hasPaymentMemo = needsPaymentMemo
      ? paymentMemo.trim().length >= 2
      : true;

    if (!needsSchedule) {
      return hasMessage && isAttachmentValid && hasPaymentMemo;
    }

    return (
      hasMessage &&
      selectedDate !== undefined &&
      selectedTime !== '' &&
      isAttachmentValid &&
      hasPaymentMemo
    );
  }, [
    hasAttachment,
    needsPaymentMemo,
    needsSchedule,
    paymentMemo,
    requestTextLength,
    requiresAttachment,
    selectedDate,
    selectedTime,
  ]);

  const shouldShowAttachmentError =
    requiresAttachment && !hasAttachment && hasSubmitAttempt;
  const shouldShowPaymentMemoError =
    needsPaymentMemo && paymentMemo.trim().length < 2 && hasSubmitAttempt;
  const isRequestBlockedByOperation =
    mentorOperationHydrated &&
    mentorOperationRecord !== undefined &&
    mentorOperationRecord.status !== 'OPEN';

  useEffect(() => {
    if (selectedTime && !availableTimeSlots.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [availableTimeSlots, selectedTime]);

  const handleDatePickerSelect = (nextDate: Date | DateRange | undefined) => {
    if (nextDate instanceof Date) {
      setSelectedDate(nextDate);
      setSelectedTime('');

      return;
    }

    setSelectedDate(undefined);
    setSelectedTime('');
  };

  const handleSubmit = async () => {
    setHasSubmitAttempt(true);

    if (!isValidForm || isSubmitting) {
      return;
    }

    if (isRequestBlockedByOperation && mentorOperationRecord) {
      showToast(
        getOperationBlockMessage(mentorOperationRecord.status),
        'error',
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const preferredTimeStart = extractMentoringTimeSlotStart(selectedTime);
      const requestId = createRequest({
        mentorId: mentor.id,
        method: selectedMethod,
        mentorDisplayTitle: getMentorDisplayTitle(mentor),
        mentorNickname: mentor.nickname,
        methodLabel: getMethodLabel(selectedMethod),
        durationLabel: selectedOption.durationLabel,
        paymentAmount: selectedOption.price,
        paymentMode,
        paymentMethod: selectedPaymentMethod,
        paymentMemo: needsPaymentMemo ? paymentMemo.trim() : undefined,
        menteeMemberId: memberId,
        menteeName: memberName ?? nickname ?? '익명 멘티',
        menteeRole: 'ZERO-ONE 멘티',
        preferredDate: selectedDate
          ? dayjs(selectedDate).format('YYYY-MM-DD')
          : undefined,
        preferredTime:
          preferredTimeStart === '' ? undefined : preferredTimeStart,
        requestMessage,
        requestContents: sanitizeMentoringRequestContents(requestContents),
        attachedFileNames:
          attachedFileNames.length > 0 ? attachedFileNames : undefined,
        referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
      });

      await new Promise((resolve) => {
        window.setTimeout(resolve, 400);
      });

      router.push(`/mentoring/${mentor.id}/complete?requestId=${requestId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitButtonLabel = isSubmitting
    ? '처리 중...'
    : isRequestBlockedByOperation
      ? '현재 신청이 제한되었습니다'
      : selectedPaymentMethodCopy.submitLabel;

  return {
    state: {
      selectedDate,
      selectedTime,
      requestContents,
      paymentMemo,
      selectedPaymentMethod,
      isSubmitting,
    },
    actions: {
      onDatePickerSelect: handleDatePickerSelect,
      onTimeSelect: setSelectedTime,
      onRequestContentsChange: setRequestContents,
      onPaymentMemoChange: setPaymentMemo,
      onPaymentMethodSelect: setSelectedPaymentMethod,
      onSubmit: handleSubmit,
    },
    viewModel: {
      selectedOption,
      needsSchedule,
      requiresAttachment,
      minSelectableDate: minSelectableDate.toDate(),
      availableTimeSlots,
      scheduleStepNumber: 1,
      messageStepNumber: needsSchedule ? 2 : 1,
      requestTextLength,
      isRequestTextTooShort: requestTextLength < 10,
      shouldShowAttachmentError,
      needsPaymentMemo,
      shouldShowPaymentMemoError,
      paymentMethodOptions: PAYMENT_METHOD_OPTIONS,
      selectedPaymentMethodCopy,
      isRequestBlockedByOperation,
      operationBlockedMessage:
        isRequestBlockedByOperation && mentorOperationRecord
          ? getOperationBlockMessage(mentorOperationRecord.status)
          : undefined,
      operationBlockedReason:
        isRequestBlockedByOperation && mentorOperationRecord
          ? (mentorOperationRecord.reason ??
            '관리자 조치로 신규 신청이 제한되었습니다.')
          : undefined,
      applicantName: memberName ?? nickname ?? '-',
      applicantPhone: tel ?? '-',
      submitButtonLabel,
      isSubmitDisabled:
        !isValidForm || isSubmitting || isRequestBlockedByOperation,
      isAttachmentReady: !requiresAttachment || hasAttachment,
      isPaymentMemoReady: !needsPaymentMemo || paymentMemo.trim().length >= 2,
      isDateDisabled: (date: Date) =>
        dayjs(date).isBefore(minSelectableDate, 'day'),
    },
  };
};
