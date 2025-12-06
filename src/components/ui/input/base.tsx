'use client';

import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { Input as ShadcnInput } from '@/components/ui/(shadcn)/ui/input';

type NativeInputProps = React.ComponentProps<typeof ShadcnInput>;

type Color = 'default' | 'error' | 'success';
type Size = 'm' | 'l';
type Appearance = 'boxed' | 'bare';

export type BaseInputProps = Omit<
  NativeInputProps,
  'size' | 'onChange' | 'value'
> & {
  color?: Color;
  size?: Size;
  appearance?: Appearance;
  value?: string;
  onValueChange?: (v: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  hideMeta?: boolean;
  guideText?: string;
};

const inputVariants = cva(
  'whitespace-pre-line focus-visible:ring-0 font-designer-16m',
  {
    variants: {
      color: {
        default: 'border-border-default text-text-default',
        error: 'border-border-error text-text-default',
        success: 'border-border-success text-text-default',
      },
      size: {
        m: 'h-[40px] py-100',
        l: 'h-[48px] py-150',
      },
      appearance: {
        boxed: 'rounded-100 border px-150 border-border-default',
        bare: 'border-0 rounded-none px-0 focus-visible:outline-none shadow-none',
      },
      disabled: {
        true: 'bg-background-disabled text-text-disabled border-border-disabled cursor-not-allowed',
      },
    },
    defaultVariants: {
      color: 'default',
      size: 'l',
    },
  },
);

export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      className,
      color = 'default',
      size = 'l',
      appearance = 'boxed',
      onValueChange,
      onChange,
      maxLength = 50,
      minLength = 0,
      hideMeta = true,
      guideText,
      value,
      ...props
    },
    ref,
  ) => {
    const current = value ?? '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.length > maxLength) {
        e.target.value = e.target.value.slice(0, maxLength);
      }
      onChange?.(e);
      onValueChange?.(e.target.value ?? '');
    };

    return (
      <div className="flex w-full flex-col gap-75">
        <ShadcnInput
          ref={ref}
          disabled={props.disabled}
          className={cn(
            inputVariants({
              color,
              size,
              appearance,
              disabled: props.disabled ? true : undefined,
            }),
            className,
          )}
          {...props}
          value={current}
          onChange={handleChange}
        />
        {!hideMeta && (
          <div className="font-designer-13r text-text-subtlest flex justify-between">
            <div>{guideText}</div>
            <div>
              {current.length}/{maxLength}
            </div>
          </div>
        )}
      </div>
    );
  },
);

BaseInput.displayName = 'BaseInput';
export default BaseInput;
