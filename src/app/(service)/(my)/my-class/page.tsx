'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  useGetCourseList,
  useGetMyGiftEmail,
} from '@/hooks/queries/course/course-api';
import type { CourseSummaryResponse } from '@/types/api/course.types';

export default function MyClassPage() {
  const { data: courses = [] } = useGetCourseList();
  const { data: giftEmail } = useGetMyGiftEmail();

  return (
    <div className="flex flex-col gap-600">
      <h1 className="font-designer-24b text-text-default">마이 클래스</h1>

      <div className="grid grid-cols-1 gap-400 md:grid-cols-2">
        <AlarmCard />
        <GiftEmailCard
          isRegistered={giftEmail?.isRegistered ?? false}
          email={giftEmail?.email}
        />
      </div>

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

function AlarmCard() {
  return (
    <div className="flex flex-col gap-200 rounded-200 border border-border-subtle p-400">
      <div className="flex flex-col gap-100">
        <h3 className="font-designer-16b text-text-default">
          매일 학습 알림톡 시간
        </h3>
        <p className="font-designer-14r text-text-subtle">
          학습이 가장 잘 챙겨지는 시간으로 알림톡을 받아보세요.
        </p>
      </div>
      <p className="font-designer-14m text-text-subtle">
        현재 지정된 시간이 없습니다.
      </p>
      {/* TODO: alarm time API not yet available */}
      <button
        type="button"
        disabled
        className={cn(
          'mt-100 w-fit rounded-100 px-300 py-150',
          'font-designer-14m cursor-not-allowed bg-gray-200 text-text-subtle opacity-50',
        )}
      >
        시간 수정하기
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
      <div className="p-300">
        <h3 className="font-designer-18b text-text-default">{course.title}</h3>
      </div>
    </Link>
  );
}
