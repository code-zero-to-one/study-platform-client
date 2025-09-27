import type { ComponentType, ReactNode } from 'react';
import ToggleButton from './button';

export interface ToggleOption {
  value: string;
  label: string;
}

interface MultiProps {
  options: ToggleOption[];
  multiple?: true;
  value?: string[];
  onChange?: (v: string[]) => void;
  renderItem?: ComponentType<ItemRendererProps>;
}

interface SingleProps {
  options: ToggleOption[];
  multiple: false;
  value?: string;
  onChange?: (v: string | undefined) => void;
  allowDeselect?: boolean;
  emptyValue?: string | undefined;
  renderItem?: ComponentType<ItemRendererProps>;
}

export type ToggleGroupProps = MultiProps | SingleProps;

export interface ItemRendererProps {
  pressed: boolean;
  onPress: () => void;
  children: ReactNode;
}

function DefaultToggleItem({ pressed, onPress, children }: ItemRendererProps) {
  return (
    <ToggleButton variant="round" pressed={pressed} onPressedChange={onPress}>
      {children}
    </ToggleButton>
  );
}

function ToggleGroup(props: ToggleGroupProps) {
  const { options } = props;
  const isMulti = props.multiple !== false;
  const Item = props.renderItem ?? DefaultToggleItem;

  const selectedSet = new Set(
    isMulti ? (props.value ?? []) : props.value ? [props.value] : [],
  );

  const toggle = (key: string) => {
    if (isMulti) {
      const curr = (props.value ?? []) as string[];
      const next = curr.includes(key)
        ? curr.filter((x) => x !== key)
        : [...curr, key];
      (props.onChange as ((v: string[]) => void) | undefined)?.(next);
    } else {
      const curr = props.value as string | undefined;
      const allowDeselect = props.allowDeselect ?? true;
      const cleared = 'emptyValue' in props ? props.emptyValue : undefined;
      const next = curr === key ? (allowDeselect ? cleared : key) : key;
      (props.onChange as ((v: string | undefined) => void) | undefined)?.(next);
    }
  };

  return (
    <div
      className="flex flex-wrap gap-100"
      role="group"
      aria-label="toggle-group"
    >
      {options.map(({ value: v, label }) => (
        <Item key={v} pressed={selectedSet.has(v)} onPress={() => toggle(v)}>
          {label}
        </Item>
      ))}
    </div>
  );
}

export default ToggleGroup;
