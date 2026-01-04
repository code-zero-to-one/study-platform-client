'use client';

import { Search } from 'lucide-react';
import { useState, useCallback } from 'react';

interface StudySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function StudySearch({
  value,
  onChange,
  placeholder = '제목, 스터디명을 검색해주세요.',
}: StudySearchProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onChange(inputValue);
      }
    },
    [inputValue, onChange],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSearchClick = useCallback(() => {
    onChange(inputValue);
  }, [inputValue, onChange]);

  return (
    <div className="border-border-default bg-background-default rounded-100 flex h-500 w-[280px] items-center gap-100 border px-150">
      <button
        type="button"
        onClick={handleSearchClick}
        className="text-text-subtlest hover:text-text-subtle"
      >
        <Search className="size-4" />
      </button>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="font-designer-14r text-text-default placeholder:text-text-subtlest w-full bg-transparent outline-none"
      />
    </div>
  );
}
