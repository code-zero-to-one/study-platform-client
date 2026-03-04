import * as RadixTooltip from '@radix-ui/react-tooltip';
import * as React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface TooltipProps {
  trigger: React.ReactElement;
  value: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  delayDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  arrowClassName?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  trigger,
  value,
  side = 'top',
  align = 'center',
  sideOffset = 5,
  delayDuration,
  open,
  defaultOpen,
  onOpenChange,
  contentClassName = 'font-designer-16m rounded-100',
  arrowClassName,
}) => {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <RadixTooltip.Trigger asChild>{trigger}</RadixTooltip.Trigger>

        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            className={cn(
              'text-text-inverse bg-background-neutral-strong data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade px-150 py-100 leading-none select-none',
              contentClassName,
            )}
          >
            {value}
            <RadixTooltip.Arrow className={arrowClassName} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
