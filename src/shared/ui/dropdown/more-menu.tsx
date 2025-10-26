import { Ellipsis } from 'lucide-react';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu';

interface MoreMenuOption {
  options: {
    label: string;
    value: string;
    onMenuClick: () => void;
  }[];
  size: number;
}

export default function MoreMenu({ options, size }: MoreMenuOption) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer focus:outline-none">
        <Ellipsis size={size} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-100 border-border-default bg-background-default shadow-2 flex w-full flex-col gap-50 border p-50">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={option.onMenuClick}
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
