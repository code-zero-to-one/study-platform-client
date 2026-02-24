import { Search, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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
      <Search className="text-text-subtle absolute top-1/2 left-300 h-4 w-4 -translate-y-1/2" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'rounded-100 border-border-subtle bg-background-default w-full border py-200 pr-800 pl-800',
          'font-designer-14r text-text-strong placeholder:text-text-subtlest',
          'focus:border-border-brand focus:ring-fill-brand-subtle-default transition-colors outline-none focus:ring-2',
        )}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="text-text-subtle hover:text-text-strong absolute top-1/2 right-300 -translate-y-1/2 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
