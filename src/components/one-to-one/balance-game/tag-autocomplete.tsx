'use client';

import { Search } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { BALANCE_GAME_TAG_MIN_QUERY_LEN } from '@/config/balance-game-tags';
import type { BalanceGameTagSuggestion } from '@/types/one-to-one-study/balance-game';

interface TagAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  onAddTag: (tag: string) => void;
  selectedTags: string[];
  onRemoveTag: (tag: string) => void;
  suggestions: BalanceGameTagSuggestion[];
  isLoading?: boolean;
  disabled?: boolean;
  layout?: 'inline' | 'stacked';
  minQueryLength?: number;
  placeholder?: string;
  maxLength?: number;
  emptyMessage?: string;
  className?: string;
  inputClassName?: string;
  menuClassName?: string;
  showSelectedTags?: boolean;
}

export default function TagAutocomplete({
  value,
  onValueChange,
  onAddTag,
  selectedTags,
  onRemoveTag,
  suggestions,
  isLoading = false,
  disabled = false,
  layout = 'inline',
  minQueryLength = BALANCE_GAME_TAG_MIN_QUERY_LEN,
  placeholder = '태그로 검색하세요',
  maxLength = 40,
  emptyMessage = '검색 결과가 없습니다',
  className,
  inputClassName,
  menuClassName,
  showSelectedTags = true,
}: TagAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = useMemo(() => {
    const selected = new Set(selectedTags);

    return suggestions.filter((item) => !selected.has(item.name));
  }, [suggestions, selectedTags]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value, filteredSuggestions.length]);

  const openIfEligible = (nextValue: string) => {
    if (disabled) {
      setIsOpen(false);

      return;
    }
    setIsOpen(nextValue.trim().length >= minQueryLength);
  };

  const handleAdd = (tag: string) => {
    if (disabled) return;
    onAddTag(tag);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const shouldShowMenu = isOpen && value.trim().length >= minQueryLength;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative min-w-0',
        layout === 'inline'
          ? 'flex flex-wrap items-center gap-150'
          : 'flex flex-col gap-150',
        className,
      )}
    >
      <div
        className={cn(
          'relative flex min-w-0 items-center gap-150',
          layout === 'inline' ? 'w-full flex-1' : 'w-full',
        )}
      >
        <input
          type="text"
          value={value}
          onFocus={() => openIfEligible(value)}
          onChange={(e) => {
            const nextValue = e.target.value;
            onValueChange(nextValue);
            openIfEligible(nextValue);
          }}
          onKeyDown={(e) => {
            if (
              e.ctrlKey &&
              (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar')
            ) {
              e.preventDefault();
              openIfEligible(value);

              return;
            }
            if (e.key === 'ArrowDown' && filteredSuggestions.length) {
              e.preventDefault();
              setIsOpen(true);
              setActiveIndex((prev) =>
                prev + 1 >= filteredSuggestions.length ? 0 : prev + 1,
              );

              return;
            }
            if (e.key === 'ArrowUp' && filteredSuggestions.length) {
              e.preventDefault();
              setIsOpen(true);
              setActiveIndex((prev) =>
                prev <= 0 ? filteredSuggestions.length - 1 : prev - 1,
              );

              return;
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
                handleAdd(filteredSuggestions[activeIndex].name);

                return;
              }
              handleAdd(value);

              return;
            }
            if (e.key === 'Escape') {
              setIsOpen(false);
              setActiveIndex(-1);
            }
          }}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            'rounded-100 bg-background-default border-border-subtle font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover w-full min-w-0 border px-200 py-150 pr-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            inputClassName,
          )}
        />
        <span className="text-text-subtlest absolute top-1/2 right-200 -translate-y-1/2">
          <Search className="h-4 w-4" />
        </span>
        {shouldShowMenu && (filteredSuggestions.length > 0 || isLoading) && (
          <div className="absolute top-full left-0 z-30 mt-100 w-full max-w-full">
            <div
              className={cn(
                'bg-background-default border-border-subtle rounded-150 shadow-2 overflow-hidden border py-100',
                menuClassName,
              )}
            >
              {isLoading ? (
                <div className="font-designer-13r text-text-subtlest px-200 py-150">
                  검색 중...
                </div>
              ) : (
                filteredSuggestions.map((tag, index) => (
                  <button
                    key={tag.name}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleAdd(tag.name);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'font-designer-13r w-full truncate px-200 py-150 text-left transition-colors',
                      activeIndex === index
                        ? 'bg-fill-neutral-subtle-default text-text-strong'
                        : 'text-text-subtle hover:bg-fill-neutral-subtle-default',
                    )}
                  >
                    #{tag.name}
                    {typeof tag.count === 'number' && (
                      <span className="text-text-subtlest ml-100">
                        {tag.count}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
        {shouldShowMenu &&
          !isLoading &&
          filteredSuggestions.length === 0 &&
          value.trim().length >= minQueryLength && (
            <div className="absolute top-full left-0 z-30 mt-100 w-full max-w-full">
              <div
                className={cn(
                  'bg-background-default border-border-subtle rounded-150 shadow-2 overflow-hidden border py-100',
                  menuClassName,
                )}
              >
                <div className="font-designer-13r text-text-subtlest px-200 py-150">
                  {emptyMessage}
                </div>
              </div>
            </div>
          )}
      </div>

      {showSelectedTags && selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-150">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onRemoveTag(tag)}
              className="rounded-100 border-border-subtle font-designer-13b text-text-subtle hover:border-border-brand hover:text-text-brand max-w-full truncate px-200 py-150 transition-colors"
            >
              #{tag} ✕
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
