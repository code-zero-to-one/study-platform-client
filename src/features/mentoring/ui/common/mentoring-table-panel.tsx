import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import SurfacePanel, {
  SurfacePanelEmpty,
  SurfacePanelHeader,
} from '@/components/ui/surface-panel';

interface MentoringTablePanelProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyContent?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  emptyClassName?: string;
}

export default function MentoringTablePanel({
  title,
  description,
  rightSlot,
  children,
  isEmpty = false,
  emptyContent,
  className,
  headerClassName,
  bodyClassName,
  emptyClassName,
}: MentoringTablePanelProps) {
  return (
    <SurfacePanel overflow="hidden" className={className}>
      <SurfacePanelHeader
        className={cn('flex items-center justify-between', headerClassName)}
      >
        <div>
          <h2 className="font-designer-16b text-text-default">{title}</h2>
          {description ? (
            <p className="font-designer-13r text-text-subtle mt-50">
              {description}
            </p>
          ) : null}
        </div>
        {rightSlot}
      </SurfacePanelHeader>

      {isEmpty ? (
        <SurfacePanelEmpty className={emptyClassName}>
          {emptyContent}
        </SurfacePanelEmpty>
      ) : (
        <div className={bodyClassName}>{children}</div>
      )}
    </SurfacePanel>
  );
}
