'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type { CheckoutFormValues } from './checkout-form';
import { TosModal } from './tos-modal';

export function TosSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  const [tosOpen, setTosOpen] = useState(false);
  const tosAgreed = watch('tosAgreed');

  return (
    <div className="rounded-200 border border-gray-300 bg-background-default px-500 py-400">
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-200">
          <div className="relative flex items-center">
            <input
              {...register('tosAgreed')}
              type="checkbox"
              className="sr-only"
            />
            <div
              className={cn(
                'flex size-300 items-center justify-center rounded-50 border-2 transition-colors',
                tosAgreed
                  ? 'border-background-brand-default bg-background-brand-default'
                  : 'border-gray-300 bg-background-default',
              )}
            >
              {tosAgreed && (
                <svg
                  viewBox="0 0 12 12"
                  className="size-200 text-gray-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <polyline points="2,6 5,9 10,3" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex items-center gap-100">
            <ChevronDown className="size-250 text-gray-500" />
            <span className="font-designer-16m text-gray-800">
              이용약관 동의 (필수)
            </span>
          </div>
        </label>

        <button
          type="button"
          onClick={() => setTosOpen(true)}
          className="font-designer-14m text-text-brand underline underline-offset-2"
        >
          보기
        </button>
      </div>

      {errors.tosAgreed && (
        <p className="mt-150 font-designer-12r text-text-error">
          이용약관에 동의해주세요.
        </p>
      )}

      <TosModal open={tosOpen} onClose={() => setTosOpen(false)} />
    </div>
  );
}
