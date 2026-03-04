import * as React from 'react';
import SurfacePanel from '@/components/common/ui/surface-panel';

interface MentoringSectionTemplateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  rightSlot?: React.ReactNode;
  empty: boolean;
  emptyContent: React.ReactNode;
  children: React.ReactNode;
}

export default function MentoringSectionTemplate({
  title,
  description,
  rightSlot,
  empty,
  emptyContent,
  children,
}: MentoringSectionTemplateProps) {
  return (
    <SurfacePanel radius="lg" className="p-300">
      <header className="mb-200 flex flex-wrap items-center justify-between gap-100">
        <div>
          <h2 className="font-designer-20b text-text-default">{title}</h2>
          {description ? (
            <p className="font-designer-14r text-text-subtle mt-50">
              {description}
            </p>
          ) : null}
        </div>
        {rightSlot}
      </header>

      {empty ? emptyContent : children}
    </SurfacePanel>
  );
}
