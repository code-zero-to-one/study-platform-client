import Image from 'next/image';
import { useState } from 'react';
import Pagination from '@/components/ui/pagination';
import GroupStudyMemberItem from './group-study-member-item';
import KickedReasonModal from './kicked-reason-modal';
import { GroupStudyMyStatusResponse } from '../api/group-study-types';
import { useGroupStudyMemberListQuery } from '../model/use-group-study-member-list-query';

interface GroupStudyMemberListProps {
  groupStudyId: number;
  leaderId: number;
  myApplicationStatus?: GroupStudyMyStatusResponse;
}

export default function GroupStudyMemberList({
  groupStudyId,
  leaderId,
  myApplicationStatus,
}: GroupStudyMemberListProps) {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const PAGE_SIZE = 10;

  const { data } = useGroupStudyMemberListQuery({
    id: groupStudyId,
    pageNumber: pageNumber,
    pageSize: PAGE_SIZE,
  });

  const memberList = data?.members || [];

  const totalPages = Math.ceil((data?.totalCount || 0) / PAGE_SIZE) || 1;

  return (
    <section className="flex flex-col gap-300">
      <span className="font-designer-20b text-text-default">스터디 참가자</span>

      {memberList.length > 0 ? (
        <ul className="flex flex-col gap-200">
          {memberList.map((member, idx) => (
            <GroupStudyMemberItem
              key={`${member.id}-${idx}`}
              groupStudyId={groupStudyId}
              leaderId={leaderId}
              {...member}
            />
          ))}
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
    </section>
  );
}
