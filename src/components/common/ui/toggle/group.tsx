import React, { type ComponentType, type ReactNode } from 'react';
import ToggleButton from './button';

type Value = string | number;
type ToggleVariant = 'round' | 'square';

export interface ToggleOption {
  value: Value;
  label: string;
}

interface MultiProps {
  variant?: ToggleVariant;
  options: ToggleOption[];
  multiple?: true;
  value?: Value[];
  onChange?: (v: Value[]) => void;
  renderItem?: ComponentType<ItemRendererProps>;
}

interface SingleProps {
  variant?: ToggleVariant;
  options: ToggleOption[];
  multiple: false;
  value?: Value;
  onChange?: (v: Value | undefined) => void;
  allowDeselect?: boolean;
  emptyValue?: Value | undefined;
  renderItem?: ComponentType<ItemRendererProps>;
}

export type ToggleGroupProps = MultiProps | SingleProps;

export interface ItemRendererProps {
  variant?: ToggleVariant;
  pressed: boolean;
  onPress: () => void;
  children: ReactNode;
}

function ToggleGroup({
  variant = 'round',
  pressed,
  onPress,
  children,
}: ItemRendererProps) {
  return (
    <ToggleButton variant={variant} pressed={pressed} onPressedChange={onPress}>
      {children}
    </ToggleButton>
  );
}

function GroupItems(props: ToggleGroupProps & { children?: ReactNode }) {
  const { variant = 'round', options } = props;
  const isMulti = props.multiple !== false;
  const Item = props.renderItem ?? ToggleGroup;

  const selectedSet = new Set(
    isMulti ? (props.value ?? []) : props.value ? [props.value] : [],
  );

  const toggle = (key: Value) => {
    if (isMulti) {
      const curr = (props.value ?? []) as Value[];
      const next = curr.includes(key)
        ? curr.filter((x) => x !== key)
        : [...curr, key];
      (props.onChange as ((v: Value[]) => void) | undefined)?.(next);
    } else {
      const curr = props.value as Value | undefined;
      const allowDeselect = props.allowDeselect ?? true;
      const cleared = 'emptyValue' in props ? props.emptyValue : undefined;
      const next = curr === key ? (allowDeselect ? cleared : key) : key;
      (props.onChange as ((v: Value | undefined) => void) | undefined)?.(next);
    }
  };

  return (
    <div
      className="flex flex-wrap gap-100"
      role="group"
      aria-label="toggle-group"
    >
      {options?.map(({ value: v, label }) => (
        <Item
          key={v}
          variant={variant}
          pressed={selectedSet.has(v)}
          onPress={() => toggle(v)}
        >
          {label}
        </Item>
      ))}
      {props.children}
    </div>
  );
}

export default GroupItems;
