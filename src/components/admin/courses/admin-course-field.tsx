import type { ReactNode } from 'react';

interface AdminCourseFieldProps {
  label: string;
  children: ReactNode;
  helper?: string;
}

export default function AdminCourseField({
  label,
  children,
  helper,
}: AdminCourseFieldProps) {
  return (
    <div className="flex flex-col gap-75">
      <span className="font-designer-13m text-text-subtle">{label}</span>
      {children}
      {helper ? (
        <span className="font-designer-12r text-text-subtlest">{helper}</span>
      ) : null}
    </div>
  );
}
