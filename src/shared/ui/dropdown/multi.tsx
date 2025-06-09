'use client';

import { XIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
   options: Option[];
   selected: string[];
   onChange: (selected: string[]) => void;
   placeholder?: string;
}

export default function MultiDropdown({
   options,
   selected,
   onChange,
   placeholder = '선택해주세요',
}: MultiDropdownProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [query, setQuery] = useState('');

   const handleAdd = (val: string) => {
      onChange([...selected, val]);
      setQuery('');
   };

   const handleRemove = (val: string) => {
      onChange(selected.filter((v) => v !== val));
   };

   const handleClear = () => {
      onChange([]);
      setQuery('');
   };

   const selectedLabels = selected
      .map((val) => options.find((opt) => opt.value === val)?.label)
      .filter(Boolean) as string[];

   return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
         <DropdownMenuTrigger asChild>
            <div
               className="flex w-full items-center justify-between rounded-150 px-150 h-[48px] border border-border-default bg-fill-neutral-subtle-default cursor-pointer"
               role="button"
               tabIndex={0}
            >
               <div className="flex flex-wrap items-center gap-50 flex-1">
                  {selected.length === 0 && !query && (
                     <span className="text-text-subtlest font-designer-14r">{placeholder}</span>
                  )}

                  {selectedLabels.map((label, idx) => (
                     <span
                        key={idx}
                        className="bg-fill-brand-default-default text-text-inverse font-designer-14m px-150 py-75 rounded-full flex items-center gap-50"
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
                     className="ml-2 cursor-pointer bg-icon-strong rounded-full w-200 h-200 flex items-center justify-center"
                     role="button"
                     tabIndex={0}
                  >
                     <XIcon className="text-icon-inverse" size={14} />
                  </span>
               )}

               {isOpen ? <ChevronUp className="size-4 ml-2" /> : <ChevronDown className="size-4 ml-2" />}
            </div>
         </DropdownMenuTrigger>


         <DropdownMenuContent
            onClick={() => setIsOpen(false)}
            className="flex w-full flex-col gap-50 rounded-100 border border-border-default bg-background-default p-50 shadow-2"
            style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
         >
            {options.length > 0 ? (
               options.map((option) => (
                  <DropdownMenuItem
                     key={option.value}
                     onClick={() => {
                        handleAdd(option.value);
                     }}
                     className="h-[48px] w-full cursor-pointer p-150 active:bg-fill-neutral-subtle-pressed rounded-100"
                  >
                     <span className="font-designer-14m text-text-subtle ">
                        {option.label}
                     </span>
                  </DropdownMenuItem>
               ))) : (
               <div className="px-4 py-2 text-sm text-gray-400">결과 없음</div>
            )}
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
