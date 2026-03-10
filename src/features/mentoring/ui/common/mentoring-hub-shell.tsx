import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import SurfacePanel from '@/components/common/ui/surface-panel';

type MentoringHubTone =
  | 'default'
  | 'brand'
  | 'green'
  | 'orange'
  | 'red'
  | 'blue';

interface MentoringHubStatItem {
  label: string;
  value: string;
  helper?: string;
  tone?: MentoringHubTone;
  href?: string;
}

interface MentoringHubHeroProps {
  title: string;
  description: string;
  eyebrow?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  stats?: MentoringHubStatItem[];
  bottomSlot?: React.ReactNode;
  className?: string;
}

const STAT_TONE_CLASS: Record<MentoringHubTone, string> = {
  default: 'text-text-default',
  brand: 'text-text-brand',
  green: 'text-text-success',
  orange: 'text-text-warning',
  red: 'text-text-error',
  blue: 'text-text-information',
};

export function MentoringHubHero({
  title,
  description,
  eyebrow,
  badges,
  actions,
  stats,
  bottomSlot,
  className,
}: MentoringHubHeroProps) {
  return (
    <SurfacePanel
      radius="lg"
      overflow="hidden"
      className={cn('border-border-subtle', className)}
    >
      <div className="bg-background-alternative border-border-subtle border-b px-250 py-250">
        <div className="flex flex-col gap-200 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="font-designer-12m text-text-brand mb-75">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-designer-28b text-text-default">{title}</h1>
            <p className="font-designer-14r text-text-subtle mt-75 leading-relaxed">
              {description}
            </p>
            {badges ? (
              <div className="mt-125 flex flex-wrap gap-75">{badges}</div>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap gap-100">{actions}</div>
          ) : null}
        </div>
      </div>

      {stats && stats.length > 0 ? (
        <div className="grid gap-100 px-200 py-200 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const content = (
              <div className="rounded-150 border-border-subtle bg-background-default h-full border px-200 py-150">
                <p className="font-designer-12m text-text-subtle">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    'font-designer-24b mt-50',
                    STAT_TONE_CLASS[stat.tone ?? 'default'],
                  )}
                >
                  {stat.value}
                </p>
                {stat.helper ? (
                  <p className="font-designer-12r text-text-subtle mt-50 leading-relaxed">
                    {stat.helper}
                  </p>
                ) : null}
              </div>
            );

            return stat.href ? (
              <Link key={`${stat.label}-${stat.value}`} href={stat.href}>
                {content}
              </Link>
            ) : (
              <div key={`${stat.label}-${stat.value}`}>{content}</div>
            );
          })}
        </div>
      ) : null}

      {bottomSlot ? (
        <div className="border-border-subtle border-t px-200 py-200">
          {bottomSlot}
        </div>
      ) : null}
    </SurfacePanel>
  );
}

interface MentoringHubSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function MentoringHubSection({
  title,
  description,
  icon,
  rightSlot,
  children,
  className,
  contentClassName,
}: MentoringHubSectionProps) {
  return (
    <SurfacePanel radius="lg" className={cn(className)}>
      <div className="border-border-subtle flex flex-col gap-125 border-b px-225 py-200 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-75">
            {icon ? (
              <span className="text-text-brand shrink-0">{icon}</span>
            ) : null}
            <h2 className="font-designer-18b text-text-default">{title}</h2>
          </div>
          {description ? (
            <p className="font-designer-13r text-text-subtle mt-50 leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      <div className={cn('px-225 py-200', contentClassName)}>{children}</div>
    </SurfacePanel>
  );
}
