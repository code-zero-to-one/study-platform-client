'use client';

import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import { ToggleButton } from '@/components/ui/toggle';
import { BaseInput } from '../input';

interface Props {
  value?: string[];
  maxSelectable?: number;
  onChange?: (updated: string[]) => void;
  options?: string[];
  // 대소문자 구분
  caseSensitive?: boolean;
  allowCustom?: boolean;
}

export default function SelectableTagsInput({
  value,
  onChange,
  maxSelectable = 4,
  options = [],
  caseSensitive = false,
  allowCustom = true,
}: Props) {
  const selected = useMemo(() => value ?? [], [value]);
  const optionSet = useMemo(
    () =>
      new Set(caseSensitive ? options : options.map((o) => o.toLowerCase())),
    [options, caseSensitive],
  );

  const norm = useCallback(
    (v: string) => (caseSensitive ? v : v.toLowerCase()),
    [caseSensitive],
  );

  const customTags = selected.filter((v) => !optionSet.has(norm(v)));

  const [showInput, setShowInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedSet = useMemo(
    () => new Set(caseSensitive ? selected : selected.map(norm)),
    [selected, caseSensitive, norm],
  );

  const canAddMore = selected.length < maxSelectable;

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  useEffect(() => {
    if (canAddMore) {
      setIsLimitExceeded(false);
    }
  }, [canAddMore]);

  const emit = useCallback((next: string[]) => onChange?.(next), [onChange]);

  const toggleItem = useCallback(
    (key: string) => {
      const k = caseSensitive ? key : key.toLowerCase();
      if (selectedSet.has(k)) {
        setIsLimitExceeded(false);
        emit(selected.filter((item) => norm(item) !== k));
      } else if (canAddMore) {
        setIsLimitExceeded(false);
        emit([...selected, key]);
      } else {
        setIsLimitExceeded(true);
      }
    },
    [caseSensitive, selectedSet, selected, emit, canAddMore, norm],
  );

  const removeCustomTag = useCallback(
    (tag: string) => emit(selected.filter((item) => item !== tag)),
    [emit, selected],
  );

  const addCustom = useCallback(() => {
    const trimmed = customInput.trim();
    if (!allowCustom || !trimmed) return;

    const key = caseSensitive ? trimmed : trimmed.toLowerCase();
    if (selectedSet.has(key)) return;
    if (!canAddMore) {
      setIsLimitExceeded(true);

      return;
    }

    emit([...selected, trimmed]);
    setCustomInput('');
    setIsLimitExceeded(false);
  }, [
    allowCustom,
    customInput,
    caseSensitive,
    selectedSet,
    canAddMore,
    emit,
    selected,
  ]);

  const handleCustomKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustom();
      } else if (e.key === 'Escape') {
        setShowInput(false);
        setCustomInput('');
      }
    },
    [addCustom],
  );

  return (
    <div className="flex flex-col gap-50">
      <div className="flex flex-wrap gap-100">
        {options.map((item) => (
          <ToggleButton
            size="sm"
            variant="square"
            key={item}
            pressed={selectedSet.has(norm(item))}
            onPressedChange={() => toggleItem(item)}
            className={cn(
              'data-[state=off]:bg-background-default',
              'data-[state=off]:border-border-subtle',
              'data-[state=off]:text-text-subtle',
              'data-[state=off]:hover:border-border-brand',
              'data-[state=off]:hover:text-text-default',
              'data-[state=on]:bg-fill-brand-subtle-default',
              'data-[state=on]:text-text-brand',
              'data-[state=on]:border-border-brand',
            )}
          >
            {item}
          </ToggleButton>
        ))}

        {customTags.map((item) => (
          <div
            key={item}
            className="rounded-150 border-border-brand bg-fill-brand-subtle-default font-designer-13m text-text-brand flex items-center gap-75 border px-150 py-75"
          >
            {item}
            <button
              type="button"
              onClick={() => removeCustomTag(item)}
              aria-label={`${item} 제거`}
              className="text-text-brand ml-50 hover:opacity-70"
            >
              ✕
            </button>
          </div>
        ))}

        {allowCustom && (
          <Button
            type="button"
            color="secondary"
            size="small"
            onClick={() => setShowInput(true)}
            disabled={!canAddMore}
            aria-expanded={showInput}
            aria-controls="custom-tag-input"
          >
            <Plus className="h-250 w-250" />
          </Button>
        )}
      </div>

      {allowCustom && showInput && (
        <div
          id="custom-tag-input"
          className="rounded-150 border-border-default bg-background mt-10 flex items-center gap-100 border px-150"
        >
          <BaseInput
            ref={inputRef}
            type="text"
            appearance="bare"
            className="flex-1"
            placeholder={
              canAddMore
                ? 'IT, Back-end, AI'
                : `최대 ${maxSelectable}개까지 선택 가능합니다`
            }
            color={canAddMore ? 'default' : 'error'}
            disabled={!canAddMore}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomKeyDown}
          />
          <Button type="button" onClick={addCustom} disabled={!canAddMore}>
            추가
          </Button>
          <Button
            type="button"
            color="secondary"
            onClick={() => {
              setShowInput(false);
              setCustomInput('');
              setIsLimitExceeded(false);
            }}
          >
            취소
          </Button>
        </div>
      )}

      <p className="font-designer-12r text-text-subtle mt-50">
        선택된 키워드 {selected.length}/{maxSelectable}
      </p>
      {!canAddMore && (
        <p
          className={cn(
            'font-designer-12r mt-25',
            isLimitExceeded ? 'text-text-warning' : 'text-text-subtle',
          )}
        >
          최대 {maxSelectable}개까지 선택 가능합니다.
        </p>
      )}
    </div>
  );
}
