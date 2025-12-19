'use client';

import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const selected = value ?? [];
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
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedSet = useMemo(
    () => new Set(caseSensitive ? selected : selected.map(norm)),
    [selected, caseSensitive, norm],
  );

  const canAddMore = selected.length < maxSelectable;

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  const emit = useCallback((next: string[]) => onChange?.(next), [onChange]);

  const toggleItem = useCallback(
    (key: string) => {
      const k = caseSensitive ? key : key.toLowerCase();
      if (selectedSet.has(k)) {
        emit(selected.filter((item) => norm(item) !== k));
      } else if (canAddMore) {
        emit([...selected, key]);
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
    if (selectedSet.has(key) || !canAddMore) return;

    emit([...selected, trimmed]);
    setCustomInput('');
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
          >
            {item}
          </ToggleButton>
        ))}

        {customTags.map((item) => (
          <div
            key={item}
            className="rounded-150 bg-fill-brand-default-default font-designer-13m text-text-inverse flex items-center gap-75 px-150 py-75"
          >
            {item}
            <button
              type="button"
              onClick={() => removeCustomTag(item)}
              aria-label={`${item} 제거`}
              className="ml-50"
            >
              ✕
            </button>
          </div>
        ))}

        {allowCustom && (
          <Button
            type="button"
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
            onClick={() => {
              setShowInput(false);
              setCustomInput('');
            }}
          >
            취소
          </Button>
        </div>
      )}

      {!canAddMore && (
        <p className="font-designer-13r text-text-brand mt-50">
          최대 {maxSelectable}개까지 선택 가능합니다.
        </p>
      )}
    </div>
  );
}
