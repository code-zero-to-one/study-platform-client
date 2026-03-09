import type { ReactNode } from 'react';

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
      {error ? (
        <p className="font-designer-13r text-text-error mt-0" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
