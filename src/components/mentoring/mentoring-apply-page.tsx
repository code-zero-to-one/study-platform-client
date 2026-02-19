'use client';

import dayjs from 'dayjs';
import {
  AlertCircle,
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
import { type ChangeEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
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
  formatWon,
  getMentorSettings,
  getMethodLabel,
  type MentorProfile,
  type MentoringMethodType,
} from '@/mocks/mentoring-mock-data';
import { useToastStore } from '@/stores/use-toast-store';
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

export default function MentoringApplyPage({
  mentor,
  selectedMethod,
}: MentoringApplyPageProps) {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { memberName, nickname, tel } = useUserStore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [referenceLinks, setReferenceLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!needsSchedule) {
      return hasMessage && isAttachmentValid;
    }

    return (
      hasMessage &&
      selectedDate !== undefined &&
      selectedTime !== '' &&
      isAttachmentValid
    );
  }, [
    hasAttachment,
    message,
    needsSchedule,
    requiresAttachment,
    selectedDate,
    selectedTime,
  ]);

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

    const normalized = raw.startsWith('http://') || raw.startsWith('https://')
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
    if (!isValidForm || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 500);
      });

      if (selectedMethod === 'note') {
        showToast(
          '결제가 완료되었습니다. 멘토의 첫 답장이 수락으로 처리됩니다.',
          'success',
        );
      } else {
        showToast(
          '결제가 완료되었습니다. 멘토가 48시간 내 수락 여부를 결정합니다.',
          'success',
        );
      }
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

      <div className="rounded-150 bg-background-alternative mb-250 flex items-center gap-100 px-150 py-125">
        <span className="text-text-brand">{methodIconMap[selectedMethod]}</span>
        <p className="font-designer-16b text-text-default truncate">
          {mentor.headline}
        </p>
        <Badge color="blue" shape="round" className="shrink-0">
          {getMethodLabel(selectedMethod)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-300 xl:grid-cols-[1fr_320px]">
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

              <div className="rounded-125 border-border-subtle border p-150">
                <label
                  htmlFor="mentoring-attachment-files"
                  className="font-designer-13b text-text-default hover:border-border-brand inline-flex cursor-pointer items-center gap-75 rounded-full border px-125 py-75 transition-colors"
                >
                  <FileUp className="h-14 w-14" />
                  파일 선택
                </label>
                <input
                  id="mentoring-attachment-files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleAttachFiles}
                />

                {attachedFiles.length > 0 && (
                  <ul className="mt-125 flex flex-col gap-75">
                    {attachedFiles.map((file) => (
                      <li
                        key={`${file.name}-${file.size}`}
                        className="bg-background-alternative flex items-center justify-between gap-100 rounded-100 px-100 py-75"
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

              <div className="rounded-125 border-border-subtle border p-150">
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
                        className="bg-background-alternative flex items-center justify-between gap-100 rounded-100 px-100 py-75"
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

              {requiresAttachment && !hasAttachment && (
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
                {selectedMethod === 'note'
                  ? '쪽지상담은 결제 후 멘토 답장이 수락 처리됩니다.'
                  : '예약형 상담은 멘토 수락 후 최종 확정됩니다.'}
              </p>
            </div>
            {selectedMethod === 'note' ? (
              <p className="font-designer-13r text-text-subtle leading-relaxed">
                결제 완료 직후 질문이 전달됩니다. 멘토가 답장을 시작하면 별도
                승인 없이 자동으로 상담이 진행됩니다.
              </p>
            ) : (
              <p className="font-designer-13r text-text-subtle leading-relaxed">
                결제 후 멘토가 48시간 내 수락/거절을 결정합니다. 48시간 동안
                응답이 없으면 자동 거절되며, 멘토는 거절 시 사유를 남길 수
                있습니다.
                <br />
                예: 이 내용은 온라인 상담으로 진행 부탁드립니다 / 제 전문
                분야가 아닙니다.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit space-y-150 xl:sticky xl:top-[88px]">
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

          <section className="rounded-200 border-border-subtle bg-background-default border p-200">
            <div className="mb-150 flex items-center justify-between">
              <span className="font-designer-18b text-text-strong">
                총 결제 금액
              </span>
              <span className="font-designer-28b text-text-strong">
                {formatWon(selectedOption.price)}
              </span>
            </div>

            <Button color="outlined" size="large" className="mb-100 w-full">
              N pay 결제하기
            </Button>

            <Button
              color="primary"
              size="large"
              className="w-full"
              onClick={handleSubmit}
              disabled={!isValidForm || isSubmitting}
            >
              {isSubmitting ? '처리 중...' : '결제하기'}
            </Button>
          </section>

          <section className="rounded-150 bg-background-alternative p-150">
            <p className="font-designer-13r text-text-subtle leading-relaxed">
              멘토링 환불은 멘토링 시작 시간을 기준으로 진행되며,
              <br />
              120시간 전 취소 시: 전액 환불
              <br />
              120시간 ~ 24시간 전 취소 시: 30% 환불
              <br />
              24시간 내 취소 시: 환불 불가
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
