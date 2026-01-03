'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MissionListResponse } from '@/api/openapi/models';
import { useGetMissions } from '@/hooks/queries/mission-api';
import HomeworkDetailContent from './homework-detail-content';
import MissionCard from './mission-card';
import MissionDetailContent from './mission-detail-content';
import CreateMissionModal from '../modals/create-mission-modal';

interface MissionSectionProps {
  groupStudyId: number;
  isLeader: boolean;
}

export default function MissionSection({
  groupStudyId,
  isLeader,
}: MissionSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const missionId = searchParams.get('missionId');
  const homeworkId = searchParams.get('homeworkId');
  const taskId = searchParams.get('taskId');

  // TODO: API 연결 시 주석 해제
  const { data, isLoading } = useGetMissions({
    groupStudyId,
  });
  if (isLoading) {
    return null;
  }

  const missionList = data.content;

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
      <section className="flex flex-col gap-300">
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
          isLeader={isLeader}
        />
      </section>
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
    return (
      <section className="flex flex-col gap-300">
        <button
          onClick={handleBack}
          className="text-text-default font-designer-16b flex w-fit items-center gap-50"
        >
          <ChevronLeft size={20} />
          미션 상세
        </button>

        <MissionDetailContent
          groupStudyId={groupStudyId}
          missionId={Number(missionId)}
          isLeader={isLeader}
        />
      </section>
    );
  }

  // 미션 목록 (기본)
  return (
    <section className="flex flex-col gap-300">
      <div className="flex items-center justify-between">
        <span className="font-designer-20b text-text-default">미션 목록</span>
        {isLeader && <CreateMissionModal groupStudyId={groupStudyId} />}
      </div>

      {hasMissions ? (
        <div className="flex flex-col gap-400">
          {inProgressMissions.length > 0 && (
            <MissionList
              title="진행 중인 미션"
              missions={inProgressMissions}
              isLeader={isLeader}
              onSelectMission={handleSelectMission}
            />
          )}
          {completedMissions.length > 0 && (
            <MissionList
              title="완료된 미션"
              missions={completedMissions}
              isLeader={isLeader}
              onSelectMission={handleSelectMission}
            />
          )}
        </div>
      ) : (
        <EmptyMissionState />
      )}
    </section>
  );
}

function MissionList({
  title,
  missions,
  isLeader,
  onSelectMission,
}: {
  title: string;
  missions: MissionListResponse[];
  isLeader?: boolean;
  onSelectMission: (missionId: number) => void;
}) {
  return (
    <div className="flex flex-col gap-200">
      <span className="text-text-subtlest font-designer-14b">
        {title} {missions.length}
      </span>
      <ul className="flex flex-col gap-200">
        {missions.map((mission) => (
          <MissionCard
            key={mission.missionId}
            mission={mission}
            isLeader={isLeader}
            onSelectMission={onSelectMission}
          />
        ))}
      </ul>
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
