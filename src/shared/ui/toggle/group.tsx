import ToggleButton from './button';

export interface ToggleOption {
  value: string;
  label: string;
}

export interface ToggleGroupProps {
  options: ToggleOption[];
  value?: string[];
  onChange?: (v: string[]) => void;
  multiple?: boolean;
}

function ToggleGroup({
  options,
  value,
  onChange,
  multiple = true,
}: ToggleGroupProps) {
  const selected = value ?? [];

  const toggle = (key: string) => {
    let next: string[];
    if (multiple) {
      next = selected.includes(key)
        ? selected.filter((x) => x !== key)
        : [...selected, key];
    } else {
      next = selected.includes(key) ? [] : [key];
    }
    onChange?.(next);
  };

  return (
    <div
      className="flex flex-wrap gap-100"
      role="group"
      aria-label="toggle-group"
    >
      {options.map(({ value: v, label }) => (
        <ToggleButton
          key={v}
          variant="round"
          pressed={selected.includes(v)}
          onPressedChange={() => toggle(v)}
        >
          {label}
        </ToggleButton>
      ))}
    </div>
  );
}

export default ToggleGroup;
