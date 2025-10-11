'use client';

import Image from 'next/image';
import { useStudyDashboardQuery } from '@/features/my-page/model/use-update-user-profile-mutation';
import MyStudyCard from '@/widgets/my-study/my-study-card';

export default function MyStudy() {
  const { data: dashboard, isLoading, isError } = useStudyDashboardQuery();

  if (isLoading) return <div>로딩 중...</div>;
  if (isError || !dashboard) return <div>에러가 발생했습니다.</div>;

  return (
    <div className="flex flex-col gap-400">
      <div className="flex flex-col gap-200">
        <div className="flex items-center gap-75">
          <Image src="icons/file_icon.svg" alt="file" width={40} height={40} />
          <div className="font-designer-20b text-text-default">내 활동</div>
        </div>

        <div className="flex gap-200">
          <MyStudyCard
            title="총 참여"
            value={dashboard.studyActivity.totalParticipationDays}
          />
          <MyStudyCard
            title="연속 참여"
            value={dashboard.studyActivity.sequenceParticipationWeeks}
            unit="주"
          />
          <MyStudyCard
            title="완료"
            value={dashboard.studyActivity.completedStudyCount}
            unit="회"
          />
        </div>

        <div className="flex gap-200">
          <MyStudyCard
            title="최대 연속 참여"
            value={dashboard.studyActivity.maxSequenceParticipationWeeks}
            unit="주"
          />
          <MyStudyCard
            title="실패"
            value={dashboard.studyActivity.failureStudyCount}
            unit="회"
          />
        </div>
      </div>

      <div className="flex flex-col gap-200">
        <div className="flex items-center gap-75">
          <Image src="icons/graph_icon.svg" alt="file" width={32} height={24} />
          <div className="font-designer-20b text-text-default">성장 지표</div>
        </div>

        <div className="flex gap-200">
          <MyStudyCard
            title="스터디 완료율"
            value={dashboard.growthMetric.studyCompleteness}
            unit="%"
          />
          <MyStudyCard title="등급" value="S" unit="등급" />
          <MyStudyCard
            title="최대 연속 참여"
            value={dashboard.studyActivity.maxSequenceParticipationWeeks}
            unit="주"
          />
        </div>
      </div>
    </div>
  );
}
