import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/(shadcn)/ui/dropdown-menu';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: ReadonlyArray<Option>;
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 's' | 'm' | 'l';
}

function SingleDropdown({
  options,
  value,
  onChange,
  placeholder,
  error = false,
  disabled = false,
  className,
  size = 'l',
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );
  const displayText = selected?.label ?? placeholder ?? '';

  const sizeStyles = {
    s: { height: 'h-[32px]', iconSize: 'size-5' },
    m: { height: 'h-[40px]', iconSize: 'size-6' },
    l: { height: 'h-[48px]', iconSize: 'size-4' },
  }[size];

  const handleSelect = useCallback(
    (v: string | undefined) => {
      if (v !== value) onChange?.(v);
      setIsOpen(false);
    },
    [onChange, value],
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={(o) => !disabled && setIsOpen(o)}>
      <DropdownMenuTrigger
        type="button"
        className="w-full focus:outline-none"
        aria-invalid={error || undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        disabled={disabled}
      >
        <div
          className={[
            'rounded-100 flex w-full items-center justify-between border px-150',
            sizeStyles.height,
            error ? 'border-border-error' : 'border-border-default',
            'bg-fill-neutral-subtle-default',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            className ?? '',
          ].join(' ')}
        >
          <span
            className={`font-designer-14m ${selected ? 'text-text-subtle' : 'text-text-subtlest'}`}
          >
            {displayText}
          </span>
          {isOpen ? (
            <ChevronUp className={sizeStyles.iconSize} />
          ) : (
            <ChevronDown className={sizeStyles.iconSize} />
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="shadow-2 rounded-100 border-border-default bg-background-default flex w-full flex-col gap-50 border p-50"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        {options.map((o) => {
          const isSelected = o.value === value;

          return (
            <DropdownMenuItem
              key={o.value}
              onSelect={() => handleSelect(o.value)}
              aria-selected={isSelected}
              className={[
                'rounded-100 w-full cursor-pointer p-150',
                sizeStyles.height,
                'data-[highlighted]:bg-fill-neutral-subtle-pressed',
                isSelected ? 'bg-fill-neutral-subtle-default' : '',
              ].join(' ')}
            >
              <span className="font-designer-14m">{o.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SingleDropdown;
