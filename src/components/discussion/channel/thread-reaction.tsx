// features/thread/ThreadReaction.tsx
import { useMutation } from '@tanstack/react-query';
import { postThreadReaction } from '@/api/endpoints/channel/post-thread-reaction';
import {
  Counts,
  Reaction,
  useReactionLogic,
} from '@/hooks/common/reaction-logic';
import { ReactionBar } from './reaction-bar';

export function ThreadReaction({
  groupStudyId,
  threadId,
  initialReaction,
  initialCounts,
}: {
  groupStudyId: number;
  threadId: number;
  initialReaction: Reaction;
  initialCounts: Counts;
}) {
  const mutation = useMutation({
    mutationFn: (next: Reaction) =>
      postThreadReaction({ groupStudyId, threadId, type: next }), // ✅ next 사용
    retry: 0,
  });

  const { reaction, counts, like, dislike, reconcile } = useReactionLogic({
    initialReaction,
    initialCounts,
    mode: 'debounce', // 연타 합치기 원하면
    debounceMs: 250,
    onCommit: (finalReaction) => {
      mutation.mutate(finalReaction, {
        // 서버가 소스오브트루스면 여기서 보정
        // onSuccess: (server) => reconcile({ reaction: server.reaction, counts: server.counts }),
        onError: () => {
          // 실패 시, 간단히 초기값으로 되돌리고 싶으면:
          // reconcile({ reaction: initialReaction, counts: initialCounts });
          // 혹은 별도 상태로 에러 토스트 처리
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
