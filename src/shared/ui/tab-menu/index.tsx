import { cva } from 'class-variance-authority';
import { cn } from '@/shared/shadcn/lib/utils';

interface TabMenuProps {
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}

const tabMenuVariants = cva(
  'font-designer-14m rounded-100 w-full px-200 py-150',
  {
    variants: {
      color: {
        default:
          'bg-fill-neutral-subtle-default text-text-subtle hover:bg-fill-neutral-subtle-hover active:bg-fill-neutral-subtle-pressed',
        active: 'bg-background-accent-blue-strong text-text-inverse',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  },
);

export default function TabMenu({
  active = false,
  className,
  children,
}: TabMenuProps) {
  return (
    <div
      className={cn(
        tabMenuVariants({ color: active ? 'active' : 'default' }),
        className,
      )}
    >
      {children}
    </div>
  );
}
