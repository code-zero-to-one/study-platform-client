'use client';

import { ChevronLeft, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useGetMissions } from '@/hooks/queries/mission-api';
import { MOCK_MISSION_LIST } from '@/mocks/group-study-mock-data';
import { useIsLeader } from '@/stores/useLeaderStore';
import { useUserStore } from '@/stores/useUserStore';
import MissionCard from '../card/mission-card';
import HomeworkDetailContent from '../contents/homework-detail-content';
import MissionDetailContent from '../contents/mission-detail-content';
import PageContainer from '../layout/page-container';
import CreateMissionModal from '../modals/create-mission-modal';
import { cn } from '../ui/(shadcn)/lib/utils';

type FilterType = 'all' | 'inProgress' | 'completed';

interface MissionSectionProps {
  groupStudyId: number;
  isMember?: boolean;
}

export default function MissionSection({
  groupStudyId,
  isMember = true,
}: MissionSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberId = useUserStore((state) => state.memberId);
  const isLeader = useIsLeader(memberId);
  const [filter, setFilter] = useState<FilterType>('all');

  const missionId = searchParams.get('missionId');
  const homeworkId = searchParams.get('homeworkId');
  const taskId = searchParams.get('taskId');

  const { data, isLoading } = useGetMissions({
    groupStudyId,
    enabled: isMember,
  });
  if (isLoading && isMember) {
    return null;
  }

  const missionList = isMember ? (data?.content ?? []) : MOCK_MISSION_LIST;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // endDate가 오늘 기준으로 지났으면 완료된 미션
  const completedMissions =
    missionList?.filter((mission) => {
      if (!mission.endDate) return false;
      const endDate = new Date(mission.endDate);

      return endDate < today;
    }) || [];

  // endDate가 오늘 이후이면 진행 중인 미션
  const inProgressMissions =
    missionList?.filter((mission) => {
      if (!mission.endDate) return true;
      const endDate = new Date(mission.endDate);

      return endDate >= today;
    }) || [];

  const hasMissions = missionList && missionList.length > 0;

  const getFilteredMissions = () => {
    switch (filter) {
      case 'inProgress':
        return inProgressMissions;
      case 'completed':
        return completedMissions;
      default:
        return missionList || [];
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
    if (taskId) {
      params.delete('taskId');
    } else if (homeworkId) {
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
          onClick={handleBack}
          className="text-text-default font-designer-16b flex w-fit items-center gap-50"
        >
          <ChevronLeft size={20} />
          과제 상세
        </button>

        <HomeworkDetailContent
          groupStudyId={groupStudyId}
          missionId={Number(missionId)}
          homeworkId={Number(homeworkId)}
        />
      </PageContainer>
    );
  }

  // 과제 상세 보기 (legacy - taskId)
  if (missionId && taskId) {
    return (
      <section className="flex flex-col gap-300">
        <button
          onClick={handleBack}
          className="text-text-default font-designer-16b flex w-fit items-center gap-50"
        >
          <ChevronLeft size={20} />
          과제 상세
        </button>

        {/* TODO: TaskDetail 컴포넌트 추가 */}
        <div>
          과제 상세 (missionId: {missionId}, taskId: {taskId})
        </div>
      </section>
    );
  }

  // 미션 상세 보기
  if (missionId) {
    // 비회원인 경우: 1주차 OT(order=1 또는 missionId=1)만 공개
    if (!isMember) {
      const numericMissionId = Number(missionId);
      const selectedMission = MOCK_MISSION_LIST.find(
        (m) => m.missionId === numericMissionId,
      );

      // 1주차 OT 체크: weekNum이 1이거나 missionId가 1이면 OT로 간주
      const isOTMission =
        selectedMission?.weekNum === 1 || numericMissionId === 1;

      // 1주차(OT)가 아니면 접근 차단 - 미션 목록으로 되돌림
      if (!isOTMission) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('missionId');
        router.replace(`?${params.toString()}`);

        return null;
      }
    }

    return (
      <PageContainer className="flex flex-col gap-300 py-500">
        <button
          onClick={handleBack}
          className="text-text-default font-designer-16b flex w-fit items-center gap-50"
        >
          <ChevronLeft size={20} />
          미션 상세
        </button>

        {isMember ? (
          <MissionDetailContent
            groupStudyId={groupStudyId}
            missionId={Number(missionId)}
          />
        ) : (
          <MissionDetailPublicView
            groupStudyId={groupStudyId}
            missionId={Number(missionId)}
          />
        )}
      </PageContainer>
    );
  }

  // 미션 목록 (기본)
  return (
    <section className="bg-background-alternative flex h-full w-full flex-col gap-300">
      <div className="m-auto my-500 w-[1164px]">
        <div className="flex items-center justify-between">
          <span className="font-designer-20b text-text-default">미션 목록</span>
          {isLeader && <CreateMissionModal groupStudyId={groupStudyId} />}
        </div>

        <MissionFilterTabs
          filter={filter}
          onFilterChange={setFilter}
          totalCount={missionList?.length || 0}
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
                showDeadline={
                  mission.status === 'IN_PROGRESS' ||
                  mission.status === 'NOT_STARTED'
                }
              />
            ))}
          </ul>
        ) : (
          <EmptyMissionState />
        )}
      </div>
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

/**
 * 비회원용 1주차 OT 미션 공개 뷰 (blur/lock 없음)
 */
function MissionDetailPublicView({
  groupStudyId,
  missionId,
}: {
  groupStudyId: number;
  missionId: number;
}) {
  const submittedCount = 2;
  const totalCount = 10;
  const progressPercentage = (submittedCount / totalCount) * 100;

  return (
    <div className="rounded-200 bg-background-default flex min-h-[360px] flex-col gap-400 p-400">
      {/* 제목 + 한줄소개 + 기간 + 본문을 하나의 border 카드로 묶기 */}
      <div className="border-border-subtle rounded-100 flex flex-col gap-0 border">
        {/* 제목 / 한줄소개 / 기간 */}
        <div className="border-border-subtle flex flex-col gap-200 border-b p-400">
          <span className="font-designer-18b text-text-default">
            1주차 미션: [OT] UX 심리학 개념 찍먹해보기
          </span>
          <p className="text-text-subtle font-designer-14r">
            UX 심리학의 기본 개념을 이해하고 실제 사례에 적용해보는 입문
            미션입니다.
          </p>
          <p className="text-text-subtlest font-designer-14r">
            제출 기간 : 2026-02-05 - 2026-02-08
          </p>
        </div>

        {/* 본문 내용 */}
        <div className="p-400">
          <div className="bg-background-alternative rounded-100 p-300 whitespace-pre-wrap">
            <p className="text-text-default font-designer-14r">
              https://example.com/ux-psychology
              {'\n\n'}
              카드뉴스 형식 아티클입니다.
              {'\n'}본 스터디 대표이미지가 포함되어 있는 글입니다.
              {'\n\n'}
              가볍게 인사이트 나누어봐요~~
            </p>
          </div>
        </div>
      </div>

      {/* 제출 현황 */}
      <div className="flex flex-col gap-300">
        {/* 제출 현황 헤더 + 제출 수 + Progress Bar */}
        <div className="flex items-center justify-between">
          <span className="font-designer-18b text-text-default">제출 현황</span>
          <div className="flex items-center gap-200">
            <span className="text-text-subtlest font-designer-14r">
              {submittedCount}/{totalCount} 제출
            </span>
            <div className="relative h-[8px] w-[120px] overflow-hidden rounded-full bg-gray-200">
              <div
                className="bg-fill-danger-default-default absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 참가자 그리드 */}
        <div className="grid grid-cols-3 gap-200">
          {[
            { name: 'djyun', status: '미제출', submitted: false },
            { name: '성효빈', status: '미제출', submitted: false },
            { name: '박경도', status: '제출 완료', submitted: true },
            { name: '하승', status: '제출 완료', submitted: true },
            { name: '제로원', status: '미제출', submitted: false },
            { name: '백지안', status: '미제출', submitted: false },
            { name: 'GUUI', status: '미제출', submitted: false },
            { name: '김대연', status: '미제출', submitted: false },
            { name: '김민규', status: '미제출', submitted: false },
            { name: '박잰', status: '미제출', submitted: false },
          ].map((item) => (
            <div
              key={item.name}
              className="border-border-subtle rounded-100 flex items-center justify-between border p-200"
            >
              <div className="flex items-center gap-150">
                <img
                  src="/profile-default.svg"
                  alt={item.name}
                  className="h-400 w-400 rounded-full"
                />
                <span className="font-designer-14b text-text-default">
                  {item.name}
                </span>
              </div>
              <span
                className={`font-designer-12r rounded-50 px-100 py-50 ${
                  item.submitted
                    ? 'bg-fill-success-subtle-default text-text-success'
                    : 'bg-fill-neutral-subtle-default text-text-subtlest'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
