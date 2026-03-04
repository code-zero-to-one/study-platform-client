import * as React from 'react';
import SurfacePanel from '@/components/ui/surface-panel';

interface MentoringEmptyPanelProps {
  title: React.ReactNode;
  description?: React.ReactNode;
}

export default function MentoringEmptyPanel({
  title,
  description,
}: MentoringEmptyPanelProps) {
  return (
    <SurfacePanel className="px-250 py-300 text-center">
      <p className="font-designer-18b text-text-default">{title}</p>
      {description ? (
        <p className="font-designer-14r text-text-subtle mt-75">
          {description}
        </p>
      ) : null}
    </SurfacePanel>
  );
}
