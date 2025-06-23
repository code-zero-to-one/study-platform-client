// header 에서 사용하는 dropdown 컴포넌트
// - 테두리, Chevron 없음
// - dropwdown 메뉴 클릭시에도 Trigger의 placeholder가 유지되어야함

import { ReactNode } from 'react';
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

interface HeaderDropdownProps {
  options: Option[];
  defaultValue?: string | number;
  placeholder?: ReactNode;
  onChange: (value: string | number) => void;
}

function HeaderDropdown({
  placeholder,
  options,
  onChange,
}: HeaderDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full focus:outline-none">
        <div>{placeholder}</div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="rounded-100 border-border-default bg-background-default shadow-2 flex w-full flex-col gap-50 border p-50">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              onChange(option.value);
            }}
            className="active:bg-fill-neutral-subtle-pressed rounded-100 h-[48px] w-full cursor-pointer p-150"
          >
            <span className="font-designer-14m text-text-subtle">
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default HeaderDropdown;
