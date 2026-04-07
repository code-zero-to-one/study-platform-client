'use client';

import { Heading1, Heading2, Heading3 } from 'lucide-react';
import { type ComponentType } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';

export const CODE_LANGUAGES = [
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Java', value: 'java' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Python', value: 'python' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Swift', value: 'swift' },
  { label: 'Dart', value: 'dart' },
  { label: 'SQL', value: 'sql' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'Bash', value: 'bash' },
] as const;

export const HEADING_OPTIONS = [
  { icon: Heading1, label: 'H1', level: 1 },
  { icon: Heading2, label: 'H2', level: 2 },
  { icon: Heading3, label: 'H3', level: 3 },
] as const;

export interface ToolbarButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * 마른다운 에디터 투바 단추늤 컴포넌트입니다.
 * 비활성 남냁 아이콘낪니다.
 * @param props - 단추늤 낭랇난늤 (아이콘, 라물, 상태 등)
 * @returns 단추늤 배늨
 * @example
 * <ToolbarButton
 *   icon={Bold}
 *   label="굵으기"
 *   isActive={isBoldActive}
 *   onClick={() => editor.chain().focus().toggleBold().run()}
 * />
 */
export function ToolbarButton({
  icon: Icon,
  label,
  isActive,
  disabled,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      color="secondary"
      size="small"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={typeof isActive === 'boolean' ? isActive : undefined}
      className={cn(
        isActive &&
          'bg-background-neutral-subtle border-border-brand text-text-brand',
      )}
    >
      <Icon className="mr-50 h-12 w-12" />
      {label}
    </Button>
  );
}
