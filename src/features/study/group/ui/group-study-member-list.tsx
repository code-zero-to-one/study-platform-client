import { useState } from 'react';
import Pagination from '@/shared/ui/pagination';
import GroupStudyMemberItem from './group-study-member-item';
import { useGroupStudyMemberListQuery } from '../model/use-group-study-member-list-query';

interface GroupStudyMemberListProps {
  groupStudyId: number;
}

export default function GroupStudyMemberList({
  groupStudyId,
}: GroupStudyMemberListProps) {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const PAGE_SIZE = 10;

  const { data } = useGroupStudyMemberListQuery({
    id: groupStudyId,
    pageNumber: pageNumber,
    pageSize: PAGE_SIZE,
  });

  const memberList = data?.members || [];

  const totalPages = Math.ceil((data?.totalCount || 0) / PAGE_SIZE);

  return (
    <section className="flex flex-col gap-300">
      <span className="font-designer-20b text-text-default">스터디 참가자</span>

      <ul className="flex flex-col gap-200">
        {memberList.map((member) => (
          <GroupStudyMemberItem key={member.id} {...member} />
        ))}
      </ul>

      <Pagination
        page={pageNumber}
        onChangePage={setPageNumber}
        totalPages={totalPages}
      />
    </section>
  );
}
