'use client';

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
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);

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
      change:
        Math.random() > 0.7 ? 'up' : Math.random() > 0.8 ? 'down' : 'same',
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
    icon: <Flame className="h-4 w-4" />,
    colorClass: 'text-text-brand',
  },
  STUDY_LOG: {
    label: '열정 기록왕',
    desc: '제로원의 도서관을 채운, 자료 공유의 신',
    icon: <FileText className="h-4 w-4" />,
    colorClass: 'text-text-information',
  },
  SINCERITY: {
    label: '성실 온도왕',
    desc: '가장 뜨거운 심장을 가진, 제로원의 신뢰 아이콘',
    icon: <Thermometer className="h-4 w-4" />,
    colorClass: 'text-text-warning',
  },
};

// ----------------------------------------------------------------------
// Types & Mock Data (Library)
// ----------------------------------------------------------------------

interface LibraryItem {
  id: number;
  title: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  link: string;
  isLiked: boolean;
}

const MOCK_LIBRARY_DATA: LibraryItem[] = [
  {
    id: 1,
    title: '2025년 상반기 백엔드 개발자 면접 질문 모음 (네카라쿠배)',
    author: '제로원 운영진',
    date: '2025.01.10',
    views: 1250,
    likes: 342,
    link: 'https://velog.io',
    isLiked: true,
  },
  {
    id: 2,
    title: '프론트엔드 성능 최적화: React 19 도입 가이드',
    author: 'TechLead_Kim',
    date: '2025.01.12',
    views: 890,
    likes: 120,
    link: 'https://medium.com',
    isLiked: false,
  },
  {
    id: 3,
    title: '비전공자가 6개월 만에 개발자로 취업한 현실적인 공부법',
    author: 'NewDeveloper',
    date: '2025.01.05',
    views: 2100,
    likes: 560,
    link: 'https://brunch.co.kr',
    isLiked: true,
  },
  {
    id: 4,
    title: 'CS 기초: 운영체제와 네트워크 핵심 요약 (PDF 다운로드)',
    author: 'CS_Master',
    date: '2024.12.28',
    views: 1500,
    likes: 410,
    link: 'https://tistory.com',
    isLiked: false,
  },
  {
    id: 5,
    title: '주니어 개발자를 위한 이력서 첨삭 가이드 101',
    author: 'HR_Manager',
    date: '2025.01.15',
    views: 750,
    likes: 230,
    link: 'https://linkedin.com',
    isLiked: false,
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 10 + i,
    title: `개발자 면접 대비 - 자료구조 핵심 질문 ${i + 1}탄`,
    author: 'Admin',
    date: `2024.12.${20 - i}`,
    views: 100 + i * 10,
    likes: 10 + i,
    link: 'https://google.com',
    isLiked: Math.random() > 0.5,
  })),
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

const RankChangeIndicator = ({
  change,
  value,
}: {
  change?: 'up' | 'down' | 'same';
  value?: number;
}) => {
  if (change === 'same' || !value) {
    return <Minus className="text-text-subtlest h-3 w-3" />;
  }
  if (change === 'up') {
    return (
      <div className="font-designer-11m text-text-error flex items-center gap-25">
        <ChevronUp className="h-3 w-3" />
        {value}
      </div>
    );
  }

  return (
    <div className="font-designer-11m text-text-information flex items-center gap-25">
      <ChevronDown className="h-3 w-3" />
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
            'rounded-200 border-border-subtle bg-background-default shadow-2 hover:shadow-3 relative flex cursor-pointer flex-col items-center border px-300 py-500 transition-transform hover:-translate-y-50',
            isFirst
              ? 'border-border-brand shadow-3 z-10 scale-105'
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

          <UserAvatar
            image={ranker.profileImage || undefined}
            alt={ranker.nickname}
            size={isFirst ? 120 : 80}
            className={cn(
              'shadow-3 mb-300 border-4 border-background-default',
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
                'mb-200 flex items-end justify-center gap-50',
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

            <div className="text-text-subtle flex justify-center gap-200">
              <div className="flex flex-col items-center">
                <span className="font-designer-12r text-text-subtlest mb-25">
                  최근 활동
                </span>
                <span className="font-designer-13b">{ranker.lastActive}</span>
              </div>
              <div className="bg-border-subtle h-[24px] w-[1px] self-center" />
              <div className="flex flex-col items-center">
                <span className="font-designer-12r text-text-subtlest mb-25">
                  누적 학습
                </span>
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
}: {
  item: LibraryItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (link: string) => void;
}) => {
  return (
    <div
      onClick={() => onView(item.link)}
      className="group rounded-200 border-border-subtle bg-background-default hover:shadow-2 hover:border-border-default flex cursor-pointer flex-col gap-200 border p-400 transition-all hover:-translate-y-50"
    >
      <div className="flex items-center justify-between">
        <span className="font-designer-13m text-text-disabled">
          {item.date}
        </span>
        <ExternalLink className="text-text-subtlest h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <h3 className="font-designer-20b text-text-strong group-hover:text-text-information line-clamp-2 h-[60px] leading-tight transition-colors">
        {item.title}
      </h3>

      <div className="border-border-subtle mt-auto flex items-center justify-between border-t pt-300">
        <span className="font-designer-13m text-text-subtle">
          by{' '}
          <span className="text-text-default font-medium">{item.author}</span>
        </span>
        <div className="text-text-subtle flex items-center gap-200">
          <div className="font-designer-12r flex items-center gap-50">
            <Eye className="h-3.5 w-3.5" />
            {item.views.toLocaleString()}
          </div>
          <button
            onClick={(e) => onLike(e, item.id)}
            className="font-designer-12r flex items-center gap-50 rounded-full p-1 transition-transform hover:scale-110 hover:bg-red-50"
          >
            <Heart
              className={cn(
                'h-3.5 w-3.5 transition-colors',
                item.isLiked ? 'fill-red-500 text-red-500' : 'text-text-subtle',
              )}
            />
            <span className={cn(item.isLiked && 'font-bold text-red-500')}>
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
}: {
  item: LibraryItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (link: string) => void;
}) => {
  return (
    <div
      onClick={() => onView(item.link)}
      className="group border-border-subtlest hover:bg-fill-neutral-subtle-hover flex cursor-pointer items-center gap-300 border-b px-300 py-200 transition-colors last:border-0"
    >
      {/* Title Area */}
      <div className="flex min-w-0 flex-1 flex-col gap-25">
        <h3 className="font-designer-15b text-text-strong group-hover:text-text-information truncate transition-colors">
          {item.title}
        </h3>
        <div className="font-designer-12r text-text-subtle flex items-center gap-100">
          <span>{item.author}</span>
          <span className="bg-border-subtle h-[10px] w-[1px]" />
          <span>{item.date}</span>
        </div>
      </div>

      {/* Stats Area - Hidden on very small screens if needed, but flex-wrap handles it */}
      <div className="flex shrink-0 items-center gap-300">
        <div className="font-designer-13m text-text-subtle flex min-w-[60px] items-center justify-end gap-50">
          <Eye className="h-3.5 w-3.5" />
          {item.views.toLocaleString()}
        </div>

        <button
          onClick={(e) => onLike(e, item.id)}
          className="font-designer-13m flex min-w-[50px] items-center justify-end gap-50 rounded-full p-1 transition-transform hover:scale-110 hover:bg-red-50"
        >
          <Heart
            className={cn(
              'h-3.5 w-3.5 transition-colors',
              item.isLiked ? 'fill-red-500 text-red-500' : 'text-text-subtle',
            )}
          />
          <span
            className={cn(
              item.isLiked ? 'font-bold text-red-500' : 'text-text-subtle',
            )}
          >
            {item.likes.toLocaleString()}
          </span>
        </button>
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
  const [isLoading, setIsLoading] = useState(true);

  // Library Specific States
  const [librarySort, setLibrarySort] = useState<'LATEST' | 'VIEWS' | 'LIKES'>(
    'LATEST',
  );
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
      }
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [activeTab, rankingType]);

  // Handler for Likes
  const handleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent card click
    setLibraryItems((prev) =>
      prev.map((item) => {
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

  // Handler for Viewing (Clicking Card)
  const handleView = (link: string) => {
    window.open(link, '_blank');
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
    activeTab === 'RANKING' ? filteredRankers.length : sortedLibrary.length;

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
    <div className="bg-background-alternative flex min-h-screen justify-center">
      <div className="flex w-full max-w-screen-xl flex-col gap-400 px-400 py-600 md:flex-row md:gap-600">
        {/* Left Sidebar (Tabs) */}
        <aside className="flex w-full flex-col gap-300 md:sticky md:top-400 md:h-fit md:w-[200px] md:shrink-0 md:gap-400 md:pt-100">
          <div className="hidden flex-col gap-50 md:flex">
            <h1 className="font-designer-20b text-text-strong tracking-tight">
              1:1 인사이트
            </h1>
            <span className="font-designer-13r text-text-subtle tracking-tight">
              성장의 기록
            </span>
          </div>

          <nav className="flex flex-row gap-100 md:flex-col md:gap-50">
            <button
              onClick={() => setActiveTab('RANKING')}
              className={cn(
                'rounded-100 font-designer-16m flex items-center gap-150 px-200 py-150 text-left transition-all',
                activeTab === 'RANKING'
                  ? 'text-text-strong bg-fill-neutral-default-default shadow-1 font-bold'
                  : 'text-text-subtle hover:text-text-strong hover:bg-fill-neutral-subtle-hover',
              )}
            >
              <Trophy
                className={cn(
                  'h-5 w-5',
                  activeTab === 'RANKING' && 'text-text-brand',
                )}
              />
              명예의 전당
            </button>
            <button
              onClick={() => setActiveTab('LIBRARY')}
              className={cn(
                'rounded-100 font-designer-16m flex items-center gap-150 px-200 py-150 text-left transition-all',
                activeTab === 'LIBRARY'
                  ? 'text-text-strong bg-fill-neutral-default-default shadow-1 font-bold'
                  : 'text-text-subtle hover:text-text-strong hover:bg-fill-neutral-subtle-hover',
              )}
            >
              <BookOpen
                className={cn(
                  'h-5 w-5',
                  activeTab === 'LIBRARY' && 'text-text-brand',
                )}
              />
              제로원 도서관
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1">
          <div className="flex flex-col gap-400">
            {/* Header Area */}
            <div className="flex items-center justify-between">
              <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
                {activeTab === 'RANKING' && '명예의 전당'}
                {activeTab === 'LIBRARY' && '제로원 도서관'}

                {activeTab === 'RANKING' && (
                  <Flame
                    className="text-text-brand h-8 w-8"
                    fill="currentColor"
                  />
                )}
                {activeTab === 'LIBRARY' && (
                  <LibraryBig className="text-text-brand h-8 w-8" />
                )}
              </h2>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-300">
              {activeTab === 'RANKING' && (
                <div className="bg-background-default rounded-200 border-border-subtle flex w-fit flex-wrap gap-150 border p-100">
                  {(Object.keys(TAB_CONFIG) as RankingType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setRankingType(type)}
                      className={cn(
                        'font-designer-15m rounded-100 flex items-center gap-100 px-300 py-150 whitespace-nowrap transition-all',
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

              <div className="flex flex-col gap-300 md:flex-row md:items-center md:justify-between">
                {/* 1. Total Count (Left) */}
                {activeTab === 'LIBRARY' && (
                  <div className="font-designer-16m text-text-subtle hidden whitespace-nowrap md:block">
                    총{' '}
                    <span className="text-text-strong font-bold">
                      {totalItems}
                    </span>
                    개의 자료가 있습니다.
                  </div>
                )}

                {/* Right Side Controls */}
                <div
                  className={cn(
                    'flex w-full flex-col items-start gap-200 md:w-auto md:flex-row md:items-center',
                    activeTab === 'LIBRARY' && 'ml-auto',
                  )}
                >
                  {activeTab === 'RANKING' && (
                    <select
                      onChange={(e) => setJobFilter(e.target.value)}
                      className="rounded-100 border-border-subtle bg-background-default font-designer-14m focus:border-border-default focus:ring-fill-neutral-default-default h-600 w-full cursor-pointer border px-200 transition-all outline-none focus:ring-2 md:w-auto"
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
                        activeTab === 'RANKING'
                          ? '닉네임 검색'
                          : '제목, 내용으로 검색'
                      }
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="rounded-100 border-border-subtle bg-background-default font-designer-14m focus:border-border-default focus:ring-fill-neutral-default-default h-600 w-full border pr-500 pl-200 transition-all outline-none focus:ring-2"
                    />
                    <span className="text-text-subtlest absolute top-1/2 right-200 -translate-y-1/2">
                      <Search className="h-4 w-4" />
                    </span>
                  </div>

                  {/* 3. Sort & View Toggle (Right End - Library Only) */}
                  {activeTab === 'LIBRARY' && (
                    <div className="flex w-full items-center justify-end gap-200 md:w-auto">
                      {/* Sort Dropdown */}
                      <div className="group relative">
                        <button className="rounded-100 bg-background-default border-border-subtle font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover flex items-center gap-50 border px-200 py-150 whitespace-nowrap transition-colors">
                          <ArrowUpDown className="h-4 w-4" />
                          {librarySort === 'LATEST'
                            ? '최신순'
                            : librarySort === 'VIEWS'
                              ? '조회순'
                              : '좋아요순'}
                        </button>

                        {/* Dropdown Wrapper - Invisible Bridge */}
                        <div className="absolute top-full right-0 z-20 hidden w-[120px] pt-50 group-hover:block">
                          {/* Visual Dropdown */}
                          <div className="bg-background-default border-border-subtle rounded-100 shadow-2 overflow-hidden border">
                            <button
                              onClick={() => setLibrarySort('LATEST')}
                              className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
                            >
                              최신순
                            </button>
                            <button
                              onClick={() => setLibrarySort('VIEWS')}
                              className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
                            >
                              조회순
                            </button>
                            <button
                              onClick={() => setLibrarySort('LIKES')}
                              className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
                            >
                              좋아요순
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-border-subtle h-[24px] w-[1px]" />

                      {/* View Mode Toggle */}
                      <div className="bg-background-default rounded-100 border-border-subtle flex shrink-0 border p-50">
                        <button
                          onClick={() => setViewMode('GRID')}
                          className={cn(
                            'rounded-75 p-100 transition-colors',
                            viewMode === 'GRID'
                              ? 'bg-fill-neutral-default-default text-text-strong shadow-sm'
                              : 'text-text-subtlest hover:text-text-subtle',
                          )}
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('LIST')}
                          className={cn(
                            'rounded-75 p-100 transition-colors',
                            viewMode === 'LIST'
                              ? 'bg-fill-neutral-default-default text-text-strong shadow-sm'
                              : 'text-text-subtlest hover:text-text-subtle',
                          )}
                        >
                          <List className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-text-subtlest flex flex-col items-center gap-200 py-800 text-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <div className="font-designer-16m">
                  데이터를 불러오는 중입니다...
                </div>
              </div>
            ) : activeTab === 'RANKING' ? (
              <>
                {/* Top 3 Section */}
                {filteredRankers.length > 0 && (
                  <div className="mt-300 mb-500 grid grid-cols-1 items-end gap-400 md:grid-cols-3">
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
                <div className="bg-background-default rounded-200 border-border-subtle shadow-1 overflow-hidden border">
                  <div className="bg-background-alternative/80 border-border-subtlest font-designer-13b text-text-subtle grid grid-cols-12 gap-200 border-b px-400 py-250 tracking-wider uppercase">
                    <div className="col-span-2 text-center md:col-span-1">
                      Rank
                    </div>
                    <div className="col-span-6 md:col-span-5">Member</div>
                    <div className="col-span-4 text-right md:col-span-3">
                      Score
                    </div>
                    <div className="hidden text-right md:col-span-3 md:block">
                      Activity
                    </div>
                  </div>

                  <div className="divide-border-subtlest divide-y">
                    {currentRankers.map((ranker) => (
                      <UserProfileModal
                        key={ranker.rank}
                        memberId={ranker.userId}
                        trigger={
                          <div className="hover:bg-fill-neutral-subtle-hover group grid h-[88px] cursor-pointer grid-cols-12 items-center gap-200 px-400 py-250 transition-colors">
                            <div className="col-span-2 flex flex-col items-center justify-center text-center md:col-span-1">
                              <span className="font-bold-h4 text-text-strong group-hover:text-text-information transition-colors">
                                {ranker.rank}
                              </span>
                            </div>

                            <div className="col-span-6 flex items-center gap-300 md:col-span-5">
                              <UserAvatar
                                image={ranker.profileImage || undefined}
                                alt={ranker.nickname}
                                size={48}
                              />
                              <div className="flex min-w-0 flex-col gap-50">
                                <div className="font-designer-18b text-text-strong group-hover:text-text-information truncate transition-colors">
                                  {ranker.nickname}
                                </div>
                                <div className="font-designer-14r text-text-subtle truncate">
                                  {ranker.major}
                                </div>
                              </div>
                            </div>

                            <div className="col-span-4 flex flex-col items-end justify-center text-right md:col-span-3">
                              <div className="font-designer-20b text-text-strong">
                                {ranker.scoreLabel}
                              </div>
                              <div className="font-designer-12b text-text-information bg-fill-information-subtle-default mt-50 inline-block rounded-[9999px] px-150 py-50">
                                상위 1%
                              </div>
                            </div>

                            <div className="font-designer-14r text-text-subtle flex hidden flex-col items-end justify-center text-right md:col-span-3 md:block">
                              <div className="text-text-default font-medium">
                                {ranker.studyTime} 누적
                              </div>
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
                {viewMode === 'GRID' ? (
                  /* Grid View */
                  <div className="grid grid-cols-1 gap-300 md:grid-cols-2">
                    {currentLibrary.length > 0 ? (
                      currentLibrary.map((item) => (
                        <LibraryCard
                          key={item.id}
                          item={item}
                          onLike={handleLike}
                          onView={handleView}
                        />
                      ))
                    ) : (
                      <div className="text-text-subtlest col-span-full flex flex-col items-center gap-200 py-800 text-center">
                        <Search className="h-10 w-10 opacity-20" />
                        <p className="font-designer-16m">
                          검색 결과가 없습니다.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* List View (Compact Rows) */
                  <div className="bg-background-default rounded-200 border-border-subtle overflow-hidden border">
                    {currentLibrary.length > 0 ? (
                      <div className="divide-border-subtlest divide-y">
                        {currentLibrary.map((item) => (
                          <LibraryRow
                            key={item.id}
                            item={item}
                            onLike={handleLike}
                            onView={handleView}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-text-subtlest flex flex-col items-center gap-200 py-800 text-center">
                        <Search className="h-10 w-10 opacity-20" />
                        <p className="font-designer-16m">
                          검색 결과가 없습니다.
                        </p>
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
                  className="border-border-subtle hover:bg-fill-neutral-subtle-hover text-text-subtle flex h-[40px] w-[40px] items-center justify-center rounded-[9999px] border transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-designer-15m text-text-subtle bg-background-default border-border-subtle flex h-[40px] items-center justify-center rounded-[9999px] border px-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="border-border-subtle hover:bg-fill-neutral-subtle-hover text-text-subtle flex h-[40px] w-[40px] items-center justify-center rounded-[9999px] border transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
