// entities/reaction/reaction-logic.ts
import * as React from 'react';

export type Reaction = 'LIKE' | 'DISLIKE' | 'NONE';
export interface Counts {
  likes: number;
  dislikes: number;
}

export function nextStateAndDelta(
  current: Reaction,
  intent: Exclude<Reaction, 'NONE'>,
) {
  const next: Reaction =
    intent === 'LIKE'
      ? current === 'LIKE'
        ? 'NONE'
        : 'LIKE'
      : current === 'DISLIKE'
        ? 'NONE'
        : 'DISLIKE';

  const likesDelta = (next === 'LIKE' ? 1 : 0) - (current === 'LIKE' ? 1 : 0);
  const dislikesDelta =
    (next === 'DISLIKE' ? 1 : 0) - (current === 'DISLIKE' ? 1 : 0);

  return { next, likesDelta, dislikesDelta };
}

type Mode = 'instant' | 'debounce';

export function useReactionLogic(params: {
  initialReaction: Reaction;
  initialCounts: Counts;
  mode?: Mode; // 기본 'instant'
  debounceMs?: number; // mode==='debounce'에서만 사용
  onCommit?: (finalReaction: Reaction) => void; // 부모가 mutation 실행
}) {
  const {
    initialReaction,
    initialCounts,
    mode = 'instant',
    debounceMs = 250,
    onCommit,
  } = params;

  const [reaction, setReaction] = React.useState<Reaction>(initialReaction);
  const [counts, setCounts] = React.useState<Counts>(initialCounts);

  const targetRef = React.useRef<Reaction>(initialReaction);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyLocal = (
    next: Reaction,
    likesDelta: number,
    dislikesDelta: number,
  ) => {
    setReaction(next);
    setCounts((c) => ({
      likes: Math.max(0, c.likes + likesDelta),
      dislikes: Math.max(0, c.dislikes + dislikesDelta),
    }));
  };

  const flush = (finalReaction: Reaction) => onCommit?.(finalReaction);

  const click = (intent: 'LIKE' | 'DISLIKE') => {
    const base =
      mode === 'debounce' ? (targetRef.current ?? reaction) : reaction;
    const { next, likesDelta, dislikesDelta } = nextStateAndDelta(base, intent);
    if (next === base) return; // no-op

    // 낙관적 업데이트(로컬)
    applyLocal(next, likesDelta, dislikesDelta);

    if (mode === 'debounce') {
      targetRef.current = next;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        flush(targetRef.current!);
        timerRef.current = null;
      }, debounceMs);
    } else {
      flush(next);
    }
  };

  // 서버 응답으로 보정하고 싶을 때 사용(선택)
  const reconcile = (server: { reaction?: Reaction; counts?: Counts }) => {
    if (server.reaction !== undefined) setReaction(server.reaction);
    if (server.counts !== undefined) setCounts(server.counts);
  };

  return {
    reaction,
    counts,
    like: () => click('LIKE'),
    dislike: () => click('DISLIKE'),
    reconcile,
  };
}
