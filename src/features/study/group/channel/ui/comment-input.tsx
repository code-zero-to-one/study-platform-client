import React, { useEffect, useState } from 'react';
import { useUser } from '@/features/auth/model/use-user';
import Button from '@/shared/ui/button';

interface CommentInputProps {
  mode: 'edit' | 'save';
  content?: string;
  onChange: (value: string) => void;
  onCancel?: () => void;
  onConfirm: () => void;
}

export default function CommentInput({
  onCancel,
  content,
  mode,
  onConfirm,
  onChange,
}: CommentInputProps) {
  const { userId, userName } = useUser();

  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className={`rounded-150 border-border-default flex w-full flex-col gap-150 border-[1px] p-300 ${isActive && 'border-border-strong'}`}
    >
      <div className="flex justify-between">
        <span>{userName}</span>
        <span>{content.length}/1000</span>
      </div>

      <input
        value={content ?? ''}
        placeholder="새로운 토론을 시작하세요."
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className="rounded outline-none focus:outline-none"
        maxLength={1000}
      />

      <div className="mt-150 flex justify-end gap-100">
        <Button
          color="secondary"
          onClick={() => {
            onCancel();
            setIsActive(false);
          }}
        >
          취소
        </Button>
        <Button color="primary" onClick={onConfirm}>
          {mode === 'edit' ? '저장' : '등록'}
        </Button>
      </div>
    </div>
  );
}
