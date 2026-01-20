'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { 
  Trophy, 
  BookOpen, 
  Flame, 
  FileText, 
  Thermometer, 
  Search, 
  Eye, 
  Heart, 
  Loader2,
  ChevronUp,
  ChevronDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LibraryBig,
  LayoutGrid,
  List,
  ArrowUpDown,
  MessageSquareText,
  Bookmark,
  Sparkles
} from 'lucide-react';

// ----------------------------------------------------------------------
// Types & Mock Data (Hall of Fame)
// ----------------------------------------------------------------------

type RankingType = 'ATTENDANCE' | 'STUDY_LOG' | 'SINCERITY';

interface Ranker {
  rank: number;
  userId: number;
  nickname: string;
  profileImage: string | null;
  score: number;
  scoreLabel: string;
  change?: 'up' | 'down' | 'same';
  lastActive: string;
  studyTime: string;
  major?: string;
  streak?: number;
  changeValue?: number;
}

const JOBS = [
  'IT 노베이스 - 비지니스/창업',
  'IT 노베이스 - 업무 자동화',
  'IT 노베이스 - 내 서비스 개발',
  'IT 실무자 - PM/PO/기획',
  'IT 실무자 - 프론트엔드',
  'IT 실무자 - 백엔드',
  'IT 실무자 - AI/머신러닝',
  'IT 실무자 - iOS',
  'IT 실무자 - 안드로이드',
  'IT 실무자 - DevOps',
  'IT 실무자 - 데이터 분석',
  'IT 실무자 - QA',
  'IT 실무자 - 게임 개발',
  'IT 실무자 - 디자인',
  'IT 실무자 - 마케팅',
  'IT 실무자 - 기타',
];

const generateMockRankers = (type: RankingType): Ranker[] => {
  return Array.from({ length: 20 }, (_, i) => {
    const rank = i + 1;
    let score = 0;
    let scoreLabel = '';

    if (type === 'ATTENDANCE') {
      score = 150 - i * 3;
      scoreLabel = `${score}회`;
    } else if (type === 'STUDY_LOG') {
      score = 80 - i * 2;
      scoreLabel = `${score}건`;
    } else {
      score = parseFloat((99.9 - i * 1.5).toFixed(1));
      scoreLabel = `${score}℃`;
    }

    const lastActive = i < 3 ? '방금 전' : `${i * 10 + 5}분 전`;
    const studyTime = `${Math.floor(Math.random() * 40 + 10)}시간`;
    const streak = Math.floor(Math.random() * 50) + 1;
    const major = JOBS[Math.floor(Math.random() * JOBS.length)];

    return {
      rank,
      userId: 100 + i,
      nickname: `User_${100 + i}`,
      profileImage: null as string | null,
      score,
      scoreLabel,
      change: Math.random() > 0.7 ? 'up' : Math.random() > 0.8 ? 'down' : 'same',
      lastActive,
      studyTime,
      major,
      streak,
      changeValue: Math.floor(Math.random() * 5),
    };
  });
};

const TAB_CONFIG: Record<
  RankingType,
  { label: string; desc: string; icon: React.ReactNode; colorClass: string }
> = {
  ATTENDANCE: {
    label: '불꽃 출석왕',
    desc: '비가 오나 눈이 오나 자리를 지킨, 제로원의 개근상',
    icon: <Flame className="w-4 h-4" />,
    colorClass: 'text-text-brand',
  },
  STUDY_LOG: {
    label: '열정 기록왕',
    desc: '제로원의 아카이브를 채운, 자료 공유의 신',
    icon: <FileText className="w-4 h-4" />,
    colorClass: 'text-text-information',
  },
  SINCERITY: {
    label: '성실 온도왕',
    desc: '가장 뜨거운 심장을 가진, 제로원의 신뢰 아이콘',
    icon: <Thermometer className="w-4 h-4" />,
    colorClass: 'text-text-warning',
  },
};

// ----------------------------------------------------------------------
// Types & Mock Data (Library)
// ----------------------------------------------------------------------

type CurationType = 'ARTICLE' | 'VIDEO' | 'PROBLEM' | 'REFERENCE';
type CurationLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type CurationBenefit = 'CONCEPT' | 'PRACTICE' | 'REVIEW';

interface LibraryItem {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  link: string;
  isLiked: boolean;
  level: CurationLevel;
  tags: string[];
  isBookmarked: boolean;
  isRecommended?: boolean;
}

interface CurationItem {
  id: number;
  title: string;
  description: string;
  type: CurationType;
  level: CurationLevel;
  tags: string[];
  benefit: CurationBenefit;
  link: string;
  isBookmarked: boolean;
  isRecommended?: boolean;
  author: string;
  views: number;
  likes: number;
  isLiked: boolean;
}

const CURATION_LABELS = {
  type: {
    ARTICLE: '글',
    VIDEO: '강의',
    PROBLEM: '문제',
    REFERENCE: '레퍼런스',
  },
  level: {
    BEGINNER: '초급',
    INTERMEDIATE: '중급',
    ADVANCED: '고급',
  },
  benefit: {
    CONCEPT: '개념 정리',
    PRACTICE: '실전 적용',
    REVIEW: '복습용',
  },
} as const;

const MOCK_LIBRARY_DATA: LibraryItem[] = [
  {
    id: 1,
    title: '2025년 상반기 백엔드 개발자 면접 질문 모음 (네카라쿠배)',
    description: '네이버, 카카오, 라인, 쿠팡, 배민 등 주요 기업의 실제 면접 질문을 분석했습니다.',
    author: '제로원 운영진',
    date: '2025.01.10',
    views: 1250,
    likes: 342,
    link: 'https://velog.io',
    isLiked: true,
    level: 'INTERMEDIATE',
    tags: ['면접', '백엔드', '취업'],
    isBookmarked: false,
    isRecommended: true,
  },
  {
    id: 2,
    title: '프론트엔드 성능 최적화: React 19 도입 가이드',
    description: '최신 React 19의 성능 개선 포인트와 마이그레이션 전략을 소개합니다.',
    author: 'TechLead_Kim',
    date: '2025.01.12',
    views: 890,
    likes: 120,
    link: 'https://medium.com',
    isLiked: false,
    level: 'ADVANCED',
    tags: ['React', '성능', '최적화'],
    isBookmarked: true,
  },
  {
    id: 3,
    title: '비전공자가 6개월 만에 개발자로 취업한 현실적인 공부법',
    description: '비전공 출신이 실제로 경험한 학습 로드맵과 포트폴리오 전략을 공유합니다.',
    author: 'NewDeveloper',
    date: '2025.01.05',
    views: 2100,
    likes: 560,
    link: 'https://brunch.co.kr',
    isLiked: true,
    level: 'BEGINNER',
    tags: ['비전공', '취업', '학습법'],
    isBookmarked: false,
    isRecommended: true,
  },
  {
    id: 4,
    title: 'CS 기초: 운영체제와 네트워크 핵심 요약 (PDF 다운로드)',
    description: '면접 대비를 위한 운영체제와 네트워크 핵심 개념 정리 자료입니다.',
    author: 'CS_Master',
    date: '2024.12.28',
    views: 1500,
    likes: 410,
    link: 'https://tistory.com',
    isLiked: false,
    level: 'INTERMEDIATE',
    tags: ['CS', '운영체제', '네트워크'],
    isBookmarked: false,
  },
  {
    id: 5,
    title: '주니어 개발자를 위한 이력서 첨삭 가이드 101',
    description: '합격하는 개발자 이력서 작성법과 실제 첨삭 사례를 소개합니다.',
    author: 'HR_Manager',
    date: '2025.01.15',
    views: 750,
    likes: 230,
    link: 'https://linkedin.com',
    isLiked: false,
    level: 'BEGINNER',
    tags: ['이력서', '취업', '포트폴리오'],
    isBookmarked: true,
  },
  ...Array.from({ length: 10 }, (_, i): LibraryItem => ({
    id: 10 + i,
    title: `개발자 면접 대비 - 자료구조 핵심 질문 ${i + 1}탄`,
    description: '자주 출제되는 자료구조 면접 질문과 모범 답변을 정리했습니다.',
    author: 'Admin',
    date: `2024.12.${20 - i}`,
    views: 100 + i * 10,
    likes: 10 + i,
    link: 'https://google.com',
    isLiked: Math.random() > 0.5,
    level: i % 3 === 0 ? 'BEGINNER' : i % 3 === 1 ? 'INTERMEDIATE' : 'ADVANCED',
    tags: ['면접', '자료구조', 'CS'],
    isBookmarked: Math.random() > 0.7,
  })),
];

const MOCK_CURATION_DATA: CurationItem[] = [
  {
    id: 101,
    title: 'Spring JPA 기본기, 실무에서 바로 쓰는 패턴',
    description: '기본 엔티티 설계부터 N+1 대응까지 핵심 패턴을 빠르게 정리합니다.',
    type: 'ARTICLE',
    level: 'INTERMEDIATE',
    tags: ['Spring', 'JPA', 'DB 설계'],
    benefit: 'PRACTICE',
    link: 'https://velog.io',
    isBookmarked: true,
    isRecommended: true,
    author: '제로원 운영진',
    views: 2340,
    likes: 580,
    isLiked: true,
  },
  {
    id: 102,
    title: 'React 성능 최적화 30분 요약',
    description: '렌더링 병목, 메모이제이션, 번들 최적화까지 압축 정리.',
    type: 'VIDEO',
    level: 'BEGINNER',
    tags: ['React', '성능', '최적화'],
    benefit: 'CONCEPT',
    link: 'https://youtube.com',
    isBookmarked: false,
    author: 'FrontendMaster',
    views: 1890,
    likes: 340,
    isLiked: false,
  },
  {
    id: 103,
    title: 'CS 면접 핵심 30제',
    description: '운영체제·네트워크·자료구조를 한 번에 복습하세요.',
    type: 'PROBLEM',
    level: 'INTERMEDIATE',
    tags: ['면접', 'CS', '자료구조'],
    benefit: 'REVIEW',
    link: 'https://notion.so',
    isBookmarked: false,
    author: 'CS_Master',
    views: 3200,
    likes: 720,
    isLiked: true,
  },
  {
    id: 104,
    title: '서비스 설계 레퍼런스 모음',
    description: '요구사항 정의부터 아키텍처 설계까지 참고할 수 있는 실무 모음.',
    type: 'REFERENCE',
    level: 'ADVANCED',
    tags: ['설계', '아키텍처', '문서화'],
    benefit: 'PRACTICE',
    link: 'https://medium.com',
    isBookmarked: false,
    author: 'TechLead_Kim',
    views: 1560,
    likes: 290,
    isLiked: false,
  },
];


// ----------------------------------------------------------------------
// Components
// ----------------------------------------------------------------------

const RankBadge = ({ rank }: { rank: number }) => {
  const iconPath =
    rank === 1
      ? '/icons/gold-rank.svg'
      : rank === 2
      ? '/icons/silver-rank.svg'
      : '/icons/bronze-rank.svg';

  return (
    <div className="relative h-[48px] w-[36px] md:h-[60px] md:w-[45px]">
      <Image src={iconPath} alt={`${rank}위`} fill className="object-contain" />
    </div>
  );
};

const ProfileAvatar = ({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) => {
  const sizeClass = {
    sm: 'w-[40px] h-[40px]',
    md: 'w-[48px] h-[48px]',
    lg: 'w-[80px] h-[80px]',
    xl: 'w-[120px] h-[120px]',
  }[size];

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-[9999px] bg-fill-neutral-default-default shadow-1',
        sizeClass,
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" />
      ) : (
        <Image
          src="/profile-default.svg"
          alt="default profile"
          fill
          className="object-cover"
        />
      )}
    </div>
  );
};

const RankChangeIndicator = ({
  change,
  value,
}: {
  change?: 'up' | 'down' | 'same';
  value?: number;
}) => {
  if (change === 'same' || !value) {
    return <Minus className="w-3 h-3 text-text-subtlest" />;
  }
  if (change === 'up') {
    return (
      <div className="flex items-center gap-25 font-designer-11m text-text-error">
        <ChevronUp className="w-3 h-3" />
        {value}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-25 font-designer-11m text-text-information">
      <ChevronDown className="w-3 h-3" />
      {value}
    </div>
  );
};

const TopRankerCard = ({ ranker }: { ranker: Ranker }) => {
  const isFirst = ranker.rank === 1;

  return (
    <UserProfileModal
      memberId={ranker.userId}
      trigger={
        <div
          className={cn(
            'relative flex cursor-pointer flex-col items-center rounded-200 border border-border-subtle bg-background-default px-300 py-500 shadow-2 transition-transform hover:-translate-y-50 hover:shadow-3',
            isFirst
              ? 'z-10 scale-105 border-border-brand shadow-3'
              : 'mt-0 scale-100',
            ranker.rank === 2
              ? 'order-1'
              : ranker.rank === 3
              ? 'order-3'
              : 'order-2',
          )}
        >
          {isFirst && (
            <div className="absolute -top-[24px] left-1/2 -translate-x-1/2">
              <RankBadge rank={ranker.rank} />
            </div>
          )}

          <ProfileAvatar
            src={ranker.profileImage}
            alt={ranker.nickname}
            size={isFirst ? 'xl' : 'lg'}
            className={cn(
              'mb-300 border-4 border-white shadow-3',
              isFirst && 'border-fill-brand-default-default',
            )}
          />

          <div className="text-center">
            {!isFirst && (
              <div className="absolute -top-[20px] left-1/2 -translate-x-1/2">
                <RankBadge rank={ranker.rank} />
              </div>
            )}
            <div
              className={cn(
                'text-text-strong mb-50 truncate px-100',
                isFirst ? 'font-bold-h4' : 'font-designer-20b',
              )}
            >
              {ranker.nickname}
            </div>

            <div
              className={cn(
                'flex items-end justify-center gap-50 mb-200',
                isFirst ? 'text-text-brand' : 'text-text-subtle',
              )}
            >
              <span
                className={cn(
                  isFirst ? 'font-display-headings5' : 'font-display-headings6',
                )}
              >
                {parseInt(ranker.scoreLabel.replace(/[^0-9.]/g, ''))}
              </span>
              <span
                className={cn(
                  'pb-150',
                  isFirst ? 'font-designer-24m' : 'font-designer-18m',
                )}
              >
                {ranker.scoreLabel.replace(/[0-9.]/g, '')}
              </span>
            </div>

            <div className="flex justify-center gap-200 text-text-subtle">
              <div className="flex flex-col items-center">
                <span className="font-designer-12r text-text-subtlest mb-25">최근 활동</span>
                <span className="font-designer-13b">{ranker.lastActive}</span>
              </div>
              <div className="bg-border-subtle h-[24px] w-[1px] self-center"></div>
              <div className="flex flex-col items-center">
                <span className="font-designer-12r text-text-subtlest mb-25">누적 학습</span>
                <span className="font-designer-13b">{ranker.studyTime}</span>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

const LibraryCard = ({ 
  item, 
  onLike, 
  onView,
  onBookmark,
  onSimilar,
}: { 
  item: LibraryItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (link: string) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onSimilar: (e: React.MouseEvent, tag: string) => void;
}) => {
  return (
    <div className="flex h-full flex-col gap-250 rounded-200 border border-border-subtle bg-background-default p-400 shadow-1 transition-all hover:-translate-y-50 hover:shadow-2">
      <div className="flex items-start justify-between gap-200">
        <div className="flex flex-wrap items-center gap-100">
          <span className="rounded-100 border border-border-subtle px-200 py-50 font-designer-12m text-text-subtle">
            {CURATION_LABELS.level[item.level]}
          </span>
          {item.isRecommended && (
            <span className="flex items-center gap-50 rounded-100 bg-fill-brand-subtle-default px-200 py-50 font-designer-12b text-text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              추천
            </span>
          )}
        </div>
        <button
          onClick={(e) => onBookmark(e, item.id)}
          className={cn(
            'flex items-center gap-50 rounded-100 px-150 py-50 font-designer-12m transition-colors',
            item.isBookmarked
              ? 'bg-fill-neutral-strong-default text-text-inverse'
              : 'bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover',
          )}
        >
          <Bookmark className="h-3.5 w-3.5" />
          {item.isBookmarked ? '저장됨' : '저장'}
        </button>
      </div>

      <div className="flex flex-col gap-150">
        <h3 className="font-bold-h5 text-text-strong line-clamp-2">
          {item.title}
        </h3>
        <p className="font-designer-13r text-text-subtle line-clamp-2">
          {item.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-100">
        {item.tags.map((tag) => (
          <button
            key={tag}
            onClick={(e) => onSimilar(e, tag)}
            className="rounded-100 bg-fill-neutral-subtle-default px-200 py-50 font-designer-12r text-text-subtle hover:bg-fill-neutral-subtle-hover"
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-300">
        <span className="font-designer-13m text-text-subtle">
          by <span className="text-text-default font-medium">{item.author}</span>
        </span>
        <div className="flex items-center gap-200 text-text-subtle">
          <div className="flex items-center gap-50 font-designer-12r">
            <Eye className="w-3.5 h-3.5" />
            {item.views.toLocaleString()}
          </div>
          <button 
            onClick={(e) => onLike(e, item.id)}
            className="flex items-center gap-50 font-designer-12r hover:scale-110 transition-transform p-1 rounded-full hover:bg-red-50"
          >
            <Heart 
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                item.isLiked ? "fill-red-500 text-red-500" : "text-text-subtle"
              )} 
            />
            <span className={cn(item.isLiked && "text-red-500 font-bold")}>
              {item.likes.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const LibraryRow = ({ 
  item, 
  onLike, 
  onView,
  onBookmark,
}: { 
  item: LibraryItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (link: string) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
}) => {
  return (
    <div 
      onClick={() => onView(item.link)}
      className="group flex items-center gap-300 px-300 py-200 border-b border-border-subtlest hover:bg-fill-neutral-subtle-hover transition-colors cursor-pointer last:border-0"
    >
      {/* Title Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-100">
        <div className="flex items-center gap-100">
          <h3 className="font-designer-15b text-text-strong group-hover:text-text-information truncate transition-colors">
            {item.title}
          </h3>
          <span className="shrink-0 rounded-100 border border-border-subtle px-150 py-25 font-designer-11m text-text-subtle">
            {CURATION_LABELS.level[item.level]}
          </span>
          {item.isRecommended && (
            <span className="shrink-0 flex items-center gap-25 rounded-100 bg-fill-brand-subtle-default px-150 py-25 font-designer-11b text-text-brand">
              <Sparkles className="h-3 w-3" />
              추천
            </span>
          )}
        </div>
        <div className="flex items-center gap-100 font-designer-12r text-text-subtle">
          <span>{item.author}</span>
          <span className="w-[1px] h-[10px] bg-border-subtle"></span>
          <span>{item.date}</span>
        </div>
      </div>

      {/* Stats Area */}
      <div className="flex items-center gap-200 shrink-0">
        <button
          onClick={(e) => onBookmark(e, item.id)}
          className={cn(
            'flex items-center gap-25 rounded-100 px-100 py-50 font-designer-11m transition-colors',
            item.isBookmarked
              ? 'bg-fill-neutral-strong-default text-text-inverse'
              : 'bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover',
          )}
        >
          <Bookmark className="h-3 w-3" />
          {item.isBookmarked ? '저장됨' : '저장'}
        </button>
        
        <div className="flex items-center gap-50 font-designer-13m text-text-subtle min-w-[60px] justify-end">
          <Eye className="w-3.5 h-3.5" />
          {item.views.toLocaleString()}
        </div>
        
        <button 
          onClick={(e) => onLike(e, item.id)}
          className="flex items-center gap-50 font-designer-13m min-w-[50px] justify-end hover:scale-110 transition-transform p-1 rounded-full hover:bg-red-50"
        >
          <Heart 
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              item.isLiked ? "fill-red-500 text-red-500" : "text-text-subtle"
            )} 
          />
          <span className={cn(item.isLiked ? "text-red-500 font-bold" : "text-text-subtle")}>
            {item.likes.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
};

const CurationCard = ({
  item,
  onBookmark,
  onView,
  onSimilar,
  onLike,
}: {
  item: CurationItem;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onView: (e: React.MouseEvent, link: string) => void;
  onSimilar: (e: React.MouseEvent, tag: string) => void;
  onLike: (e: React.MouseEvent, id: number) => void;
}) => {
  return (
    <div className="flex h-full flex-col gap-250 rounded-200 border border-border-subtle bg-background-default p-400 shadow-1 transition-all hover:-translate-y-50 hover:shadow-2">
      <div className="flex items-start justify-between gap-200">
        <div className="flex flex-wrap items-center gap-100">
          <span className="rounded-100 border border-border-subtle px-200 py-50 font-designer-12m text-text-subtle">
            {CURATION_LABELS.level[item.level]}
          </span>
          {item.isRecommended && (
            <span className="flex items-center gap-50 rounded-100 bg-fill-brand-subtle-default px-200 py-50 font-designer-12b text-text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              추천
            </span>
          )}
        </div>
        <button
          onClick={(e) => onBookmark(e, item.id)}
          className={cn(
            'flex items-center gap-50 rounded-100 px-150 py-50 font-designer-12m transition-colors',
            item.isBookmarked
              ? 'bg-fill-neutral-strong-default text-text-inverse'
              : 'bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover',
          )}
        >
          <Bookmark className="h-3.5 w-3.5" />
          {item.isBookmarked ? '저장됨' : '저장'}
        </button>
      </div>

      <div className="flex flex-col gap-150">
        <h3 className="font-bold-h5 text-text-strong line-clamp-2">
          {item.title}
        </h3>
        <p className="font-designer-13r text-text-subtle line-clamp-2">
          {item.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-100">
        {item.tags.map((tag) => (
          <button
            key={tag}
            onClick={(e) => onSimilar(e, tag)}
            className="rounded-100 bg-fill-neutral-subtle-default px-200 py-50 font-designer-12r text-text-subtle hover:bg-fill-neutral-subtle-hover"
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-300">
        <span className="font-designer-13m text-text-subtle">
          by <span className="text-text-default font-medium">{item.author}</span>
        </span>
        <div className="flex items-center gap-200 text-text-subtle">
          <div className="flex items-center gap-50 font-designer-12r">
            <Eye className="w-3.5 h-3.5" />
            {item.views.toLocaleString()}
          </div>
          <button 
            onClick={(e) => onLike(e, item.id)}
            className="flex items-center gap-50 font-designer-12r hover:scale-110 transition-transform p-1 rounded-full hover:bg-red-50"
          >
            <Heart 
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                item.isLiked ? "fill-red-500 text-red-500" : "text-text-subtle"
              )} 
            />
            <span className={cn(item.isLiked && "text-red-500 font-bold")}>
              {item.likes.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Page
// ----------------------------------------------------------------------

export default function OneOnOnePage() {
  const [activeTab, setActiveTab] = useState<'RANKING' | 'LIBRARY'>('RANKING');
  const [rankingType, setRankingType] = useState<RankingType>('ATTENDANCE');
  const [rankers, setRankers] = useState<Ranker[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [curationItems, setCurationItems] = useState<CurationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Library Specific States
  const [librarySort, setLibrarySort] = useState<'LATEST' | 'VIEWS' | 'LIKES'>('LATEST');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = viewMode === 'LIST' ? 15 : 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('');

  // Data Loading Simulation
  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); // 탭 변경 시 페이지 리셋

    const timer = setTimeout(() => {
      if (activeTab === 'RANKING') {
        const data = Array.from({ length: 100 }, (_, i) => {
          return generateMockRankers(rankingType).map((r) => ({
            ...r,
            rank: r.rank + i * 20,
          }));
        })
          .flat()
          .map((item, index) => ({ ...item, rank: index + 1 }));
        setRankers(data);
      } else if (activeTab === 'LIBRARY') {
        setLibraryItems(MOCK_LIBRARY_DATA);
        setCurationItems(MOCK_CURATION_DATA);
      }
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [activeTab, rankingType]);

  // Handler for Likes
  const handleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent card click
    setLibraryItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isLiked: !item.isLiked,
          likes: item.isLiked ? item.likes - 1 : item.likes + 1
        };
      }
      return item;
    }));
  };

  const handleBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setCurationItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item,
      ),
    );
  };

  // Handler for Viewing (Clicking Card)
  const handleView = (link: string) => {
    window.open(link, '_blank');
  };

  const handleCurationView = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    handleView(link);
  };

  const handleSimilar = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setSearchTerm(tag);
    setCurrentPage(1);
  };

  const handleCurationLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setCurationItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1,
          };
        }
        return item;
      }),
    );
  };

  const handleLibraryBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLibraryItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item,
      ),
    );
  };


  // Filtering Logic
  const filteredRankers = rankers.filter((r) => {
    const matchesSearch = r.nickname
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesJob = jobFilter ? r.major === jobFilter : true;
    return matchesSearch && matchesJob;
  });

  const filteredLibrary = libraryItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedLibrary = [...filteredLibrary].sort((a, b) => {
    if (librarySort === 'VIEWS') return b.views - a.views;
    if (librarySort === 'LIKES') return b.likes - a.likes;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Pagination Logic
  const totalItems =
    activeTab === 'RANKING' 
      ? filteredRankers.length 
      : sortedLibrary.length;

  const totalPages = Math.ceil(
    (activeTab === 'RANKING' ? Math.max(0, totalItems - 3) : totalItems) /
      ITEMS_PER_PAGE,
  );

  const currentRankers = filteredRankers
    .slice(3)
    .slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE + (currentPage === 1 ? 0 : 0),
    );
    
  const currentLibrary = sortedLibrary.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-background-alternative flex justify-center">
      <div className="w-full max-w-screen-xl flex gap-600 px-400 py-600">
        {/* Left Sidebar (Tabs) */}
        <aside className="w-[200px] shrink-0 flex flex-col gap-400 pt-100 sticky top-400 h-fit">
          <div className="flex flex-col gap-50">
            <h1 className="font-bold-h5 text-text-strong tracking-tight">1:1 인사이트</h1>
            <span className="font-designer-13r text-text-subtle tracking-tight">
              성장의 기록
            </span>
          </div>

          <nav className="flex flex-col gap-50">
            <button
              onClick={() => setActiveTab('RANKING')}
              className={cn(
                'text-left px-200 py-150 rounded-100 font-designer-16m transition-all flex items-center gap-150',
                activeTab === 'RANKING'
                  ? 'text-text-strong bg-fill-neutral-default-default font-bold shadow-1'
                  : 'text-text-subtle hover:text-text-strong hover:bg-fill-neutral-subtle-hover'
              )}
            >
              <Trophy className={cn("w-5 h-5", activeTab === 'RANKING' && "text-text-brand")} /> 
              명예의 전당
            </button>
            <button
              onClick={() => setActiveTab('LIBRARY')}
              className={cn(
                'text-left px-200 py-150 rounded-100 font-designer-16m transition-all flex items-center gap-150',
                activeTab === 'LIBRARY'
                  ? 'text-text-strong bg-fill-neutral-default-default font-bold shadow-1'
                  : 'text-text-subtle hover:text-text-strong hover:bg-fill-neutral-subtle-hover'
              )}
            >
              <BookOpen className={cn("w-5 h-5", activeTab === 'LIBRARY' && "text-text-brand")} />
              제로원 아카이브
            </button>
            <a
              href="/insights/weekly"
              className="text-left px-200 py-150 rounded-100 font-designer-16m transition-all flex items-center gap-150 text-text-subtle hover:text-text-strong hover:bg-fill-neutral-subtle-hover"
            >
              <MessageSquareText className="w-5 h-5" />
              <span className="flex items-center gap-100">
                위클리 소통 공간
                <span className="animate-pulse text-[10px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-100 py-25 rounded-full font-bold">
                  NEW
                </span>
              </span>
            </a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col gap-400">
            {/* Header Area */}
            <div className="flex items-center justify-between">
              <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
                {activeTab === 'RANKING' && '명예의 전당'}
                {activeTab === 'LIBRARY' && '제로원 아카이브'}
                
                {activeTab === 'RANKING' && <Flame className="w-8 h-8 text-text-brand" fill="currentColor" />}
                {activeTab === 'LIBRARY' && <LibraryBig className="w-8 h-8 text-text-brand" />}
              </h2>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-300">
              {activeTab === 'RANKING' && (
                <div className="flex flex-wrap gap-150 p-100 bg-background-default rounded-200 border border-border-subtle w-fit">
                  {(Object.keys(TAB_CONFIG) as RankingType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setRankingType(type)}
                      className={cn(
                        'px-300 py-150 font-designer-15m rounded-100 transition-all whitespace-nowrap flex items-center gap-100',
                        rankingType === type
                          ? 'bg-fill-neutral-strong-default text-text-inverse shadow-1'
                          : 'text-text-subtle hover:bg-fill-neutral-subtle-hover',
                      )}
                    >
                      {TAB_CONFIG[type].icon}
                      {TAB_CONFIG[type].label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-300">
                {/* 1. Total Count (Left) */}
                {activeTab === 'LIBRARY' && (
                  <div className="font-designer-16m text-text-subtle whitespace-nowrap hidden md:block">
                    총 <span className="font-bold text-text-strong">{totalItems}</span>개의 자료가 있습니다.
                  </div>
                )}
                
                {/* Right Side Controls */}
                <div className={cn("flex flex-col md:flex-row gap-200 w-full md:w-auto items-start md:items-center", activeTab === 'LIBRARY' && "ml-auto")}>
                  {activeTab === 'RANKING' && (
                    <select
                      onChange={(e) => setJobFilter(e.target.value)}
                      className="h-600 rounded-100 border border-border-subtle bg-background-default px-200 font-designer-14m outline-none focus:border-border-default focus:ring-2 focus:ring-fill-neutral-default-default transition-all cursor-pointer w-full md:w-auto"
                    >
                      <option value="">모든 직무</option>
                      {JOBS.map((job) => (
                        <option key={job} value={job}>
                          {job}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* 2. Search Bar (Center/Right) */}
                  <div className="relative w-full md:w-[320px]">
                    <input
                      type="text"
                      placeholder={
                        activeTab === 'RANKING' ? '닉네임 검색' : '제목, 내용으로 검색'
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-600 w-full rounded-100 border border-border-subtle bg-background-default pl-200 pr-500 font-designer-14m outline-none focus:border-border-default focus:ring-2 focus:ring-fill-neutral-default-default transition-all"
                    />
                    <span className="absolute right-200 top-1/2 -translate-y-1/2 text-text-subtlest">
                      <Search className="w-4 h-4" />
                    </span>
                  </div>

                  {/* 3. Sort & View Toggle (Right End - Library Only) */}
                  {activeTab === 'LIBRARY' && (
                    <div className="flex items-center gap-200 w-full md:w-auto justify-end">
                      {/* Sort Dropdown */}
                      <div className="relative group">
                        <button className="flex items-center gap-50 px-200 py-150 rounded-100 bg-background-default border border-border-subtle font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover transition-colors whitespace-nowrap">
                          <ArrowUpDown className="w-4 h-4" />
                          {librarySort === 'LATEST' ? '최신순' : librarySort === 'VIEWS' ? '조회순' : '좋아요순'}
                        </button>
                        
                        {/* Dropdown Wrapper - Invisible Bridge */}
                        <div className="absolute top-full right-0 pt-50 w-[120px] hidden group-hover:block z-20">
                          {/* Visual Dropdown */}
                          <div className="bg-background-default border border-border-subtle rounded-100 shadow-2 overflow-hidden">
                            <button onClick={() => setLibrarySort('LATEST')} className="w-full text-left px-200 py-150 hover:bg-fill-neutral-subtle-hover font-designer-14r transition-colors">최신순</button>
                            <button onClick={() => setLibrarySort('VIEWS')} className="w-full text-left px-200 py-150 hover:bg-fill-neutral-subtle-hover font-designer-14r transition-colors">조회순</button>
                            <button onClick={() => setLibrarySort('LIKES')} className="w-full text-left px-200 py-150 hover:bg-fill-neutral-subtle-hover font-designer-14r transition-colors">좋아요순</button>
                          </div>
                        </div>
                      </div>

                      <div className="w-[1px] h-[24px] bg-border-subtle"></div>

                      {/* View Mode Toggle */}
                      <div className="flex bg-background-default rounded-100 border border-border-subtle p-50 shrink-0">
                        <button 
                          onClick={() => setViewMode('GRID')}
                          className={cn(
                            "p-100 rounded-75 transition-colors",
                            viewMode === 'GRID' ? "bg-fill-neutral-default-default text-text-strong shadow-sm" : "text-text-subtlest hover:text-text-subtle"
                          )}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setViewMode('LIST')}
                          className={cn(
                            "p-100 rounded-75 transition-colors",
                            viewMode === 'LIST' ? "bg-fill-neutral-default-default text-text-strong shadow-sm" : "text-text-subtlest hover:text-text-subtle"
                          )}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="py-800 text-center text-text-subtlest flex flex-col items-center gap-200">
                <Loader2 className="w-8 h-8 animate-spin" />
                <div className="font-designer-16m">데이터를 불러오는 중입니다...</div>
              </div>
            ) : activeTab === 'RANKING' ? (
              <>
                {/* Top 3 Section */}
                {filteredRankers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-400 items-end mt-300 mb-500">
                    {filteredRankers[1] && (
                      <div className="order-2 md:order-1">
                        <TopRankerCard ranker={filteredRankers[1]} />
                      </div>
                    )}
                    {filteredRankers[0] && (
                      <div className="order-1 md:order-2">
                        <TopRankerCard ranker={filteredRankers[0]} />
                      </div>
                    )}
                    {filteredRankers[2] && (
                      <div className="order-3">
                        <TopRankerCard ranker={filteredRankers[2]} />
                      </div>
                    )}
                  </div>
                )}

                {/* Ranking Table */}
                <div className="bg-background-default rounded-200 border border-border-subtle overflow-hidden shadow-1">
                  <div className="grid grid-cols-12 gap-200 px-400 py-250 bg-background-alternative/80 border-b border-border-subtlest font-designer-13b text-text-subtle uppercase tracking-wider">
                    <div className="col-span-2 text-center md:col-span-1">Rank</div>
                    <div className="col-span-6 md:col-span-5">Member</div>
                    <div className="col-span-4 md:col-span-3 text-right">Score</div>
                    <div className="hidden md:block md:col-span-3 text-right">Activity</div>
                  </div>

                  <div className="divide-y divide-border-subtlest">
                    {currentRankers.map((ranker) => (
                      <UserProfileModal
                        key={ranker.rank}
                        memberId={ranker.userId}
                        trigger={
                          <div className="grid grid-cols-12 gap-200 px-400 py-250 items-center hover:bg-fill-neutral-subtle-hover transition-colors cursor-pointer group h-[88px]">
                            <div className="col-span-2 md:col-span-1 text-center flex flex-col items-center justify-center">
                              <span className="font-bold-h4 text-text-strong group-hover:text-text-information transition-colors">
                                {ranker.rank}
                              </span>
                              <RankChangeIndicator
                                change={ranker.change}
                                value={ranker.changeValue}
                              />
                            </div>

                            <div className="col-span-6 md:col-span-5 flex items-center gap-300">
                              <ProfileAvatar src={ranker.profileImage} alt={ranker.nickname} size="md" />
                              <div className="min-w-0 flex flex-col gap-50">
                                <div className="font-designer-18b text-text-strong truncate group-hover:text-text-information transition-colors">
                                  {ranker.nickname}
                                </div>
                                <div className="font-designer-14r text-text-subtle truncate">
                                  {ranker.major}
                                </div>
                              </div>
                            </div>

                            <div className="col-span-4 md:col-span-3 text-right flex flex-col justify-center items-end">
                              <div className="font-bold-h5 text-text-strong">
                                {ranker.scoreLabel}
                              </div>
                              <div className="font-designer-12b text-text-information bg-fill-information-subtle-default px-150 py-50 rounded-[9999px] inline-block mt-50">
                                상위 1%
                              </div>
                            </div>

                            <div className="hidden md:block md:col-span-3 text-right font-designer-14r text-text-subtle flex flex-col justify-center items-end">
                              <div className="font-medium text-text-default">{ranker.studyTime} 누적</div>
                              <div className="font-designer-12r text-text-subtlest mt-50">
                                최근: {ranker.lastActive}
                              </div>
                            </div>
                          </div>
                        }
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Library Content */
              <>
                <div className="flex flex-col gap-250">
                  <div className="flex items-center justify-between">
                    <h3 className="font-designer-18b text-text-strong">
                      자료 큐레이션
                    </h3>
                    <span className="flex items-center gap-100 font-designer-13m text-text-subtle">
                      <Sparkles className="h-4 w-4 text-text-brand" />
                      취향 맞춤 추천
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-300">
                    {curationItems.map((item) => (
                      <CurationCard
                        key={item.id}
                        item={item}
                        onBookmark={handleBookmark}
                        onView={handleCurationView}
                        onSimilar={handleSimilar}
                        onLike={handleCurationLike}
                      />
                    ))}
                  </div>
                </div>

                {viewMode === 'GRID' ? (
                   /* Grid View */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-300">
                    {currentLibrary.length > 0 ? (
                      currentLibrary.map((item) => (
                        <LibraryCard 
                          key={item.id} 
                          item={item} 
                          onLike={handleLike}
                          onView={handleView}
                          onBookmark={handleLibraryBookmark}
                          onSimilar={handleSimilar}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-800 text-center text-text-subtlest flex flex-col items-center gap-200">
                        <Search className="w-10 h-10 opacity-20" />
                        <p className="font-designer-16m">검색 결과가 없습니다.</p>
                      </div>
                    )}
                  </div>
                ) : (
                   /* List View (Compact Rows) */
                  <div className="bg-background-default rounded-200 border border-border-subtle overflow-hidden">
                     {currentLibrary.length > 0 ? (
                        <div className="divide-y divide-border-subtlest">
                          {currentLibrary.map((item) => (
                            <LibraryRow 
                              key={item.id} 
                              item={item} 
                              onLike={handleLike}
                              onView={handleView}
                              onBookmark={handleLibraryBookmark}
                            />
                          ))}
                        </div>
                     ) : (
                        <div className="py-800 text-center text-text-subtlest flex flex-col items-center gap-200">
                          <Search className="w-10 h-10 opacity-20" />
                          <p className="font-designer-16m">검색 결과가 없습니다.</p>
                        </div>
                     )}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-100 py-600">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-[40px] h-[40px] flex items-center justify-center border border-border-subtle rounded-[9999px] hover:bg-fill-neutral-subtle-hover disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-text-subtle"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="flex items-center justify-center px-300 h-[40px] font-designer-15m text-text-subtle bg-background-default border border-border-subtle rounded-[9999px]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-[40px] h-[40px] flex items-center justify-center border border-border-subtle rounded-[9999px] hover:bg-fill-neutral-subtle-hover disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-text-subtle"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}

