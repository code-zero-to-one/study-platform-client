import { PAIN_POINTS } from './cowork-content';
import { CoworkSectionHeading } from './cowork-section-heading';

export function CoworkPainPointSection() {
  return (
    <section className="w-full bg-white px-300 py-1000 md:py-1500">
      <div className="mx-auto flex max-w-page flex-col items-center gap-600">
        <CoworkSectionHeading
          label="혹시 이런 상황이세요?"
          title={
            '‘이 문장 다듬어줘’는 해봤지만,\n반복되는 그 업무를 통째로 맡겨본 적은 없으셨을 거예요.'
          }
          description="매주 비슷한 일에 시간을 쏟고 있다면, 여러분의 이야기일 수 있어요."
        />

        <div className="grid w-full grid-cols-1 gap-300 md:grid-cols-2">
          {PAIN_POINTS.map((item) => (
            <div
              key={item.role}
              className="flex flex-col gap-200 rounded-300 border border-gray-200 bg-gray-50 p-400"
            >
              <span className="w-fit rounded-full bg-gray-900 px-200 py-75 text-[13px] font-semibold text-white">
                {item.role}
              </span>
              <p className="whitespace-pre-line text-[15px] leading-[1.6] text-gray-700 md:text-[16px]">
                {item.body}
              </p>
              <div className="flex flex-wrap gap-100">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-rose-50 px-150 py-50 text-[12px] font-medium text-rose-500 md:text-[13px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
