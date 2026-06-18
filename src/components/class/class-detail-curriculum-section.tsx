import { ChevronDown, ChevronUp } from 'lucide-react';
import { CurriculumLessonCard } from './curriculum-lesson-card';

export interface ChapterForRoadmap {
  num: string;
  title: string;
  desc: string;
  lessons: {
    order: number;
    title: string;
    lessonId?: number;
    estimatedMinutes: number;
    isFree: boolean;
  }[];
}

interface ClassDetailCurriculumSectionProps {
  chaptersForRoadmap: ChapterForRoadmap[];
  expandedChapters: Set<number>;
  onToggleChapter: (index: number) => void;
}

export function ClassDetailCurriculumSection({
  chaptersForRoadmap,
  expandedChapters,
  onToggleChapter,
}: ClassDetailCurriculumSectionProps) {
  return (
    <section id="curriculum">
      <h2 className="font-designer-20b text-gray-800 md:font-designer-28b">
        로드맵 따라만 가세요! 첫 URL 배포 가능합니다
      </h2>
      <div className="mt-400 space-y-250">
        {chaptersForRoadmap.map((chapter, i) => (
          <div
            key={`${chapter.num}-${chapter.title}`}
            className="overflow-hidden rounded-200 border border-border-default bg-gray-100"
          >
            <div className="flex items-start gap-150 p-250">
              <div className="flex shrink-0 flex-col items-center justify-center rounded-100 bg-background-brand-default px-150 py-75">
                <p className="font-designer-16m text-text-inverse">Chapter</p>
                <p className="font-designer-24b text-center text-text-inverse">
                  {chapter.num}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-designer-20b text-gray-800">
                  {chapter.title}
                </p>
                {chapter.desc && (
                  <p className="mt-75 font-designer-16m text-gray-800">
                    {chapter.desc}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onToggleChapter(i)}
                className="shrink-0 text-gray-800"
                aria-label={expandedChapters.has(i) ? '접기' : '펼치기'}
              >
                {expandedChapters.has(i) ? (
                  <ChevronUp className="size-400" />
                ) : (
                  <ChevronDown className="size-400" />
                )}
              </button>
            </div>
            {expandedChapters.has(i) && chapter.lessons.length > 0 && (
              <div className="relative flex flex-col gap-250 pb-250 pl-700 pr-250">
                <div
                  aria-hidden
                  className="absolute bottom-300 left-375 top-0 border-l border-gray-300"
                />
                {chapter.lessons.map((lesson) => (
                  <CurriculumLessonCard
                    key={`${chapter.num}-${lesson.order}`}
                    order={lesson.order}
                    title={lesson.title}
                    estimatedMinutes={lesson.estimatedMinutes ?? 0}
                    isFree={lesson.isFree}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
