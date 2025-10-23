import React from 'react';
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

  console.log('data', data);

  if (isLoading) return;

  return (
    <div>
      {data?.content.map((subComment: any) => (
        <div key={subComment.id} className="mt-10 ml-20">
          <p className="font-bold">{subComment.author}</p>
          <p>{subComment.content}</p>
        </div>
      ))}
    </div>
  );
}
