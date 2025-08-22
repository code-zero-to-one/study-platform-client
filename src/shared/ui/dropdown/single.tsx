import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu';

export interface Option {
  label: string;
  value: string;
}

interface Props {
  options: ReadonlyArray<Option>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

function SingleDropdown({
  options,
  value,
  onChange,
  placeholder,
  error = false,
  disabled = false,
  className,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );
  const displayText = selected?.label ?? placeholder ?? '';

  const handleSelect = useCallback(
    (v: string) => {
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
            'rounded-100 flex h-[48px] w-full items-center justify-between border px-150',
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
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
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
                'rounded-100 h-[48px] w-full cursor-pointer p-150',
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
