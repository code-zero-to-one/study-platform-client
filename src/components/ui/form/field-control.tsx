'use client';

import React, { cloneElement, isValidElement } from 'react';
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';

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

export interface FieldControlProps<
  T extends FieldValues,
  N extends Path<T>,
  V = string,
> {
  name: N;
  rules?: RegisterOptions<T, N>;
  describedById?: string;
  children: React.ReactElement<ControlledChildProps<V>>;
  controlId?: string;
}

export function FieldControl<
  T extends FieldValues,
  N extends Path<T>,
  V = string,
>({
  name,
  rules,
  describedById,
  controlId,
  children,
}: FieldControlProps<T, N, V>) {
  const { control } = useFormContext<T>();

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

          injected = cloneElement(child, {
            id: child.props.id ?? controlId,
            name: child.props.name ?? field.name,
            value: (child.props.value ?? field.value) as V,
            onChange: nextOnChange,
            onBlur: child.props.onBlur ?? field.onBlur,
            'aria-invalid':
              child.props['aria-invalid'] ?? (fieldState.invalid || undefined),
            'aria-describedby':
              child.props['aria-describedby'] ?? describedById,
          });
        }

        return injected;
      }}
    />
  );
}
