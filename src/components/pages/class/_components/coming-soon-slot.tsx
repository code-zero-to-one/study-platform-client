'use client';

import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { LeadCaptureModal } from './lead-capture-modal';
import { MaterialIcon } from './material-icon';
import { type ComingSoonCourse } from '../_data/courses';

interface ComingSoonSlotProps {
  course: ComingSoonCourse;
}

export function ComingSoonSlot({ course }: ComingSoonSlotProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          'bg-background-default rounded-200 overflow-hidden border border-dashed border-border-default',
        )}
      >
        <div className="px-300 pt-300 pb-300">
          <span
            className={cn(
              'font-designer-12b inline-flex items-center rounded-full px-150 py-25',
              'bg-fill-neutral-default-default text-text-default',
            )}
            style={{ letterSpacing: '-0.005em' }}
          >
            Coming Soon
          </span>
          <h3
            className="font-bold-h6 text-text-subtlest mt-150"
            style={{ letterSpacing: '-0.01em' }}
          >
            {course.title}
          </h3>
          <p className="font-designer-13r text-text-subtlest mt-75">
            {course.releaseLabel}
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={cn(
              'font-designer-14b mt-200 flex w-full items-center justify-center gap-75',
              'h-500 rounded-100 border border-border-default',
              'bg-background-default text-text-default',
              'hover:bg-fill-neutral-subtle-hover hover:border-fill-neutral-strong-default',
              'transition-colors',
            )}
          >
            <MaterialIcon name="notifications_active" size={16} />
            오픈 알림 받기
          </button>
        </div>
      </div>

      <LeadCaptureModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        courseTitle={course.title}
        releaseLabel={course.releaseLabel}
      />
    </>
  );
}
