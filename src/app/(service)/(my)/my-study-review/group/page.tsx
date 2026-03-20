'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import type {
  GroupStudyBasicInfoResponseDto,
  GroupStudyDetailInfoResponseDto,
} from '@/api/openapi';
import GroupStudyReviewModal from '@/components/common/modals/group-study-review-modal';
import Pagination from '@/components/common/ui/pagination';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useMemberStudyListQuery } from '@/hooks/queries/use-member-study-list-query';
import type { MemberStudyItem } from '@/types/api/group-study.types';
import StudyReviewTabNav from '../_components/study-review-tab-nav';
import MemberStudyCard from './_components/member-study-card';

export default function GroupStudyReviewListPage() {
  const [page, setPage] = useState(1);
  const [reviewStudy, setReviewStudy] = useState<MemberStudyItem | null>(null);
  const { memberId } = useAuthReady();

  const { data: completedGroupStudy } = useMemberStudyListQuery({
    memberId: memberId ?? 0,
    studyType: 'GROUP_STUDY',
    studyStatus: 'COMPLETED',
    completedPage: page,
    completedPageSize: 9,
  });

  const completedGroupStudies = completedGroupStudy?.completed.content ?? [];

  return (
    <div className="flex flex-col gap-400">
      <StudyReviewTabNav />

      <div className="flex flex-col gap-400">
        {completedGroupStudies.length === 0 ? (
          <div className="flex items-center justify-center py-600">
            <span className="font-designer-15r text-text-subtlest">
              아직 받은 그룹스터디 후기가 없습니다.
            </span>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-300 sm:grid-cols-2 lg:grid-cols-3">
            {completedGroupStudies.map((study, index) => (
              <MemberStudyCard
                key={study.studyId ?? index}
                study={study}
                basePath="/my-study-review/group"
                onMemberClick={
                  study.studyRole === 'PARTICIPANT' ? setReviewStudy : undefined
                }
              />
            ))}
          </ul>
        )}
        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={completedGroupStudy?.completed.totalPages ?? 1}
        />
      </div>

      {reviewStudy && (
        <GroupStudyReviewModal
          open={!!reviewStudy}
          onOpenChange={(open) => {
            if (!open) setReviewStudy(null);
          }}
          groupStudyId={reviewStudy.studyId}
          detailInfo={
            { title: reviewStudy.title } as GroupStudyDetailInfoResponseDto
          }
          basicInfo={
            {
              startDate: dayjs(reviewStudy.startTime).format('YYYY.MM.DD'),
              endDate: dayjs(reviewStudy.endTime).format('YYYY.MM.DD'),
            } as GroupStudyBasicInfoResponseDto
          }
        />
      )}
    </div>
  );
}
