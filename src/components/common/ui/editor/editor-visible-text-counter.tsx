import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface EditorVisibleTextCounterProps {
  currentLength: number;
  helperText?: string;
  maxLength: number;
}

export default function EditorVisibleTextCounter({
  currentLength,
  helperText,
  maxLength,
}: EditorVisibleTextCounterProps) {
  return (
    <div
      className={cn(
        'flex px-150 pt-50 pb-100',
        helperText ? 'items-center justify-between gap-100' : 'justify-end',
      )}
    >
      {helperText ? (
        <p className="font-designer-13r text-text-subtlest">{helperText}</p>
      ) : null}
      <p className="font-designer-13r text-text-subtlest">
        {currentLength.toLocaleString()} / {maxLength.toLocaleString()}
      </p>
    </div>
  );
}
