import { create } from 'zustand';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  isVisible: boolean;
  variant: ToastVariant;
  showToast: (message: string, variant?: ToastVariant) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  isVisible: false,
  variant: 'success',
  showToast: (message, variant = 'success') =>
    set({ message, variant, isVisible: true }),
  hideToast: () => set({ isVisible: false }),
}));
