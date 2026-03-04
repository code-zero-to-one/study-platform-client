import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const dataTableRowVariants = cva('', {
  variants: {
    bordered: {
      true: 'border-b-border-subtle border-b',
      false: '',
    },
  },
  defaultVariants: {
    bordered: true,
  },
});

const dataTableHeadCellVariants = cva(
  'font-designer-14m text-text-default px-200 text-left',
  {
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      align: 'left',
    },
  },
);

const dataTableCellVariants = cva('px-200 py-150', {
  variants: {
    tone: {
      inherit: '',
      default: 'font-designer-14r text-text-default',
      subtle: 'font-designer-14r text-text-subtle',
      strong: 'font-designer-14b text-text-default',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    tone: 'default',
    align: 'left',
  },
});

export function DataTable({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'table'>) {
  return <table className={cn('w-full', className)} {...props} />;
}

export function DataTableHead({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'thead'>) {
  return (
    <thead
      className={cn('bg-background-neutral-subtle h-[52px]', className)}
      {...props}
    />
  );
}

type DataTableRowProps = React.ComponentPropsWithoutRef<'tr'> &
  VariantProps<typeof dataTableRowVariants>;

export function DataTableRow({
  className,
  bordered,
  ...props
}: DataTableRowProps) {
  return (
    <tr
      className={cn(dataTableRowVariants({ bordered }), className)}
      {...props}
    />
  );
}

type DataTableHeadCellProps = React.ComponentPropsWithoutRef<'th'> &
  VariantProps<typeof dataTableHeadCellVariants>;

export function DataTableHeadCell({
  className,
  align,
  ...props
}: DataTableHeadCellProps) {
  return (
    <th
      className={cn(dataTableHeadCellVariants({ align }), className)}
      {...props}
    />
  );
}

type DataTableCellProps = React.ComponentPropsWithoutRef<'td'> &
  VariantProps<typeof dataTableCellVariants>;

export function DataTableCell({
  className,
  tone,
  align,
  ...props
}: DataTableCellProps) {
  return (
    <td
      className={cn(dataTableCellVariants({ tone, align }), className)}
      {...props}
    />
  );
}
