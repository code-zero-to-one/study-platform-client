'use client';

import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { type DateRange } from 'react-day-picker';
import { extractMentoringTimeSlotStart } from '@/features/mentoring/model/mentor-settings';
import {
  getMentoringApplyAvailableTimeSlots,
  getMentoringApplyAvailabilityLoadingState,
  getMentoringApplyAvailabilityStatusMessage,
} from '@/features/mentoring/model/mentoring-apply-availability';
import {
  buildMentoringRequestMessage,
  createMentoringRequestRichTextBlock,
  getMentoringRequestAttachmentFileKeys,
  getMentoringRequestAttachedFileNames,
  getMentoringRequestReferenceLinks,
  getMentoringRequestTextLength,
  hasMentoringRequestAttachment,
  sanitizeMentoringRequestContents,
  type MentoringRequestContentBlock,
} from '@/features/mentoring/model/request-content';
import { useMentorAvailabilityQuery } from '@/features/mentoring/model/use-mentor-availability-query';
import { useCreateMentoringRequestMutation } from '@/features/mentoring/model/use-mentoring-lifecycle-mutations';
import { useToastStore } from '@/stores/use-toast-store';
import { useUserStore } from '@/stores/useUserStore';
import type { MentoringReservableMethodType } from '@/types/mentoring/availability';
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

interface UseMentoringApplyControllerParams {
  mentor: MentorProfile;
  selectedMethod: MentoringMethodType;
}

export interface MentoringApplyControllerState {
  selectedDate: Date | undefined;
  selectedTime: string;
  requestTitle: string;
  requestContents: MentoringRequestContentBlock[];
  paymentMemo: string;
  selectedPaymentMethod: MentoringApplyPaymentMethod;
  isSubmitting: boolean;
}

export interface MentoringApplyControllerActions {
  onDatePickerSelect: (nextDate: Date | DateRange | undefined) => void;
  onTimeSelect: (timeSlot: string) => void;
  onRequestTitleChange: (nextRequestTitle: string) => void;
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
  requiresRequestTitle: boolean;
  requiresAttachment: boolean;
  minSelectableDate: Date;
  availableTimeSlots: string[];
  isAvailabilityLoading: boolean;
  availabilityStatusMessage: string | undefined;
  scheduleStepNumber: number;
  messageStepNumber: number;
  requestTitleLength: number;
  isRequestTitleTooShort: boolean;
  shouldShowRequestTitleError: boolean;
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

const REQUEST_TITLE_MIN_LENGTH = 2;

export const useMentoringApplyController = ({
  mentor,
  selectedMethod,
}: UseMentoringApplyControllerParams): MentoringApplyControllerResult => {
  const router = useRouter();
  const createRequestMutation = useCreateMentoringRequestMutation();
  const { showToast } = useToastStore();
  const { memberName, nickname, tel } = useUserStore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [requestTitle, setRequestTitle] = useState('');
  const [requestContents, setRequestContents] = useState<
    MentoringRequestContentBlock[]
  >([createMentoringRequestRichTextBlock()]);
  const [paymentMemo, setPaymentMemo] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<MentoringApplyPaymentMethod>('CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);

  const selectedOption = mentor.methods[selectedMethod];
  const needsSchedule = selectedOption.requiresSchedule;
  const requiresRequestTitle = true;
  const requiresAttachment = selectedMethod === 'note';
  const minSelectableDate = dayjs().add(3, 'day').startOf('day');
  const selectedPaymentMethodCopy =
    PAYMENT_METHOD_COPY_MAP[selectedPaymentMethod];
  const needsPaymentMemo = selectedPaymentMethodCopy.requiresMemo;
  const selectedDateKey = selectedDate
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : undefined;
  const reservableMethod = needsSchedule
    ? (selectedMethod as MentoringReservableMethodType)
    : undefined;
  const availabilityQuery = useMentorAvailabilityQuery({
    mentorId: mentor.id,
    method: reservableMethod,
    date: selectedDateKey,
    enabled: needsSchedule,
  });
  const hasAvailability = availabilityQuery.data !== undefined;

  const availableTimeSlots = useMemo(() => {
    return getMentoringApplyAvailableTimeSlots(availabilityQuery.data);
  }, [availabilityQuery.data]);
  const isAvailabilityLoading = getMentoringApplyAvailabilityLoadingState({
    hasSelectedDate: needsSchedule && selectedDateKey !== undefined,
    isLoading: availabilityQuery.isLoading,
    hasAvailability,
  });
  const availabilityStatusMessage = useMemo(() => {
    return getMentoringApplyAvailabilityStatusMessage({
      hasSelectedDate: needsSchedule && selectedDateKey !== undefined,
      isLoading: isAvailabilityLoading,
      isError: availabilityQuery.isError,
      availableTimeSlotCount: availableTimeSlots.length,
    });
  }, [
    availabilityQuery.isError,
    availableTimeSlots.length,
    isAvailabilityLoading,
    needsSchedule,
    selectedDateKey,
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
  const normalizedRequestTitle = requestTitle.trim();
  const requestTitleLength = normalizedRequestTitle.length;
  const attachedFileNames = useMemo(() => {
    return getMentoringRequestAttachedFileNames(requestContents);
  }, [requestContents]);
  const referenceLinks = useMemo(() => {
    return getMentoringRequestReferenceLinks(requestContents);
  }, [requestContents]);
  const attachmentFileKeys = useMemo(() => {
    return getMentoringRequestAttachmentFileKeys(requestContents);
  }, [requestContents]);

  const isValidForm = useMemo(() => {
    const hasRequestTitle = requiresRequestTitle
      ? requestTitleLength >= REQUEST_TITLE_MIN_LENGTH
      : true;
    const hasMessage = requestTextLength >= 10;
    const isAttachmentValid = requiresAttachment ? hasAttachment : true;
    const hasPaymentMemo = needsPaymentMemo
      ? paymentMemo.trim().length >= 2
      : true;

    if (!needsSchedule) {
      return (
        hasRequestTitle && hasMessage && isAttachmentValid && hasPaymentMemo
      );
    }

    return (
      hasRequestTitle &&
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
    requestTitleLength,
    requestTextLength,
    requiresRequestTitle,
    requiresAttachment,
    selectedDate,
    selectedTime,
  ]);
  const shouldShowRequestTitleError =
    requiresRequestTitle &&
    requestTitleLength < REQUEST_TITLE_MIN_LENGTH &&
    hasSubmitAttempt;

  const shouldShowAttachmentError =
    requiresAttachment && !hasAttachment && hasSubmitAttempt;
  const shouldShowPaymentMemoError =
    needsPaymentMemo && paymentMemo.trim().length < 2 && hasSubmitAttempt;

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

    setIsSubmitting(true);

    try {
      const preferredTimeStart = extractMentoringTimeSlotStart(selectedTime);
      const result = await createRequestMutation.mutateAsync({
        mentorId: mentor.id,
        method: selectedMethod,
        preferredDate: selectedDate
          ? dayjs(selectedDate).format('YYYY-MM-DD')
          : undefined,
        preferredTime:
          preferredTimeStart === '' ? undefined : preferredTimeStart,
        requestTitle:
          normalizedRequestTitle.length > 0
            ? normalizedRequestTitle
            : undefined,
        requestMessage,
        requestContents: sanitizeMentoringRequestContents(requestContents),
        attachmentFileKeys:
          attachmentFileKeys.length > 0 ? attachmentFileKeys : undefined,
        attachedFileNames:
          attachedFileNames.length > 0 ? attachedFileNames : undefined,
        referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
      });
      router.push(
        `/mentoring/${mentor.id}/complete?requestId=${result.requestId}`,
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : '멘토링 신청에 실패했습니다.',
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitButtonLabel = isSubmitting
    ? '처리 중...'
    : selectedPaymentMethodCopy.submitLabel;

  return {
    state: {
      selectedDate,
      selectedTime,
      requestTitle,
      requestContents,
      paymentMemo,
      selectedPaymentMethod,
      isSubmitting,
    },
    actions: {
      onDatePickerSelect: handleDatePickerSelect,
      onTimeSelect: setSelectedTime,
      onRequestTitleChange: setRequestTitle,
      onRequestContentsChange: setRequestContents,
      onPaymentMemoChange: setPaymentMemo,
      onPaymentMethodSelect: setSelectedPaymentMethod,
      onSubmit: handleSubmit,
    },
    viewModel: {
      selectedOption,
      needsSchedule,
      requiresRequestTitle,
      requiresAttachment,
      minSelectableDate: minSelectableDate.toDate(),
      availableTimeSlots,
      isAvailabilityLoading,
      availabilityStatusMessage,
      scheduleStepNumber: 1,
      messageStepNumber: needsSchedule ? 2 : 1,
      requestTitleLength,
      isRequestTitleTooShort:
        requiresRequestTitle && requestTitleLength < REQUEST_TITLE_MIN_LENGTH,
      shouldShowRequestTitleError,
      requestTextLength,
      isRequestTextTooShort: requestTextLength < 10,
      shouldShowAttachmentError,
      needsPaymentMemo,
      shouldShowPaymentMemoError,
      paymentMethodOptions: PAYMENT_METHOD_OPTIONS,
      selectedPaymentMethodCopy,
      isRequestBlockedByOperation: false,
      operationBlockedMessage: undefined,
      operationBlockedReason: undefined,
      applicantName: memberName ?? nickname ?? '-',
      applicantPhone: tel ?? '-',
      submitButtonLabel,
      isSubmitDisabled: !isValidForm || isSubmitting,
      isAttachmentReady: !requiresAttachment || hasAttachment,
      isPaymentMemoReady: !needsPaymentMemo || paymentMemo.trim().length >= 2,
      isDateDisabled: (date: Date) =>
        dayjs(date).isBefore(minSelectableDate, 'day'),
    },
  };
};
