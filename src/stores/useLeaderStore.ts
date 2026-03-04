import { create } from 'zustand';
import { Leader } from '@/types/api/group-study.types';

interface LeaderStore {
  leaderInfo: Leader | null;
  setLeaderInfo: (v: Leader | null) => void;
  reset: () => void;
}

export const useLeaderStore = create<LeaderStore>((set) => ({
  leaderInfo: null,
  setLeaderInfo: (v) => set({ leaderInfo: v }),
  reset: () => set({ leaderInfo: null }),
}));

// Context에서 제공하던 훅들을 Zustand 기반으로 구현
export function useLeaderInfo(): Leader | null {
  return useLeaderStore((state) => state.leaderInfo);
}

export function useIsLeader(memberId: number | null): boolean {
  const leaderInfo = useLeaderStore((state) => state.leaderInfo);
  if (!leaderInfo || !memberId) return false;

  return leaderInfo.memberId === memberId;
}
