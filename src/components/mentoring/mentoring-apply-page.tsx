'use client';

import dayjs from 'dayjs';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Link2,
  ChevronLeft,
  CircleHelp,
  FileUp,
  MessageCircle,
  Monitor,
  Phone,
  X,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  '멘토에게 전하고 싶은 말',
];

const paymentModeCopy = {
  title: '수동결제 신청',
  description: '계좌이체/송금 후 멘토가 직접 확인하는 방식',
  helper: '결제 API 없이도 바로 운영 가능한 모드입니다.',
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
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [referenceLinks, setReferenceLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const paymentMode: MentoringPaymentMode = 'MANUAL_TRANSFER';
  const [paymentMemo, setPaymentMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);

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
  const attachmentStepNumber = messageStepNumber + 1;
  const hasAttachment = attachedFiles.length > 0 || referenceLinks.length > 0;

  const isValidForm = useMemo(() => {
    const hasMessage = message.trim().length >= 10;
    const isAttachmentValid = requiresAttachment ? hasAttachment : true;
    const hasPaymentMemo = paymentMemo.trim().length >= 2;

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
    message,
    needsSchedule,
    paymentMemo,
    requiresAttachment,
    selectedDate,
    selectedTime,
  ]);
  const shouldShowAttachmentError =
    requiresAttachment && !hasAttachment && hasSubmitAttempt;
  const shouldShowPaymentMemoError =
    paymentMemo.trim().length < 2 && hasSubmitAttempt;
  const isRequestBlockedByOperation =
    mentorOperationHydrated &&
    mentorOperationRecord !== undefined &&
    mentorOperationRecord.status !== 'OPEN';

  useEffect(() => {
    if (selectedTime && !availableTimeSlots.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [availableTimeSlots, selectedTime]);

  const handleAttachFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    if (nextFiles.length === 0) {
      return;
    }

    setAttachedFiles((prev) => [...prev, ...nextFiles].slice(0, 8));
    event.target.value = '';
  };

  const removeFile = (targetName: string, targetSize: number) => {
    setAttachedFiles((prev) =>
      prev.filter(
        (file) => !(file.name === targetName && file.size === targetSize),
      ),
    );
  };

  const handleAddLink = () => {
    const raw = linkInput.trim();
    if (!raw) {
      return;
    }

    const normalized =
      raw.startsWith('http://') || raw.startsWith('https://')
        ? raw
        : `https://${raw}`;

    try {
      const parsed = new URL(normalized);
      if (referenceLinks.includes(parsed.toString())) {
        setLinkError('이미 추가된 링크입니다.');

        return;
      }

      setReferenceLinks((prev) => [...prev, parsed.toString()].slice(0, 8));
      setLinkInput('');
      setLinkError('');
    } catch {
      setLinkError('올바른 링크 형식으로 입력해주세요.');
    }
  };

  const removeLink = (targetLink: string) => {
    setReferenceLinks((prev) => prev.filter((link) => link !== targetLink));
  };

  const handleSubmit = async () => {
    setHasSubmitAttempt(true);

    if (!isValidForm || isSubmitting) {
      return;
    }

    if (isRequestBlockedByOperation && mentorOperationRecord) {
      showToast(getOperationBlockMessage(mentorOperationRecord.status), 'error');

      return;
    }

    setIsSubmitting(true);

    try {
      const preferredTimeStart =
        selectedTime.split('~')[0]?.trim() ?? selectedTime;
      createRequest({
        mentorId: mentor.id,
        method: selectedMethod,
        paymentMode,
        paymentMemo: paymentMemo.trim(),
        menteeMemberId: memberId,
        menteeName: memberName ?? nickname ?? '익명 멘티',
        menteeRole: 'ZERO-ONE 멘티',
        preferredDate: selectedDate
          ? dayjs(selectedDate).format('YYYY-MM-DD')
          : undefined,
        preferredTime:
          preferredTimeStart === '' ? undefined : preferredTimeStart,
        requestMessage: message.trim(),
      });

      await new Promise((resolve) => {
        window.setTimeout(resolve, 300);
      });

      showToast(
        '신청이 접수되었습니다. 수동결제 메모가 멘토에게 전달되며 입금 확인 후 진행됩니다.',
        'success',
      );

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
            <div className="border-border-subtle bg-background-alternative flex items-center justify-between gap-100 border-b px-200 py-150">
              <div className="flex items-center gap-75">
                <span className="font-designer-16b text-text-strong">
                  {messageStepNumber}. 멘토에게 보낼 메시지
                </span>
                <span className="font-designer-16b text-text-brand">*</span>
              </div>
              <button
                type="button"
                className="font-designer-13r text-text-subtle hover:text-text-default inline-flex items-center gap-50"
              >
                <CircleHelp className="h-14 w-14" />
                예시 질문 다시보기
              </button>
            </div>

            <div className="p-200">
              <p className="font-designer-13r text-text-subtle mb-150">
                멘토링을 시작할 문서가 멘토의 진행에 도움이 될 만큼 자세하게
                작성해 주세요.
              </p>

              <div className="rounded-125 bg-background-alternative mb-150 p-150">
                {exampleQuestions.map((question) => (
                  <p
                    key={question}
                    className="font-designer-13r text-text-subtle"
                  >
                    Q. {question}
                  </p>
                ))}
              </div>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className={cn(
                  'font-designer-14r rounded-125 border-border-subtle bg-background-default',
                  'text-text-default min-h-[160px] w-full resize-y border p-150',
                  'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
                )}
                placeholder="멘토에게 전달할 내용을 자유롭게 작성해주세요."
              />

              <div className="mt-75 flex items-center justify-between">
                <span
                  className={cn(
                    'font-designer-13r',
                    message.length < 10
                      ? 'text-text-error'
                      : 'text-text-subtlest',
                  )}
                >
                  최소 10자 이상 입력해주세요.
                </span>
                <span className="font-designer-13r text-text-subtlest">
                  {message.length}자
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-200 border-border-subtle bg-background-default border">
            <div className="border-border-subtle bg-background-alternative flex items-center justify-between gap-100 border-b px-200 py-150">
              <div className="flex items-center gap-75">
                <span className="font-designer-16b text-text-strong">
                  {attachmentStepNumber}. 파일/링크 첨부
                </span>
                {requiresAttachment && (
                  <span className="font-designer-16b text-text-brand">*</span>
                )}
              </div>
              <p className="font-designer-12r text-text-subtle">
                최대 파일 8개, 링크 8개
              </p>
            </div>

            <div className="space-y-150 p-200">
              <p className="font-designer-13r text-text-subtle leading-relaxed">
                {requiresAttachment
                  ? '쪽지/전화 상담은 빠른 피드백을 위해 파일 또는 링크를 최소 1개 이상 첨부해주세요.'
                  : '필요한 경우 자료 파일이나 참고 링크를 첨부해주세요.'}
              </p>

              <div className="rounded-125 border-border-subtle bg-background-alternative border p-150">
                <div className="mb-100 flex flex-wrap items-center justify-between gap-75">
                  <p className="font-designer-13b text-text-default">
                    파일 첨부
                  </p>
                  <span className="font-designer-12r text-text-subtle">
                    {attachedFiles.length}/8
                  </span>
                </div>

                <div className="rounded-100 border-border-subtle bg-background-default border border-dashed p-125">
                  <label
                    htmlFor="mentoring-attachment-files"
                    className="font-designer-13b text-text-default hover:border-border-brand rounded-500 inline-flex cursor-pointer items-center gap-75 border px-125 py-75 transition-colors"
                  >
                    <FileUp className="h-14 w-14" />
                    파일 선택
                  </label>
                  <p className="font-designer-12r text-text-subtle mt-75">
                    이력서, 포트폴리오 PDF, 질문 문서 등을 첨부하면 상담 준비가
                    빨라집니다.
                  </p>
                  <input
                    id="mentoring-attachment-files"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleAttachFiles}
                  />
                </div>

                {attachedFiles.length > 0 && (
                  <ul className="mt-125 flex flex-col gap-75">
                    {attachedFiles.map((file) => (
                      <li
                        key={`${file.name}-${file.size}`}
                        className="rounded-100 border-border-subtle bg-background-default flex items-center justify-between gap-100 border px-100 py-75"
                      >
                        <span className="font-designer-12r text-text-default truncate">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          className="text-text-subtle hover:text-text-default shrink-0"
                          onClick={() => removeFile(file.name, file.size)}
                        >
                          <X className="h-14 w-14" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-125 border-border-subtle bg-background-alternative border p-150">
                <div className="mb-100 flex flex-wrap items-center justify-between gap-75">
                  <p className="font-designer-13b text-text-default">
                    참고 링크 첨부
                  </p>
                  <span className="font-designer-12r text-text-subtle">
                    {referenceLinks.length}/8
                  </span>
                </div>

                <div className="flex flex-col gap-100 sm:flex-row">
                  <input
                    value={linkInput}
                    onChange={(event) => {
                      setLinkInput(event.target.value);
                      if (linkError) {
                        setLinkError('');
                      }
                    }}
                    className={cn(
                      'font-designer-13r rounded-100 border-border-subtle bg-background-default',
                      'text-text-default w-full border px-125 py-100',
                      'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
                    )}
                    placeholder="https://github.com/... 또는 포트폴리오 링크"
                  />
                  <Button
                    type="button"
                    color="secondary"
                    size="small"
                    className="shrink-0"
                    onClick={handleAddLink}
                  >
                    <Link2 className="mr-50 h-14 w-14" />
                    링크 추가
                  </Button>
                </div>

                {linkError && (
                  <p className="font-designer-12r text-text-error mt-75">
                    {linkError}
                  </p>
                )}

                {referenceLinks.length > 0 && (
                  <ul className="mt-125 flex flex-col gap-75">
                    {referenceLinks.map((link) => (
                      <li
                        key={link}
                        className="rounded-100 border-border-subtle bg-background-default flex items-center justify-between gap-100 border px-100 py-75"
                      >
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-designer-12r text-text-brand truncate underline"
                        >
                          {link}
                        </a>
                        <button
                          type="button"
                          className="text-text-subtle hover:text-text-default shrink-0"
                          onClick={() => removeLink(link)}
                        >
                          <X className="h-14 w-14" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {shouldShowAttachmentError && (
                <p className="font-designer-12r text-text-error">
                  파일 또는 링크를 최소 1개 첨부해주세요.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-150 border-border-warning bg-background-accent-yellow-subtle border p-200">
            <div className="mb-100 flex items-center gap-75">
              <AlertCircle className="text-text-warning h-16 w-16" />
              <p className="font-designer-14b text-text-default">
                결제 API 없이 신청되며, 입금 여부는 멘토가 직접 확인합니다.
              </p>
            </div>
            <p className="font-designer-13r text-text-subtle leading-relaxed">
              자동 결제창 없이 신청서가 접수됩니다. 입력한 수동결제 메모 (입금
              예정 시각/예금주명/송금 채널)는 멘토에게 전달되며, 멘토가 확인 후
              수락/거절을 처리합니다.
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

            <div className="rounded-125 border-border-subtle bg-background-alternative mb-150 border p-125">
              <div className="mb-75 flex items-center justify-between gap-75">
                <p className="font-designer-14b text-text-default inline-flex items-center gap-50">
                  <Banknote className="h-14 w-14" />
                  {paymentModeCopy.title}
                </p>
                <Badge color="gray" shape="round">
                  멘토 확인
                </Badge>
              </div>
              <p className="font-designer-12r text-text-subtle">
                {paymentModeCopy.description}
              </p>
              <p className="font-designer-12r text-text-subtle mt-75 inline-flex items-center gap-50">
                <CheckCircle2 className="h-14 w-14" />
                {paymentModeCopy.helper}
              </p>
            </div>

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
                  수동 확인
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
                  : '수동결제로 신청하기'}
            </Button>
          </section>

          <section className="rounded-150 bg-background-alternative p-150">
            <p className="font-designer-13r text-text-subtle leading-relaxed">
              수동결제 신청은 멘토와 합의한 환불 정책을 따릅니다.
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
