'use client';

import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import Button from '@/components/common/ui/button';

export const ADMIN_NOTION_ZIP_SINGLE_IMPORT_CONFIRM_MESSAGE =
  '현재 레슨 본문을 ZIP 기준으로 교체할까요?\n제목, 설명, 챕터, 레슨 번호는 유지되고 본문만 바뀝니다.';

interface AdminNotionZipImportButtonProps {
  children: string;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  confirmMessage?: string;
  onSelectFiles: (files: File[]) => void;
}

export default function AdminNotionZipImportButton({
  children,
  disabled = false,
  loading = false,
  multiple = false,
  confirmMessage,
  onSelectFiles,
}: AdminNotionZipImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (disabled || loading) {
      return;
    }

    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0 || disabled || loading) {
      return;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    onSelectFiles(files);
  };

  return (
    <>
      <input
        ref={inputRef}
        accept=".zip"
        className="hidden"
        multiple={multiple}
        type="file"
        onChange={handleChange}
      />
      <Button
        color="secondary"
        size="small"
        disabled={disabled}
        loading={loading}
        onClick={handleClick}
      >
        {children}
      </Button>
    </>
  );
}
