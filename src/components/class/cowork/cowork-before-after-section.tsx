import { ArrowRight } from 'lucide-react';
import { BEFORE_AFTER, BEFORE_AFTER_STATS } from './cowork-content';
import { CoworkSectionHeading } from './cowork-section-heading';

export function CoworkBeforeAfterSection() {
  return (
    <section className="w-full bg-gray-50 px-300 py-1000 md:py-1500">
      <div className="mx-auto flex max-w-page flex-col items-center gap-600">
        <CoworkSectionHeading
          label="익숙해서 당연하게 여겼던 그 시간, 줄일 수 있습니다"
          title="AI한테 맡기면, 이만큼 돌아와요"
          description="같은 시간, 다른 결과. Cowork에 맡기면 달라지는 것들"
        />

        <div className="flex w-full flex-col gap-200">
          {BEFORE_AFTER.map((row) => (
            <div
              key={row.before}
              className="grid grid-cols-1 items-center gap-200 rounded-300 bg-white p-400 md:grid-cols-[1fr_auto_1fr]"
            >
              <div className="flex items-center gap-150">
                <span className="shrink-0 rounded-full bg-gray-200 px-200 py-50 text-[12px] font-semibold text-gray-500">
                  Before
                </span>
                <p className="text-[14px] leading-[1.5] text-gray-500 line-through md:text-[15px]">
                  {row.before}
                </p>
              </div>
              <ArrowRight className="mx-auto hidden size-300 text-rose-400 md:block" />
              <div className="flex items-center gap-150">
                <span className="shrink-0 rounded-full bg-rose-500 px-200 py-50 text-[12px] font-semibold text-white">
                  After
                </span>
                <p className="text-[14px] font-semibold leading-[1.5] text-gray-900 md:text-[15px]">
                  {row.after}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid w-full grid-cols-1 gap-300 md:grid-cols-3">
          {BEFORE_AFTER_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-100 rounded-300 border border-rose-100 bg-white p-400"
            >
              <span className="text-[28px] font-bold text-rose-500 md:text-[36px]">
                {stat.value}
              </span>
              <span className="text-[14px] text-gray-500 md:text-[15px]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-[15px] font-semibold leading-[1.6] text-gray-800 md:text-[18px]">
          업무 자동화로 아낀 시간은, 곧 나의 커리어 경쟁력이 됩니다
        </p>
      </div>
    </section>
  );
}
