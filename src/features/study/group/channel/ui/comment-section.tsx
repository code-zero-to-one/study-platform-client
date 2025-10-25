import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@/features/auth/model/use-user';
import Comment from './comment';
import CommentInput from './comment-input';
import Reaction from './reaction';
import SubComments from './sub-comments';
import { useThreadsQuery } from '../model/use-channel-query';

interface CommentProps {
  groupStudyId: number;
}

export default function CommentSection({ groupStudyId }: CommentProps) {
  const { data, isLoading } = useThreadsQuery(groupStudyId);

  const [showSubComment, setShowSubComment] = useState(false);

  if (isLoading) {
    return;
  }

  return (
    <div className="flex flex-col gap-400">
      <div className="flex items-center">
        <MessageCircle className="mr-100 inline-block" size={24} />
        <span className="font-designer-16b text-text-strong mr-50">댓글</span>
        <span className="font-designer-16b text-text-subtlest">
          {data.length}개
        </span>
      </div>
      <div className="flex flex-col gap-300">
        {data.map((comment) => (
          <div
            key={comment.threadId}
            className="border-b-[1px] border-[#D5D7DA] pb-300"
          >
            <div className="flex flex-col gap-200">
              <Comment data={comment} />
              <div className="flex gap-150">
                <Reaction
                  likesCount={comment.likesCount}
                  dislikesCount={comment.dislikesCount}
                  myReaction={comment.myReaction}
                />
                <span onClick={() => setShowSubComment(!showSubComment)}>
                  답글쓰기
                </span>
              </div>
            </div>

            <div className="ml-[52px] flex flex-col">
              <SubComments
                threadId={comment.threadId}
                groupStudyId={groupStudyId}
              />
              {showSubComment && <CommentInput />}
            </div>
          </div>
        ))}

        <CommentInput />
      </div>
    </div>
  );
}
