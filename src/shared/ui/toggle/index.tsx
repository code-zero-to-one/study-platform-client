'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cva } from 'class-variance-authority';
import { cn } from '@/shared/shadcn/lib/utils'

const toggleRootVariants = cva(
   'inline-flex items-center rounded-full transition-colors',
   {
      variants: {
         color: {
            primary: 'bg-fill-success-default-default',
            gray: 'bg-fill-neutral-default-default',
         },
         size: {
            sm: 'h-200 w-[28px]',
            md: 'h-[20px] w-500',
            lg: 'h-300 w-[46px]',
         },
      },
      defaultVariants: {
         color: 'primary',
         size: 'md',
      },
   }
)

const toggleThumbVariants = cva(
   'rounded-full transition-transform bg-background-default shadow-[0_1px_2px_rgba(0,0,0,0.2)]',
   {
      variants: {
         size: {
            sm: 'size-150 translate-x-[2px] data-[state=checked]:translate-x-[14px]',
            md: 'size-200 translate-x-[2px] data-[state=checked]:translate-x-[22px]',
            lg: 'size-[20px] translate-x-[2px] data-[state=checked]:translate-x-[24px]',
         },
      },
      defaultVariants: {
         size: 'md',
      },
   }
)

interface ToggleProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
   label?: string
   color?: 'primary' | 'gray'
   size?: 'sm' | 'md' | 'lg'
   className?: string
}

function ToggleProvider({
   color = 'primary',
   size = 'md',
   checked,
   className,
   ...props }: ToggleProps) {
   const appliedColor = checked ? color : 'gray';

   return (
      <SwitchPrimitive.Root
         data-slot="toggle"
         className={cn(toggleRootVariants({ color: appliedColor, size }), className)}
         checked={checked}
         {...props}
      >
         <SwitchPrimitive.Thumb
            data-slot="toggle-thumb"
            className={cn(toggleThumbVariants({ size }))}
         />
      </SwitchPrimitive.Root>
   )
}

function ToggleLabel({
   children,
   className,
   ...props
}: React.ComponentProps<'label'>) {
   return (
      <label
         data-slot="toggle-label"
         className={cn('flex items-center gap-50 cursor-pointer', className)}
         {...props}
      >
         {children}
      </label>
   )
}

export const Toggle = {
   Provider: ToggleProvider,
   Label: ToggleLabel,
} as const
