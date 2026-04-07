'use client';

import { ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useGetMissions } from '@/hooks/queries/mission-api';
import MissionCard from '../card/mission-card';
import PageContainer from '../common/layout/page-container';
import { cn } from '../common/ui/(shadcn)/lib/utils';
import HomeworkDetailContent from '../contents/homework-detail-content';
import MissionDetailContent from '../contents/mission-detail-content';

const CreateMissionModal = dynamic(
  () => import('@/components/common/modals/create-mission-modal'),
  { ssr: false },
);

const LoginModal = dynamic(
  () => import('@/components/common/modals/login-modal'),
  { ssr: false },
);

const PhoneVerificationModal = dynamic(
  () => import('@/components/common/modals/phone-verification-modal'),
  { ssr: false },
);

type FilterType = 'all' | 'inProgress' | 'completed';

interface MissionSectionProps {
  groupStudyId: number;
  isMember?: boolean;
  isLeader?: boolean;
  showMyHomework?: boolean;
}

const FIRST_WEEK = 1;

export default function MissionSection({
  groupStudyId,
  isMember,
  isLeader: isLeaderProp,
  showMyHomework,
}: MissionSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<FilterType>('all');
  const { isAuthenticated, isHydrated } = useAuthReady();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const loginTriggerRef = useRef<HTMLButtonElement>(null);

  const missionId = searchParams.get('missionId');
  const homeworkId = searchParams.get('homeworkId');

  const { data, isLoading } = useGetMissions({
    groupStudyId,
  });
  if (isLoading) {
    return null;
  }

  const missionList = data.content;

  const canAccessAll = isMember || isLeaderProp;
  // 비가입자도 전체 주차 목록을 보여주되, 2주차+ 카드에 잠금 UI 적용
  const visibleMissionList = missionList ?? [];

  const handleLockedClick = () => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      loginTriggerRef.current?.click();
    } else {
      setIsPhoneModalOpen(true);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // endDate가 오늘 기준으로 지났으면 완료된 미션
  const completedMissions =
    visibleMissionList?.filter((mission) => {
      if (!mission.endDate) return false;
      const endDate = new Date(mission.endDate);

      return endDate < today;
    }) || [];

  // endDate가 오늘 이후이면 진행 중인 미션
  const inProgressMissions =
    visibleMissionList?.filter((mission) => {
      if (!mission.endDate) return true;
      const endDate = new Date(mission.endDate);

      return endDate >= today;
    }) || [];

  const hasMissions = visibleMissionList && visibleMissionList.length > 0;

  const getFilteredMissions = () => {
    switch (filter) {
      case 'inProgress':
        return inProgressMissions;
      case 'completed':
        return completedMissions;
      default:
        return visibleMissionList || [];
    }
  };

  const filteredMissions = getFilteredMissions();

  const handleSelectMission = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('missionId', String(id));
    router.push(`?${params.toString()}`);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (homeworkId) {
      params.delete('homeworkId');
    } else if (missionId) {
      params.delete('missionId');
    }
    router.push(`?${params.toString()}`);
  };

  // 과제(homework) 상세 보기
  if (missionId && homeworkId) {
    return (
      <PageContainer className="my-500 flex flex-col gap-300">
        <button
          type="button"
          onClick={handleBack}
          className="text-text-default font-designer-16b flex w-fit items-center gap-50"
        >
          <ChevronLeft size={20} />
          과제 상세
        </button>

        <HomeworkDetailContent
          missionId={Number(missionId)}
          homeworkId={Number(homeworkId)}
        />
      </PageContainer>
    );
  }

  // 미션 상세 보기
  if (missionId) {
    return (
      <PageContainer className="flex flex-col gap-300 py-500">
        <button
          type="button"
          onClick={handleBack}
          className="text-text-default font-designer-16b flex w-fit items-center gap-50"
        >
          <ChevronLeft size={20} />
          미션 상세
        </button>

        <MissionDetailContent
          missionId={Number(missionId)}
          showMyHomework={!!canAccessAll}
        />
      </PageContainer>
    );
  }

  // 미션 목록 (기본)
  return (
    <section className="bg-background-alternative flex h-full w-full flex-col gap-300">
      <div className="m-auto my-500 w-[1164px]">
        <div className="flex items-center justify-between">
          <span className="font-designer-20b text-text-default">미션 목록</span>
          {isLeaderProp && <CreateMissionModal groupStudyId={groupStudyId} />}
        </div>

        <MissionFilterTabs
          filter={filter}
          onFilterChange={setFilter}
          totalCount={visibleMissionList?.length || 0}
          inProgressCount={inProgressMissions.length}
          completedCount={completedMissions.length}
        />

        {hasMissions ? (
          <ul className="flex flex-col gap-200">
            {filteredMissions.map((mission) => (
              <MissionCard
                key={mission.missionId}
                mission={mission}
                groupStudyId={groupStudyId}
                onSelectMission={handleSelectMission}
                isMember={canAccessAll}
                isLeader={isLeaderProp}
                showDeadline={
                  mission.status === 'IN_PROGRESS' ||
                  mission.status === 'NOT_STARTED'
                }
                isLocked={!canAccessAll && (mission.weekNum ?? 1) > FIRST_WEEK}
                onLockedClick={handleLockedClick}
              />
            ))}
          </ul>
        ) : (
          <EmptyMissionState />
        )}
      </div>

      <LoginModal
        openTrigger={
          <button
            type="button"
            ref={loginTriggerRef}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          />
        }
      />
      <PhoneVerificationModal
        open={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
      />
    </section>
  );
}

function MissionFilterTabs({
  filter,
  onFilterChange,
  totalCount,
  inProgressCount,
  completedCount,
}: {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  totalCount: number;
  inProgressCount: number;
  completedCount: number;
}) {
  const tabs = [
    { key: 'all' as const, label: '전체', count: totalCount },
    { key: 'inProgress' as const, label: '진행중', count: inProgressCount },
    { key: 'completed' as const, label: '완료', count: completedCount },
  ];

  return (
    <div className="mt-400 mb-200 flex gap-100">
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={cn(
            'font-designer-14b rounded-full px-200 py-100 transition-colors',
            filter === tab.key
              ? 'bg-fill-neutral-strong-default text-text-inverse'
              : 'bg-fill-neutral-subtle-default text-text-default border-border-default border',
          )}
        >
          {tab.label} {tab.count}
        </button>
      ))}
    </div>
  );
}

function EmptyMissionState() {
  return (
    <div className="bg-background-alternative rounded-100 flex h-[400px] flex-col items-center justify-center gap-200">
      <p className="text-text-subtle font-designer-14r text-center">
        생성된 미션이 없습니다.
        <br />
        최소 1개 이상의 미션을 생성해 주세요.
      </p>
    </div>
  );
}
