import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PhoneVerificationState {
  isVerified: boolean;
  phoneNumber: string | null;
  verifiedAt: string | null;
  memberId: number | null;
  hasHydrated: boolean;
  setVerified: (phoneNumber: string, memberId?: number) => void;
  reset: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const usePhoneVerificationStore = create<PhoneVerificationState>()(
  persist(
    (set) => ({
      isVerified: false,
      phoneNumber: null as string | null,
      verifiedAt: null as string | null,
      memberId: null as number | null,
      hasHydrated: false,
      setVerified: (phoneNumber, memberId) =>
        set({
          isVerified: true,
          phoneNumber,
          verifiedAt: new Date().toISOString(),
          ...(memberId !== undefined ? { memberId } : {}),
        }),
      reset: () =>
        set({
          isVerified: false,
          phoneNumber: null as string | null,
          verifiedAt: null as string | null,
          memberId: null as number | null,
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
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
    },
  ),
);
