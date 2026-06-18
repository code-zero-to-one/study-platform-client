import { RESULTS } from './cowork-content';
import { CoworkSectionHeading } from './cowork-section-heading';

export function CoworkResultSection() {
  return (
    <section className="w-full bg-gray-900 px-300 py-1000 md:py-1500">
      <div className="mx-auto flex max-w-page flex-col items-center gap-600">
        <CoworkSectionHeading
          invert
          label="배우고 끝나는 게 아니라, 바로 쓸 수 있어요"
          title="코스가 끝나면, 자동화는 더 이상 어렵지 않아요"
          description={
            '10개의 레슨을 따라가다 보면, 어느새 반복 업무를 직접 자동화하고 있는 나를 만나게 됩니다.\n그리고 손에는 바로 쓸 수 있는 결과물이 남아요.'
          }
        />

        <div className="grid w-full grid-cols-1 gap-300 sm:grid-cols-2 lg:grid-cols-4">
          {RESULTS.map((item) => (
            <div
              key={item.role}
              className="flex flex-col gap-200 rounded-300 bg-white/5 p-400"
            >
              <span className="w-fit rounded-full bg-rose-500 px-200 py-75 text-[13px] font-semibold text-white">
                {item.role}
              </span>
              <p className="text-[15px] font-semibold leading-[1.5] text-white md:text-[16px]">
                {item.output}
              </p>
              <span className="mt-auto text-[12px] font-medium text-white/50">
                결과물
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
