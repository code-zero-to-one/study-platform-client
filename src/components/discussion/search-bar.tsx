import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = '토론 검색...',
  className,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // 디바운스를 위한 useEffect
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-300 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-100 border border-border-subtle bg-background-default py-200 pl-800 pr-800',
          'font-designer-14r text-text-strong placeholder:text-text-subtlest',
          'outline-none transition-colors focus:border-border-brand focus:ring-2 focus:ring-fill-brand-subtle-default',
        )}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-300 top-1/2 -translate-y-1/2 text-text-subtle transition-colors hover:text-text-strong"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
