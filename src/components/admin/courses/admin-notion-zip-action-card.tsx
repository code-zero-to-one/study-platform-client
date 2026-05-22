'use client';

import AdminNotionZipImportButton from '@/components/admin/courses/admin-notion-zip-import-button';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';

interface AdminNotionZipActionCardProps {
  title: string;
  description: string;
  bullets: string[];
  buttonLabel: string;
  badgeLabel: string;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  confirmMessage?: string;
  tone?: 'brand' | 'warning';
  onSelectFiles: (files: File[]) => void;
}

export default function AdminNotionZipActionCard({
  title,
  description,
  bullets,
  buttonLabel,
  badgeLabel,
  disabled = false,
  loading = false,
  multiple = false,
  confirmMessage,
  tone = 'brand',
  onSelectFiles,
}: AdminNotionZipActionCardProps) {
  return (
    <div
      className={cn(
        'rounded-125 border px-150 py-125',
        tone === 'brand' && 'border-border-brand bg-fill-brand-subtle-default',
        tone === 'warning' &&
          'border-border-warning bg-fill-warning-subtle-default',
      )}
    >
      <div className="flex items-start justify-between gap-125">
        <div className="min-w-0">
          <div className="mb-50 flex flex-wrap items-center gap-50">
            <Badge color={tone === 'brand' ? 'blue' : 'orange'}>
              {badgeLabel}
            </Badge>
            <h3
              className={cn(
                'font-designer-15b',
                tone === 'brand' ? 'text-text-brand' : 'text-text-warning',
              )}
            >
              {title}
            </h3>
          </div>
          <p className="font-designer-13r text-text-default">{description}</p>
          <ul className="font-designer-12r text-text-subtle mt-75 flex flex-col gap-25">
            {bullets.map((bullet, index) => (
              <li key={`${bullet}-${index}`}>• {bullet}</li>
            ))}
          </ul>
        </div>
        <div className="shrink-0">
          <AdminNotionZipImportButton
            multiple={multiple}
            confirmMessage={confirmMessage}
            disabled={disabled}
            loading={loading}
            onSelectFiles={onSelectFiles}
          >
            {buttonLabel}
          </AdminNotionZipImportButton>
        </div>
      </div>
    </div>
  );
}
