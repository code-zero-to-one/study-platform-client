// features/comment/CommentReaction.tsx (대댓글용)
import { useMutation } from '@tanstack/react-query';
import { ReactionBar } from './reaction-bar';
import { postCommentReaction } from '../api/post-comment-reaction'; // 새로 분리
import { Counts, Reaction, useReactionLogic } from '../model/reaction-logic';

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

  const { reaction, counts, like, dislike, reconcile } = useReactionLogic({
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
