import React from 'react';
import SubComments from './sub-comments';
import { useThreadsQuery } from '../model/use-channel-query';

interface CommentProps {
  groupStudyId: number;
}

export default function Comments({ groupStudyId }: CommentProps) {
  const { data, isLoading } = useThreadsQuery(groupStudyId);

  if (isLoading) {
    return;
  }

  return (
    <div>
      {data.content.map((comment: any) => (
        <div key={comment.id}>
          <p className="font-bold">{comment.content}</p>
          <SubComments
            threadId={comment.threadId}
            groupStudyId={groupStudyId}
          />
        </div>
      ))}

      <input />
      {/**
       * 여기서 댓글 작성하면 create만들면 useThreadsQuery refetch
       */}
    </div>
  );
}
