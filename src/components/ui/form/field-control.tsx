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
  /** 필드 값이 변경된 직후 호출되는 콜백. 자동 스크롤 등 부가 동작에 사용 */
  onAfterChange?: (value: unknown) => void;
  /** blur 시 필드 값이 채워져 있으면 호출되는 콜백. 텍스트 입력 등에서 자동 스크롤에 사용 */
  onAfterBlurFilled?: () => void;
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
  onAfterChange,
  onAfterBlurFilled,
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
          const coreOnChange: ChangeHandler<V> =
            child.props.onChange ??
            ((arg: V | React.ChangeEvent<Element>) => {
              if (isReactChangeEvent(arg)) field.onChange(arg);
              else field.onChange(arg);
            });

          const nextOnChange: ChangeHandler<V> = onAfterChange
            ? (((arg: V | React.ChangeEvent<Element>) => {
                if (isReactChangeEvent(arg)) {
                  (coreOnChange as EventChange)(arg);
                  onAfterChange((arg.target as HTMLInputElement).value);
                } else {
                  (coreOnChange as ValueChange<V>)(arg);
                  onAfterChange(arg);
                }
              }) as ChangeHandler<V>)
            : coreOnChange;

          const baseOnBlur: () => void = child.props.onBlur ?? field.onBlur;
          const nextOnBlur = onAfterBlurFilled
            ? () => {
                baseOnBlur();
                if (field.value) onAfterBlurFilled();
              }
            : baseOnBlur;

          injected = cloneElement(child, {
            id: child.props.id ?? controlId,
            name: child.props.name ?? field.name,
            value: (child.props.value ?? field.value) as V,
            onChange: nextOnChange,
            onBlur: nextOnBlur,
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
