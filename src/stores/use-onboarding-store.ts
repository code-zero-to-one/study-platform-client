import { create } from 'zustand';

interface OnboardingState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
