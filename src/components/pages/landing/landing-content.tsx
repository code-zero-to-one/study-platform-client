'use client';

import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import LandingForm from '@/components/common/ui/form/landing-form';

/* ─── Animation Wrappers ──────────────────────────── */

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
      initial={{ opacity: 0, y: 30 }}
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

function Stagger({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <m.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

function StaggerChild({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/* ─── Animated Counter ────────────────────────────── */

function AnimatedCounter({
  target,
  suffix = '',
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const startTime = Date.now();
    let raf: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(raf);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Data ────────────────────────────────────────── */

const STATS = [
  { value: 300, suffix: '+', label: '참여자' },
  { value: 2000, suffix: '+', label: '스터디 진행' },
  { value: 12, suffix: '개월+', label: '커뮤니티 운영' },
];

const FEATURES = [
  {
    title: '1:1 스터디 · 멘토링',
    description: '막힌 지점을 실전 맥락으로 빠르게 해결하는 고밀도 세션',
    color: '#f63d68',
  },
  {
    title: '그룹스터디',
    description: '함께 검증하고 기록하며 완주율을 끌어올리는 협업 학습',
    color: '#6172f3',
  },
  {
    title: '유료스터디',
    description: '결과와 과정이 남는 구조로 집중도 높은 트랙 제공',
    color: '#9e77ed',
  },
  {
    title: '인사이트 · 지식 컨텐츠',
    description: '바이브코딩 트렌드와 IT 실전 지식을 빠르게 흡수',
    color: '#2e90fa',
  },
  {
    title: '커뮤니티',
    description: '질문 · 자랑 · 해결사례가 쌓이며 문제 해결이 빨라지는 공간',
    color: '#12b76a',
    badge: '오픈 예정',
  },
];

const VIBE_CODER_POINTS = [
  'GPT로 방향은 잡지만, 막히는 지점에서 실제 해결이 필요한 사람',
  '실행하고 기록하며 빠르게 피드백을 받고 싶은 사람',
  '혼자서 공부하다 멈추는 루프를 끊고 싶은 사람',
];

const DEVELOPER_POINTS = [
  '현업끼리 함께 학습하며 기술 감각을 유지하고 싶은 사람',
  '커뮤니티에서 지식 제공으로 신뢰와 브랜드를 쌓고 싶은 사람',
  '회사 밖에서도 전문성을 증명하고 싶은 사람',
];

const VIBE_CODER_JOURNEY = [
  {
    step: '01',
    title: '인사이트에서 IT 지식 흡수',
    desc: '막연한 검색 대신 지금 필요한 지식부터 빠르게.',
  },
  {
    step: '02',
    title: '커뮤니티에서 질문 · 공유',
    desc: '해결사례 중심으로 밀도 있게 소통합니다.',
  },
  {
    step: '03',
    title: '스터디로 뭉쳐서 성장',
    desc: '혼자 멈추는 구간을 팀 학습으로 돌파.',
  },
  {
    step: '04',
    title: '1:1 멘토링으로 해결',
    desc: '실무자의 시선으로 의사결정을 정리합니다.',
  },
];

const DEV_JOURNEY = [
  {
    title: '커뮤니티에서 가치 제공',
    desc: '답변과 해결사례가 곧 브랜딩 자산.',
  },
  {
    title: '멘토링으로 전문성 확장',
    desc: '경험을 구조화해 역량과 소득을 동시에.',
  },
  {
    title: '스터디로 실무 감각 유지',
    desc: '팀 학습으로 최신 기술 변화에 대응.',
  },
];

const CORE_VALUES = [
  '실제 삶을 바꾸는 학습이 가장 가치 있다',
  '기본과 본질에 집중한다',
  '끝까지 완수하는 실행력을 가진다',
  '나눔과 공유로 더 크게 성장한다',
];

const DESIRED_PEOPLE = [
  '질문을 숨기지 않고 꺼내는 사람',
  '답을 받기만 하지 않고 다시 나누는 사람',
  '기록으로 실력을 증명하고 싶은 사람',
  '혼자보다 함께가 빠르다는 걸 아는 사람',
];

/* ─── Shared Layout ───────────────────────────────── */

const SECTION_INNER = 'mx-auto w-full max-w-[1160px] px-250 md:px-500 lg:px-0';

/* ─── Main Component ──────────────────────────────── */

export default function LandingContent() {
  return (
    <LazyMotion features={domAnimation}>
      <div>
        <HeroSection />
        <SocialProofSection />
        <EcosystemSection />
        <FeaturesSection />
        <JourneySection />
        <ValuesSection />
        <CTASection />
        <FooterSection />
      </div>
    </LazyMotion>
  );
}

/* ─── Hero Section ────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gray-1000 pb-[80px] pt-[60px] md:pb-[140px] md:pt-[80px]">
      {/* Animated gradient orbs */}
      <m.div
        className="pointer-events-none absolute left-[8%] top-[-5%] h-[400px] w-[400px] rounded-full md:h-[600px] md:w-[600px]"
        style={{
          background:
            'radial-gradient(circle, rgba(246,61,104,0.4), transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.3,
          willChange: 'transform',
        }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <m.div
        className="pointer-events-none absolute right-[5%] top-[15%] h-[300px] w-[300px] rounded-full md:h-500px md:w-[500px]"
        style={{
          background:
            'radial-gradient(circle, rgba(97,114,243,0.45), transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.2,
          willChange: 'transform',
        }}
        animate={{ x: [0, -35, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <m.div
        className="pointer-events-none absolute bottom-[15%] left-[35%] hidden h-[400px] w-[400px] rounded-full md:block"
        style={{
          background:
            'radial-gradient(circle, rgba(158,119,237,0.3), transparent 70%)',
          filter: 'blur(100px)',
          opacity: 0.15,
          willChange: 'transform',
        }}
        animate={{ x: [0, 20, 0], y: [0, 25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: 0.4,
        }}
      />

      <div
        className={`${SECTION_INNER} relative z-10 flex flex-col items-center`}
      >
        {/* Badge */}
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <span className="inline-flex items-center gap-100 rounded-full border border-gray-700 bg-gray-900/80 px-175 py-75 font-designer-13b text-gray-400 backdrop-blur md:px-200 md:py-[7px]">
            <span className="size-75 animate-pulse rounded-full bg-rose-500" />
            AI 시대의 성장 파트너
          </span>
        </m.div>

        {/* Headline */}
        <m.h1
          className="mt-350 flex flex-col items-center text-center md:mt-[36px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="text-[28px] font-bold leading-500 text-gray-0 md:text-[40px] md:leading-[60px] lg:text-[52px] lg:leading-[78px]">
            누구나 개발자가 되는 시대이지만,
          </span>
          <span
            className="text-[28px] font-bold leading-500 md:text-[40px] md:leading-[60px] lg:text-[52px] lg:leading-[78px]"
            style={{
              background:
                'linear-gradient(135deg, #f63d68 0%, #b692f6 50%, #6172f3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            아무나 개발자가 될 수는 없습니다.
          </span>
        </m.h1>

        {/* Subtitle */}
        <m.div
          className="mt-250 flex flex-col items-center gap-50 text-center font-designer-16m text-gray-400 md:mt-300 lg:font-designer-20m"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p>바이브코더는 GPT로 해결되지 않는 문제를 가져오고,</p>
          <p>개발자는 그 문제를 해결하며 전문성과 기회를 함께 키웁니다.</p>
          <p className="mt-100 text-gray-300">
            ZERO-ONE은 이 상생을 스터디와 멘토링으로 구조화합니다.
          </p>
        </m.div>

        {/* CTA Buttons */}
        <m.div
          className="mt-[36px] flex flex-col items-center gap-150 md:mt-600 md:flex-row md:gap-200"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          <a
            href="#open-form"
            className="inline-flex h-600 w-full items-center justify-center rounded-150 px-400 font-designer-16b text-gray-0 transition-all duration-300 hover:shadow-[0_0_24px_rgba(246,61,104,0.4)] md:h-650 md:w-auto"
            style={{
              background: 'linear-gradient(135deg, #f63d68, #e31b54)',
            }}
          >
            맞춤 스터디 · 멘토 알림 받기
          </a>
          <Link
            href="/login"
            className="inline-flex h-600 w-full items-center justify-center rounded-150 border border-gray-700 bg-gray-800/50 px-400 font-designer-16b text-gray-200 backdrop-blur transition-all duration-300 hover:border-gray-500 hover:bg-gray-700/50 md:h-650 md:w-auto"
          >
            로그인 / 회원가입
          </Link>
        </m.div>

        {/* Product Screenshot */}
        <m.div
          className="relative mt-600 w-full md:mt-[80px]"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <div
            className="rounded-200 p-px md:rounded-250"
            style={{
              background:
                'linear-gradient(135deg, rgba(246,61,104,0.4), rgba(97,114,243,0.3), rgba(246,61,104,0.15))',
            }}
          >
            <div className="overflow-hidden rounded-[15px] bg-gray-900/80 backdrop-blur md:rounded-[19px]">
              <Image
                src="/images/one-by-one-study.png"
                alt="ZERO-ONE 플랫폼"
                className="object-cover"
                width={1160}
                height={640}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1160px"
              />
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] md:h-[180px]"
            style={{
              background:
                'linear-gradient(to top, var(--color-gray-1000), transparent)',
            }}
          />
        </m.div>
      </div>
    </section>
  );
}

/* ─── Social Proof Section ────────────────────────── */

function SocialProofSection() {
  return (
    <section className="relative w-full border-t border-gray-800 bg-gray-1000 pb-[80px] pt-600 md:pb-[100px] md:pt-800">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60px]"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--color-gray-0))',
        }}
      />

      <FadeIn
        className={`${SECTION_INNER} relative z-10 grid grid-cols-3 gap-200 text-center md:gap-300`}
      >
        {STATS.map((stat) => (
          <div key={stat.label}>
            <div className="text-[28px] font-bold leading-500 text-gray-0 md:text-[40px] md:leading-[60px] lg:text-[48px] lg:leading-[72px]">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <p className="mt-50 font-designer-14m text-gray-400 md:mt-100">
              {stat.label}
            </p>
          </div>
        ))}
      </FadeIn>
    </section>
  );
}

/* ─── Ecosystem Section ───────────────────────────── */

function PersonaCard({
  title,
  subtitle,
  points,
  accentColor,
}: {
  title: string;
  subtitle: string;
  points: string[];
  accentColor: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-200 border border-gray-200 bg-gray-0 p-300 transition-all duration-300 hover:shadow-2 md:rounded-250 md:p-500"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div
        className="pointer-events-none absolute -right-500 -top-500 h-[160px] w-[160px] rounded-full transition-opacity duration-300 group-hover:opacity-[0.18]"
        style={{
          background: `radial-gradient(circle, ${accentColor}, transparent 70%)`,
          opacity: 0.08,
        }}
      />
      <h3 className="font-bold-h4 text-text-strong md:font-bold-h2">{title}</h3>
      <p className="mt-100 font-designer-14m text-text-subtle md:mt-150">
        {subtitle}
      </p>
      <ul className="mt-250 flex flex-col gap-125 md:mt-300 md:gap-150">
        {points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-125 font-designer-14m text-text-default"
          >
            <span
              className="mt-75 size-100 shrink-0 rounded-full"
              style={{ background: accentColor }}
            />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EcosystemSection() {
  return (
    <section className="w-full bg-gray-0 py-[80px] md:py-[120px]">
      <div className={`${SECTION_INNER} flex flex-col items-center`}>
        <FadeIn className="flex flex-col items-center gap-150 text-center">
          <span className="font-designer-14b uppercase tracking-[2px] text-text-brand">
            Ecosystem
          </span>
          <h2 className="font-bold-h4 text-text-strong md:font-bold-h2 lg:font-bold-h1">
            두 개의 여정이 만나는 곳
          </h2>
          <p className="mt-50 font-designer-16m text-text-subtle md:mt-100">
            필요한 사람이 정확히 만나야 생태계가 완성됩니다
          </p>
        </FadeIn>

        <div className="mt-500 grid w-full grid-cols-1 gap-250 md:mt-800 md:grid-cols-2 md:gap-300">
          <FadeIn delay={0.1}>
            <PersonaCard
              title="바이브코더"
              subtitle="입문자 · 비전공자 · 전환 준비자 · 사이드프로젝트 실전이 필요한 사람"
              points={VIBE_CODER_POINTS}
              accentColor="#f63d68"
            />
          </FadeIn>
          <FadeIn delay={0.2}>
            <PersonaCard
              title="개발자"
              subtitle="주니어~시니어 현업 개발자 · 멘토링과 스터디로 영향력 확장"
              points={DEVELOPER_POINTS}
              accentColor="#6172f3"
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── Features Section ────────────────────────────── */

function FeatureCard({
  title,
  description,
  color,
  badge,
}: {
  title: string;
  description: string;
  color: string;
  badge?: string;
}) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-gray-200 bg-gray-0 p-300 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-2 md:rounded-200 md:p-400">
      <div
        className="mb-200 h-100 w-[36px] rounded-full md:mb-250 md:h-125 md:w-500"
        style={{ background: color }}
      />
      <h3 className="font-bold-h6 text-text-strong md:font-bold-h5">{title}</h3>
      <p className="mt-100 flex-1 font-designer-14m text-text-subtle md:mt-125">
        {description}
      </p>
      {badge && (
        <span
          className="mt-150 inline-flex w-fit rounded-full px-150 py-50 font-designer-13b md:mt-200"
          style={{ background: `${color}18`, color }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="w-full bg-gray-50 py-[80px] md:py-[120px]">
      <div className={`${SECTION_INNER} flex flex-col items-center`}>
        <FadeIn className="flex flex-col items-center gap-150 text-center">
          <span className="font-designer-14b uppercase tracking-[2px] text-text-brand">
            Products
          </span>
          <h2 className="font-bold-h4 text-text-strong md:font-bold-h2 lg:font-bold-h1">
            하나의 플랫폼, 다섯 가지 경험
          </h2>
          <p className="mt-50 font-designer-16m text-text-subtle md:mt-100">
            바이브코더의 질문과 개발자의 해결이 순환하는 제품 구조입니다
          </p>
        </FadeIn>

        <div className="mt-500 flex w-full flex-col gap-200 md:mt-800 md:gap-250">
          <Stagger className="grid grid-cols-1 gap-200 md:grid-cols-2 md:gap-250 lg:grid-cols-3">
            {FEATURES.slice(0, 3).map((feature) => (
              <StaggerChild key={feature.title}>
                <FeatureCard {...feature} />
              </StaggerChild>
            ))}
          </Stagger>
          <Stagger className="grid grid-cols-1 gap-200 md:mx-auto md:flex md:w-full md:max-w-[calc(66.67%+7px)] md:gap-250">
            {FEATURES.slice(3).map((feature) => (
              <StaggerChild key={feature.title} className="md:flex-1">
                <FeatureCard {...feature} />
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ─── Journey Section ─────────────────────────────── */

function JourneySection() {
  return (
    <section className="w-full bg-gray-0 py-[80px] md:py-[120px]">
      <div className={`${SECTION_INNER} flex flex-col items-center`}>
        <FadeIn className="flex flex-col items-center gap-150 text-center">
          <span className="font-designer-14b uppercase tracking-[2px] text-text-brand">
            Journey
          </span>
          <h2 className="font-bold-h4 text-text-strong md:font-bold-h2 lg:font-bold-h1">
            연결되는 성장 여정
          </h2>
          <p className="mt-50 font-designer-16m text-text-subtle md:mt-100">
            인사이트에서 커뮤니티, 스터디, 멘토링으로 이어지는 흐름
          </p>
        </FadeIn>

        <div className="mx-auto mt-500 grid w-full max-w-[860px] grid-cols-1 gap-500 md:mt-800 md:grid-cols-2 md:gap-600">
          {/* Vibe Coder Journey */}
          <FadeIn delay={0.1}>
            <div>
              <div className="flex items-center gap-125">
                <span className="size-100 rounded-full bg-rose-500" />
                <h3 className="font-bold-h5 text-text-strong md:font-bold-h3">
                  바이브코더
                </h3>
              </div>
              <div className="ml-50 mt-300 border-l-2 border-rose-200 md:mt-350">
                {VIBE_CODER_JOURNEY.map((item) => (
                  <div
                    key={item.step}
                    className="relative pb-350 pl-300 last:pb-0 md:pb-400 md:pl-350"
                  >
                    <span className="absolute left-[-7px] top-25 flex size-150 items-center justify-center rounded-full bg-rose-500">
                      <span className="size-50 rounded-full bg-gray-0" />
                    </span>
                    <span className="font-designer-13b text-rose-500">
                      STEP {item.step}
                    </span>
                    <h4 className="mt-50 font-bold-h6 text-text-strong md:font-bold-h5">
                      {item.title}
                    </h4>
                    <p className="mt-50 font-designer-14m text-text-subtle">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Developer Journey */}
          <FadeIn delay={0.2}>
            <div>
              <div className="flex items-center gap-125">
                <span className="size-100 rounded-full bg-indigo-500" />
                <h3 className="font-bold-h5 text-text-strong md:font-bold-h3">
                  개발자
                </h3>
              </div>
              <div className="ml-50 mt-300 border-l-2 border-indigo-200 md:mt-350">
                {DEV_JOURNEY.map((item) => (
                  <div
                    key={item.title}
                    className="relative pb-350 pl-300 last:pb-0 md:pb-400 md:pl-350"
                  >
                    <span className="absolute left-[-7px] top-25 flex size-150 items-center justify-center rounded-full bg-indigo-500">
                      <span className="size-50 rounded-full bg-gray-0" />
                    </span>
                    <h4 className="font-bold-h6 text-text-strong md:font-bold-h5">
                      {item.title}
                    </h4>
                    <p className="mt-50 font-designer-14m text-text-subtle">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── Values Section ──────────────────────────────── */

function ValuesSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gray-1000 py-[80px] md:py-[120px]">
      <div
        className="pointer-events-none absolute left-[20%] top-[30%] h-[300px] w-[300px] rounded-full md:h-[400px] md:w-[400px]"
        style={{
          background:
            'radial-gradient(circle, rgba(246,61,104,0.3), transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.15,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[20%] right-[15%] hidden h-[350px] w-[350px] rounded-full md:block"
        style={{
          background:
            'radial-gradient(circle, rgba(97,114,243,0.3), transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.12,
        }}
      />

      <div
        className={`${SECTION_INNER} relative z-10 flex flex-col items-center`}
      >
        <FadeIn className="flex flex-col items-center gap-150 text-center md:gap-200">
          <span className="font-designer-14b uppercase tracking-[2px] text-rose-400">
            Values
          </span>
          <h2 className="font-bold-h4 text-gray-0 md:font-bold-h2 lg:font-bold-h1">
            우리가 기다리는 사람
          </h2>
        </FadeIn>

        <Stagger className="mt-[36px] grid w-full grid-cols-1 gap-150 md:mt-600 md:grid-cols-2 md:gap-200">
          {DESIRED_PEOPLE.map((item) => (
            <StaggerChild key={item}>
              <div className="flex items-center gap-150 rounded-150 border border-gray-800 bg-gray-900/60 px-250 py-200 backdrop-blur md:px-300 md:py-250">
                <span className="size-75 shrink-0 rounded-full bg-rose-500" />
                <span className="font-designer-14m text-gray-200 md:font-designer-16m">
                  {item}
                </span>
              </div>
            </StaggerChild>
          ))}
        </Stagger>

        {/* Mission & Vision */}
        <div className="mt-700 grid w-full grid-cols-1 gap-200 md:mt-[80px] md:grid-cols-2 md:gap-300">
          <FadeIn delay={0.1}>
            <div className="rounded-[14px] border border-gray-800 bg-gray-900/60 p-300 backdrop-blur md:rounded-200 md:p-[36px]">
              <span className="font-designer-14b uppercase tracking-[2px] text-rose-400">
                Mission
              </span>
              <p className="mt-150 font-designer-16m text-gray-200 md:mt-200 md:font-designer-20m">
                책 · 강의 · GPT 검색만으로 얻기 어려운 살아있는 실전 인사이트를
                사람 간 학습으로 전파하고, 개인의 잠재력을 극대화합니다.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="rounded-[14px] border border-gray-800 bg-gray-900/60 p-300 backdrop-blur md:rounded-200 md:p-[36px]">
              <span className="font-designer-14b uppercase tracking-[2px] text-indigo-400">
                Vision
              </span>
              <p className="mt-150 font-designer-16m text-gray-200 md:mt-200 md:font-designer-20m">
                IT 스터디와 커뮤니티의 새로운 표준이 되어 학습, 증명, 커리어
                기회를 한 곳에서 연결하는 통합 생태계를 만듭니다.
              </p>
            </div>
          </FadeIn>
        </div>

        <FadeIn
          delay={0.3}
          className="mt-[36px] flex flex-wrap justify-center gap-125 md:mt-600 md:gap-150"
        >
          {CORE_VALUES.map((value) => (
            <span
              key={value}
              className="rounded-full border border-gray-700 px-200 py-100 font-designer-14m text-gray-400 md:px-250 md:py-125"
            >
              {value}
            </span>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── CTA + Form Section ──────────────────────────── */

function CTASection() {
  return (
    <section
      id="open-form"
      className="w-full bg-gray-0 py-[80px] md:py-[120px]"
    >
      <div
        className={`${SECTION_INNER} flex flex-col items-center gap-500 lg:flex-row lg:items-start lg:gap-800`}
      >
        <FadeIn className="w-full flex-1 text-center lg:pt-600 lg:text-left">
          <span className="font-designer-14b uppercase tracking-[2px] text-text-brand">
            Matching
          </span>
          <h2 className="mt-150 font-bold-h4 text-text-strong md:mt-200 md:font-bold-h2 lg:font-bold-h1">
            내 상황에 딱 맞는
          </h2>
          <p className="font-bold-h4 text-text-strong md:font-bold-h2 lg:font-bold-h1">
            스터디와 멘토, 놓치지 마세요.
          </p>
          <p className="mt-150 font-designer-16m text-text-subtle md:mt-200">
            관심 분야와 현재 상황을 알려주시면, 관련 스터디가 개설되거나 꼭 맞는
            개발자 멘토가 등록될 때 가장 먼저 알려드려요.
          </p>

          <div className="mt-350 inline-flex flex-col gap-175 md:mt-500 md:gap-200">
            {[
              '관심 분야와 현재 고민을 알려주세요',
              '관련 스터디 개설 시 우선 안내',
              '내 상황에 맞는 멘토 등록 시 알림',
            ].map((text, i) => (
              <div key={text} className="flex items-center gap-150">
                <span className="flex size-350 shrink-0 items-center justify-center rounded-full bg-rose-50 font-designer-13b text-rose-500 md:size-400 md:font-designer-14b">
                  {i + 1}
                </span>
                <span className="font-designer-14m text-text-default md:font-designer-16m">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2} className="w-full lg:w-[560px]">
          <LandingForm />
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────── */

function FooterSection() {
  return (
    <footer className="w-full bg-gray-1000 px-250 py-600 md:px-500 md:py-800">
      <div className="mx-auto flex w-full max-w-[1160px] flex-col items-center gap-400 md:gap-500">
        <div className="flex flex-col items-center gap-50 text-center md:gap-100">
          <p className="font-bold-h5 text-gray-0 md:font-bold-h3">
            더 좋은 답과 더 빠른 성장을 만들기 위해
          </p>
          <p className="font-bold-h5 text-gray-0 md:font-bold-h3">
            계속 달립니다.
          </p>
        </div>

        <div className="flex gap-150 md:gap-200">
          {[
            {
              href: 'https://www.threads.net/@code_zero_to_one',
              icon: '/icons/thread.svg',
              alt: 'Threads',
            },
            {
              href: 'https://www.instagram.com/code_zero_to_one/',
              icon: '/icons/instagram.svg',
              alt: 'Instagram',
            },
            {
              href: 'https://www.youtube.com/@코드제로투원',
              icon: '/icons/youtube.svg',
              alt: 'YouTube',
            },
          ].map((social) => (
            <Link
              key={social.alt}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="flex size-500 items-center justify-center rounded-full border border-gray-700 transition-all duration-300 hover:border-gray-500 hover:bg-gray-800 md:h-[44px] md:w-[44px]"
            >
              <Image
                src={social.icon}
                alt={social.alt}
                width={20}
                height={20}
                className="invert md:h-[22px] md:w-[22px]"
              />
            </Link>
          ))}
        </div>

        <div className="flex w-full flex-col items-center gap-75 border-t border-gray-800 pt-300 font-designer-12m text-gray-500 md:gap-100 md:pt-400">
          <div className="flex flex-col items-center gap-50 md:flex-row md:gap-200">
            <span>상호명: 정성컴퍼니</span>
            <span className="hidden text-gray-700 md:inline">|</span>
            <span>대표자명: 조성진</span>
            <span className="hidden text-gray-700 md:inline">|</span>
            <span>전화번호: 010-6856-6609</span>
          </div>
          <div className="flex flex-col items-center gap-50 md:flex-row md:gap-200">
            <span>사업자번호: 798-31-01774</span>
            <span className="hidden text-gray-700 md:inline">|</span>
            <span>사업장 주소: 서울시 강남구 역삼동 620-17 203호</span>
          </div>
          <div className="mt-50 text-gray-600 md:mt-100">
            &copy; 2024 ZERO-ONE. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
