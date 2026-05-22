'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  useGetCourseJourneyMap,
  useGetCourseList,
  useGetMyGiftEmail,
} from '@/hooks/queries/course/course-api';
import { useGetNotificationSetting } from '@/hooks/queries/notification/use-notification-setting';
import type { CourseSummaryResponse } from '@/types/api/course.types';

const LearningNotificationModal = dynamic(
  () => import('./_components/learning-notification-modal'),
  { ssr: false },
);

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function MyClassPage() {
  const { data: courses = [] } = useGetCourseList();
  const { data: giftEmail } = useGetMyGiftEmail();
  const { data: notificationSetting } = useGetNotificationSetting();
  const [alarmModalOpen, setAlarmModalOpen] = useState(false);

  const isEnabled = notificationSetting?.isEnabled ?? false;

  return (
    <div className="flex flex-col gap-600">
      <h1 className="font-designer-24b text-text-default">마이 클래스</h1>

      {/* 알림 섹션 */}
      <section className="flex flex-col gap-300">
        <div className="flex items-center gap-200">
          <h2 className="font-designer-18m text-text-default">알림</h2>
          <Toggle enabled={isEnabled} onClick={() => setAlarmModalOpen(true)} />
        </div>

        <div className="grid grid-cols-1 gap-400 md:grid-cols-2">
          <AlarmCard
            isEnabled={isEnabled}
            notifyHour={notificationSetting?.notifyHour}
            notifyMinute={notificationSetting?.notifyMinute}
            onOpenModal={() => setAlarmModalOpen(true)}
          />
          <GiftEmailCard
            isRegistered={giftEmail?.isRegistered ?? false}
            email={giftEmail?.email}
          />
        </div>
      </section>

      <LearningNotificationModal
        open={alarmModalOpen}
        onOpenChange={setAlarmModalOpen}
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

function Toggle({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="학습 알림 설정 열기"
      aria-pressed={enabled}
      onClick={onClick}
      className={cn(
        'relative flex h-300 w-650 cursor-pointer items-center rounded-full transition-colors duration-200',
        enabled ? 'bg-primary-500' : 'bg-border-subtle',
      )}
    >
      <span
        className={cn(
          'absolute size-250 rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-375' : 'translate-x-25',
        )}
      />
    </button>
  );
}

function AlarmCard({
  isEnabled,
  notifyHour,
  notifyMinute,
  onOpenModal,
}: {
  isEnabled: boolean;
  notifyHour?: number;
  notifyMinute?: number;
  onOpenModal: () => void;
}) {
  const hasTime =
    notifyHour !== null &&
    notifyHour !== undefined &&
    notifyMinute !== null &&
    notifyMinute !== undefined;
  const timeText = hasTime
    ? `${pad(notifyHour!)}:${pad(notifyMinute!)}`
    : '현재 지정된 시간이 없습니다.';

  return (
    <div
      className={cn(
        'flex flex-col gap-200 rounded-200 border p-400',
        isEnabled
          ? 'border-primary-500'
          : 'border-border-subtle bg-background-alternative',
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
            isEnabled ? 'text-text-default' : 'text-text-subtle',
          )}
        >
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z" />
        </svg>
        <div className="flex flex-col gap-50">
          <h3
            className={cn(
              'font-designer-16b',
              isEnabled ? 'text-text-default' : 'text-text-subtle',
            )}
          >
            매일 학습 알림톡 시간
          </h3>
          <p
            className={cn(
              'font-designer-14r',
              isEnabled ? 'text-text-subtle' : 'text-text-subtlest',
            )}
          >
            학습이 가장 잘 챙겨지는 시간으로 알림톡을 받아보세요.
          </p>
        </div>
      </div>

      <div
        className={cn('h-px', isEnabled ? 'bg-rose-200' : 'bg-border-subtle')}
      />

      <p
        className={cn(
          'font-designer-14r',
          isEnabled ? 'text-primary-500' : 'text-text-subtle',
        )}
      >
        {timeText}
      </p>

      <button
        type="button"
        onClick={onOpenModal}
        className={cn(
          'w-fit rounded-100 px-300 py-150 font-designer-14m',
          isEnabled
            ? 'bg-primary-500 text-white'
            : 'bg-border-subtle text-text-subtlest',
        )}
      >
        {hasTime ? '시간 수정하기' : '시간 등록하기'}
      </button>
    </div>
  );
}

function GiftEmailCard({
  isRegistered,
  email,
}: {
  isRegistered: boolean;
  email?: string;
}) {
  return (
    <div className="flex flex-col gap-200 rounded-200 border border-rose-200 bg-rose-50 p-400">
      <div className="flex flex-col gap-100">
        <h3 className="font-designer-16b text-text-default">
          Claude Pro Gift 메일
        </h3>
        <p className="font-designer-14r text-text-subtle">
          {isRegistered
            ? `Gift 메일 발송이 완료되었습니다.${email ? ` (${email})` : ''}`
            : '현재 등록된 메일이 없습니다.'}
        </p>
      </div>
      <Link
        href="/class"
        className={cn(
          'mt-100 w-fit rounded-100 px-300 py-150',
          'font-designer-14m bg-primary-500 text-white',
        )}
      >
        메일 확인 하러가기
      </Link>
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
              className="h-75 rounded-full bg-primary-500"
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
