import { MessageCircle } from 'lucide-react';
import UserAvatar from '@/shared/ui/avatar';
import SubComments from './sub-comments';
import { useThreadsQuery } from '../model/use-channel-query';

interface CommentProps {
  groupStudyId: number;
}

export default function Comments({ groupStudyId }: CommentProps) {
  const { data, isLoading } = useThreadsQuery(groupStudyId);

  console.log('data', data);

  if (isLoading) {
    return;
  }

  return (
    <div className="flex flex-col gap-400">
      <div className="flex items-center">
        <MessageCircle className="mr-100 inline-block" size={20} />
        <span className="font-designer-16b text-text-strong mr-50">댓글</span>
        <span className="font-designer-16b text-text-subtlest">
          {data.content.length}개
        </span>
      </div>
      <div className="flex flex-col gap-300">
        {data.content.map((comment: any) => (
          <div key={comment.id} className="border-b-[1px] border-[#D5D7DA]">
            <UserAvatar size={40} image={undefined} />
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
    </div>
  );
}
