import Image from 'next/image';
import { Fragment } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';

interface InstructorCard {
  team: string;
  heading: string;
  body?: string;
  profileImageUrl?: string;
}

interface ClassDetailInstructorSectionProps {
  instructorCards: InstructorCard[];
}

export function ClassDetailInstructorSection({
  instructorCards,
}: ClassDetailInstructorSectionProps) {
  return (
    <section>
      <h2 className="font-designer-24b text-gray-800">
        가장 많이 좌절하시는 지점, 저희가 잘 알고 있어요.
      </h2>
      <p className="mt-100 font-designer-14r text-gray-800">
        학습은 같이 할 때 가장 즐겁습니다.
        <br />
        서로의 아이디어를 나누고 함께 성장하세요.
      </p>
      <div className="mt-500 flex flex-col">
        {instructorCards.map((msg, i) => (
          <Fragment key={msg.team}>
            {i > 0 && (
              <div className="relative h-400 md:h-1375">
                <svg
                  className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
                  aria-hidden="true"
                >
                  <line
                    x1="11.5%"
                    y1="0"
                    x2="11.5%"
                    y2="100%"
                    stroke="#fecdd6"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                  {i % 2 === 1 ? (
                    <line
                      x1="45.8%"
                      y1="0"
                      x2="56%"
                      y2="100%"
                      stroke="#fecdd6"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                    />
                  ) : (
                    <line
                      x1="67.3%"
                      y1="0"
                      x2="57%"
                      y2="100%"
                      stroke="#fecdd6"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                    />
                  )}
                </svg>
              </div>
            )}
            <div className={i % 2 === 1 ? 'relative' : undefined}>
              {i % 2 === 1 && (
                <svg
                  className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
                  aria-hidden="true"
                >
                  <line
                    x1="11.5%"
                    y1="0"
                    x2="11.5%"
                    y2="100%"
                    stroke="#fecdd6"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                </svg>
              )}
              <div
                className={cn(
                  'rounded-200 border border-rose-200 bg-gray-0 p-500 shadow-[0_4px_17px_3px_#f9e9ed]',
                  i % 2 === 1 && 'md:ml-[25%]',
                )}
              >
                <p className="font-designer-20b text-text-brand">
                  {msg.heading}
                </p>
                {msg.body && (
                  <p className="mt-150 whitespace-pre-line font-designer-16r text-gray-800">
                    {msg.body}
                  </p>
                )}
                <div className="mt-300 flex items-end justify-end gap-200">
                  <p className="font-designer-16r text-gray-800">
                    - {msg.team}
                  </p>
                  <div className="relative flex size-750 shrink-0 overflow-hidden rounded-full bg-gray-100">
                    {msg.profileImageUrl ? (
                      <Image
                        src={msg.profileImageUrl}
                        alt={msg.team}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserAvatar image={undefined} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
