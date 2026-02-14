'use client';

import dayjs from 'dayjs';
import {
  AlertCircle,
  ChevronLeft,
  CircleHelp,
  MessageCircle,
  Phone,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
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
  chat: <MessageCircle className="h-20 w-20" />,
  call: <Phone className="h-20 w-20" />,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOption = mentor.methods[selectedMethod];
  const mentorSettings = getMentorSettings(mentor);
  const needsSchedule = selectedOption.requiresSchedule;
  const methodDurationMinutes =
    parseDurationLabelToMinutes(selectedOption.durationLabel) ??
    mentorSettings.sessionDurationMinutes;
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

  const isValidForm = useMemo(() => {
    const hasMessage = message.trim().length >= 10;

    if (!needsSchedule) {
      return hasMessage;
    }

    return hasMessage && selectedDate !== undefined && selectedTime !== '';
  }, [message, needsSchedule, selectedDate, selectedTime]);

  useEffect(() => {
    if (selectedTime && !availableTimeSlots.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [availableTimeSlots, selectedTime]);

  const handleSubmit = async () => {
    if (!isValidForm || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 500);
      });

      showToast('멘토링 신청이 완료되었습니다.', 'success');
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

          <section className="rounded-150 border-border-warning bg-background-accent-yellow-subtle border p-200">
            <div className="mb-100 flex items-center gap-75">
              <AlertCircle className="text-text-warning h-16 w-16" />
              <p className="font-designer-14b text-text-default">
                멘토링은 멘토 확정 후 진행됩니다.
              </p>
            </div>
            <p className="font-designer-13r text-text-subtle">
              신청 후 24시간 내로 멘토링 진행 여부를 확인할 수 있습니다. 진행이
              확정되면 멘토와 세부 일정 조율을 진행합니다.
            </p>
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
