'use client';

import {
  BadgeCheck,
  Briefcase,
  Building2,
  type LucideIcon,
  TrendingUp,
} from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

type MentorProfileMetaListVariant = 'directory' | 'detail' | 'sidebar';

interface MentorProfileMetaListProps {
  appealLine?: string;
  companyLabel?: string;
  jobTitleLabel?: string;
  careerLabel?: string;
  variant: MentorProfileMetaListVariant;
  className?: string;
}

interface MentorProfileMetaRow {
  key: 'appeal' | 'company' | 'jobTitle' | 'career';
  icon: LucideIcon;
  value: string;
  iconClassName: string;
  textClassName: string;
}

const VARIANT_STYLES = {
  directory: {
    container: 'flex flex-col gap-75',
    row: 'flex min-w-0 items-center gap-125',
    icon: 'h-160 w-160 shrink-0',
    defaultText: 'font-designer-13m text-text-subtle line-clamp-1',
    accentText:
      'min-w-0 flex-1 break-words whitespace-normal font-designer-13b text-text-brand leading-relaxed',
  },
  detail: {
    container: 'flex flex-col gap-75',
    row: 'flex min-w-0 items-center gap-125',
    icon: 'h-160 w-160 shrink-0',
    defaultText: 'font-designer-14r text-text-subtle leading-relaxed',
    accentText: 'font-designer-14b text-text-brand leading-relaxed',
  },
  sidebar: {
    container: 'flex flex-col gap-75',
    row: 'flex min-w-0 items-center gap-125',
    icon: 'h-160 w-160 shrink-0',
    defaultText: 'font-designer-13m text-text-subtle truncate',
    accentText: 'font-designer-13b text-text-brand truncate',
  },
} as const;

export default function MentorProfileMetaList({
  appealLine = '',
  companyLabel = '',
  jobTitleLabel = '',
  careerLabel = '',
  variant,
  className,
}: MentorProfileMetaListProps) {
  const styles = VARIANT_STYLES[variant];
  const trimmedAppealLine = appealLine.trim();
  const trimmedCompanyLabel = companyLabel.trim();
  const trimmedJobTitleLabel = jobTitleLabel.trim();
  const trimmedCareerLabel = careerLabel.trim();
  const rows: MentorProfileMetaRow[] =
    variant === 'directory'
      ? [
          {
            key: 'jobTitle',
            icon: Briefcase,
            value: trimmedJobTitleLabel,
            iconClassName: 'text-text-subtlest',
            textClassName: styles.defaultText,
          },
          {
            key: 'career',
            icon: TrendingUp,
            value: trimmedCareerLabel,
            iconClassName: 'text-text-subtlest',
            textClassName: styles.defaultText,
          },
          {
            key: 'appeal',
            icon: BadgeCheck,
            value: trimmedAppealLine,
            iconClassName: 'text-text-brand',
            textClassName: styles.accentText,
          },
        ]
      : [
          {
            key: 'appeal',
            icon: BadgeCheck,
            value: trimmedAppealLine,
            iconClassName: 'text-text-brand',
            textClassName: styles.accentText,
          },
          {
            key: 'company',
            icon: Building2,
            value: trimmedCompanyLabel,
            iconClassName: 'text-text-subtlest',
            textClassName: styles.defaultText,
          },
          {
            key: 'jobTitle',
            icon: Briefcase,
            value: trimmedJobTitleLabel,
            iconClassName: 'text-text-subtlest',
            textClassName: styles.defaultText,
          },
          {
            key: 'career',
            icon: TrendingUp,
            value: trimmedCareerLabel,
            iconClassName: 'text-text-subtlest',
            textClassName: styles.defaultText,
          },
        ];

  const visibleRows = rows.filter((row) => row.value.length > 0);

  if (visibleRows.length === 0) {
    return null;
  }

  return (
    <div className={cn(styles.container, className)}>
      {visibleRows.map((row) => {
        const Icon = row.icon;

        return (
          <Fragment key={row.key}>
            <div className={styles.row}>
              <Icon className={cn(styles.icon, row.iconClassName)} />
              <span className={row.textClassName}>{row.value}</span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
