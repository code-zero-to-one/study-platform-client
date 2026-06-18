import Image from 'next/image';

const HERO_BADGES = ['Anthropic 공식 기반', '100% 무료', '업무 자동화'];

export function CoworkHeroSection() {
  return (
    <section className="w-full bg-gray-900 px-300 py-1000 text-white md:py-1500">
      <div className="mx-auto flex max-w-page flex-col items-center gap-500 text-center">
        <div className="flex flex-wrap items-center justify-center gap-150">
          {HERO_BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/30 px-200 py-75 text-[13px] font-medium text-white/90 md:text-[14px]"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center gap-200">
          <Image
            src="/class/cowork/claude-logo.png"
            alt="Claude"
            width={64}
            height={48}
            className="h-auto w-800"
          />
          <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.5px] md:text-[44px]">
            코딩없이 AI한테 일 맡기는 방법
          </h1>
          <p className="whitespace-pre-line text-[15px] leading-[1.6] text-white/70 md:text-[20px]">
            {
              '매일 반복되는 보고서, 회의록, 데이터 정리\n핵심 업무는 계속 뒤로 밀리고 있지 않나요?'
            }
          </p>
        </div>

        <p className="whitespace-pre-line text-[14px] leading-[1.6] text-white/60 md:text-[16px]">
          {
            'AI를 쓰는 것과, AI가 일하는 것은 다릅니다.\n영어로 된 Anthropic 공식 코스를, 한국어로 직접 만들어보며 배웁니다.'
          }
        </p>

        {/* 대화 목업 */}
        <div className="mt-300 flex w-full flex-col gap-200 rounded-300 bg-white/5 p-400 text-left md:w-7/12 lg:w-1/2">
          <div className="ml-auto max-w-[80%] whitespace-pre-line rounded-200 bg-rose-500 px-250 py-150 text-[14px] leading-[1.5] text-white md:text-[15px]">
            {'이번 주 회의록 정리해서\n보고서로 만들어줘'}
          </div>
          <div className="mr-auto max-w-[80%] rounded-200 bg-white/10 px-250 py-150 text-[14px] leading-[1.5] text-white/90 md:text-[15px]">
            알겠습니다. 보고서 초안 만들었습니다.
          </div>
          <div className="mr-auto flex items-center gap-150 rounded-200 border border-white/15 bg-white/5 px-250 py-150 text-[13px] text-white/80 md:text-[14px]">
            📄 주간_회의록_정리.docx
          </div>
        </div>
      </div>
    </section>
  );
}
