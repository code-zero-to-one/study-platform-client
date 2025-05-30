'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/shared/shadcn/lib/utils'

const badgeVariants = cva(
   'inline-flex min-w-[24px] px-[6px] py-[2.5px] justify-center items-center gap-[2px] text-xs font-medium whitespace-nowrap',
   {
      variants: {
         color: {
            default: 'bg-background-accent-blue-subtle text-text-subtlest border-border-default',
            completed: 'bg-fill-success-subtle-default text-text-success',
            incomplete: 'bg-fill-danger-subtle-default text-text-error',
            orange: 'bg-background-accent-orange-subtle text-background-accent-orange-strong',
            gray: 'bg-background-accent-gray-subtle text-background-accent-gray-strong',
            purple: 'bg-background-accent-purple-subtle text-background-accent-purple-strong'
         },
         shape: {
            rectangle: 'rounded-50',
            round: 'rounded-full',
         },
      },
      defaultVariants: {
         color: 'default',
         shape: 'rectangle',
      },
   }
)

type BadgeProps = {
   asChild?: boolean
   leftIcon?: React.ReactNode
   rightIcon?: React.ReactNode
} & Omit<React.ComponentProps<'span'>, 'color'> &
   VariantProps<typeof badgeVariants>

function Badge({
   asChild = false,
   color,
   shape,
   leftIcon,
   rightIcon,
   className,
   children,
   ...props
}: BadgeProps) {
   const Comp = asChild ? Slot : 'span'

   return (
      <Comp
         data-slot="badge"
         className={cn(badgeVariants({ color, shape }), className)}
         {...props}
      >
         {leftIcon && <span className="mr-[2px]">{leftIcon}</span>}
         {children}
         {rightIcon && <span className="ml-[2px]">{rightIcon}</span>}
      </Comp>
   )
}

export { Badge, badgeVariants }
