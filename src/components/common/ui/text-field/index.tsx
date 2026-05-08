'use client';

import { cva } from 'class-variance-authority';
import { forwardRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

type FieldState = 'default' | 'error' | 'success' | 'disabled';

const containerVariants = 'flex w-full flex-col gap-75';

const STATE_VARIANTS: Record<FieldState, string> = {
  default:
    'border-border-default hover:bg-fill-neutral-subtle-hover active:bg-fill-neutral-subtle-pressed focus-within:border-border-strong focus-within:bg-fill-neutral-subtle-default',
  error: 'border-border-error',
  success: 'border-border-success',
  disabled: 'border-border-disabled bg-background-disabled cursor-not-allowed',
};

const inputBoxVariants = cva(
  'flex w-full items-center border bg-fill-neutral-subtle-default rounded-100 pl-150 transition-colors',
  {
    variants: {
      size: {
        L: 'h-600',
        M: 'h-500',
      },
      state: STATE_VARIANTS,
      hasTrailingIcon: {
        true: 'pr-100',
        false: 'pr-150',
      },
    },
    defaultVariants: { size: 'L', state: 'default', hasTrailingIcon: false },
  },
);

const textareaBoxVariants = cva(
  'flex w-full flex-col items-start border bg-fill-neutral-subtle-default rounded-100 p-150 transition-colors',
  {
    variants: {
      state: STATE_VARIANTS,
    },
    defaultVariants: { state: 'default' },
  },
);

const fieldElementVariants = cva(
  'min-w-0 flex-1 bg-transparent text-text-default outline-none placeholder:text-text-subtlest disabled:cursor-not-allowed disabled:text-text-disabled disabled:placeholder:text-text-disabled',
  {
    variants: {
      size: {
        L: 'font-designer-16m',
        M: 'font-designer-14m',
      },
    },
    defaultVariants: { size: 'L' },
  },
);

const helperVariants = cva('font-designer-13r', {
  variants: {
    state: {
      default: 'text-text-subtlest',
      error: 'text-text-error',
      success: 'text-text-success',
      disabled: 'text-text-subtlest',
    },
  },
  defaultVariants: { state: 'default' },
});

function deriveState({
  disabled,
  error,
  success,
}: {
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
}): FieldState {
  if (disabled) return 'disabled';
  if (error) return 'error';
  if (success) return 'success';
  return 'default';
}

interface CommonProps {
  size?: 'L' | 'M';
  helperText?: string;
  error?: boolean;
  success?: boolean;
  className?: string;
  containerClassName?: string;
}

type TextFieldProps = CommonProps & {
  showClear?: boolean;
  trailingIcon?: React.ReactNode;
  onClear?: () => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      size = 'L',
      helperText,
      error,
      success,
      disabled,
      showClear,
      trailingIcon,
      onClear,
      className,
      containerClassName,
      ...inputProps
    },
    ref,
  ) {
    const state = deriveState({ disabled, error, success });
    const hasTrailingIcon = (showClear && !disabled) || !!trailingIcon;
    return (
      <div className={cn(containerVariants, containerClassName)}>
        <div
          className={cn(
            inputBoxVariants({ size, state, hasTrailingIcon }),
            className,
          )}
        >
          <input
            ref={ref}
            data-slot="text-field"
            disabled={disabled}
            aria-invalid={error || undefined}
            className={fieldElementVariants({ size })}
            {...inputProps}
          />
          {showClear && !disabled ? (
            <button
              type="button"
              onClick={onClear}
              aria-label="입력 지우기"
              className="ml-50 size-5 shrink-0 text-gray-400"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM15 13.59L13.59 15L10 11.41L6.41 15L5 13.59L8.59 10L5 6.41L6.41 5L10 8.59L13.59 5L15 6.41L11.41 10L15 13.59Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          ) : trailingIcon ? (
            <span className="text-icon-subtlest ml-50 flex size-5 items-center justify-center">
              {trailingIcon}
            </span>
          ) : null}
        </div>
        {helperText && (
          <p className={helperVariants({ state })}>{helperText}</p>
        )}
      </div>
    );
  },
);

type TextAreaProps = CommonProps & {
  showCounter?: boolean;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      size = 'L',
      helperText,
      error,
      success,
      disabled,
      showCounter,
      maxLength,
      value,
      defaultValue,
      onChange,
      className,
      containerClassName,
      rows = 3,
      ...textareaProps
    },
    ref,
  ) {
    const state = deriveState({ disabled, error, success });
    const showHelperRow =
      !!helperText || (showCounter && maxLength !== undefined);
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(
      String(defaultValue ?? ''),
    );
    const textValue = isControlled ? String(value) : internalValue;

    return (
      <div className={cn(containerVariants, containerClassName)}>
        <div className={cn(textareaBoxVariants({ state }), className)}>
          <textarea
            ref={ref}
            data-slot="text-field"
            disabled={disabled}
            maxLength={maxLength}
            rows={rows}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={error || undefined}
            onChange={(event) => {
              if (!isControlled) setInternalValue(event.target.value);
              onChange?.(event);
            }}
            className={cn(fieldElementVariants({ size }), 'w-full resize-none')}
            {...textareaProps}
          />
        </div>
        {showHelperRow && (
          <div className="flex items-start justify-between gap-150">
            {helperText ? (
              <p className={cn(helperVariants({ state }), 'flex-1 min-w-0')}>
                {helperText}
              </p>
            ) : (
              <span className="flex-1" />
            )}
            {showCounter && maxLength !== undefined && (
              <p
                className={cn(
                  'font-designer-13r shrink-0',
                  state === 'disabled'
                    ? 'text-text-disabled'
                    : 'text-text-subtlest',
                )}
              >
                {textValue.length}/{maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

export { TextField, TextArea };
export type { TextFieldProps, TextAreaProps };
