'use client';

import * as React from 'react';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

export function TableFooter({
  className,
  ...props
}: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return <th data-slot="table-head" className={cn(className)} {...props} />;
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  );
}

interface Props<T extends string> {
  headers: readonly T[];
  placeholder?: string;
  data: Record<T, React.ReactNode>[];
}

export default function TableList<T extends string>({
  headers,
  placeholder = '아직 진행된 매칭이 없어요!',
  data,
}: Props<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background-alternative rounded-50 border border-transparent">
          {headers.map((header) => (
            <TableHead
              key={header}
              className="font-designer-13r text-text-subtle px-100 py-200 text-center align-middle leading-[20px]"
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow className="h-[240px]">
            <TableCell
              colSpan={headers.length}
              className="text-text-subtle p-300 text-center"
            >
              {placeholder}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => (
            <TableRow key={index} className="border-none">
              {headers.map((header) => (
                <TableCell
                  key={header}
                  className="p-300 text-center align-middle whitespace-normal"
                >
                  {row[header]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
