import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
}

export default function Dropdown({
  placeholder,
  options,
  defaultValue,
  onSelect,
}: Props) {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="w-full focus:outline-none">
        <div className="flex w-full items-center justify-between rounded-[var(--radius-100)] border border-[var(--color-border-strong)] p-[var(--spacing-150)]">
          <span className="text-[var(--color-text)]">
            {selectedValue || placeholder}
          </span>
          {isOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        onClick={() => setIsOpen(false)}
        className="flex w-full flex-col gap-[var(--spacing-50)] rounded-[var(--radius-100)] border border-[var(--color-border-default)] p-[var(--spacing-50)] shadow-[var(--shadow-2)]"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              setSelectedValue(option.value);
              onSelect(option.value);
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
