'use client';

import { m, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

/* ─── Animation helper ──────────────────────────────── */

function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <m.div
      ref={ref}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/* ─── Layout constant ───────────────────────────────── */

const SECTION_INNER =
  'mx-auto w-full max-w-[1400px] px-250 md:px-500 lg:px-1000';

/* ─── Data ──────────────────────────────────────────── */

interface CheckCardLine {
  text: string;
  red: boolean;
}

const CHECK_CARDS: { tag: string; lines: CheckCardLine[] }[] = [
  {
    tag: '#피그마_감옥',
    lines: [
      { text: 'FIgma 파일까진 완벽한데...', red: false },
      { text: '거기서 끝이에요.', red: false },
      { text: '살아있는 웹사이트로 만들어내지 못하고', red: false },
      { text: '피그마 안에만 갇혀있어요.', red: true },
    ],
  },
  {
    tag: '#눈치_개발자',
    lines: [
      { text: '"이거 구현 가능해요?" 물어보는 게 매번', red: false },
      { text: '눈치보여요. 안된다고 하면', red: false },
      { text: '"아...네..."', red: true },
      { text: '할 수 밖에 없는 내가 싫어요.', red: false },
    ],
  },
  {
    tag: '#터미널_엔딩',
    lines: [
      { text: 'Claudef로 뭔가 만들다가 오류 딱 하나가', red: false },
      { text: '해결이 안되요.', red: false },
      { text: '구글링도 해보고 별짓 다하다가', red: false },
      { text: '결국 터미널 닫고 유튜브 켜요.', red: true },
    ],
  },
  {
    tag: '#AI시대_막막',
    lines: [
      { text: 'AI 시대에 디자이너로서 뭘 해야할지', red: false },
      { text: '모르겠어요...', red: false },
      { text: '다들 뭔가 하는 것 같은데', red: true },
      { text: '나만 가만히 있는 느낌?', red: true },
    ],
  },
  {
    tag: '#유튜브_미아',
    lines: [
      { text: '바이브코딩 유튜브 이것저것', red: false },
      { text: '전진했는데, 정작 뭐부터 해야 하는지', red: false },
      { text: '감이 안잡혀요.', red: false },
      { text: '영상은 많은데 방향이 없어요.', red: true },
    ],
  },
  {
    tag: '#노션_무덤',
    lines: [
      { text: '사이드 프로젝트 아이디어는', red: false },
      { text: '넘쳐나는데 항상 노션에만 쌓여요.', red: false },
      { text: '실행이 안 되니까 아이디어가', red: true },
      { text: '무덤이 되어가요', red: true },
    ],
  },
];

const RESULT_CARDS = [
  { job: '디자이너', days: '3일', title: '내 포트폴리오 사이트' },
  { job: '마케터', days: '4일', title: '사이드 프로젝트 랜딩' },
  { job: '대학생', days: '5일', title: '감성 카페 큐레이션' },
  { job: '기획자', days: '5일', title: '팀 프로필 모음 사이트' },
];

const CURRICULUM_ITEMS = [
  {
    num: '01',
    title: '영상, 강의보다 학습지처럼 매일 1시간씩',
    subtitle: '레슨 미리보기',
    body: '학습 여정 지도에서 도장찍듯이 하나씩 레슨을\n통과해보세요! 혼자가 아닌 다양한 수강생들도 함께\n달리고 있습니다. 혼자 공부가 아닌 소통하며 공부를 해보세요!\n확실한 동기부여로 20일간 함께 하겠습니다.',
  },
  {
    num: '02',
    title: '실시간 질문과 운영진 피드백',
    subtitle: '질문하기',
    body: 'AI로 해결이 안 되는 부분은 운영진이 직접 답변해 드립니다.\n막히는 지점을 빠르게 돌파하고 학습 흐름을 유지하세요.\n혼자 막히지 말고 함께 해결하세요.',
  },
  {
    num: '03',
    title: '함께 만들어가는 빌더 커뮤니티',
    subtitle: '결과물 피드',
    body: '수강생들의 실제 결과물을 피드에서 확인하세요.\n서로의 작업물을 보며 영감을 얻고, 내 작업물도 공유해보세요.\n동기부여와 소통이 함께합니다.',
  },
  {
    num: '04',
    title: '실전 배포까지 완성',
    subtitle: '웹사이트 배포',
    body: '코드 작성부터 실제 URL 발급까지.\n20일 후엔 당신만의 웹사이트 링크를 세상에 공개합니다.\n결과물이 있는 공부를 경험하세요.',
  },
];

const FAQ_ITEMS = [
  {
    q: '코딩 한 번도 안 해봤는데 따라갈 수 있나요?',
    a: '네, 완전 비전공자도 따라올 수 있도록 설계되어 있습니다. Claude와 AI 도구를 활용해 코드를 직접 작성하지 않아도 웹사이트를 만들 수 있습니다.',
  },
  {
    q: '어떤 준비물이 필요한가요?',
    a: 'PC 또는 맥북과 인터넷 환경만 있으면 됩니다. Claude Pro 구독($20/월)이 필요하며, 기타 설치 프로그램은 안내에 따라 진행됩니다.',
  },
  {
    q: '하루에 얼마나 시간을 써야 하나요?',
    a: '하루 1~2시간을 권장합니다. 총 20일 과정이며, 레슨별로 무리 없이 따라올 수 있는 분량으로 설계되어 있습니다.',
  },
  {
    q: 'Claude Pro를 이미 구독 중이에요!',
    a: '별도 추가 비용 없이 기존 구독을 그대로 활용하실 수 있습니다. 코스 수강료와 Claude Pro 구독은 별개입니다.',
  },
  {
    q: '환불이 가능한가요?',
    a: '수강 시작 후 3일 이내에는 전액 환불이 가능합니다. 이후에는 환불이 어렵습니다. 자세한 내용은 이용약관을 참고해 주세요.',
  },
];

/* ─── Speech bubble positions (desktop only) ────────── */

const SPEECH_BUBBLES = [
  {
    src: '/landing/speech-bubble-1.svg',
    rotate: '0deg',
    scaleY: false,
    posClass: 'left-[1%] top-[16%]',
    text: ['디자인은 완성인데', '그 다음이 없다'],
    width: 207,
    height: 168,
  },
  {
    src: '/landing/speech-bubble-2.svg',
    rotate: '-5.97deg',
    scaleY: false,
    posClass: 'left-[49%] top-[17%]',
    text: ['개발자 앞에서', '항상 을이 되는 느낌'],
    width: 197,
    height: 163,
  },
  {
    src: '/landing/speech-bubble-3.svg',
    rotate: '-20.56deg',
    scaleY: false,
    posClass: 'right-[1%] top-[12%]',
    text: ['오류 하나에', '모든 의지가 증발'],
    width: 244,
    height: 246,
  },
  {
    src: '/landing/speech-bubble-4.svg',
    rotate: '22.8deg',
    scaleY: false,
    posClass: 'left-[0%] bottom-[26%]',
    text: ['뭔가 해야 하는건 아는데', '뭘 해야 할지...'],
    width: 255,
    height: 234,
  },
  {
    src: '/landing/speech-bubble-5.svg',
    rotate: '-159.44deg',
    scaleY: true,
    posClass: 'left-[38%] bottom-[30%]',
    text: ['강의는 100개', '봤는데 결과물은 0개'],
    width: 244,
    height: 246,
  },
  {
    src: '/landing/speech-bubble-6.svg',
    rotate: '180deg',
    scaleY: true,
    posClass: 'right-[4%] bottom-[28%]',
    text: ['아이디어만 쌓이고', '실행력은 0'],
    width: 207,
    height: 168,
  },
];

/* ─── Main ──────────────────────────────────────────── */

export default function LandingContent() {
  return (
    <div className="relative w-full">
      <HeroSection />
      <CheckSection />
      <ResultsSection />
      <CurriculumSection />
      <BenefitsSection />
      <FAQSection />
      <FloatingCTABar />
    </div>
  );
}

/* ─── 1. Hero Section ───────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gray-100 pb-1000 pt-1000 md:pb-1250 md:pt-1625">
      <div className={cn(SECTION_INNER, 'flex flex-col items-center')}>
        {/* Headline */}
        <FadeIn className="text-center">
          <h1 className="text-[32px] font-bold leading-[1.5] tracking-[-0.76px] text-gray-800 md:text-[50px]">
            <span className="text-rose-600">바이브 코딩</span>
            <br />
            뭐부터 해야 할지 모르겠죠?
            <br />
            그래서 만들었습니다.
          </h1>
        </FadeIn>

        {/* Subtitle */}
        <FadeIn
          delay={0.2}
          className="mt-300 text-center text-[15px] leading-[1.5] text-gray-800 md:text-[26px]"
        >
          막막할 이유 없습니다.{' '}
          <span className="font-bold">방향을 몰랐을 뿐</span>
          입니다.
          <br />
          20일 후, 당신의 첫 웹사이트가 세상에 공개됩니다
        </FadeIn>

        {/* Instructor card */}
        <FadeIn delay={0.4} className="mt-1000 flex justify-center">
          <div className="relative h-[300px] w-[230px] overflow-visible rounded-[40px] bg-rose-500 md:h-[460px] md:w-[330px] lg:h-[575px] lg:w-[395px]">
            {/* 성윤님의 */}
            <p className="absolute left-1/2 top-300 -translate-x-1/2 whitespace-nowrap text-[20px] font-bold leading-[1.5] text-white md:top-400 md:text-[30px] lg:text-[40px]">
              성윤님의
            </p>

            {/* Bottom label */}
            <p className="absolute bottom-300 left-1/2 -translate-x-1/2 whitespace-nowrap text-[16px] font-bold leading-[1.5] text-white md:text-[24px] lg:text-[40px]">
              사이드 프로젝트 랜딩
            </p>

            {/* 사이드 프로젝트 랜딩 badge */}
            <div className="absolute bottom-1250 left-250 flex items-center gap-125 rounded-[60px] bg-rose-100 px-250 py-125">
              <span className="whitespace-nowrap text-[11px] font-bold leading-[1.5] text-gray-800 md:text-[14px] lg:text-[16px]">
                사이드 프로젝트 랜딩
              </span>
            </div>

            {/* #바이브코딩 신기 badge */}
            <div className="absolute right-250 top-500 flex items-center gap-100 rounded-[60px] bg-rose-100 px-250 py-125">
              <span className="font-bold text-black">#</span>
              <span className="whitespace-nowrap text-[11px] font-bold leading-[1.5] text-gray-800 md:text-[14px] lg:text-[16px]">
                바이브코딩 신기
              </span>
            </div>

            {/* Website preview box (desktop only) */}
            <div className="absolute hidden right-0 top-[42%] h-[140px] w-[200px] translate-x-[60%] rounded-[20px] border border-rose-400 bg-rose-100 lg:block lg:h-[237px] lg:w-[300px]" />

            {/* Instructor photo */}
            <div className="absolute bottom-0 left-1/2 h-[72%] w-[78%] -translate-x-1/2 overflow-hidden">
              <Image
                src="/landing/instructor-full.png"
                alt="강사 이미지"
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 768px) 180px, (max-width: 1024px) 260px, 310px"
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 2. Check Section ──────────────────────────────── */

function CheckCard({ card }: { card: (typeof CHECK_CARDS)[0] }) {
  return (
    <div className="group relative">
      {/* Shadow layer — appears on hover */}
      <div className="absolute inset-0 translate-x-100 translate-y-100 bg-gray-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      {/* Card */}
      <div className="relative overflow-hidden border-2 border-gray-800 bg-white">
        {/* Tag */}
        <div className="flex items-center justify-center px-100 pb-100 pt-400">
          <p className="text-center text-[18px] font-bold leading-[1.5] text-black md:text-[20px]">
            {card.tag}
          </p>
        </div>

        {/* Description */}
        <div className="flex items-center justify-center px-100 pb-300">
          <div className="text-center text-[14px] leading-[1.5] text-gray-800 md:text-[16px]">
            {card.lines.map((line, i) => (
              <p
                key={i}
                className={cn(
                  'whitespace-pre',
                  line.red && 'font-bold text-rose-500',
                )}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>

        {/* Illustration placeholder */}
        <div className="h-[120px] w-full bg-gray-100 md:h-[160px]" />
      </div>
    </div>
  );
}

function CheckSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white pb-1000 pt-1000 md:pb-1250 md:pt-1625">
      {/* Speech bubbles — desktop only */}
      {SPEECH_BUBBLES.map((bubble, i) => (
        <div
          key={i}
          className={cn(
            'pointer-events-none absolute hidden xl:block',
            bubble.posClass,
          )}
          style={{
            transform: `rotate(${bubble.rotate})${bubble.scaleY ? ' scaleY(-1)' : ''}`,
            zIndex: 0,
          }}
        >
          <div className="relative">
            <Image
              src={bubble.src}
              alt=""
              width={bubble.width}
              height={bubble.height}
              unoptimized
            />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center text-[16px] font-semibold leading-[1.5] text-black"
              style={{
                transform: `rotate(${bubble.scaleY ? String(-Number(bubble.rotate.replace('deg', '')) + 180) : `-${bubble.rotate}`})`,
              }}
            >
              {bubble.text.map((t, j) => (
                <p key={j}>{t}</p>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className={cn(SECTION_INNER, 'relative z-10')}>
        {/* Badge */}
        <FadeIn className="flex justify-center">
          <span className="rounded-[40px] bg-rose-300 px-250 py-125 text-[20px] font-medium leading-[1.5] text-white md:text-[24px]">
            Check
          </span>
          <h2 className="text-[24px] font-bold leading-[36px] text-text-strong md:font-bold-h2 lg:font-bold-h1">
            두 개의 여정이 만나는 곳
          </h2>
        </FadeIn>

        {/* Subtitle */}
        <FadeIn delay={0.15} className="mt-75 text-center">
          <p className="text-[14px] leading-[1.5] text-gray-800 md:text-[16px]">
            카드 위 마우스를 올려보세요
          </p>
        </FadeIn>

        {/* Cards grid */}
        <FadeIn delay={0.2} className="mt-500">
          <div className="grid grid-cols-1 gap-500 sm:grid-cols-2 lg:grid-cols-3">
            {CHECK_CARDS.map((card) => (
              <CheckCard key={card.tag} card={card} />
            ))}
          </div>
        </FadeIn>

        {/* CTA highlight box */}
        <FadeIn delay={0.3} className="mt-1000">
          <div className="flex items-center justify-center gap-200 rounded-200 border-[3px] border-rose-500 bg-rose-50 px-750 py-500">
            <svg
              viewBox="0 0 30 30"
              className="size-325 shrink-0 md:size-375"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 0.5H26C27.933 0.5 29.5 2.067 29.5 4V26C29.5 27.933 27.933 29.5 26 29.5H4C2.067 29.5 0.5 27.933 0.5 26V4L0.504883 3.82031C0.595411 2.03035 2.03035 0.595411 3.82031 0.504883L4 0.5Z"
                fill="white"
                stroke="#F63D68"
              />
              <path
                d="M7 13.5L14.5 21.5L22 8"
                stroke="#F63D68"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </svg>
            <p className="text-[18px] font-bold leading-[1.5] text-rose-500 md:text-[24px] lg:text-[28px]">
              3개 이상 해당된다면, 이 코스는 당신을 위해 설계됐습니다.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 3. Results Section ────────────────────────────── */

function ResultsSection() {
  return (
    <section className="w-full overflow-hidden bg-gray-100 pb-1000 pt-1000 md:pb-1250 md:pt-1625">
      <div className={SECTION_INNER}>
        {/* Badge */}
        <FadeIn className="flex justify-center">
          <span className="rounded-[40px] bg-rose-300 px-250 py-125 text-[20px] font-medium leading-[1.5] text-white md:text-[24px]">
            베타 수강생 결과물
          </span>
          <h2 className="text-[24px] font-bold leading-[36px] text-text-strong md:font-bold-h2 lg:font-bold-h1">
            하나의 플랫폼, 다섯 가지 경험
          </h2>
        </FadeIn>

        {/* Subtitle */}
        <FadeIn delay={0.15} className="mt-75 text-center">
          <p className="text-[14px] leading-[1.5] text-gray-800 md:text-[20px]">
            모두 개발 경험이 전무했습니다. 20일 후, 전부 각자의 URL을 가지게
            되었어요.
          </p>
        </FadeIn>

        {/* Cards */}
        <FadeIn delay={0.2} className="mt-500">
          <div className="grid grid-cols-1 gap-375 sm:grid-cols-2 lg:grid-cols-4">
            {RESULT_CARDS.map((card) => (
              <div
                key={card.title}
                className="overflow-hidden rounded-150 bg-white"
              >
                {/* Image placeholder */}
                <div className="flex h-[140px] items-center justify-center bg-gray-200 md:h-[182px]">
                  <p className="text-[28px] font-bold text-white md:text-[40px]">
                    결과물
                  </p>
                </div>

                {/* Meta */}
                <div className="px-300 pb-400 pt-300">
                  <div className="flex items-center justify-center gap-50 text-[16px] font-medium leading-[1.5] text-rose-500 md:text-[20px]">
                    <span>{card.job}</span>
                    <span>·</span>
                    <span>{card.days}</span>
                  </div>
                  <p className="mt-50 text-center text-[18px] font-bold leading-[1.5] text-gray-800 md:text-[24px]">
                    {card.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 4. Curriculum Section ─────────────────────────── */

function CurriculumRow({
  item,
  index,
}: {
  item: (typeof CURRICULUM_ITEMS)[0];
  index: number;
}) {
  return (
    <FadeIn delay={index * 0.1}>
      <div className="relative border-t border-gray-800 pt-1000">
        {/* Number badge */}
        <div className="mb-500 inline-flex items-center justify-center rounded-100 border border-gray-800 px-175 py-50">
          <span className="text-[16px] font-medium leading-[1.5] text-gray-800 md:text-[20px]">
            {item.num}
          </span>
        </div>

        <div className="flex flex-col gap-500 lg:flex-row lg:items-start lg:gap-1000">
          {/* Image placeholder */}
          <div className="flex h-[200px] w-full shrink-0 items-center justify-center rounded-200 bg-gray-200 md:h-[280px] lg:h-[340px] lg:w-[500px]">
            <p className="text-[20px] font-bold text-white">
              움직이는 인터랙션
            </p>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-350">
            <div>
              <h3 className="text-[20px] font-semibold leading-[1.5] text-gray-800 md:text-[26px]">
                {item.title}
              </h3>
              <p className="text-[18px] font-semibold leading-[1.5] text-gray-400 md:text-[26px]">
                {item.subtitle}
              </p>
            </div>
            <p className="whitespace-pre-line text-[14px] font-semibold leading-[1.5] text-gray-800 md:text-[16px]">
              {item.body}
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function CurriculumSection() {
  return (
    <section className="w-full bg-white pb-1000 pt-1000 md:pb-1250 md:pt-1625">
      <div className={SECTION_INNER}>
        {/* Title */}
        <FadeIn className="text-center">
          <h2 className="text-[24px] font-bold leading-[1.5] tracking-[-0.76px] text-gray-800 md:text-[40px]">
            미리보기형식으로 컨텐츠 보여주기
          </h2>
        </FadeIn>

        {/* Description */}
        <FadeIn delay={0.1} className="mt-75 text-center">
          <p className="text-[14px] leading-[1.5] text-gray-800 md:text-[20px]">
            컨텐츠, 질문하기, 빌더들과의 소통, 결과물 피드로 공유 등 사용자의
            다양한 학습을 듣고 끝이 아닌 소통 서비스로 다가갑니다.
          </p>
        </FadeIn>

        {/* Rows */}
        <div className="mt-1000 flex flex-col gap-1250">
          {CURRICULUM_ITEMS.map((item, i) => (
            <CurriculumRow key={item.num} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. Benefits Section ───────────────────────────── */

function BenefitsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-l from-gray-700 to-gray-800 pb-1000 pt-1000 md:pb-1250 md:pt-1625">
      <div className={cn(SECTION_INNER, 'relative z-10')}>
        {/* Title */}
        <FadeIn className="text-center">
          <h2 className="text-[24px] font-bold leading-[1.5] tracking-[-0.95px] text-white md:text-[40px] lg:text-[50px]">
            AI로 풀리지 않는 것
            <br />
            직접 운영진이 답변을 해드립니다.
          </h2>
        </FadeIn>

        {/* App icons + illustration */}
        <FadeIn
          delay={0.2}
          className="mt-1000 flex flex-col items-center gap-500 md:flex-row md:justify-center md:gap-1000"
        >
          {/* Discord */}
          <div style={{ transform: 'rotate(12.72deg)' }}>
            <div className="relative size-1750 overflow-hidden rounded-[30px] md:size-2250">
              <Image
                src="/landing/discord-app.png"
                alt="Discord 커뮤니티"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Toast illustration */}
          <div className="relative h-2500 w-3500 md:h-3500 md:w-5000">
            <Image
              src="/landing/toast-illustration.svg"
              alt="운영 방식"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* KakaoTalk */}
          <div style={{ transform: 'rotate(-20.93deg)' }}>
            <div className="relative size-1750 overflow-hidden rounded-[30px] md:size-2250">
              <Image
                src="/landing/kakao-app.png"
                alt="KakaoTalk 오픈채팅"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 6. FAQ Section ────────────────────────────────── */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full bg-gray-100 pb-1000 pt-1000 md:pb-1250 md:pt-1625">
      <div className={SECTION_INNER}>
        {/* Title */}
        <FadeIn className="text-center">
          <h2 className="text-[24px] font-bold leading-[1.5] tracking-[-0.76px] text-gray-800 md:text-[40px]">
            자주하는 질문 답변
          </h2>
        </FadeIn>

        {/* Accordion */}
        <FadeIn delay={0.1} className="mx-auto mt-1000 max-w-[820px]">
          <div className="flex flex-col gap-125">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-200 border border-gray-300 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center gap-125 px-375 py-250"
                  >
                    <span className="shrink-0 text-[14px] font-medium leading-[1.5] text-rose-500 md:text-[16px]">
                      Q
                    </span>
                    <span className="flex-1 text-left text-[14px] font-medium leading-[1.5] text-gray-800 md:text-[16px]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        'shrink-0 text-gray-400 transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                      size={24}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-300 px-375 py-300">
                      <p className="text-[14px] leading-[1.5] text-gray-800 md:text-[16px]">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 7. Floating CTA Bar ───────────────────────────── */

function FloatingCTABar() {
  return (
    <div className="fixed bottom-1250 left-1/2 z-50 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-9250 overflow-hidden rounded-2000 bg-gray-200 px-500 py-300 md:px-750">
      <div className="flex items-center justify-between gap-300">
        <p className="text-[14px] font-semibold leading-[1.5] text-gray-800 md:text-[20px] lg:text-[24px]">
          얼리버드 혜택가로 바로 만나보세요!
        </p>
        <Link
          href="/class/vibe-intro"
          className="shrink-0 rounded-100 bg-rose-500 px-200 py-100 text-[13px] font-semibold leading-[1.5] text-white transition-opacity hover:opacity-90 md:px-300 md:py-200 md:text-[18px] lg:text-[20px]"
        >
          바로 시작하기
        </Link>
      </div>
    </div>
  );
}
