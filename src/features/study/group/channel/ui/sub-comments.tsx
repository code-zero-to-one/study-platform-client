import dayjs from 'dayjs';
import React from 'react';
import UserAvatar from '@/shared/ui/avatar';
import { useCommentsQuery } from '../model/use-channel-query';

interface SubCommentsProps {
  threadId: number;
  groupStudyId: number;
}

export default function SubComments({
  threadId,
  groupStudyId,
}: SubCommentsProps) {
  const { data, isLoading } = useCommentsQuery(groupStudyId, threadId);

  if (isLoading) return;

  return (
    <div className="flex flex-col gap-300 pl-[52px]">
      {data?.content.map((subComment: any) => (
        <div key={subComment.id} className="flex gap-150">
          <UserAvatar size={48} image={undefined} />
          <div className="flex flex-col gap-100">
            <div className="flex items-center gap-100">
              <span className="font-bold">{subComment.authorName}</span>
              <span className="font-designer-13r text-text-subtlest">
                {dayjs(subComment.updatedAt).format('YYYY.MM.DD  HH:mm')}
              </span>
            </div>

            <p>{subComment.content}</p>
          </div>
        </div>
      ))}
      <input />
      {/**
       * 여기서 댓글 작성하면 create만들면 useThreadsQuery refetch
       */}
    </div>
  );
}
