import { ChevronDown, ChevronUp } from 'lucide-react';
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

interface Props {
  options: Option[];
  defaultValue?: string | number;
  placeholder?: string;
  onChange: (value: string | number) => void;
}

export default function SingleDropdownProvider({
  placeholder,
  options,
  defaultValue,
  onChange,
}: Props) {
  const [selectedValue, setSelectedValue] = useState<string | number | undefined>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === selectedValue);
  const displayText = selectedOption?.label || placeholder;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="w-full focus:outline-none">
        <div className="flex w-full items-center justify-between rounded-150 px-150 h-[48px] border border-border-default bg-fill-neutral-subtle-default">
          <span className={`font-designer-14m ${selectedOption ? 'text-text-subtle' : 'text-text-subtlest'}`}>
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
        onClick={() => setIsOpen(false)}
        className="flex w-full flex-col gap-50 rounded-100 border border-border-default bg-background-default p-50 shadow-2"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              setSelectedValue(option.value);
              onChange(option.value);
            }}
            className="h-[48px] w-full cursor-pointer p-150 active:bg-fill-neutral-subtle-pressed rounded-100"
          >
            <span className="font-designer-14m ">
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const SingleDropdown = {
  Provider: SingleDropdownProvider,
} as const;