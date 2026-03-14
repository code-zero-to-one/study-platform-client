import type { ReactNode } from 'react';
import FieldErrorText from '@/components/common/ui/form/field-error-text';

interface MatchingFormFieldProps {
  label: string;
  helper?: ReactNode;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}

export default function MatchingFormField({
  label,
  helper,
  error,
  required = false,
  htmlFor,
  children,
}: MatchingFormFieldProps) {
  return (
    <div className="flex flex-col gap-75">
      <div className="flex items-center gap-75">
        <label
          htmlFor={htmlFor}
          className="font-designer-14b text-text-default"
        >
          {label}
        </label>
        {required ? (
          <span className="font-designer-12r text-text-error">필수</span>
        ) : null}
      </div>
      {helper ? (
        <p className="font-designer-13r text-text-subtle">{helper}</p>
      ) : null}
      {children}
      <FieldErrorText message={error} className="mt-0" />
    </div>
  );
}
