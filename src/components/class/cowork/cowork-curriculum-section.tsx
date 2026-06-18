import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { CURRICULUM } from './cowork-content';
import { CoworkSectionHeading } from './cowork-section-heading';

export function CoworkCurriculumSection() {
  return (
    <section className="w-full bg-gray-50 px-300 py-1000 md:py-1500">
      <div className="mx-auto flex max-w-page flex-col items-center gap-600">
        <CoworkSectionHeading
          label="4개 챕터, 10개 레슨으로 차근차근 이어집니다"
          title="전체 커리큘럼 - 이렇게 배워요"
        />

        <div className="flex w-full flex-col gap-300">
          {CURRICULUM.map((chapter) => (
            <div
              key={chapter.chapter}
              className="flex flex-col gap-300 rounded-300 border border-gray-200 bg-white p-500"
            >
              <div className="flex flex-wrap items-center justify-between gap-200">
                <h3 className="text-[17px] font-bold text-gray-900 md:text-[20px]">
                  {chapter.chapter}
                </h3>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-200 py-75 text-[12px] font-semibold md:text-[13px]',
                    chapter.badgeTone === 'free'
                      ? 'bg-rose-50 text-rose-500'
                      : 'bg-gray-900 text-white',
                  )}
                >
                  {chapter.badge}
                </span>
              </div>

              <p className="whitespace-pre-line text-[14px] leading-[1.6] text-gray-500 md:text-[15px]">
                {chapter.summary}
              </p>

              <ul className="flex flex-col gap-150 border-t border-gray-100 pt-300">
                {chapter.lessons.map((lesson) => (
                  <li
                    key={lesson}
                    className="flex gap-150 text-[14px] leading-[1.6] text-gray-700 md:text-[15px]"
                  >
                    <span className="mt-50 size-100 shrink-0 rounded-full bg-rose-400" />
                    <span>{lesson}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
