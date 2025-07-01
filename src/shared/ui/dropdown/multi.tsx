'use client';

import { XIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu';

interface Option {
  label: string;
  value: string | number;
}

interface MultiDropdownProps {
  options: Option[];
  defaultValue?: (string | number)[];
  onChange?: (selected: (string | number)[]) => void;
  placeholder?: string;
}

function MultiDropdown({
  options,
  defaultValue = [],
  onChange,
  placeholder = '선택해주세요',
}: MultiDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<(string | number)[]>(defaultValue);

  const handleAdd = (val: string | number) => {
    if (selected.includes(val)) return; // 중복 방지
    const newSelected = [...selected, val];
    setSelected(newSelected);
    onChange?.(newSelected);
    setQuery('');
  };

  const handleRemove = (val: string | number) => {
    const newSelected = selected.filter((v) => v !== val);
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const handleClear = () => {
    setSelected([]);
    onChange?.([]);
    setQuery('');
  };

  const selectedLabels = selected
    .map((val) => options.find((opt) => opt.value === val)?.label)
    .filter(Boolean) as string[];

  const filteredOptions = options.filter(
    (opt) => !selected.includes(opt.value),
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className="rounded-150 border-border-default bg-fill-neutral-subtle-default flex h-[48px] w-full cursor-pointer items-center justify-between border px-150"
          role="button"
          tabIndex={0}
        >
          <div className="flex flex-1 flex-wrap items-center gap-50">
            {selected.length === 0 && !query && (
              <span className="text-text-subtlest font-designer-14r">
                {placeholder}
              </span>
            )}

            {selectedLabels.map((label, idx) => (
              <span
                key={idx}
                className="bg-fill-brand-default-default text-text-inverse font-designer-14m flex items-center gap-50 rounded-full px-150 py-75"
              >
                {label}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(selected[idx]);
                  }}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  <XIcon size={16} />
                </span>
              </span>
            ))}
          </div>

          {selected.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="bg-icon-strong ml-2 flex h-200 w-200 cursor-pointer items-center justify-center rounded-full"
              role="button"
              tabIndex={0}
            >
              <XIcon className="text-icon-inverse" size={14} />
            </span>
          )}

          {isOpen ? (
            <ChevronUp className="ml-2 size-4" />
          ) : (
            <ChevronDown className="ml-2 size-4" />
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        onClick={() => setIsOpen(false)}
        className="rounded-100 border-border-default bg-background-default shadow-2 flex w-full flex-col gap-50 border p-50"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleAdd(option.value)}
              className="active:bg-fill-neutral-subtle-pressed rounded-100 h-[48px] w-full cursor-pointer p-150"
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

export default MultiDropdown;
