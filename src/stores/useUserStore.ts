import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isApiError } from '@/api/client/api-error';
import { getUserProfile } from '@/entities/user/api/get-user-profile';

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
          if (isApiError(error) && error.statusCode === 404) {
            set(initialState);

            return;
          }

          console.error('Failed to fetch user profile:', error);
        }
      },
      reset: () => set(initialState),
    }),
    {
      name: 'user-info-storage',
    },
  ),
);
