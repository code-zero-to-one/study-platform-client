import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

type CommunitySectionShellProps = ComponentPropsWithoutRef<'section'>;

export default function CommunitySectionShell({
  className,
  ...props
}: CommunitySectionShellProps) {
  return <section className={cn('flex flex-col', className)} {...props} />;
}
