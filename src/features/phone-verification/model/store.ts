import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PhoneVerificationState {
  isVerified: boolean;
  phoneNumber: string | null;
  verifiedAt: Date | null;
  setVerified: (phoneNumber: string) => void;
  reset: () => void;
}

export const usePhoneVerificationStore = create<PhoneVerificationState>()(
  persist(
    (set) => ({
      isVerified: false,
      phoneNumber: '',
      verifiedAt: new Date(),
      setVerified: (phoneNumber) =>
        set({
          isVerified: true,
          phoneNumber,
          verifiedAt: new Date(),
        }),
      reset: () =>
        set({
          isVerified: false,
          phoneNumber: null,
          verifiedAt: null,
        }),
    }),
    {
      name: 'phone-verification-storage', // 로컬 스토리지에 저장
    },
  ),
);

