import Image from 'next/image';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { INSTRUCTOR_TEAMS } from './class-detail-constants';

export function ClassDetailInstructorSection() {
  return (
    <section>
      <h2 className="font-designer-28b text-gray-800">
        가장 많이 좌절하시는 지점, 저희가 잘 알고 있어요.
      </h2>
      <p className="mt-100 font-designer-20r text-gray-800">
        학습은 같이 할 때 가장 즐겁습니다.
        <br />
        서로의 아이디어를 나누고 함께 성장하세요.
      </p>

      <div className="mt-600 flex flex-col gap-500">
        {INSTRUCTOR_TEAMS.map((card) => (
          <div
            key={card.team}
            className={cn(
              'flex flex-col overflow-hidden md:flex-row md:items-stretch',
              card.bgClass,
              card.roundedClass,
              card.imageSide === 'right' && 'md:flex-row-reverse',
            )}
          >
            <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center md:aspect-auto md:w-2/5">
              <Image
                src={card.image}
                alt={card.team}
                fill
                sizes="(max-width: 768px) 100vw"
                className="h-full w-full object-contain"
                quality={100}
              />
            </div>
            <div className="flex flex-1 flex-col gap-150 p-500 md:p-700">
              <p className="font-corinthia text-[62px] leading-none text-gray-800">
                {card.script}
              </p>
              {card.intro && (
                <p className="font-designer-18r text-gray-800">{card.intro}</p>
              )}
              <p
                className={cn(
                  'whitespace-pre-line font-designer-20b',
                  card.headingClass,
                )}
              >
                {card.heading}
              </p>
              <p className="whitespace-pre-line font-designer-18r text-gray-800">
                {card.outro}
              </p>
              <p className="mt-100 font-designer-16b text-black">{card.team}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
