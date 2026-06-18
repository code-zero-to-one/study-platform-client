import * as React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

type BorderedTextareaProps = React.ComponentPropsWithoutRef<'textarea'>;

const BorderedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  BorderedTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'font-designer-14r rounded-100 border-border-default bg-background-default',
        'text-text-default min-h-[180px] w-full resize-y border p-150',
        'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
        className,
      )}
      {...props}
    />
  );
});

BorderedTextarea.displayName = 'BorderedTextarea';

export default BorderedTextarea;
