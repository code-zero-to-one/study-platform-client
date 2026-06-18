'use client';

import Image from 'next/image';

interface Props {
  onToggleCurriculum: () => void;
  currentLesson: number;
  totalLessons: number;
  courseTitle: string;
  discordCount?: number;
}

export function LessonTopBar({
  onToggleCurriculum,
  currentLesson,
  totalLessons,
  courseTitle,
  discordCount = 59,
}: Props) {
  const progressPct =
    totalLessons > 0 ? Math.min(100, (currentLesson / totalLessons) * 100) : 0;

  return (
    <div className="flex h-800 w-full items-center gap-200 bg-rose-100 md:gap-0">
      <button
        type="button"
        onClick={onToggleCurriculum}
        className="flex size-800 shrink-0 flex-col items-center justify-center bg-rose-500 text-rose-100"
      >
        <Image
          src="/class/checklist.svg"
          alt=""
          aria-hidden="true"
          width={32}
          height={32}
          className="mt-75"
        />
        <span className="mb-75 font-designer-14m">커리큘럼</span>
      </button>

      <div className="ml-200 flex min-w-0 items-center gap-175 md:ml-332">
        <div className="flex shrink-0 items-center gap-37 bg-rose-300 rounded-100 px-125 py-25 text-rose-50 font-designer-16m">
          <span>{currentLesson}</span>
          <span>/</span>
          <span>{totalLessons}</span>
        </div>
        <p className="min-w-0 truncate font-designer-16sb text-black">
          {courseTitle}
        </p>
      </div>

      <div className="ml-200 min-w-0 max-w-[787px] flex-1 md:ml-450">
        <div className="relative h-175 overflow-hidden rounded-full bg-white">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-rose-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="ml-auto mr-200 flex h-450 shrink-0 items-center rounded-100 bg-rose-500 px-150 md:mr-400 md:px-250">
        <p className="flex items-center gap-75">
          <span className="text-gray-800 font-designer-14m md:font-designer-16m">
            {discordCount}
          </span>
          <span className="text-gray-0 font-designer-14m md:font-designer-16sb">
            명과 함께 공부 중!
          </span>
        </p>
      </div>
    </div>
  );
}
