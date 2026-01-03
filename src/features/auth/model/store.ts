import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  memberId: number | null;
  nickname: string | null;
  memberName: string | null;
  tel: string | null;
}

interface UserStore extends UserInfo {
  setUserInfo: (info: Partial<UserInfo>) => void;
  reset: () => void;
}

const initialState: UserInfo = {
  memberId: null,
  nickname: null,
  memberName: null,
  tel: null,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUserInfo: (info) => set((state) => ({ ...state, ...info })),
      reset: () => set(initialState),
    }),
    {
      name: 'user-info-storage',
    },
  ),
);
