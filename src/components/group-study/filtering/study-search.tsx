'use client';

import { Search } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';

interface StudySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function StudySearch({
  value,
  onChange,
  placeholder = '스터디명을 검색해주세요.',
}: StudySearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 디바운스된 검색 실행
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onChange(inputValue);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, onChange]);

  // 외부에서 value가 변경되면 inputValue 동기화
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <div className="border-border-default bg-background-default rounded-100 flex h-500 w-full items-center gap-100 border px-150 sm:w-[280px]">
      <Search className="text-text-subtlest size-4" />
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="font-designer-14r text-text-default placeholder:text-text-subtlest w-full bg-transparent outline-none"
      />
    </div>
  );
}
