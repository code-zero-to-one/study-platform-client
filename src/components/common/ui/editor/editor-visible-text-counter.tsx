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
        'border-border-subtle flex border-t px-150 py-100',
        helperText ? 'items-center justify-between gap-100' : 'justify-end',
      )}
    >
      {helperText ? (
        <p className="font-designer-12r text-text-subtle">{helperText}</p>
      ) : null}
      <p className="font-designer-12r text-text-subtle">
        {currentLength.toLocaleString()} / {maxLength.toLocaleString()}
      </p>
    </div>
  );
}
