import React, { useState } from 'react';
import { useUser } from '@/features/auth/model/use-user';

export default function CommentInput() {
  const { userId, userName } = useUser();

  const [text, setText] = useState('');
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className={`rounded-150 border-border-default flex flex-col gap-150 border-[1px] p-300 ${isActive && 'border-border-strong'}`}
    >
      <div className="flex justify-between">
        <span>{userName}</span>
        <span>{text.length}/1000</span>
      </div>

      <input
        value={text}
        placeholder="새로운 토론을 시작하세요."
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className="rounded outline-none focus:outline-none"
      />

      <div className="mt-150 flex justify-end gap-100">
        <button>취소</button>
        <button>등록</button>
      </div>
    </div>
  );
}
