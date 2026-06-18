import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { isApiError } from '@/api/client/api-error';
import { getUserProfile } from '@/api/endpoints/user/get-user-profile';

interface UserInfo {
  memberId: number | null;
  nickname: string | null;
  memberName: string | null;
  tel: string | null;
  profileImageUrl: string | null;
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
  profileImageUrl: null,
};

const createPendingUserInfo = (memberId: number): UserInfo => ({
  ...initialState,
  memberId,
});

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUserInfo: (info) => set((state) => ({ ...state, ...info })),
      fetchAndSetUser: async (memberId: number) => {
        set(createPendingUserInfo(memberId));

        try {
          const profile = await getUserProfile(memberId);

          if (useUserStore.getState().memberId !== memberId) {
            return;
          }

          const originalProfileImageUrl =
            profile.memberProfile.profileImage?.resizedImages?.find(
              (image) => image.imageSizeType.imageTypeName === 'ORIGINAL',
            )?.resizedImageUrl;
          const fallbackProfileImageUrl =
            profile.memberProfile.profileImage?.resizedImages?.[0]
              ?.resizedImageUrl ?? null;
          set({
            memberId: profile.memberId,
            nickname: profile.memberProfile.nickname,
            memberName: profile.memberProfile.memberName,
            tel: profile.memberProfile.tel ?? null,
            profileImageUrl: originalProfileImageUrl ?? fallbackProfileImageUrl,
          });
        } catch (error) {
          if (useUserStore.getState().memberId !== memberId) {
            return;
          }

          if (isApiError(error) && error.statusCode === 404) {
            set(createPendingUserInfo(memberId));

            return;
          }

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
