'use client';

import { CheckCircle2, Info, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const EXIT_DURATION = 200;

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  variant?: 'success' | 'error' | 'info';
}

export default function Toast({
  message,
  isVisible,
  onClose,
  duration = 3000,
  variant = 'success',
}: ToastProps) {
  const [isRendered, setIsRendered] = useState(isVisible);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
      setIsExiting(false);
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }

    if (isRendered) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsExiting(false);
      }, EXIT_DURATION);

      return () => clearTimeout(timer);
    }
  }, [duration, isRendered, isVisible, message, onClose, variant]);

  if (!isRendered) return null;
  if (typeof document === 'undefined') return null;

  const isSuccess = variant === 'success';

  const isError = variant === 'error';
  const isInfo = variant === 'info';

  const toast = (
    <div className="fixed top-400 left-1/2 z-50 -translate-x-1/2">
      <div
        className={cn(
          'rounded-200 px-500 py-400',
          'bg-background-default shadow-2xl',
          isSuccess
            ? 'border-2 border-green-500'
            : isError
              ? 'border-2 border-red-500'
              : 'border-2 border-blue-500',
          'font-designer-15b text-gray-900',
          'flex min-w-[280px] items-center gap-300',
          isExiting ? 'toast-exit' : 'toast-enter',
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
        ) : isError ? (
          <XCircle className="h-5 w-5 shrink-0 text-red-600" />
        ) : isInfo ? (
          <Info className="h-5 w-5 shrink-0 text-blue-600" />
        ) : null}
        <span className="flex-1">{message}</span>
      </div>
    </div>
  );

  return createPortal(toast, document.body);
}
