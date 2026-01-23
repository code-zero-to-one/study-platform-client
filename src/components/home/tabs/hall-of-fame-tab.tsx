'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { Trophy, Flame, Crown, Users, FileText, Thermometer } from 'lucide-react';

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
  major: string;
}

interface MVPTeam {
  id: number;
  members: [
    { userId: number; nickname: string; profileImage: string | null },
    { userId: number; nickname: string; profileImage: string | null },
  ];
  sharedLinks: { title: string; url: string }[];
  weekDate: string;
}

const JOBS = [
  'IT 노베이스 - 비지니스/창업',
  'IT 노베이스 - 업무 자동화',
  'IT 노베이스 - 내 서비스 개발',
  'IT 실무자 - PM/PO/기획',
  'IT 실무자 - 프론트엔드',
  'IT 실무자 - 백엔드',
];

const TAB_CONFIG: Record<
  RankingType,
  { label: string; icon: React.ReactNode; unit: string; colorClass: string }
> = {
  ATTENDANCE: {
    label: '불꽃 출석왕',
    icon: <Flame className="w-4 h-4" />,
    unit: '회',
    colorClass: 'text-text-brand',
  },
  STUDY_LOG: {
    label: '열정 기록왕',
    icon: <FileText className="w-4 h-4" />,
    unit: '건',
    colorClass: 'text-text-information',
  },
  SINCERITY: {
    label: '성실 온도왕',
    icon: <Thermometer className="w-4 h-4" />,
    unit: '℃',
    colorClass: 'text-text-warning',
  },
};

// Mock Data Generators
const generateMockTop5 = (type: RankingType): Ranker[] => {
  return Array.from({ length: 5 }, (_, i) => {
    let score = 0;
    let scoreLabel = '';

    if (type === 'ATTENDANCE') {
      score = 150 - i * 12;
      scoreLabel = `${score}회`;
    } else if (type === 'STUDY_LOG') {
      score = 85 - i * 5;
      scoreLabel = `${score}건`;
    } else {
      score = parseFloat((99.5 - i * 0.5).toFixed(1));
      scoreLabel = `${score}℃`;
    }

    return {
      rank: i + 1,
      userId: 100 + i,
      nickname: `User_${100 + i}`,
      profileImage: null as string | null,
      score,
      scoreLabel,
      change: Math.random() > 0.7 ? 'up' : 'same',
      lastActive: i < 2 ? '방금 전' : `${i * 10 + 5}분 전`,
      major: JOBS[i % JOBS.length],
    };
  });
};

const generateMockMVPTeam = (): MVPTeam => ({
  id: 1,
  members: [
    { userId: 201, nickname: '새벽코딩', profileImage: null },
    { userId: 202, nickname: '알고리즘마스터', profileImage: null },
  ],
  sharedLinks: [
    { title: 'useEffect 완벽 가이드', url: '#' },
    { title: 'Next.js 13 App Router 마이그레이션 후기', url: '#' },
    { title: '프론트엔드 성능 최적화 팁 5가지', url: '#' },
    { title: '타입스크립트 제네릭 활용하기', url: '#' },
    { title: '리액트 상태관리 라이브러리 비교', url: '#' },
  ],
  weekDate: '1월 3주차',
});

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

  if (rank > 3) return <div className="font-bold-h3 text-text-subtle w-[36px] text-center">{rank}</div>;

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

const MVPTeamCard = ({ team }: { team: MVPTeam }) => {
  return (
    <div className="relative overflow-hidden rounded-200 bg-gradient-to-br from-[#FFF8E7] to-[#FFF] border border-[#FFEBA4] p-500 shadow-2">
      <div className="absolute top-0 right-0 p-300 opacity-10">
        <Trophy className="w-[120px] h-[120px] text-text-warning" />
      </div>
      
      <div className="relative z-10 flex flex-col gap-400 items-center justify-center text-center">
        <div className="flex flex-col items-center gap-100">
           <span className="px-150 py-50 rounded-[9999px] bg-fill-warning-subtle-default text-text-warning font-designer-12b border border-border-warning-subtle">
             {team.weekDate} MVP 팀
           </span>
           <h3 className="font-display-headings5 text-text-strong">
             최고의 스터디 메이트
           </h3>
        </div>

        <div className="flex items-center justify-center gap-300">
          {team.members.map((member, index) => (
            <React.Fragment key={member.userId}>
              <div className="flex flex-col items-center gap-100 group">
                <UserProfileModal
                  memberId={member.userId}
                  trigger={
                    <div className="relative cursor-pointer transition-transform hover:-translate-y-50">
                       <ProfileAvatar 
                         src={member.profileImage} 
                         alt={member.nickname} 
                         size="lg" 
                         className="border-4 border-white shadow-2"
                       />
                       <div className="absolute -bottom-100 left-1/2 -translate-x-1/2 bg-white px-100 py-25 rounded-[9999px] border border-border-subtle shadow-1 whitespace-nowrap z-10">
                         <span className="font-designer-12b text-text-strong">{member.nickname}</span>
                       </div>
                    </div>
                  }
                />
              </div>
              {index === 0 && (
                <div className="text-text-warning font-display-headings4 opacity-50">&</div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="w-full bg-white/60 rounded-100 border border-border-warning-subtle/30 p-300 mt-200">
          <div className="flex items-center gap-100 mb-200">
            <Flame className="w-4 h-4 text-text-brand" />
            <span className="font-designer-14b text-text-strong">이번 주 공유한 자료</span>
          </div>
          <div className="flex flex-col gap-100 text-left">
            {team.sharedLinks.map((link, i) => (
              <a 
                key={i} 
                href={link.url} 
                className="flex items-center gap-100 font-designer-13r text-text-subtle hover:text-text-information hover:underline transition-all truncate"
              >
                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-fill-neutral-subtle-default text-[10px] text-text-subtle shrink-0">
                  {i + 1}
                </span>
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RankerListItem = ({ ranker }: { ranker: Ranker }) => {
  return (
    <UserProfileModal
      memberId={ranker.userId}
      trigger={
        <div className="group flex items-center gap-300 p-250 bg-background-default border border-border-subtle rounded-150 shadow-1 hover:shadow-2 hover:border-border-default transition-all cursor-pointer">
          <div className="flex items-center justify-center w-[50px] shrink-0">
            <RankBadge rank={ranker.rank} />
          </div>
          
          <ProfileAvatar src={ranker.profileImage} alt={ranker.nickname} size="md" />
          
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-100">
              <span className="font-designer-16b text-text-strong truncate group-hover:text-text-brand transition-colors">
                {ranker.nickname}
              </span>
              {ranker.rank === 1 && <Crown className="w-3 h-3 text-text-warning" fill="currentColor" />}
            </div>
            <span className="font-designer-13r text-text-subtle truncate">
              {ranker.major}
            </span>
          </div>

          <div className="text-right shrink-0">
            <div className="font-bold-h5 text-text-strong">
              {ranker.scoreLabel}
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
  const [allRankers, setAllRankers] = useState<Record<RankingType, Ranker[]>>({
    ATTENDANCE: [],
    STUDY_LOG: [],
    SINCERITY: [],
  });
  const [mvpTeam, setMvpTeam] = useState<MVPTeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600)); // Delay
      
      setAllRankers({
        ATTENDANCE: generateMockTop5('ATTENDANCE'),
        STUDY_LOG: generateMockTop5('STUDY_LOG'),
        SINCERITY: generateMockTop5('SINCERITY'),
      });
      setMvpTeam(generateMockMVPTeam());
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const currentRankers = allRankers[rankingType];

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-200 text-text-subtle">
           <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin" />
           <p className="font-designer-14m">명예의 전당을 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-600">
      {/* Header */}
      <div className="flex flex-col gap-100">
        <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
          명예의 전당
          <Trophy className="w-6 h-6 text-text-warning" fill="currentColor" />
        </h2>
        <p className="font-designer-16r text-text-subtle">
          제로원을 빛낸 열정적인 멤버들과 최고의 팀을 소개합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-500">
        {/* Section 1: Top 5 Rankers */}
        <div className="flex flex-col gap-300">
          <div className="flex flex-col gap-150 items-start">
             <div className="flex items-center gap-100">
               <h3 className="font-display-headings6 text-text-strong flex items-center gap-100">
                 <span className={TAB_CONFIG[rankingType].colorClass}>
                   {TAB_CONFIG[rankingType].icon}
                 </span>
                 {TAB_CONFIG[rankingType].label} TOP 5
               </h3>
               <span className="font-designer-13r text-text-subtlest mt-50">
                 {new Date().toLocaleDateString()} 기준
               </span>
             </div>

             <div className="flex flex-wrap gap-100 p-100 bg-background-default rounded-200 border border-border-subtle w-fit mb-100">
               {(Object.keys(TAB_CONFIG) as RankingType[]).map((type) => (
                 <button
                   key={type}
                   onClick={() => setRankingType(type)}
                   className={cn(
                     'px-200 py-100 font-designer-14m rounded-100 transition-all whitespace-nowrap flex items-center gap-50',
                     rankingType === type
                       ? 'bg-fill-neutral-strong-default text-text-inverse shadow-1'
                       : 'text-text-subtle hover:bg-fill-neutral-subtle-hover',
                   )}
                 >
                   <span className={cn(rankingType !== type && TAB_CONFIG[type].colorClass)}>
                     {TAB_CONFIG[type].icon}
                   </span>
                   {TAB_CONFIG[type].label}
                 </button>
               ))}
             </div>
          </div>
          
          <div className="flex flex-col gap-150">
            {currentRankers.map((ranker) => (
              <RankerListItem key={ranker.userId} ranker={ranker} />
            ))}
          </div>
        </div>

        {/* Section 2: MVP Team */}
        <div className="flex flex-col gap-300">
          <h3 className="font-display-headings6 text-text-strong flex items-center gap-100">
             <Users className="w-5 h-5 text-text-information" />
             저번 주 스터디 MVP 팀
          </h3>
          {mvpTeam && <MVPTeamCard team={mvpTeam} />}
          
          {/* Motivation Card / Info */}
          <div className="flex-1 bg-fill-neutral-default-default rounded-200 p-400 border border-border-subtle flex flex-col justify-center items-center text-center gap-200">
            <h4 className="font-designer-18b text-text-strong">
              랭킹에 도전해보세요!
            </h4>
            <p className="font-designer-14r text-text-subtle max-w-[300px]">
              꾸준한 1:1 스터디와 열정적인 팀 활동으로<br/>
              제로원 명예의 전당에 이름을 올릴 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
