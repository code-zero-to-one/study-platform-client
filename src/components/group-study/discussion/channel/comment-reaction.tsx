// features/comment/CommentReaction.tsx (대댓글용)
import { useMutation } from '@tanstack/react-query';
import { postCommentReaction } from '@/api/endpoints/channel/post-comment-reaction'; // 새로 분리
import { ReactionBar } from '@/components/group-study/discussion/channel/reaction-bar';
import {
  Counts,
  Reaction,
  useReactionLogic,
} from '@/hooks/common/reaction-logic';

export function CommentReaction({
  threadId,
  commentId,
  initialReaction,
  initialCounts,
}: {
  threadId: number;
  commentId: number;
  initialReaction: Reaction;
  initialCounts: Counts;
}) {
  const mutation = useMutation({
    mutationFn: (next: Reaction) =>
      postCommentReaction({ threadId, commentId, type: next }),
    retry: 0,
  });

  const { reaction, counts, like, dislike } = useReactionLogic({
    initialReaction,
    initialCounts,
    mode: 'debounce',
    debounceMs: 250,
    onCommit: (finalReaction) => {
      mutation.mutate(finalReaction, {
        // onSuccess: (server) => reconcile({ reaction: server.reaction, counts: server.counts }),
        onError: () => {
          /* 롤백/토스트 등 */
        },
      });
    },
  });

  return (
    <ReactionBar
      likes={counts.likes}
      dislikes={counts.dislikes}
      active={reaction}
      disabled={mutation.isPending}
      onLike={like}
      onDislike={dislike}
    />
  );
}
