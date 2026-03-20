'use client';

import { useState } from 'react';
import Pagination from '@/components/common/ui/pagination';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useMemberStudyListQuery } from '@/hooks/queries/use-member-study-list-query';
import StudyReviewTabNav from '../_components/study-review-tab-nav';
import EvaluationSection from '../group/[groupStudyId]/_components/evaluation-section';
import MemberStudyCard from '../group/_components/member-study-card';

const studyTypeName = '1:1스터디';
const reviewSubtitle = '모든 후기는 나에게만 보여요';

export default function OneToOneReviewPage() {
  const [page, setPage] = useState(1);
  const { memberId } = useAuthReady();

  const { data: completedOneOnOneStudy } = useMemberStudyListQuery({
    memberId: memberId ?? 0,
    studyType: 'ONE_ON_ONE_STUDY',
    studyStatus: 'COMPLETED',
    completedPage: page,
    completedPageSize: 6,
  });

  const completedStudies = completedOneOnOneStudy?.completed.content ?? [];

  return (
    <div className="flex flex-col gap-400">
      <StudyReviewTabNav />

      {completedStudies.length === 0 ? (
        <div className="flex flex-col gap-400">
          <EvaluationSection studyTypeName={studyTypeName} />
          <div className="flex flex-col gap-200">
            <div className="flex items-center gap-100">
              <h2 className="font-designer-20b text-text-default">후기</h2>
              <span className="font-designer-20b text-text-default">
                {completedStudies.length}
              </span>
            </div>
            <span className="font-designer-14r text-text-subtle">
              {reviewSubtitle}
            </span>
            <div className="text-text-subtle font-designer-14r flex h-[200px] items-center justify-center text-center">
              아직까지 받은 후기가 없습니다.
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-400">
          <ul className="grid grid-cols-1 gap-300 sm:grid-cols-2 lg:grid-cols-3">
            {completedStudies.map((study, index) => (
              <MemberStudyCard
                key={study.studyId ?? index}
                study={study}
                basePath="/my-study-review/one-to-one"
                disableLeaderGuard
              />
            ))}
          </ul>
          <Pagination
            page={page}
            onChangePage={setPage}
            totalPages={completedOneOnOneStudy?.completed.totalPages ?? 1}
          />
        </div>
      )}
    </div>
  );
}
