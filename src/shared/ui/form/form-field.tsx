'use client';

import React, { cloneElement, isValidElement, useId } from 'react';
import {
  useWatch,
  Controller,
  get,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { cn } from '@/shared/shadcn/lib/utils';

type Direction = 'horizontal' | 'vertical';

type EventChange = (e: React.ChangeEvent<Element>) => void;
type ValueChange<V> = (value: V) => void;
type ChangeHandler<V> = EventChange | ValueChange<V>;

export interface ControlledChildProps<V = unknown> {
  id?: string;
  name?: string;
  value?: V;
  onChange?: ChangeHandler<V>;
  onBlur?: () => void;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

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
  id?: string;

  showCounterRight?: boolean;
  counterMax?: number;

  children: React.ReactElement<ControlledChildProps<V>>;
}

export default function FormField<
  T extends FieldValues,
  N extends Path<T>,
  V = string,
>(props: FormFieldProps<T, N, V>) {
  const {
    name,
    rules,
    label,
    helper,
    description,
    required = false,
    direction = 'horizontal',
    id,
    children,
    showCounterRight = false,
    counterMax,
  } = props;

  const { control, formState } = useFormContext<T>();
  const autoId = useId();
  const fieldId = id ?? `field-${autoId}`;
  const descId = description ? `${fieldId}-desc` : undefined;
  const errId = `${fieldId}-error`;

  const watched = useWatch({ control, name }) as unknown;
  const currentLen = typeof watched === 'string' ? watched.length : 0;

  const leftCol =
    direction === 'vertical'
      ? 'w-full items-center gap-75'
      : 'w-[112px] gap-100 pt-100';

  const isReactChangeEvent = (
    arg: unknown,
  ): arg is React.ChangeEvent<Element> =>
    typeof arg === 'object' && arg !== null && 'target' in arg;

  const error = get(formState.errors, name);
  const errorMsg = (error as { message?: string })?.message;

  return (
    <div
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col gap-100' : 'gap-600',
      )}
    >
      <div className={cn('flex', leftCol)}>
        <label
          htmlFor={fieldId}
          className="font-designer-14b text-text-default"
        >
          {label}
        </label>
        {required && (
          <div className="font-designer-13r text-text-error">필수</div>
        )}
      </div>

      <div className="flex w-full flex-col gap-75">
        {helper && (
          <div className={'text-text-subtle font-designer-14r mb-100'}>
            {helper}
          </div>
        )}
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field, fieldState }) => {
            let injected = children;
            if (
              isValidElement<ControlledChildProps<V>>(children) &&
              !Array.isArray(children)
            ) {
              const child = children;

              const nextOnChange: ChangeHandler<V> =
                child.props.onChange ??
                ((arg: V | React.ChangeEvent<Element>) => {
                  if (isReactChangeEvent(arg)) field.onChange(arg);
                  else field.onChange(arg);
                });

              const describedBy =
                (fieldState.error ? errId : descId) ?? undefined;

              injected = cloneElement(child, {
                id: child.props.id ?? fieldId,
                name: child.props.name ?? field.name,
                value: (child.props.value ?? field.value) as V,
                onChange: nextOnChange,
                onBlur: child.props.onBlur ?? field.onBlur,
                'aria-invalid':
                  child.props['aria-invalid'] ??
                  (fieldState.invalid || undefined),
                'aria-describedby':
                  child.props['aria-describedby'] ?? describedBy,
              });
            }

            return injected;
          }}
        />

        <div className="font-designer-13r flex items-center justify-between">
          <div
            id={errorMsg ? errId : descId}
            className={cn(errorMsg ? 'text-text-error' : 'text-text-subtlest')}
            role={errorMsg ? 'alert' : undefined}
            aria-live={errorMsg ? 'polite' : undefined}
          >
            {errorMsg ? errorMsg : description}
          </div>

          {showCounterRight && typeof counterMax === 'number' && (
            <div className="text-text-subtlest">
              {currentLen}/{counterMax}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
