import { create } from 'zustand';
import { Leader } from '@/features/study/group/api/group-study-types';

interface LeaderStore {
  leaderInfo: Leader; // 전역으로 들고 있을 값
  setLeaderInfo: (v: Leader) => void; // 값을 세팅하는 액션
}

export const useLeaderStore = create<LeaderStore>((set) => ({
  leaderInfo: null,
  setLeaderInfo: (v) => set({ leaderInfo: v }),
}));
