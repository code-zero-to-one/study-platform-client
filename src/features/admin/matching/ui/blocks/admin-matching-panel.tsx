import type { ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import SurfacePanel, {
  SurfacePanelHeader,
} from '@/components/common/ui/surface-panel';

interface AdminMatchingPanelProps {
  title: ReactNode;
  description?: ReactNode;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export default function AdminMatchingPanel({
  title,
  description,
  rightSlot,
  children,
  className,
  bodyClassName,
}: AdminMatchingPanelProps) {
  return (
    <SurfacePanel
      className={cn('rounded-200 shadow-1 overflow-hidden', className)}
    >
      <SurfacePanelHeader className="bg-background-alternative flex flex-col gap-125 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h2 className="font-designer-20b text-text-default">{title}</h2>
          {description ? (
            <p className="font-designer-13r text-text-subtle mt-50">
              {description}
            </p>
          ) : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </SurfacePanelHeader>
      <div className={cn('p-200', bodyClassName)}>{children}</div>
    </SurfacePanel>
  );
}
