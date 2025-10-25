import React from 'react';
import { useUser } from '@/features/auth/model/use-user';

export default function CommentInput() {
  const { userId, userName } = useUser();

  return (
    <div className="rounded-150 border-border-default flex flex-col gap-150 border-[1px] p-300">
      <div className="flex justify-between">
        <span>{userName}</span>
        <span>0/500</span>
      </div>

      <input />

      <div className="mt-150 flex justify-end gap-100">
        <button>취소</button>
        <button>등록</button>
      </div>
    </div>
  );
}
