'use client';

import { domAnimation, LazyMotion, m, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { BenefitCarousel } from './benefit-carousel';
import { BuilderFeedCoverflow } from './builder-feed-coverflow';
import { CourseBranch } from './course-branch';
import { CurriculumVisual } from './curriculum-visual';
import { HeroFlipCard } from './hero-flip-card';
import { StudyReadyForm } from './study-ready-form';

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

const SECTION_INNER = 'mx-auto w-full max-w-17500 px-250 md:px-500 lg:px-1000';

/* ─── Data ──────────────────────────────────────────── */

const HERO_TAGS = [
  '코딩·코드 0부터',
  '하루 1시간',
  '막히면 즉시 답변',
  '완주하면 내 것',
];

interface CheckCardLine {
  text: string;
  red: boolean;
}

const CHECK_CARDS: { tag: string; lines: CheckCardLine[] }[] = [
  {
    tag: '#피그마_감옥',
    lines: [
      { text: 'Figma 시안까진 완벽한데...', red: false },
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
      { text: 'Claude로 뭔가 만들다가 오류 딱 하나가', red: false },
      { text: '해결이 안되요.', red: false },
      { text: '구글링도 해보고 별짓 다하다가', red: false },
      { text: '결국 터미널 닫고 유튜브 켜요.', red: true },
    ],
  },
  {
    tag: '#회의록_지옥',
    lines: [
      { text: '회의는 끝났는데', red: false },
      { text: '일은 그때부터 시작이에요.', red: false },
      { text: '정리하고 액션아이템 뽑다 보면', red: false },
      { text: '퇴근 시간이 사라져요.', red: true },
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
    tag: '#복붙_노가다',
    lines: [
      { text: '매주 같은 보고서,', red: false },
      { text: '같은 자리에 같은 복붙.', red: false },
      { text: '데이터만 바뀌는데 매번 처음부터', red: false },
      { text: '30분씩 날려요.', red: true },
    ],
  },
];

const CURRICULUM_ITEMS = [
  {
    num: '01',
    title: '영상, 강의보다 매일 1시간씩 읽는 전자책',
    subtitle: '하루 1시간, 손으로 체화',
    body: '수십 시간짜리 VOD 멍때리기는 그만.\n핵심만 짚는 학습지를 읽고, 그 자리에서 바로 코드로 타이핑합니다.',
  },
  {
    num: '02',
    title: '에러 창 앞에서의 좌절은 끝, 무제한 질문답변',
    subtitle: '언제든 기댈 수 있는 든든한 페이스메이커',
    body: '영문 에러에 며칠씩 멈춰본 적 있죠?\n막히면 즉시 질문 — Claude와 운영진이 포기 전에 다음 칸으로 밀어줍니다.',
  },
  {
    num: '03',
    title: '영감이 끊이지 않는 공간, 빌더 피드 탐색',
    subtitle: '동료들과 함께 만드는 강력한 시너지',
    body: '다른 사람은 이걸 어떻게 만들었을까?\n무제한 피드에서 레퍼런스를 줍고, 팔로우하고, 내 결과물의 퀄리티를 끌어올립니다.',
  },
  {
    num: '04',
    title: '마침내 세상에 선보이는 내 웹사이트, 배포와 피드백',
    subtitle: '고유한 URL로 찍는 성장의 마침표',
    body: '완성작을 올리고 러닝메이트와 함께 다듬은 뒤, 라이브로 배포.\n마침내 내 이름이 박힌 URL을 손에 쥡니다.',
  },
];

const FAQ_ITEMS = [
  {
    q: '바이브 코딩이랑 업무 자동화, 뭘 들어야 하나요?',
    a: '웹사이트·포트폴리오를 직접 만들고 싶으면 바이브 코딩, 매주 반복하는 업무를 줄이고 싶으면 업무 자동화(Cowork)예요. 둘 다 1챕터는 무료라 직접 맛보고 골라도 됩니다.',
  },
  {
    q: '코딩 한 번도 안 해봤는데 따라갈 수 있나요?',
    a: '네. 코드를 직접 짜지 않아요. AI에게 한국어로 시키면 됩니다. 비전공자 기준으로 설계했어요.',
  },
  {
    q: '어떤 준비물이 필요한가요?',
    a: 'PC(또는 맥북)와 인터넷이면 시작합니다. 무료 구간 이후에는 Claude Pro 구독($20/월)이 필요해요.',
  },
  {
    q: '하루에 얼마나 써야 하나요?',
    a: '하루 1~2시간이면 충분해요. 레슨별로 무리 없이 끊어서 따라올 수 있게 나눠놨습니다.',
  },
  {
    q: 'Claude Pro가 꼭 필요한가요?',
    a: '무료 구간은 Pro 없이 완주돼요. 이후 실습부터 Pro가 필요하고, 이미 구독 중이라면 추가 비용 없이 그대로 씁니다.',
  },
  {
    q: '환불이 가능한가요?',
    a: '수강 시작 후 3일 이내 전액 환불돼요. 무료로 먼저 충분히 경험하고 결정하세요.',
  },
];

/* ─── Speech bubbles (one per Check card, desktop only) ──
   Each bubble is hover-gated to its own card (group-hover) and placed
   relative to that card per Figma 853:32539. The transform is applied
   to the bubble SHAPE only — the tail orientation is baked there — while
   the text stays upright (Figma keeps the text node un-transformed). */

const SPEECH_BUBBLES = [
  {
    src: '/landing/speech-bubble-1.svg',
    transform: 'none',
    left: '-19.6%',
    top: '-22.9%',
    width: 207,
    height: 168,
    text: ['디자인은 완성인데', '그 다음이 없다'],
  },
  {
    src: '/landing/speech-bubble-2.svg',
    transform: 'rotate(-5.97deg)',
    left: '49.9%',
    top: '-20.8%',
    width: 183,
    height: 145,
    text: ['개발자 앞에서', '항상 을이 되는 느낌'],
  },
  {
    src: '/landing/speech-bubble-3.svg',
    transform: 'scaleX(-1)',
    left: '58.2%',
    top: '-26.7%',
    width: 207,
    height: 168,
    text: ['오류 하나에', '모든 의지가 증발'],
  },
  {
    src: '/landing/speech-bubble-4.svg',
    transform: 'rotate(22.8deg)',
    left: '-39.3%',
    top: '27.2%',
    width: 207,
    height: 168,
    text: ['회의 끝나도', '일이 안 끝나'],
  },
  {
    src: '/landing/speech-bubble-5.svg',
    transform: 'none',
    left: '-16.4%',
    top: '-26%',
    width: 207,
    height: 168,
    text: ['강의는 100개', '봤는데 결과물은 0개'],
  },
  {
    src: '/landing/speech-bubble-6.svg',
    transform: 'scaleX(-1)',
    left: '72.3%',
    top: '-14.1%',
    width: 207,
    height: 168,
    text: ['매주 같은 보고서', '같은 복붙 노가다'],
  },
];

/* ─── Main ──────────────────────────────────────────── */

export default function LandingContent() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative w-full pb-3000">
        <HeroSection />
        <CourseBranchSection />
        <CheckSection />
        <ResultsSection />
        <CurriculumSection />
        <BenefitsSection />
        <FAQSection />
        <FloatingCTABar />
      </div>
    </LazyMotion>
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
            손은 많이 댔는데,
            <br />내 결과물은 아직 <span className="text-rose-500">0개.</span>
          </h1>
        </FadeIn>

        {/* Subtitle */}
        <FadeIn
          delay={0.2}
          className="mt-300 text-center text-[15px] leading-[1.5] text-gray-800 md:text-[26px]"
        >
          의지가 부족한 게 아니었어요. 끝까지 끌어줄 강제성과, 막힐 때 답해줄
          사람이 없었을 뿐.
          <br />
          20일 뒤, 당신 손에 진짜 결과물 하나가 남습니다.
        </FadeIn>

        {/* Tag row */}
        <FadeIn
          delay={0.3}
          className="mt-300 flex flex-wrap items-center justify-center gap-100"
        >
          {HERO_TAGS.map((tag) => (
            <span
              key={tag}
              className="whitespace-nowrap rounded-100 bg-gray-800 px-125 py-50 text-[13px] leading-[1.5] tracking-[-0.304px] text-white md:text-[16px]"
            >
              {tag}
            </span>
          ))}
        </FadeIn>

        {/* Hero 3D flip carousel */}
        <FadeIn delay={0.4} className="mt-1000 w-full">
          <HeroFlipCard />
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 2. Two-course branch (공통 훅 → 분기) ──────────── */

function CourseBranchSection() {
  return (
    <section className="w-full bg-white pb-1000 pt-1000 md:pb-1250 md:pt-1625">
      <CourseBranch className={SECTION_INNER} />
    </section>
  );
}

/* ─── 3. Check Section ──────────────────────────────── */

function CheckCard({
  card,
  img,
  bubble,
}: {
  card: (typeof CHECK_CARDS)[0];
  img: string;
  bubble: (typeof SPEECH_BUBBLES)[0];
}) {
  return (
    <div className="group relative aspect-[336/404] w-full">
      {/* Speech bubble — desktop only, revealed on this card's hover */}
      <div
        className="pointer-events-none absolute z-20 hidden w-max opacity-0 transition-opacity duration-200 group-hover:opacity-100 xl:block"
        style={{ left: bubble.left, top: bubble.top }}
      >
        <div className="relative">
          <Image
            src={bubble.src}
            alt=""
            width={bubble.width}
            height={bubble.height}
            unoptimized
            style={{ transform: bubble.transform }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[16px] font-semibold leading-[1.5] text-gray-800">
            {bubble.text.map((t, j) => (
              <p key={j}>{t}</p>
            ))}
          </div>
        </div>
      </div>
      {/* Rose shadow — appears on hover */}
      <div className="absolute inset-0 translate-x-50 translate-y-50 rounded-200 bg-rose-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      {/* Card */}
      <div className="absolute inset-0 overflow-hidden rounded-200 border border-transparent bg-gray-100 transition-colors duration-200 group-hover:border-gray-300 group-hover:bg-white">
        {/* Tag + description */}
        <div className="flex flex-col items-center gap-250 px-200 pt-400">
          <p className="text-center text-[20px] font-bold leading-[1.5] text-black">
            {card.tag}
          </p>
          <div className="text-center text-[16px] leading-[1.5] text-gray-800">
            {card.lines.map((line, i) => (
              <p key={i} className={cn(line.red && 'font-bold text-rose-500')}>
                {line.text}
              </p>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div className="absolute inset-x-0 bottom-0 h-1/2">
          <Image
            src={img}
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 336px"
          />
        </div>
      </div>
    </div>
  );
}

function CheckSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white pb-1000 pt-1000 md:pb-1250 md:pt-1625">
      <div className={cn(SECTION_INNER, 'relative z-10')}>
        {/* Badge */}
        <FadeIn className="flex flex-col items-center gap-75 text-center">
          <span className="rounded-500 bg-rose-300 px-250 py-125 text-[20px] font-medium leading-[1.5] text-white md:text-[24px]">
            Check It!
          </span>
          <h2 className="text-[24px] font-bold leading-[36px] text-text-strong md:font-designer-32b lg:font-designer-36b">
            혹시 이런 적 없으셨나요?
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
            {CHECK_CARDS.map((card, i) => (
              <CheckCard
                key={card.tag}
                card={card}
                img={`/landing/check-${i + 1}.png`}
                bubble={SPEECH_BUBBLES[i]}
              />
            ))}
          </div>
        </FadeIn>

        {/* CTA highlight box (Figma 959:13485 — gray box, gray border, no icon) */}
        <FadeIn delay={0.3} className="mt-1000 flex justify-center">
          <div className="flex w-fit max-w-full items-center justify-center rounded-200 border border-gray-500 bg-gray-100 px-750 py-375">
            <p className="text-center text-[18px] font-bold leading-[1.5] tracking-[-0.532px] text-gray-800 md:text-[24px] lg:text-[28px]">
              3개 이상 끄덕였다면, ZERO-ONE은 정확히 당신을 위한 곳이에요.
            </p>
          </div>
        </FadeIn>

        {/* Survey — study-ready form (Figma 1782:10310) */}
        <FadeIn delay={0.3} className="mt-1000">
          <div className="flex flex-col items-center gap-75 text-center">
            <h2 className="text-[24px] font-bold leading-[1.5] text-text-strong md:font-designer-32b lg:font-designer-36b">
              여러분의 목소리로 다음 코스가 완성됩니다.
            </h2>
            <p className="text-[14px] leading-[1.5] text-gray-800 md:text-[16px]">
              바이브 코딩 입문 이후, 어떤 프로덕트를 만들고 싶으신가요? 제로원에
              의견을 남겨주시면 코스 오픈 시 가장 먼저 알려드릴게요.
            </p>
          </div>
          <div className="mx-auto mt-500 w-full max-w-10150">
            <StudyReadyForm />
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
        <FadeIn className="flex flex-col items-center gap-75 text-center">
          <span className="rounded-500 bg-rose-300 px-250 py-125 text-[20px] font-medium leading-[1.5] text-white md:text-[24px]">
            베타 수강생 결과물
          </span>
          <h2 className="text-[24px] font-bold leading-[36px] text-text-strong md:font-designer-32b lg:font-designer-36b">
            코딩도 코드도 Zero. 그래도 결과물은 남았어요.
          </h2>
        </FadeIn>

        {/* Subtitle */}
        <FadeIn delay={0.15} className="mt-75 text-center">
          <p className="text-[14px] leading-[1.5] text-gray-800 md:text-[20px]">
            누군가는 첫 URL을, 누군가는 매주 2시간을 돌려받았어요.
          </p>
        </FadeIn>
      </div>

      {/* Builder-feed cover-flow carousel (Figma 136:7025) */}
      <FadeIn delay={0.2} className="mt-500">
        <BuilderFeedCoverflow className="px-250 md:px-500 lg:px-1000" />
      </FadeIn>
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
      {/* Figma 959:13715 — badge(x260) · img box 682×467(x419) · text(x1231,w393).
          Content zone 260..1660 = 1400 = max-w-17500 → fr cols mirror Figma px. */}
      <div className="relative border-t border-gray-800 pt-500 md:pt-750 lg:grid lg:grid-cols-[auto_109fr_682fr_130fr_393fr] lg:items-start lg:pt-1250">
        {/* Number badge */}
        <div className="mb-500 inline-flex items-center justify-center rounded-100 border border-gray-800 px-175 py-50 lg:col-start-1 lg:mb-0">
          <span className="text-[16px] font-medium leading-[1.5] text-gray-800 md:text-[20px]">
            {item.num}
          </span>
        </div>

        {/* Roadmap micro-interaction (replaces static placeholder, Figma 682×467) */}
        <div className="mb-500 lg:col-start-3 lg:mb-0">
          <CurriculumVisual num={item.num} />
        </div>

        {/* Text side */}
        <div className="flex flex-col gap-350 lg:col-start-5 lg:mt-1500">
          <div className="flex flex-col gap-50">
            <h3 className="text-[20px] font-semibold leading-[1.5] tracking-[-0.494px] text-black md:text-[26px]">
              {item.title}
            </h3>
            <p className="text-[18px] font-semibold leading-[1.5] tracking-[-0.456px] text-gray-400 md:text-[24px]">
              {item.subtitle}
            </p>
          </div>
          <p className="whitespace-pre-line text-[14px] font-semibold leading-[1.5] tracking-[-0.304px] text-gray-800 md:text-[16px]">
            {item.body}
          </p>
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
          <h2 className="text-[24px] font-bold leading-[1.5] tracking-[-0.57px] text-gray-800 md:text-[30px]">
            혼자서 헤매는 시간은 끝, 20일 완성 바이브 로드맵
          </h2>
        </FadeIn>

        {/* Description */}
        <FadeIn delay={0.1} className="mt-75 text-center">
          <p className="text-[14px] leading-[1.5] tracking-[-0.38px] text-gray-800 md:text-[20px]">
            보는 강의가 아니라, 매일 하나씩 결과물이 쌓이는 20일. 바이브 코딩
            입문 트랙을 미리 펼쳐볼게요.
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
  // No overflow-hidden here: it would turn the section into the sticky
  // containing scrollport and break the carousel's pinned viewport.
  return (
    <section className="relative w-full bg-gradient-to-l from-gradation-600 to-gray-800 to-[53.846%]">
      <BenefitCarousel className={cn(SECTION_INNER, 'relative z-10')} />
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
        <FadeIn delay={0.1} className="mx-auto mt-1000 max-w-10250">
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
  // Lens normal map (R = horizontal, G = vertical displacement).
  // 128 = neutral (no shift); only the edges deviate → barrel refraction,
  // strongest at the pill edges like real glass. Built as a data-URI so no asset.
  const lensMap =
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gx" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="rgb(255,0,0)"/>
            <stop offset="0.28" stop-color="rgb(128,0,0)"/>
            <stop offset="0.72" stop-color="rgb(128,0,0)"/>
            <stop offset="1" stop-color="rgb(0,0,0)"/>
          </linearGradient>
          <linearGradient id="gy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="rgb(0,255,0)"/>
            <stop offset="0.28" stop-color="rgb(0,128,0)"/>
            <stop offset="0.72" stop-color="rgb(0,128,0)"/>
            <stop offset="1" stop-color="rgb(0,0,0)"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="black"/>
        <rect width="100" height="100" fill="url(#gx)" style="mix-blend-mode:screen"/>
        <rect width="100" height="100" fill="url(#gy)" style="mix-blend-mode:screen"/>
      </svg>`,
    );

  return (
    <div
      className="liquid-glass fixed bottom-0 left-0 z-50 w-full overflow-hidden rounded-none bg-gray-0 px-500 pt-300 sm:bottom-1250 sm:left-1/2 sm:w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:max-w-9250 sm:rounded-2000 sm:bg-gray-0/60 sm:px-700 sm:shadow-3 sm:ring-1 sm:ring-inset sm:ring-gray-0/50"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
      }}
    >
      {/* Liquid-glass refraction filter — warps the live backdrop behind the bar.
          Figma Glass → CSS/SVG mapping:
            Frost 55      → blur(6px) (applied via .liquid-glass in global.css)
            Refraction 80 → lens displacement scale ~50
            Dispersion 50 → R/B sampled at scale 56/44 then recombined (chromatic)
            Splay 25      → fractalNoise ripple scale 6
            Light -45°    → directional highlight overlay (below)
          Not expressible in CSS/SVG: Depth (approximated by shadow-3) and the
          GPU lens specular — these are the documented residual gaps. */}
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <filter
          id="liquid-glass"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={lensMap}
            preserveAspectRatio="none"
            x="0"
            y="0"
            width="100%"
            height="100%"
            result="lensRaw"
          />
          <feGaussianBlur in="lensRaw" stdDeviation={0.6} result="lens" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.016"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          {/* chromatic split: same backdrop refracted at 3 scales, one per channel */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="lens"
            scale={56}
            xChannelSelector="R"
            yChannelSelector="G"
            result="dispR"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="lens"
            scale={50}
            xChannelSelector="R"
            yChannelSelector="G"
            result="dispG"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="lens"
            scale={44}
            xChannelSelector="R"
            yChannelSelector="G"
            result="dispB"
          />
          <feColorMatrix
            in="dispR"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="rC"
          />
          <feColorMatrix
            in="dispG"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="gC"
          />
          <feColorMatrix
            in="dispB"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="bC"
          />
          <feBlend in="rC" in2="gC" mode="screen" result="rg" />
          <feBlend in="rg" in2="bC" mode="screen" result="rgb" />
          <feDisplacementMap
            in="rgb"
            in2="noise"
            scale={6}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      {/* Light -45° / 80% — directional specular highlight (top-left → bottom-right) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.14) 100%)',
        }}
      />
      <div className="relative flex items-center justify-between gap-300">
        <p className="hidden shrink-0 text-[20px] font-semibold leading-[1.5] tracking-[-0.456px] text-gray-800 sm:block lg:text-[24px]">
          오늘, <span className="text-rose-500">무료로</span> 시작하세요
        </p>
        <div className="flex w-full items-center gap-150 sm:w-auto">
          <Link
            href="/class/vibe-intro-claude-code"
            className="flex-1 rounded-100 bg-rose-500 px-200 py-100 text-center text-[13px] font-semibold leading-[1.5] tracking-[-0.38px] text-white transition-opacity hover:opacity-90 sm:flex-none sm:px-400 sm:py-125 sm:text-[18px]"
          >
            웹사이트 만들기
          </Link>
          <Link
            href="/class/claude-cowork-intro"
            className="flex-1 rounded-100 border border-rose-500 bg-gray-0 px-200 py-100 text-center text-[13px] font-semibold leading-[1.5] tracking-[-0.38px] text-rose-500 transition-colors hover:bg-rose-100 sm:flex-none sm:px-400 sm:py-125 sm:text-[18px]"
          >
            업무 자동화
          </Link>
        </div>
      </div>
    </div>
  );
}
