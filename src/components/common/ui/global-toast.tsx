'use client';

import { useToastStore } from '@/stores/use-toast-store';
import Toast from './toast';

export default function GlobalToast() {
  const { isVisible, message, variant, hideToast } = useToastStore();

  return (
    <Toast
      isVisible={isVisible}
      message={message}
      variant={variant}
      onClose={hideToast}
    />
  );
}
