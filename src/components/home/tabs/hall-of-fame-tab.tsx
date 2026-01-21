'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { 
  Trophy, 
  Flame, 
  FileText, 
  Thermometer, 
  Search, 
  Loader2,
  ChevronLeft,
  ChevronRight,
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

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function HallOfFameTab() {
  const [rankingType, setRankingType] = useState<RankingType>('ATTENDANCE');
  const [rankers, setRankers] = useState<Ranker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('');

  const ITEMS_PER_PAGE = 15;

  // Data Loading Simulation
  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1);

    const timer = setTimeout(() => {
      const data = Array.from({ length: 100 }, (_, i) => {
        return generateMockRankers(rankingType).map((r) => ({
          ...r,
          rank: r.rank + i * 20,
        }));
      })
        .flat()
        .map((item, index) => ({ ...item, rank: index + 1 }));
      setRankers(data);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [rankingType]);

  // Filtering Logic
  const filteredRankers = rankers.filter((r) => {
    const matchesSearch = r.nickname
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesJob = jobFilter ? r.major === jobFilter : true;
    return matchesSearch && matchesJob;
  });

  // Pagination Logic
  const totalItems = filteredRankers.length;
  const totalPages = Math.ceil(Math.max(0, totalItems - 3) / ITEMS_PER_PAGE);

  const currentRankers = filteredRankers
    .slice(3)
    .slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );

  return (
    <div className="flex flex-col gap-400">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
          명예의 전당
          <Flame className="w-8 h-8 text-text-brand" fill="currentColor" />
        </h2>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-300">
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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-300">
          <div className="flex flex-col md:flex-row gap-200 w-full md:w-auto items-start md:items-center">
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

            <div className="relative w-full md:w-[320px]">
              <input
                type="text"
                placeholder="닉네임 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-600 w-full rounded-100 border border-border-subtle bg-background-default pl-200 pr-500 font-designer-14m outline-none focus:border-border-default focus:ring-2 focus:ring-fill-neutral-default-default transition-all"
              />
              <span className="absolute right-200 top-1/2 -translate-y-1/2 text-text-subtlest">
                <Search className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-800 text-center text-text-subtlest flex flex-col items-center gap-200">
          <Loader2 className="w-8 h-8 animate-spin" />
          <div className="font-designer-16m">데이터를 불러오는 중입니다...</div>
        </div>
      ) : (
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
  );
}
