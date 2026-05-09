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
    <div className="sticky top-0 z-30 flex h-800 w-full items-center bg-background-default">
      <button
        type="button"
        onClick={onToggleCurriculum}
        className="flex h-800 w-800 shrink-0 flex-col items-center justify-center gap-25 bg-background-brand-default text-text-inverse"
      >
        <Image
          src="/class/vibe-intro/checklist.svg"
          alt=""
          aria-hidden="true"
          width={32}
          height={32}
        />
        <span className="font-designer-14m text-text-inverse">커리큘럼</span>
      </button>

      <div className="flex items-center gap-350 px-350">
        <div className="flex items-center rounded-100 bg-rose-200 px-125 py-25">
          <p className="font-designer-16m text-rose-400">
            {currentLesson} / {totalLessons}
          </p>
        </div>
        <p className="font-designer-16b text-gray-1000">{courseTitle}</p>
      </div>

      <div className="flex-1 px-300">
        <div className="relative h-175 overflow-hidden rounded-full bg-gray-200">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-background-brand-default transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mr-400 flex h-450 items-center rounded-100 bg-gray-800 px-250">
        <p className="font-designer-16b">
          <span className="text-text-brand">{discordCount}</span>
          <span className="text-text-inverse">
            명과 디스코드에서 함께 공부중!
          </span>
        </p>
      </div>
    </div>
  );
}
