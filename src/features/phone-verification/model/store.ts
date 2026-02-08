import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PhoneVerificationState {
  isVerified: boolean;
  phoneNumber: string | null;
<<<<<<< Updated upstream
  verifiedAt: string | null;
  memberId: number | null;
  hasHydrated: boolean;
  setVerified: (phoneNumber: string, memberId?: number) => void;
||||||| Stash base
  verifiedAt: Date | null;
  setVerified: (phoneNumber: string) => void;
=======
  verifiedAt: string | null;
  memberId: number | null;
  hasHydrated: boolean;
  setVerified: (phoneNumber: string, memberId?: number) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
>>>>>>> Stashed changes
  reset: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type PersistedPhoneVerificationState = Pick<
  PhoneVerificationState,
  'isVerified' | 'phoneNumber' | 'verifiedAt' | 'memberId'
>;

export const usePhoneVerificationStore = create<PhoneVerificationState>()(
  persist(
    (set) => ({
      isVerified: false,
<<<<<<< Updated upstream
      phoneNumber: null as string | null,
      verifiedAt: null as string | null,
      memberId: null as number | null,
      hasHydrated: false,
      setVerified: (phoneNumber, memberId) =>
        set({
||||||| Stash base
      phoneNumber: '',
      verifiedAt: new Date(),
      setVerified: (phoneNumber) =>
        set({
=======
      phoneNumber: null,
      verifiedAt: null,
      memberId: null,
      hasHydrated: false,
      setVerified: (phoneNumber, memberId) =>
        set((state) => ({
>>>>>>> Stashed changes
          isVerified: true,
          phoneNumber,
<<<<<<< Updated upstream
          verifiedAt: new Date().toISOString(),
          ...(memberId !== undefined ? { memberId } : {}),
||||||| Stash base
          verifiedAt: new Date(),
=======
          verifiedAt: new Date().toISOString(),
          memberId: memberId ?? state.memberId,
        })),
      setHasHydrated: (hasHydrated) =>
        set({
          hasHydrated,
>>>>>>> Stashed changes
        }),
      reset: () =>
        set({
          isVerified: false,
<<<<<<< Updated upstream
          phoneNumber: null as string | null,
          verifiedAt: null as string | null,
          memberId: null as number | null,
||||||| Stash base
          phoneNumber: null,
          verifiedAt: null,
=======
          phoneNumber: null,
          verifiedAt: null,
          memberId: null,
>>>>>>> Stashed changes
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
<<<<<<< Updated upstream
      name: 'phone-verification-storage',
      partialize: (state) => ({
        isVerified: state.isVerified,
        phoneNumber: state.phoneNumber,
        verifiedAt: state.verifiedAt,
        memberId: state.memberId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
||||||| Stash base
      name: 'phone-verification-storage', // 로컬 스토리지에 저장
=======
      name: 'phone-verification-storage',
      partialize: (state): PersistedPhoneVerificationState => ({
        isVerified: state.isVerified,
        phoneNumber: state.phoneNumber,
        verifiedAt: state.verifiedAt,
        memberId: state.memberId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
>>>>>>> Stashed changes
    },
  ),
);
