import ToggleButton from './button';

export interface ToggleOption {
  value: string;
  label: string;
}

export interface ToggleGroupProps {
  options: ToggleOption[];
  value?: string[];
  onChange?: (v: string[]) => void;
}

function ToggleGroup({ options, value, onChange }: ToggleGroupProps) {
  const selected = value ?? [];

  const toggle = (key: string) => {
    const next = selected.includes(key)
      ? selected.filter((x) => x !== key)
      : [...selected, key];
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
