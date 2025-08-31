'use client';

import { XIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu';

interface Option {
  label: string;
  value: string;
}

interface MultiDropdownProps {
  options: ReadonlyArray<Option>;
  value?: ReadonlyArray<string>;
  onChange?: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

const EMPTY: ReadonlyArray<string> = Object.freeze([]);

export default function MultiDropdown({
  options,
  value,
  onChange,
  placeholder = '선택해주세요',
  disabled = false,
  error = false,
  className,
}: MultiDropdownProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo<ReadonlyArray<string>>(
    () => value ?? EMPTY,
    [value],
  );

  const selectedItems = useMemo(() => {
    const set = new Set(selected);

    return options.filter((o) => set.has(o.value));
  }, [options, selected]);

  const remainingOptions = useMemo(() => {
    const set = new Set(selected);

    return options.filter((o) => !set.has(o.value));
  }, [options, selected]);

  const setNext = useCallback((next: string[]) => onChange?.(next), [onChange]);

  const add = useCallback(
    (v: string) => {
      if (selected.includes(v)) return;
      setNext([...selected, v]);
    },
    [selected, setNext],
  );

  const remove = useCallback(
    (v: string) => {
      setNext(selected.filter((x) => x !== v));
    },
    [selected, setNext],
  );

  const clear = useCallback(() => setNext([]), [setNext]);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(option) => !disabled && setOpen(option)}
    >
      <DropdownMenuTrigger asChild>
        <div
          tabIndex={0}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-invalid={error || undefined}
          className={[
            'rounded-150 flex h-auto max-h-[120px] min-h-[48px] w-full flex-wrap items-center justify-between border px-150 py-50',
            error ? 'border-border-error' : 'border-border-default',
            'bg-fill-neutral-subtle-default',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            className ?? '',
          ].join(' ')}
        >
          <div className="scrollbar-hide flex max-h-[96px] flex-1 flex-wrap items-center gap-50 overflow-y-auto">
            {selected.length === 0 && (
              <span className="font-designer-14r text-text-subtlest">
                {placeholder}
              </span>
            )}

            {selectedItems.map((item) => (
              <span
                key={item.value}
                className="bg-fill-brand-default-default text-text-inverse font-designer-14m flex items-center gap-50 rounded-full px-150 py-75"
              >
                {item.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(item.value);
                  }}
                  className="cursor-pointer"
                  aria-label={`${item.label} 제거`}
                >
                  <XIcon size={16} />
                </button>
              </span>
            ))}
          </div>

          <div className="ml-auto flex flex-shrink-0 items-center gap-100">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
                className="bg-icon-strong flex h-200 w-200 items-center justify-center rounded-full"
                aria-label="선택 모두 지우기"
              >
                <XIcon className="text-icon-inverse" size={14} />
              </button>
            )}
            {open ? (
              <ChevronUp className="ml-2 size-4" />
            ) : (
              <ChevronDown className="ml-2 size-4" />
            )}
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="shadow-2 rounded-100 border-border-default bg-background-default flex w-full flex-col gap-50 border p-50"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        {remainingOptions.length > 0 ? (
          remainingOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={(e) => {
                e.preventDefault();
                add(option.value);
              }}
              className="rounded-100 data-[highlighted]:bg-fill-neutral-subtle-pressed h-[40px] w-full p-150"
            >
              <span className="font-designer-14m text-text-subtle">
                {option.label}
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-75 py-100 text-sm text-gray-400">결과 없음</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
