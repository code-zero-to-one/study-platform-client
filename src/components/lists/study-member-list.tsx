'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { GetGroupStudyMemberStatusResponseContent } from '@/api/openapi';
import Pagination from '@/components/common/ui/pagination';
import GroupStudyMemberItem from '@/components/lists/group-study-member-item';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useGetGroupStudyMembers } from '@/hooks/queries/group-study-member-api';
import type { GroupStudyMember } from '@/types/api/group-study.types';

import PageContainer from '../common/layout/page-container';

const KickedReasonModal = dynamic(
  () => import('@/components/common/modals/kicked-reason-modal'),
  { ssr: false },
);

interface GroupStudyMemberListProps {
  groupStudyId: number;
  leaderId: number;
  excludeLeaderFromMembers?: boolean;
  myApplicationStatus?: GetGroupStudyMemberStatusResponseContent;
}

export default function StudyMemberList({
  groupStudyId,
  leaderId,
  excludeLeaderFromMembers = false,
  myApplicationStatus,
}: GroupStudyMemberListProps) {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const PAGE_SIZE = 10;

  const { data, isLoading } = useGetGroupStudyMembers({
    id: groupStudyId,
    isPaging: true,
    pageNumber: pageNumber,
    pageSize: PAGE_SIZE,
  });
  const { memberId, isAuthReady } = useAuthReady();

  const visibleMemberList = useMemo(() => {
    const memberList = data?.members ?? [];

    return excludeLeaderFromMembers
      ? memberList.filter((member) => member.id !== leaderId)
      : memberList;
  }, [excludeLeaderFromMembers, leaderId, data?.members]);

  if (isLoading) {
    return null;
  }
  const visibleTotalMemberCount = Math.max(
    (data?.totalMemberCount ?? 0) - (excludeLeaderFromMembers ? 1 : 0),
    0,
  );

  // memberList의 첫 번째 요소는 내 정보
  const myInfo = visibleMemberList[0] ?? null;
  const isLeader = isAuthReady && leaderId === memberId;
  const totalPages = Math.ceil((data?.totalMemberCount || 0) / PAGE_SIZE) || 1;

  return (
    <PageContainer className="flex flex-col gap-300 py-500">
      {/* 리더가 아닌 참가자에게 내 정보 상단에 노출 */}
      {!isLeader && myInfo && (
        <SelfMemberInfo
          groupStudyId={groupStudyId}
          leaderId={leaderId}
          myInfo={myInfo}
        />
      )}

      <div className="flex items-center gap-100">
        <span className="font-designer-20b text-text-default">
          스터디 참가자
        </span>
        <span className="text-text-subtle font-designer-14r">
          {visibleTotalMemberCount}명
        </span>
      </div>

      {visibleMemberList.length > 0 ? (
        <ul className="flex flex-col gap-200">
          {visibleMemberList.map((member, idx) => {
            // 리더가 아닌 참가자는 이미 내 정보가 위에 노출되어 있으므로 제외
            if (idx === 0 && !isLeader) return null;

            return (
              <GroupStudyMemberItem
                key={member.id}
                groupStudyId={groupStudyId}
                leaderId={leaderId}
                {...member}
              />
            );
          })}
        </ul>
      ) : (
        <div className="bg-background-alternative rounded-100 flex h-[640px] flex-col items-center justify-center gap-200">
          <Image
            src="/images/no-group-study-member.svg"
            alt="no-group-study-member"
            width={160}
            height={160}
          />
          <p className="text-text-default font-bold-h5">
            아직 <span className="text-text-brand">참여한 멤버</span>가 없습니다
          </p>
        </div>
      )}

      {myApplicationStatus?.status === 'KICKED' && (
        <KickedReasonModal reason={myApplicationStatus.reason} />
      )}

      <Pagination
        page={pageNumber}
        onChangePage={setPageNumber}
        totalPages={totalPages}
      />
    </PageContainer>
  );
}

function SelfMemberInfo({
  groupStudyId,
  leaderId,
  myInfo,
}: {
  groupStudyId: number;
  leaderId: number;
  myInfo: GroupStudyMember;
}) {
  return (
    <>
      <span className="font-designer-20b text-text-default">내 정보</span>

      <GroupStudyMemberItem
        groupStudyId={groupStudyId}
        leaderId={leaderId}
        {...myInfo}
      />
    </>
  );
}
