'use client';

import React, { cloneElement, isValidElement, useId } from 'react';
import {
  Controller,
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
  description?: React.ReactNode;
  required?: boolean;
  direction?: Direction;
  id?: string;

  children: React.ReactElement<ControlledChildProps<V>>;
}

export function FormField<
  T extends FieldValues,
  N extends Path<T>,
  V = string,
>({
  name,
  rules,
  label,
  description,
  required = false,
  direction = 'horizontal',
  id,
  children,
}: FormFieldProps<T, N, V>) {
  const { control } = useFormContext<T>();
  const autoId = useId();
  const fieldId = id ?? `field-${autoId}`;
  const descId = description ? `${fieldId}-desc` : undefined;
  const errId = `${fieldId}-error`;

  const leftCol =
    direction === 'vertical'
      ? 'w-full items-center gap-75'
      : 'w-[112px] gap-100 pt-100';

  const Layout = ({
    child,
    errorMsg,
  }: {
    child: React.ReactNode;
    errorMsg?: string;
  }) => (
    <div
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col gap-150' : 'gap-600',
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
        {child}

        {!errorMsg && description && (
          <div id={descId} className="font-designer-13r text-text-subtlest">
            {description}
          </div>
        )}

        {errorMsg && (
          <div id={errId} className="font-designer-13r text-text-error">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );

  const isReactChangeEvent = (
    arg: unknown,
  ): arg is React.ChangeEvent<Element> =>
    typeof arg === 'object' && arg !== null && 'target' in arg;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const errorMsg = fieldState.error?.message;

        let injected = children;
        if (
          isValidElement<ControlledChildProps<V>>(children) &&
          !Array.isArray(children)
        ) {
          const child = children;

          const normalizedValue = (child.props.value ?? field.value) as V;

          const nextOnChange: ChangeHandler<V> =
            child.props.onChange ??
            ((arg: V | React.ChangeEvent<Element>) => {
              if (isReactChangeEvent(arg)) field.onChange(arg);
              else field.onChange(arg);
            });

          const describedBy = errorMsg ? errId : descId ? descId : undefined;

          const extraProps: Partial<ControlledChildProps<V>> = {
            id: child.props.id ?? fieldId,
            name: child.props.name ?? field.name,
            value: normalizedValue,
            onChange: nextOnChange,
            onBlur: child.props.onBlur ?? field.onBlur,
            'aria-invalid':
              child.props['aria-invalid'] ?? (Boolean(errorMsg) || undefined),
            'aria-describedby': child.props['aria-describedby'] ?? describedBy,
          };

          injected = cloneElement(child, extraProps);
        }

        return <Layout child={injected} errorMsg={errorMsg} />;
      }}
    />
  );
}

export default FormField;
