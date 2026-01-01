'use client';

import { ChevronLeft, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { MissionListResponse } from '@/api/openapi/models';
import Button from '@/components/ui/button';
import HomeworkDetailContent from './homework-detail-content';
import MissionCard from './mission-card';
import MissionDetailContent from './mission-detail-content';

// 목 데이터
const MOCK_MISSIONS: MissionListResponse[] = [
  {
    id: 1,
    title: '1주차 과제 제출',
    status: 'IN_PROGRESS',
    startTime: '2026-01-01T00:00:00',
    endTime: '2026-01-07T23:59:59',
  },
  {
    id: 2,
    title: '2주차 과제 제출',
    status: 'SCHEDULED',
    startTime: '2026-01-08T00:00:00',
    endTime: '2026-01-14T23:59:59',
  },
  {
    id: 3,
    title: '킥오프 미팅 참석 인증',
    status: 'SUBMISSION_CLOSED',
    startTime: '2025-12-20T00:00:00',
    endTime: '2025-12-25T23:59:59',
  },
  {
    id: 4,
    title: '자기소개 작성하기',
    status: 'SUBMISSION_CLOSED',
    startTime: '2025-12-15T00:00:00',
    endTime: '2025-12-19T23:59:59',
  },
];

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
  // const { data: missions, isLoading } = useGetMissions({
  //   groupStudyId,
  // });
  // if (isLoading) {
  //   return null;
  // }

  // 목 데이터 사용
  const missions = MOCK_MISSIONS;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // endTime이 오늘 기준으로 지났으면 완료된 미션
  const completedMissions =
    missions?.filter((mission) => {
      if (!mission.endTime) return false;
      const endDate = new Date(mission.endTime);

      return endDate < today;
    }) || [];

  // endTime이 오늘 이후이면 진행 중인 미션
  const inProgressMissions =
    missions?.filter((mission) => {
      if (!mission.endTime) return true;
      const endDate = new Date(mission.endTime);

      return endDate >= today;
    }) || [];

  const hasMissions = missions && missions.length > 0;

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
        <div>과제 상세 (missionId: {missionId}, taskId: {taskId})</div>
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
        {isLeader && (
          <Button
            color="primary"
            size="medium"
            className="font-designer-16b"
            icon={<Plus />}
          >
            새 미션 만들기
          </Button>
        )}
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
            key={mission.id}
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
      <Image
        src="/images/default-thumbnail.svg"
        alt="no-mission"
        width={120}
        height={120}
      />
      <p className="text-text-subtlest font-designer-14r text-center">
        생성된 미션이 없습니다.
        <br />
        최소 1개 이상의 미션을 생성해 주세요.
      </p>
    </div>
  );
}
