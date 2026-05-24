'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { ToggleSwitch } from '@/components/common/ui/toggle/switch';
import {
  useGetCourseJourneyMap,
  useGetCourseList,
} from '@/hooks/queries/course/course-api';
import { useGetNotificationSetting } from '@/hooks/queries/notification/use-notification-setting';
import { useToastStore } from '@/stores/use-toast-store';
import type { CourseSummaryResponse } from '@/types/api/course.types';

const LearningNotificationModal = dynamic(
  () => import('./_components/learning-notification-modal'),
  { ssr: false },
);

const DisableNotificationModal = dynamic(
  () => import('./_components/disable-notification-modal'),
  { ssr: false },
);

const NOTIFICATION_DISABLE_KEY = 'zeroone:notification:disabled';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function MyClassPage() {
  const { data: courses = [] } = useGetCourseList();
  const {
    data: notificationSetting,
    isError: isNotificationSettingError,
    isLoading: isNotificationSettingLoading,
  } = useGetNotificationSetting();
  const [alarmModalOpen, setAlarmModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [locallyDisabled, setLocallyDisabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem(NOTIFICATION_DISABLE_KEY) === 'true',
  );
  const showToast = useToastStore((s) => s.showToast);

  const isEnabled =
    (notificationSetting?.isEnabled ?? false) && !locallyDisabled;

  const handleDisableConfirm = () => {
    localStorage.setItem(NOTIFICATION_DISABLE_KEY, 'true');
    setLocallyDisabled(true);
    setDisableModalOpen(false);
    showToast('알림톡이 해제되었습니다.', 'success');
  };

  const handleAlarmSuccess = () => {
    localStorage.removeItem(NOTIFICATION_DISABLE_KEY);
    setLocallyDisabled(false);
  };

  return (
    <div className="flex flex-col gap-600">
      <h1 className="font-designer-24b text-text-default">마이 클래스</h1>

      {/* 알림 섹션 */}
      <section className="flex flex-col gap-300">
        <div className="flex items-center gap-200">
          <h2 className="font-designer-18m text-text-default">알림</h2>
          <ToggleSwitch.Root
            checked={isEnabled}
            onClick={() =>
              isEnabled ? setDisableModalOpen(true) : setAlarmModalOpen(true)
            }
            onCheckedChange={() => {}}
            size="lg"
            className="bg-border-subtle data-[state=checked]:bg-fill-brand-default-default"
          />
        </div>

        <div className="grid grid-cols-1 gap-400 md:grid-cols-2">
          <AlarmCard
            isEnabled={isEnabled}
            notifyHour={notificationSetting?.notifyHour}
            notifyMinute={notificationSetting?.notifyMinute}
            isLoading={isNotificationSettingLoading}
            isError={isNotificationSettingError}
            onOpenModal={() => setAlarmModalOpen(true)}
          />
        </div>
      </section>

      <LearningNotificationModal
        open={alarmModalOpen}
        onOpenChange={setAlarmModalOpen}
        onSuccess={handleAlarmSuccess}
      />

      <DisableNotificationModal
        open={disableModalOpen}
        onOpenChange={setDisableModalOpen}
        onConfirm={handleDisableConfirm}
      />

      <section className="flex flex-col gap-400">
        <h2 className="font-designer-20b text-text-default">
          참여 중인 클래스
        </h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-400 md:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
        ) : (
          <p className="font-designer-14r text-text-subtle">
            참여 중인 클래스가 없습니다.
          </p>
        )}
      </section>

      <hr className="border-border-subtle" />

      <section className="flex flex-col gap-400">
        <h2 className="font-designer-20b text-text-default">완주한 클래스</h2>
        {/* TODO: completed courses API not yet available */}
        <p className="font-designer-14r text-text-subtle">
          완주한 클래스가 없습니다.
        </p>
      </section>
    </div>
  );
}

function AlarmCard({
  isEnabled,
  notifyHour,
  notifyMinute,
  isLoading,
  isError,
  onOpenModal,
}: {
  isEnabled: boolean;
  notifyHour?: number;
  notifyMinute?: number;
  isLoading: boolean;
  isError: boolean;
  onOpenModal: () => void;
}) {
  const hasTime =
    typeof notifyHour === 'number' && typeof notifyMinute === 'number';
  const timeText = (() => {
    if (isLoading) return '알림 시간을 불러오는 중입니다.';
    if (isError) return '알림 시간 조회에 실패했습니다.';
    if (hasTime) return `${pad(notifyHour)}:${pad(notifyMinute)}`;
    return '현재 지정된 시간이 없습니다.';
  })();

  return (
    <div
      className={cn(
        'flex flex-col gap-200 rounded-200 border p-400',
        isEnabled
          ? 'border-border-brand'
          : 'border-border-default bg-background-alternative',
      )}
    >
      <div className="flex items-center gap-150">
        {/* access_time icon */}
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            'size-300',
            isEnabled ? 'text-text-default' : 'text-text-subtlest',
          )}
        >
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z" />
        </svg>
        <div className="flex flex-col gap-50">
          <h3
            className={cn(
              'font-designer-16b',
              isEnabled ? 'text-text-default' : 'text-text-subtlest',
            )}
          >
            매일 학습 알림톡 시간
          </h3>
          <p
            className={cn(
              'font-designer-14r',
              isEnabled ? 'text-text-default' : 'text-text-subtlest',
            )}
          >
            학습이 가장 잘 챙겨지는 시간으로 알림톡을 받아보세요.
          </p>
        </div>
      </div>

      <div
        className={cn('h-px', isEnabled ? 'bg-rose-200' : 'bg-border-default')}
      />

      <p
        className={cn(
          'font-designer-14r',
          isEnabled ? 'text-text-brand' : 'text-text-subtlest',
        )}
      >
        {timeText}
      </p>

      <button
        type="button"
        onClick={onOpenModal}
        disabled={!isEnabled}
        className={cn(
          'w-fit rounded-100 px-300 py-150 font-designer-14m',
          isEnabled
            ? 'bg-fill-brand-default-default text-text-inverse'
            : 'bg-border-default text-text-subtle',
        )}
      >
        {hasTime ? '시간 수정하기' : '시간 등록하기'}
      </button>
    </div>
  );
}

function CourseCard({ course }: { course: CourseSummaryResponse }) {
  const { data: journeyMap } = useGetCourseJourneyMap(course.courseId);
  const chapterCount = journeyMap?.chapters.length ?? 0;
  const lessonCount = journeyMap?.totalLessons ?? 0;
  const progressPercent = journeyMap
    ? Math.round(journeyMap.progressRate * 100)
    : 0;

  return (
    <Link
      href={`/class/${course.slug}`}
      className="overflow-hidden rounded-200 border border-border-subtle"
    >
      <div className="relative aspect-[2/1] w-full bg-gray-200">
        {course.thumbnailUrl && (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-100 p-300">
        <h3 className="font-designer-18b text-text-default">{course.title}</h3>
        <div className="flex items-center gap-100">
          <span className="font-designer-14r text-text-subtle">
            챕터 {chapterCount}
          </span>
          <div className="h-200 w-px bg-border-default" />
          <span className="font-designer-14r text-text-subtle">
            레슨 {lessonCount}
          </span>
        </div>
        <div className="mt-200 flex flex-col gap-75">
          <div className="h-75 w-full overflow-hidden rounded-full bg-border-subtle">
            <div
              className="h-75 rounded-full bg-fill-brand-default-default"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="font-designer-14r text-text-subtle">
            진행률 : {progressPercent}%
          </p>
        </div>
      </div>
    </Link>
  );
}
