'use client';

import React, { useId } from 'react';
import {
  useWatch,
  get,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { FieldControl, type ControlledChildProps } from './field-control';

type Direction = 'horizontal' | 'vertical';
type Size = 'small' | 'medium';

const TYPO = {
  small: {
    label: 'font-designer-14b',
    helper: 'font-designer-14r',
    foot: 'font-designer-13r',
    counter: 'font-designer-13r',
  },
  medium: {
    label: 'font-designer-16b',
    helper: 'font-designer-14r',
    foot: 'font-designer-14r',
    counter: 'font-designer-13r',
  },
} as const;

export interface FormFieldProps<
  T extends FieldValues,
  N extends Path<T>,
  V = string,
> {
  name: N;
  rules?: RegisterOptions<T, N>;

  label: React.ReactNode;
  helper?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  direction?: Direction;
  size?: Size;
  id?: string;

  showCounterRight?: boolean;
  counterMax?: number;

  /** true로 설정하면 data-scroll-field 속성을 wrapper div에 추가 (자동 스크롤 위치 마킹) */
  scrollable?: boolean;
  /** 필드 값이 변경된 직후 호출되는 콜백. 자동 스크롤 등 부가 동작에 사용 */
  onAfterChange?: (value: unknown) => void;
  /** blur 시 필드 값이 채워져 있으면 호출되는 콜백. 텍스트 입력 등에서 자동 스크롤에 사용 */
  onAfterBlurFilled?: () => void;

  children: React.ReactElement<ControlledChildProps<V>>;
}

export default function FormField<
  T extends FieldValues,
  N extends Path<T>,
  V = string,
>({
  name,
  rules,
  label,
  helper,
  description,
  required = false,
  direction = 'horizontal',
  size = 'small',
  id,
  children,
  showCounterRight = false,
  counterMax,
  scrollable,
  onAfterChange,
  onAfterBlurFilled,
}: FormFieldProps<T, N, V>) {
  const { control, formState } = useFormContext<T>();
  const autoId = useId();
  const fieldId = id ?? `field-${autoId}`;
  const descId = description ? `${fieldId}-desc` : undefined;
  const errId = `${fieldId}-error`;

  const watched = useWatch({ control, name }) as unknown;
  const currentLen = typeof watched === 'string' ? watched.length : 0;

  const error = get(formState.errors, name) as { message?: string } | undefined;
  const errorMsg = error?.message;

  const leftCol =
    direction === 'vertical'
      ? 'w-full items-center gap-75'
      : 'w-[112px] gap-100 pt-100';

  return (
    <div
      {...(scrollable ? { 'data-scroll-field': name } : {})}
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col gap-100' : 'gap-600',
      )}
    >
      <div className={cn('flex', leftCol)}>
        <label
          htmlFor={fieldId}
          className={cn(TYPO[size].label, 'text-text-default')}
        >
          {label}
        </label>
        {required && (
          <div className="font-designer-13r text-text-error">필수</div>
        )}
      </div>

      <div className="flex w-full flex-col gap-75">
        {helper && (
          <div className={cn(TYPO[size].helper, 'text-text-subtle mb-100')}>
            {helper}
          </div>
        )}

        <FieldControl<T, N, V>
          name={name}
          rules={rules}
          controlId={fieldId}
          describedById={errorMsg ? errId : descId}
          onAfterChange={onAfterChange}
          onAfterBlurFilled={onAfterBlurFilled}
        >
          {children}
        </FieldControl>

        <div className="flex items-center justify-between">
          <div
            id={errorMsg ? errId : descId}
            className={cn(
              TYPO[size].foot,
              errorMsg ? 'text-text-error' : 'text-text-subtlest',
            )}
            role={errorMsg ? 'alert' : undefined}
            aria-live={errorMsg ? 'polite' : undefined}
          >
            {errorMsg ? errorMsg : description}
          </div>

          {showCounterRight && typeof counterMax === 'number' && (
            <div className={cn(TYPO[size].counter, 'text-text-subtlest')}>
              {currentLen}/{counterMax}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
