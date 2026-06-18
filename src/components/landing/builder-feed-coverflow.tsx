'use client';

import {
  ChevronLeft,
  ChevronRight,
  Forward,
  Heart,
  MessageSquare,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

/* ─── Mock feed (landing marketing — static, no backend) ─── */

interface Feed {
  name: string;
  /** Project name shown on the thumbnail hero. */
  project: string;
  /** Result type chip (웹사이트 / 업무 자동화). */
  kind: string;
  /** Thumbnail image path under /public/landing/. */
  thumb: string;
  lines: string[];
  likes: number;
  comments: number;
}

const FEED: Feed[] = [
  {
    name: '뭉다',
    project: '내 첫 포트폴리오',
    kind: '웹사이트',
    thumb: '/landing/feed-thumb-portfolio.png',
    lines: [
      '오늘 처음 만들어본 웹사이트!',
      '뭘 먼저 시작해야될지 모르겠어서 고민이 많았던...',
      '바이브 코딩인데 하나씩 따라가보니 그냥 배포됨 ㅋㅋ',
    ],
    likes: 24,
    comments: 10,
  },
  {
    name: '성윤',
    project: '사이드 프로젝트 랜딩',
    kind: '웹사이트',
    thumb: '/landing/feed-thumb-side-project.png',
    lines: [
      '사이드 프로젝트 랜딩 완성했어요',
      '디자인만 하던 제가 직접 배포까지 하다니',
      'URL 생기니까 진짜 실감나네요 🚀',
    ],
    likes: 38,
    comments: 12,
  },
  {
    name: '지우',
    project: '감성 카페 큐레이션',
    kind: '웹사이트',
    thumb: '/landing/feed-thumb-cafe.png',
    lines: [
      '감성 카페 큐레이션 사이트 오픈!',
      '코딩 1도 몰랐는데 20일 만에 이게 되네요',
      '에러 날 때마다 질문하니까 막힘이 없었어요',
    ],
    likes: 51,
    comments: 18,
  },
  {
    name: '도현',
    project: '주간 회의록 자동화',
    kind: '업무 자동화',
    thumb: '/landing/feed-thumb-meeting.png',
    lines: [
      '회의 끝나면 회의록이 저절로 정리돼요',
      '액션아이템까지 자동 추출되니까',
      '매주 야근 1시간이 사라졌습니다',
    ],
    likes: 29,
    comments: 7,
  },
  {
    name: '하늘',
    project: '캠페인 리포트 자동화',
    kind: '업무 자동화',
    thumb: '/landing/feed-thumb-campaign.png',
    lines: [
      '매주 반나절 걸리던 캠페인 리포트',
      '이제 프롬프트 한 줄이면 끝나요',
      '돌려받은 2시간으로 진짜 일을 합니다',
    ],
    likes: 44,
    comments: 15,
  },
];

/* Result site preview — generated thumbnail image with overlay labels. */
function FeedThumbnail({ feed }: { feed: Feed }) {
  return (
    <div
      className="absolute inset-x-0 overflow-hidden"
      style={{ top: '26.21%', height: '60.04%' }}
    >
      <div className="relative h-full w-full">
        <Image
          src={feed.thumb}
          alt={feed.project}
          fill
          className="object-cover object-top"
          sizes="(max-width: 1024px) 368px, 368px"
        />
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-transparent via-transparent to-black/50 p-250">
          <span className="w-fit rounded-full bg-gray-0/90 px-150 py-25 text-[11px] font-bold leading-[1.5] text-gray-800 md:text-[13px]">
            {feed.kind}
          </span>
          <div className="flex flex-col gap-25">
            <p className="text-[16px] font-bold leading-[1.3] tracking-[-0.342px] text-gray-0 md:text-[20px]">
              {feed.project}
            </p>
            <p className="text-[11px] leading-[1.5] text-gray-0/85 md:text-[13px]">
              live · zeroone.it.kr
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Single builder-feed card (Figma 1502:18192, 368×538) ───
   Internal layout uses % positions so the card stays faithful while
   scaling down with the viewport (same pattern as hero-flip-card). */

function BuilderFeedCard({ feed }: { feed: Feed }) {
  return (
    <div className="relative aspect-[368/538] w-full overflow-hidden rounded-150 bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.25)]">
      {/* Result preview (dummy site thumbnail) */}
      <FeedThumbnail feed={feed} />

      {/* Profile */}
      <div
        className="absolute flex items-center gap-125"
        style={{ left: '5.43%', top: '3.72%' }}
      >
        <Image
          src="/landing/feed-avatar.svg"
          alt=""
          width={24}
          height={24}
          className="size-300 shrink-0 rounded-full"
        />
        <p className="whitespace-nowrap text-[14px] font-medium leading-[1.5] tracking-[-0.266px] text-gray-800">
          {feed.name}
        </p>
      </div>

      {/* Body */}
      <div
        className="absolute text-[16px] leading-[1.5] tracking-[-0.304px] text-gray-800"
        style={{ left: '5.43%', right: '5.43%', top: '9.67%' }}
      >
        {feed.lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {/* Indicator dots */}
      <div
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-30"
        style={{ top: '88.85%' }}
      >
        <span className="h-75 w-225 rounded-full bg-gray-800" />
        <span className="size-75 rounded-full bg-gray-300" />
        <span className="size-75 rounded-full bg-gray-300" />
        <span className="size-75 rounded-full bg-gray-300" />
      </div>

      {/* Like / comment / share */}
      <div
        className="absolute flex items-center gap-125"
        style={{ left: '5.43%', top: '91.82%' }}
      >
        <div className="flex items-center gap-30">
          <Heart className="size-250 text-gray-1000" />
          <span className="text-[16px] leading-[1.5] tracking-[-0.304px] text-gray-1000">
            {feed.likes}
          </span>
        </div>
        <div className="flex items-center gap-50">
          <MessageSquare className="size-250 text-gray-1000" />
          <span className="text-[16px] leading-[1.5] tracking-[-0.304px] text-gray-1000">
            {feed.comments}
          </span>
        </div>
        <Forward className="size-250 text-gray-1000" />
      </div>
    </div>
  );
}

/* ─── Cover-flow carousel ─────────────────────────────────
   5 slots: center (z-30, sharp), inner ±1 (scale .9375, blur 2px),
   outer ±2 (scale .807, blur 5px). Offsets are % of the center
   card width (368px) so they hold across viewport sizes. */

const SLOTS = [
  {
    pos: -2,
    z: 'z-10',
    cls: 'hidden lg:block',
    tx: -108.56,
    scale: 0.8071,
    blur: 'blur-[5px]',
  },
  {
    pos: -1,
    z: 'z-20',
    cls: 'hidden lg:block',
    tx: -58.97,
    scale: 0.9375,
    blur: 'blur-[2px]',
  },
  { pos: 0, z: 'z-30', cls: 'block', tx: 0, scale: 1, blur: '' },
  {
    pos: 1,
    z: 'z-20',
    cls: 'hidden lg:block',
    tx: 58.97,
    scale: 0.9375,
    blur: 'blur-[2px]',
  },
  {
    pos: 2,
    z: 'z-10',
    cls: 'hidden lg:block',
    tx: 108.56,
    scale: 0.8071,
    blur: 'blur-[5px]',
  },
];

export function BuilderFeedCoverflow({ className }: { className?: string }) {
  const [center, setCenter] = useState(0);
  const n = FEED.length;

  const move = (dir: 1 | -1) => setCenter((c) => (c + dir + n) % n);

  return (
    <div className={cn('relative mx-auto w-full max-w-17500', className)}>
      {/* Height spacer = center card */}
      <div className="mx-auto aspect-[368/538] w-full max-w-4600" aria-hidden />

      {/* Cards */}
      {SLOTS.map((slot) => {
        const feed = FEED[(center + slot.pos + n) % n];
        return (
          <div
            key={slot.pos}
            className={cn(
              'absolute left-1/2 top-1/2 w-full max-w-4600',
              slot.z,
              slot.cls,
              slot.blur,
            )}
            style={{
              transform: `translate(-50%, -50%) translateX(${slot.tx}%) scale(${slot.scale})`,
            }}
            aria-hidden={slot.pos !== 0}
          >
            <BuilderFeedCard feed={feed} />
          </div>
        );
      })}

      {/* Chevrons */}
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="이전 결과물"
        className="absolute left-0 top-1/2 z-40 flex -translate-y-1/2 items-center justify-center text-gray-800 transition-opacity hover:opacity-70"
      >
        <ChevronLeft className="size-625" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        aria-label="다음 결과물"
        className="absolute right-0 top-1/2 z-40 flex -translate-y-1/2 items-center justify-center text-gray-800 transition-opacity hover:opacity-70"
      >
        <ChevronRight className="size-625" strokeWidth={1.5} />
      </button>
    </div>
  );
}
