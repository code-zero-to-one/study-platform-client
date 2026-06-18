import { DIFFERENCES } from './cowork-content';
import { CoworkSectionHeading } from './cowork-section-heading';

export function CoworkDifferenceSection() {
  return (
    <section className="w-full bg-white px-300 py-1000 md:py-1500">
      <div className="mx-auto flex max-w-page flex-col items-center gap-600">
        <CoworkSectionHeading
          label="비슷한 AI 강의는 많지만, 모두 같지는 않습니다"
          title="다른 AI 코스와 다른 이유 - 그리고, 무료"
          description={
            '영어로 된 Anthropic 공식 코스를, 한국어로 직접 만들어보며 배웁니다.\n보는 코스 말고, 하는 코스로요.'
          }
        />

        <div className="grid w-full grid-cols-1 gap-300 md:grid-cols-2">
          {DIFFERENCES.map((item, index) => (
            <div
              key={item.title}
              className="flex flex-col gap-200 rounded-300 border border-gray-200 p-500"
            >
              <span className="flex size-500 items-center justify-center rounded-full bg-rose-500 text-[15px] font-bold text-white">
                {index + 1}
              </span>
              <h3 className="text-[18px] font-bold text-gray-900 md:text-[20px]">
                {item.title}
              </h3>
              <p className="whitespace-pre-line text-[14px] leading-[1.6] text-gray-500 md:text-[15px]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
