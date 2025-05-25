import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu';
import Chip from '../chip';

export interface Option {
  label: string;
  value: string;
}

interface Props<T extends string | number> {
  options: Option[];
  defaultValueIds?: T[];
  placeholder?: string;
  onChange?: (ids: T[]) => void;
}

export default function ChipDropdown<T extends string | number>({
  options,
  defaultValueIds,
  placeholder,
  onChange,
}: Props<T>) {
  const [selectedIds, setSelectedIds] = useState<T[]>(defaultValueIds || []);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onChange?.(selectedIds);
  }, [selectedIds]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="w-full focus:outline-none">
        <div className="flex w-full items-center justify-between rounded-[var(--radius-100)] border border-[var(--color-button-secondary-border)] px-[var(--spacing-150)] py-[var(--spacing-100)]">
          <div className="flex flex-wrap gap-[var(--spacing-50)] [&>*]:pointer-events-auto">
            {selectedIds.length === 0 ? (
              <span className="font-designer-14m text-[var(--color-text-subtlest)]">
                {placeholder}
              </span>
            ) : (
              selectedIds.map((id) => (
                <Chip
                  id={id}
                  isActive
                  key={id}
                  text={options.find((option) => option.value === id)?.label}
                  onClose={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedIds(
                      selectedIds.filter((selectedId) => selectedId !== id),
                    );
                  }}
                />
              ))
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex w-full flex-col gap-[var(--spacing-50)] rounded-[var(--radius-100)] border border-[var(--color-border-default)] bg-[var(--color-background-default)] p-[var(--spacing-50)] shadow-[var(--shadow-2)]"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              if (selectedIds.includes(option.value as T)) {
                setSelectedIds(
                  selectedIds.filter((id) => id !== (option.value as T)),
                );
              } else {
                setSelectedIds([...selectedIds, option.value as T]);
              }
            }}
            className="h-[45px] w-full cursor-pointer p-[var(--spacing-150)]"
          >
            <span className="font-designer-14m text-[var(--color-text-subtlest)]">
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
