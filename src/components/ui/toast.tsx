'use client';

import { CheckCircle2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-6 left-1/2 z-[99999] -translate-x-1/2',
        'rounded-200 px-500 py-400',
        'border-2 border-green-500 bg-white shadow-2xl',
        'font-designer-15b text-gray-900',
        'animate-in fade-in-0 slide-in-from-top-4 duration-300',
        'transition-all',
        'flex min-w-[280px] items-center gap-300',
      )}
      style={{
        boxShadow:
          '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
      }}
    >
      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
      <span className="flex-1">{message}</span>
    </div>
  );
}
