'use client';

import {
  Trophy,
  Flame,
  Crown,
  Users,
  FileText,
  Thermometer,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState, useMemo } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { useHallOfFameQuery } from '@/features/study/one-to-one/hall-of-fame/model/use-hall-of-fame-query';
import type {
  HallOfFameData,
  Ranker,
  MVPTeam,
} from '@/features/study/one-to-one/hall-of-fame/types';

// ----------------------------------------------------------------------
// Types & Constants
// ----------------------------------------------------------------------

type RankingType = 'ATTENDANCE' | 'STUDY_LOG' | 'SINCERITY';

interface RankerWithLabel extends Ranker {
  scoreLabel: string;
}

const TAB_CONFIG: Record<
  RankingType,
  { label: string; icon: React.ReactNode; unit: string; colorClass: string }
> = {
  ATTENDANCE: {
    label: '불꽃 출석왕',
    icon: <Flame className="h-4 w-4" />,
    unit: '회',
    colorClass: 'text-text-brand',
  },
  STUDY_LOG: {
    label: '열정 기록왕',
    icon: <FileText className="h-4 w-4" />,
    unit: '건',
    colorClass: 'text-text-information',
  },
  SINCERITY: {
    label: '성실 온도왕',
    icon: <Thermometer className="h-4 w-4" />,
    unit: '℃',
    colorClass: 'text-text-warning',
  },
};

/**
 * 랭커 데이터에 scoreLabel 추가
 */
const addScoreLabel = (ranker: Ranker, type: RankingType): RankerWithLabel => {
  let scoreLabel = '';

  if (type === 'ATTENDANCE') {
    scoreLabel = `${ranker.score}회`;
  } else if (type === 'STUDY_LOG') {
    scoreLabel = `${ranker.score}건`;
  } else {
    // SINCERITY
    scoreLabel = `${ranker.score}℃`;
  }

  return {
    ...ranker,
    scoreLabel,
  };
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

  if (rank > 3)
    return (
      <div className="font-bold-h3 text-text-subtle w-[36px] text-center">
        {rank}
      </div>
    );

  return (
    <div className="relative h-[48px] w-[36px] md:h-[60px] md:w-[45px]">
      <Image src={iconPath} alt={`${rank}위`} fill className="object-contain" />
    </div>
  );
};

const MVPTeamCard = ({
  team,
  className,
}: {
  team: MVPTeam;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'rounded-200 shadow-2 relative overflow-hidden border border-[#FFEBA4] bg-gradient-to-br from-[#FFF8E7] to-[#FFF] p-500',
        className,
      )}
    >
      <div className="absolute top-0 right-0 p-300 opacity-10">
        <Trophy className="text-text-warning h-[120px] w-[120px]" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-400 text-center">
        <div className="flex flex-col items-center gap-100">
          <span className="bg-fill-warning-subtle-default text-text-warning font-designer-12b border-border-warning-subtle rounded-[9999px] border px-150 py-50">
            {team.weekDate} MVP 팀
          </span>
          <h3 className="font-display-headings5 text-text-strong">
            최고의 스터디 메이트
          </h3>
        </div>

        <div className="flex items-center justify-center gap-300">
          {team.members.map((member, index) => (
            <React.Fragment key={member.userId}>
              <div className="group flex flex-col items-center gap-100">
                <UserProfileModal
                  memberId={member.userId}
                  trigger={
                    <div className="relative cursor-pointer transition-transform hover:-translate-y-50">
                      <ProfileAvatar
                        src={member.profileImage}
                        alt={member.nickname}
                        size="lg"
                        className="shadow-2 border-4 border-white"
                      />
                      <div className="border-border-subtle shadow-1 absolute -bottom-100 left-1/2 z-10 -translate-x-1/2 rounded-[9999px] border bg-white px-100 py-25 whitespace-nowrap">
                        <span className="font-designer-12b text-text-strong">
                          {member.nickname}
                        </span>
                      </div>
                    </div>
                  }
                />
              </div>
              {index === 0 && (
                <div className="text-text-warning font-display-headings4 opacity-50">
                  &
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="rounded-100 border-border-warning-subtle/30 mt-auto w-full border bg-white/60 p-300">
          <div className="mb-200 flex items-center gap-100">
            <Flame className="text-text-brand h-4 w-4" />
            <span className="font-designer-14b text-text-strong">
              이번 주 공유한 자료
            </span>
          </div>
          <div className="flex flex-col gap-100 text-left">
            {team.sharedLinks.map((link, i) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-designer-13r text-text-subtle hover:text-text-information flex items-center gap-100 truncate transition-all hover:underline"
              >
                <span className="bg-fill-neutral-subtle-default text-text-subtle flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px]">
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

const RankerListItem = ({ ranker }: { ranker: RankerWithLabel }) => {
  return (
    <UserProfileModal
      memberId={ranker.userId}
      trigger={
        <div className="group bg-background-default border-border-subtle rounded-150 shadow-1 hover:shadow-2 hover:border-border-default flex cursor-pointer items-center gap-300 border p-250 transition-all">
          <div className="flex w-[50px] shrink-0 items-center justify-center">
            <RankBadge rank={ranker.rank} />
          </div>

          <ProfileAvatar
            src={ranker.profileImage}
            alt={ranker.nickname}
            size="md"
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-100">
              <span className="font-designer-16b text-text-strong group-hover:text-text-brand truncate transition-colors">
                {ranker.nickname}
              </span>
              {ranker.rank === 1 && (
                <Crown
                  className="text-text-warning h-3 w-3"
                  fill="currentColor"
                />
              )}
            </div>
            <span className="font-designer-13r text-text-subtle truncate">
              {ranker.jobs && ranker.jobs.length > 0
                ? ranker.jobs
                    .map((job) => job.description || job.job || '')
                    .filter(Boolean)
                    .join(', ')
                : ranker.major}
            </span>
          </div>

          <div className="shrink-0 text-right">
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

interface HallOfFameTabClientProps {
  initialData?: HallOfFameData;
}

export default function HallOfFameTabClient({
  initialData,
}: HallOfFameTabClientProps) {
  const [rankingType, setRankingType] = useState<RankingType>('ATTENDANCE');
  const { data, isLoading, error } = useHallOfFameQuery({ initialData });

  // 랭킹 데이터 변환 및 scoreLabel 추가
  const allRankers = useMemo(() => {
    if (!data) {
      return {
        ATTENDANCE: [] as RankerWithLabel[],
        STUDY_LOG: [] as RankerWithLabel[],
        SINCERITY: [] as RankerWithLabel[],
      };
    }

    return {
      ATTENDANCE: data.rankings.attendanceRankings.map((r) =>
        addScoreLabel(r, 'ATTENDANCE'),
      ),
      STUDY_LOG: data.rankings.studyLogRankings.map((r) =>
        addScoreLabel(r, 'STUDY_LOG'),
      ),
      SINCERITY: data.rankings.sincerityRankings.map((r) =>
        addScoreLabel(r, 'SINCERITY'),
      ),
    };
  }, [data]);

  const currentRankers = allRankers[rankingType];
  const baseDate = data?.rankings.baseDate
    ? new Date(data.rankings.baseDate).toLocaleDateString('ko-KR')
    : new Date().toLocaleDateString('ko-KR');

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="text-text-subtle flex animate-pulse flex-col items-center gap-200">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="font-designer-14m">
            명예의 전당을 불러오고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="text-text-subtle flex flex-col items-center gap-200">
          <p className="font-designer-14m text-text-error">
            명예의 전당 정보를 불러오는 중 오류가 발생했습니다.
          </p>
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
          <Trophy className="text-text-warning h-6 w-6" fill="currentColor" />
        </h2>
        <div className="font-designer-16r text-text-subtle flex flex-col">
          <p>제로원을 빛낸 열정적인 멤버들과 최고의 유저들을 소개합니다.</p>
          <p>
            꾸준한 1:1 스터디를 통해 제로원 명예의 전당에 이름을 올려보세요!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-500 xl:grid-cols-2">
        {/* Section 1: Top 5 Rankers */}
        <div className="flex flex-col gap-300">
          <div className="flex flex-col items-start gap-150">
            <div className="flex items-center gap-100">
              <h3 className="font-display-headings6 text-text-strong flex items-center gap-100">
                <span className={TAB_CONFIG[rankingType].colorClass}>
                  {TAB_CONFIG[rankingType].icon}
                </span>
                {TAB_CONFIG[rankingType].label} TOP 5
              </h3>
              <span className="font-designer-13r text-text-subtlest mt-50">
                {baseDate} 기준
              </span>
            </div>

            <div className="bg-background-default rounded-200 border-border-subtle mb-100 flex w-fit flex-wrap gap-100 border p-100">
              {(Object.keys(TAB_CONFIG) as RankingType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setRankingType(type)}
                  className={cn(
                    'font-designer-14m rounded-100 flex items-center gap-50 px-200 py-100 whitespace-nowrap transition-all',
                    rankingType === type
                      ? 'bg-fill-neutral-strong-default text-text-inverse shadow-1'
                      : 'text-text-subtle hover:bg-fill-neutral-subtle-hover',
                  )}
                >
                  <span
                    className={cn(
                      rankingType !== type && TAB_CONFIG[type].colorClass,
                    )}
                  >
                    {TAB_CONFIG[type].icon}
                  </span>
                  {TAB_CONFIG[type].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-150">
            {currentRankers.length > 0 ? (
              currentRankers.map((ranker) => (
                <RankerListItem key={ranker.userId} ranker={ranker} />
              ))
            ) : (
              <div className="bg-background-default border-border-subtle rounded-200 flex h-[400px] items-center justify-center border">
                <p className="font-designer-14m text-text-subtle">
                  랭킹이 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: MVP Team */}
        <div className="flex flex-col gap-300">
          <h3 className="font-display-headings6 text-text-strong flex items-center gap-100">
            <Users className="text-text-information h-5 w-5" />
            저번 주 스터디 MVP 팀
          </h3>

          {data?.mvpTeam ? (
            <MVPTeamCard team={data.mvpTeam} className="flex-1" />
          ) : (
            <div className="bg-background-default border-border-subtle rounded-200 flex h-[400px] items-center justify-center border">
              <p className="font-designer-14m text-text-subtle">
                이번 주 MVP 팀이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
