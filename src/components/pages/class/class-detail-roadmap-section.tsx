import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { TARGET_AUDIENCE } from './class-detail-constants';

export function ClassDetailRoadmapSection() {
  return (
    <section id="roadmap">
      <h2 className="font-designer-24b text-gray-800">
        바이브 코딩, 나도 해보고 싶은데… 어디서부터?
        <br />그 막막함, 여기서 끝내세요.
      </h2>
      <p className="mt-300 font-designer-14r text-gray-800">
        코드 한 줄 몰라도 괜찮아요.
        <br />
        Claude가 만들고, 참여자가 결정합니다. 터미널 막막했던 그 벽, 여기서
        없애드릴게요.
      </p>

      <div className="mt-400">
        <div className="relative">
          {/* TODO: h-[354px] uses a banned px arbitrary value — add --spacing-4425 token */}
          <div className="mx-[10.35%] flex h-[354px] items-center justify-center overflow-hidden rounded-100 bg-gray-300">
            <p className="font-designer-18r text-black">
              커리큘럼 미리보기 이미지
            </p>
          </div>
          <button
            type="button"
            aria-label="이전"
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
          >
            <ChevronLeft className="h-250 w-250" />
          </button>
          <button
            type="button"
            aria-label="다음"
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
          >
            <ChevronRight className="h-250 w-250" />
          </button>
        </div>
        <div className="mt-200 flex items-center justify-center gap-125">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'size-125 rounded-full',
                i === 0 ? 'bg-rose-500' : 'bg-gray-300',
              )}
            />
          ))}
        </div>
      </div>

      <h3 className="mt-500 font-designer-24b text-gray-800">
        이런 분들이 들으면 좋아요!
      </h3>
      <div className="mt-300 grid grid-cols-3 gap-250">
        {TARGET_AUDIENCE.map((a) => (
          <div
            key={a.title}
            className="flex h-[140px] flex-col items-center justify-center gap-125 overflow-hidden rounded-200 bg-gray-200 px-200 text-center"
          >
            <p className="font-designer-18b text-gray-1000">{a.title}</p>
            <p className="whitespace-pre-line font-designer-16r text-gray-1000">
              {a.desc}
            </p>
          </div>
        ))}
      </div>

      <h3 className="mt-500 font-designer-24b text-gray-800">
        이 코스를 완주하면 이런 걸 만들 수 있어요!
      </h3>
      <div className="relative mt-300 h-[150px] w-full overflow-hidden rounded-100">
        <Image
          src="/class/detail/result-showcase.png"
          alt="코스 완주 결과물 예시"
          fill
          className="object-cover"
        />
      </div>
      <p className="mt-150 font-designer-14r text-gray-800">
        형식은 자유예요. 중요한 건{' '}
        <span className="font-designer-14b text-text-brand">
          &quot;내가 만든 웹사이트&quot;
        </span>
        가 진짜로 인터넷에 올라간다는 거예요!
      </p>
    </section>
  );
}
