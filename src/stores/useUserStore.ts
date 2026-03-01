import { getUserProfile } from '@/api/endpoints/user/get-user-profile';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';


interface UserInfo {
  memberId: number | null;
  nickname: string | null;
  memberName: string | null;
  tel: string | null;
}

interface UserStore extends UserInfo {
  setUserInfo: (info: Partial<UserInfo>) => void;
  fetchAndSetUser: (memberId: number) => Promise<void>;
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
      fetchAndSetUser: async (memberId: number) => {
        try {
          const profile = await getUserProfile(memberId);
          set({
            memberId: profile.memberId,
            nickname: profile.memberProfile.nickname,
            memberName: profile.memberProfile.memberName,
            tel: profile.memberProfile.tel ?? null,
          });
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      },
      reset: () => set(initialState),
    }),
    {
      name: 'user-info-storage',

      // 새 탭에서 열면 providers/index.tsx의 UserInitializer가 fetchAndSetUser()로 재취득하므로 UX 영향 없음.
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
