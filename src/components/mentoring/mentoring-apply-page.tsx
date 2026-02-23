'use client';

import dayjs from 'dayjs';
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  MessageCircle,
  Monitor,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import MentoringRequestEditor from '@/components/mentoring/mentoring-request-editor';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import {
  getWeekdayKeyFromDate,
  hasAnyWeeklyScheduleSlots,
  isDateInHolidayRange,
  parseDurationLabelToMinutes,
  toTimeRangeLabel,
} from '@/features/mentoring/model/mentor-settings';
import {
  buildMentoringRequestMessage,
  createMentoringRequestParagraphBlock,
  getMentoringRequestAttachedFileNames,
  getMentoringRequestReferenceLinks,
  getMentoringRequestTextLength,
  hasMentoringRequestAttachment,
  sanitizeMentoringRequestContents,
  type MentoringRequestContentBlock,
} from '@/features/mentoring/model/request-content';
import { useAuthReady } from '@/hooks/common/use-auth';
import {
  formatWon,
  getMentorSettings,
  getMethodLabel,
  type MentorProfile,
  type MentoringMethodType,
} from '@/mocks/mentoring-mock-data';
import { useToastStore } from '@/stores/use-toast-store';
import {
  type MentoringPaymentMode,
  useMentoringManagementStore,
} from '@/stores/useMentoringManagementStore';
import {
  type MentorOperationStatus,
  useMentorOperationStore,
} from '@/stores/useMentorOperationStore';
import { useUserStore } from '@/stores/useUserStore';

interface MentoringApplyPageProps {
  mentor: MentorProfile;
  selectedMethod: MentoringMethodType;
}

const methodIconMap: Record<MentoringMethodType, ReactNode> = {
  note: <MessageCircle className="h-20 w-20" />,
  phone: <Phone className="h-20 w-20" />,
  online: <Monitor className="h-20 w-20" />,
  offline: <Users className="h-20 w-20" />,
};

const exampleQuestions = [
  '멘토링 목적이 무엇인가요?',
  '멘토링에 도움이 될 정보를 작성해 주세요. (재직중인 회사, 수료한 교육, 작업 내용 등)',
  '질문하고 싶은 내용을 작성해주세요.',
  '멘토에게 전하고 싶은 말',
];

type TossPaymentMethod = 'CARD' | 'VIRTUAL_ACCOUNT';

type MentoringApplyPaymentMethod = TossPaymentMethod | 'MANUAL_TRANSFER';

const PAYMENT_METHOD_OPTIONS: Array<{
  id: MentoringApplyPaymentMethod;
  label: string;
  title: string;
  description: string;
  helper: string;
  paymentMode: MentoringPaymentMode;
  requiresMemo: boolean;
  flowLabel: string;
  submitLabel: string;
  successToast: string;
}> = [
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
    successToast: '카드 결제가 완료되어 신청이 접수되었습니다.',
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
    successToast: '가상계좌가 발급되어 신청이 접수되었습니다.',
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
    successToast: '수동결제 신청이 접수되었습니다.',
  },
];

const PAYMENT_METHOD_COPY_MAP: Record<
  MentoringApplyPaymentMethod,
  (typeof PAYMENT_METHOD_OPTIONS)[number]
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

export default function MentoringApplyPage({
  mentor,
  selectedMethod,
}: MentoringApplyPageProps) {
  const router = useRouter();
  const { memberId } = useAuthReady();
  const createRequest = useMentoringManagementStore(
    (state) => state.createRequest,
  );
  const mentorOperationRecord = useMentorOperationStore(
    (state) => state.recordsByMentorId[mentor.id],
  );
  const mentorOperationHydrated = useMentorOperationStore(
    (state) => state.hasHydrated,
  );
  const { showToast } = useToastStore();
  const { memberName, nickname, tel } = useUserStore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [requestContents, setRequestContents] = useState<
    MentoringRequestContentBlock[]
  >([createMentoringRequestParagraphBlock()]);
  const [paymentMemo, setPaymentMemo] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<MentoringApplyPaymentMethod>('CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);
  const selectedPaymentMethodCopy =
    PAYMENT_METHOD_COPY_MAP[selectedPaymentMethod];
  const paymentMode = selectedPaymentMethodCopy.paymentMode;
  const needsPaymentMemo = selectedPaymentMethodCopy.requiresMemo;

  const selectedOption = mentor.methods[selectedMethod];
  const mentorSettings = getMentorSettings(mentor);
  const needsSchedule = selectedOption.requiresSchedule;
  const requiresAttachment =
    selectedMethod === 'note' || selectedMethod === 'phone';
  const methodDurationMinutes =
    parseDurationLabelToMinutes(selectedOption.durationLabel) ??
    mentorSettings.onlineDurationMinutes;
  const minSelectableDate = dayjs().add(3, 'day').startOf('day');
  const hasWeeklySchedule = hasAnyWeeklyScheduleSlots(mentorSettings.schedule);

  const selectedWeekday = selectedDate
    ? getWeekdayKeyFromDate(selectedDate)
    : undefined;
  const isHolidayDate = selectedDate
    ? isDateInHolidayRange(selectedDate, mentorSettings.holidays)
    : false;
  const scheduleBasedTimeRanges = useMemo(() => {
    const scheduleBasedSlots =
      selectedWeekday && !isHolidayDate
        ? (mentorSettings.schedule.weekly[selectedWeekday] ?? [])
        : [];

    return scheduleBasedSlots.map((slot) =>
      toTimeRangeLabel(slot, methodDurationMinutes),
    );
  }, [
    isHolidayDate,
    mentorSettings.schedule.weekly,
    methodDurationMinutes,
    selectedWeekday,
  ]);
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || isHolidayDate) {
      return [];
    }

    if (hasWeeklySchedule) {
      return scheduleBasedTimeRanges;
    }

    return selectedOption.timeSlots;
  }, [
    hasWeeklySchedule,
    isHolidayDate,
    scheduleBasedTimeRanges,
    selectedDate,
    selectedOption.timeSlots,
  ]);

  const scheduleStepNumber = 1;
  const messageStepNumber = needsSchedule ? 2 : 1;
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
      // [Mock] 결제 완료 후 신청 생성
      const preferredTimeStart =
        selectedTime.split('~')[0]?.trim() ?? selectedTime;
      createRequest({
        mentorId: mentor.id,
        method: selectedMethod,
        paymentMode,
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

      showToast(selectedPaymentMethodCopy.successToast, 'success');

      router.push(`/mentoring/${mentor.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-200 py-400 sm:px-300 sm:py-500 xl:px-400 xl:py-600">
      <div className="mb-250">
        <Link
          href={`/mentoring/${mentor.id}`}
          className="font-designer-14r text-text-subtle hover:text-text-default inline-flex items-center gap-50"
        >
          <ChevronLeft className="h-16 w-16" />
          상세로 돌아가기
        </Link>
      </div>

      <h1 className="font-designer-28b text-text-strong mb-300">멘토링 신청</h1>

      <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-200">
        <div className="mb-125 flex items-start gap-125">
          <span className="bg-fill-brand-subtle-default text-text-brand rounded-100 inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center">
            {methodIconMap[selectedMethod]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-designer-18b text-text-default line-clamp-2 leading-snug">
              {mentor.headline}
            </p>
            <p className="font-designer-13r text-text-subtle mt-50 line-clamp-1">
              {mentor.nickname} · {mentor.role}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-75">
          <Badge color="blue" shape="round">
            {getMethodLabel(selectedMethod)}
          </Badge>
          <Badge color="gray" shape="round">
            {selectedOption.durationLabel}
          </Badge>
          <Badge color="green" shape="round">
            {formatWon(selectedOption.price)}
          </Badge>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-300 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-250">
          {needsSchedule && (
            <section className="rounded-200 border-border-subtle bg-background-default border">
              <div className="border-border-subtle bg-background-alternative flex items-center gap-100 border-b px-200 py-150">
                <span className="font-designer-16b text-text-strong">
                  {scheduleStepNumber}. 일정 선택
                </span>
                <span className="font-designer-18b text-text-brand">
                  {selectedDate
                    ? `${dayjs(selectedDate).format('YY.MM.DD')} ${selectedTime}`
                    : ''}
                </span>
              </div>

              <div className="p-200">
                <p className="font-designer-13r text-text-subtle mb-150">
                  1회 상담 시간은 {selectedOption.durationLabel}이며, 신청일
                  기준 3일 뒤부터 선택할 수 있어요.
                </p>

                <div className="grid grid-cols-1 gap-200 md:grid-cols-[280px_1fr]">
                  <div>
                    <DatePicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(nextDate) => {
                        if (nextDate instanceof Date) {
                          setSelectedDate(nextDate);
                          setSelectedTime('');
                        }
                      }}
                      placeholder="날짜를 선택해주세요"
                      disabled={(date) =>
                        dayjs(date).isBefore(minSelectableDate, 'day')
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-100">
                    {selectedDate && isHolidayDate && (
                      <p className="font-designer-13r text-text-warning w-full">
                        선택한 날짜는 휴가로 등록되어 있어 예약할 수 없습니다.
                      </p>
                    )}
                    {!selectedDate && (
                      <p className="font-designer-13r text-text-subtle w-full">
                        먼저 날짜를 선택해 주세요.
                      </p>
                    )}
                    {selectedDate &&
                      !isHolidayDate &&
                      availableTimeSlots.map((timeSlot) => (
                        <button
                          key={timeSlot}
                          type="button"
                          onClick={() => setSelectedTime(timeSlot)}
                          className={cn(
                            'font-designer-14r rounded-100 border px-150 py-125 transition-colors',
                            selectedTime === timeSlot
                              ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                              : 'border-border-subtle bg-background-default text-text-default hover:border-border-brand',
                          )}
                        >
                          {timeSlot}
                        </button>
                      ))}
                    {selectedDate &&
                      !isHolidayDate &&
                      availableTimeSlots.length === 0 && (
                        <p className="font-designer-13r text-text-subtle w-full">
                          선택한 날짜에 가능한 시간이 없습니다.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-200 border-border-subtle bg-background-default border">
            <div className="border-border-subtle bg-background-alternative flex items-center gap-100 border-b px-200 py-150">
              <div className="flex items-center gap-75">
                <span className="font-designer-16b text-text-strong">
                  {messageStepNumber}. 멘토에게 보낼 질문 작성
                </span>
                <span className="font-designer-16b text-text-brand">*</span>
              </div>
            </div>

            <div className="space-y-150 p-200">
              <p className="font-designer-13r text-text-subtle leading-relaxed">
                블로그 글처럼 텍스트, 이미지, 첨부파일, 링크 블록을 원하는
                순서로 배치해 작성할 수 있어요.
              </p>

              <div className="rounded-125 bg-background-alternative p-150">
                {exampleQuestions.map((question) => (
                  <p
                    key={question}
                    className="font-designer-13r text-text-subtle"
                  >
                    Q. {question}
                  </p>
                ))}
              </div>

              <MentoringRequestEditor
                value={requestContents}
                onChange={setRequestContents}
              />

              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-designer-13r',
                    requestTextLength < 10
                      ? 'text-text-error'
                      : 'text-text-subtlest',
                  )}
                >
                  텍스트는 최소 10자 이상 입력해주세요.
                </span>
                <span className="font-designer-13r text-text-subtlest">
                  {requestTextLength}자
                </span>
              </div>

              <p className="font-designer-13r text-text-subtle leading-relaxed">
                {requiresAttachment
                  ? '쪽지/전화 상담은 이미지, 첨부파일, 링크 중 1개 이상 포함해주세요.'
                  : '필요한 자료가 있다면 이미지/첨부파일/링크를 함께 남겨주세요.'}
              </p>

              {shouldShowAttachmentError && (
                <p className="font-designer-12r text-text-error">
                  이미지, 첨부파일, 링크 중 최소 1개를 포함해주세요.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-150 border-border-subtle bg-background-default border p-200">
            <div className="mb-150 flex items-center gap-75">
              <ShieldCheck className="text-text-success h-16 w-16" />
              <p className="font-designer-14b text-text-default">결제 안내</p>
            </div>
            <p className="font-designer-13r text-text-subtle leading-relaxed">
              카드/가상계좌 결제는 결제 내역이 자동 반영되며, 수동결제는 입금
              확인 후 멘토가 신청을 수락할 수 있습니다. 환불은 시작 120시간
              전까지 전액, 120~24시간 전 30%, 24시간 내 환불 불가 기준을
              따릅니다.
            </p>
          </section>
        </div>

        <aside className="h-fit space-y-175 xl:sticky xl:top-[96px]">
          <section className="rounded-200 border-border-subtle bg-background-default border p-200">
            <div className="mb-125 flex items-center justify-between">
              <h2 className="font-designer-18b text-text-strong">
                신청자 정보
              </h2>
              <button
                type="button"
                className="font-designer-14b rounded-100 border-border-subtle text-text-default border px-100 py-50"
              >
                수정
              </button>
            </div>

            <div className="font-designer-14r text-text-subtle space-y-75">
              <p>
                이름{' '}
                <span className="text-text-default">
                  {memberName ?? nickname ?? '-'}
                </span>
              </p>
              <p>
                이메일 <span className="text-text-default">-</span>
              </p>
              <p>
                휴대폰 번호{' '}
                <span className="text-text-default">{tel ?? '-'}</span>
              </p>
            </div>
          </section>

          <section className="rounded-200 border-border-subtle bg-background-default border p-225">
            <div className="mb-150 flex items-center justify-between">
              <h2 className="font-designer-18b text-text-strong">결제/신청</h2>
              <Badge color="blue" shape="round">
                결제 API 미연동
              </Badge>
            </div>

            {isRequestBlockedByOperation && mentorOperationRecord ? (
              <div className="rounded-100 border-border-subtle bg-background-accent-orange-subtle mb-150 border px-125 py-100">
                <p className="font-designer-13b text-text-default">
                  {getOperationBlockMessage(mentorOperationRecord.status)}
                </p>
                <p className="font-designer-12r text-text-subtle mt-50">
                  사유:{' '}
                  {mentorOperationRecord.reason ??
                    '관리자 조치로 신규 신청이 제한되었습니다.'}
                </p>
              </div>
            ) : null}

            <div className="mb-150">
              <p className="font-designer-13r text-text-subtle mb-75">
                결제 방식
              </p>
              <div className="space-y-100">
                {PAYMENT_METHOD_OPTIONS.map((option) => {
                  const isSelected = selectedPaymentMethod === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(option.id)}
                      className={cn(
                        'rounded-100 w-full border px-125 py-100 text-left transition-colors',
                        isSelected
                          ? 'border-border-brand bg-fill-brand-subtle-default'
                          : 'border-border-subtle bg-background-default hover:border-border-brand',
                      )}
                    >
                      <p className="font-designer-14b text-text-default">
                        {option.label}
                      </p>
                      <p className="font-designer-12r text-text-subtle mt-50">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-125 border-border-subtle bg-background-alternative mb-150 border p-125">
              <div className="mb-75 flex items-center justify-between gap-75">
                <p className="font-designer-14b text-text-default inline-flex items-center gap-50">
                  <Banknote className="h-14 w-14" />
                  {selectedPaymentMethodCopy.title}
                </p>
                <Badge color="gray" shape="round">
                  {needsPaymentMemo ? '멘토 확인' : '자동 반영'}
                </Badge>
              </div>
              <p className="font-designer-12r text-text-subtle">
                {selectedPaymentMethodCopy.description}
              </p>
              <p className="font-designer-12r text-text-subtle mt-75 inline-flex items-center gap-50">
                <CheckCircle2 className="h-14 w-14" />
                {selectedPaymentMethodCopy.helper}
              </p>
            </div>

            {needsPaymentMemo && (
              <div className="mb-150">
                <p className="font-designer-13r text-text-subtle mb-75">
                  결제 메모 <span className="text-text-brand">*</span>
                </p>
                <p className="font-designer-12r text-text-subtle mb-75">
                  입금 예정 시각/송금자명/송금 채널을 남겨주세요.
                </p>
                <textarea
                  value={paymentMemo}
                  onChange={(event) => setPaymentMemo(event.target.value)}
                  className={cn(
                    'font-designer-13r rounded-100 bg-background-default border',
                    'text-text-default min-h-[112px] w-full resize-y px-125 py-100',
                    'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
                    shouldShowPaymentMemoError
                      ? 'border-border-error'
                      : 'border-border-subtle',
                  )}
                  placeholder="예: 21:30, 홍길동, 카카오뱅크"
                />
                {shouldShowPaymentMemoError && (
                  <p className="font-designer-12r text-text-error mt-50">
                    수동결제 신청은 결제 메모를 2자 이상 입력해주세요.
                  </p>
                )}
              </div>
            )}

            <div className="rounded-100 border-border-subtle mb-150 border px-125 py-100">
              <div className="mb-75 flex items-center justify-between">
                <span className="font-designer-13r text-text-subtle">
                  상담 방식
                </span>
                <span className="font-designer-14b text-text-default">
                  {getMethodLabel(selectedMethod)}
                </span>
              </div>
              <div className="mb-75 flex items-center justify-between">
                <span className="font-designer-13r text-text-subtle">
                  상담 기본 금액
                </span>
                <span className="font-designer-16b text-text-default">
                  {formatWon(selectedOption.price)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-designer-13r text-text-subtle">
                  실제 결제 진행
                </span>
                <span className="font-designer-16b text-text-default">
                  {selectedPaymentMethodCopy.flowLabel}
                </span>
              </div>
            </div>

            <Button
              color="primary"
              size="large"
              className="w-full"
              onClick={handleSubmit}
              disabled={
                !isValidForm || isSubmitting || isRequestBlockedByOperation
              }
            >
              {isSubmitting
                ? '처리 중...'
                : isRequestBlockedByOperation
                  ? '현재 신청이 제한되었습니다'
                  : selectedPaymentMethodCopy.submitLabel}
            </Button>
          </section>

          <section className="rounded-150 bg-background-alternative p-150">
            <p className="font-designer-13r text-text-subtle leading-relaxed">
              선택한 결제 방식과 무관하게 환불 정책은 동일하게 적용됩니다.
              <br />
              일반 기준: 시작 120시간 전 전액, 120~24시간 전 30%, 24시간 내 환불
              불가
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
