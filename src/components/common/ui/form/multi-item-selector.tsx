'use client';

import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import { ToggleButton } from '@/components/common/ui/toggle';
import { BaseInput } from '../input';

interface Props {
  value?: string[];
  maxSelectable?: number;
  maxCustomLength?: number;
  onChange?: (updated: string[]) => void;
  options?: Array<string | { value: string; label: string }>;
  // 대소문자 구분
  caseSensitive?: boolean;
  allowCustom?: boolean;
}

export default function SelectableTagsInput({
  value,
  onChange,
  maxSelectable = 4,
  maxCustomLength,
  options = [],
  caseSensitive = false,
  allowCustom = true,
}: Props) {
  const selected = useMemo(() => value ?? [], [value]);
  const normalizedOptions = useMemo(() => {
    return options.map((option) => {
      if (typeof option === 'string') {
        return {
          value: option,
          label: option,
        };
      }

      return {
        value: option.value,
        label: option.label,
      };
    });
  }, [options]);
  const optionSet = useMemo(
    () =>
      new Set(
        caseSensitive
          ? normalizedOptions.map((option) => option.value)
          : normalizedOptions.map((option) => option.value.toLowerCase()),
      ),
    [caseSensitive, normalizedOptions],
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

  const closeCustomInput = useCallback(() => {
    setShowInput(false);
    setCustomInput('');
    setIsLimitExceeded(false);
  }, []);

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
    const nextCustomTag = maxCustomLength
      ? trimmed.slice(0, maxCustomLength)
      : trimmed;
    if (!allowCustom || !nextCustomTag) return;

    const key = caseSensitive ? nextCustomTag : nextCustomTag.toLowerCase();
    if (selectedSet.has(key)) return;
    if (!canAddMore) {
      setIsLimitExceeded(true);

      return;
    }

    emit([...selected, nextCustomTag]);
    setCustomInput('');
    setIsLimitExceeded(false);
  }, [
    allowCustom,
    customInput,
    maxCustomLength,
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
        closeCustomInput();
      }
    },
    [addCustom, closeCustomInput],
  );

  return (
    <div className="flex flex-col gap-50">
      <div className="flex flex-wrap gap-100">
        {normalizedOptions.map((item) => (
          <ToggleButton
            size="sm"
            variant="square"
            key={item.value}
            pressed={selectedSet.has(norm(item.value))}
            onPressedChange={() => toggleItem(item.value)}
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
            {item.label}
          </ToggleButton>
        ))}

        {customTags.map((item) => (
          <div
            key={item}
            className="rounded-150 border-border-brand bg-fill-brand-subtle-default font-designer-13m text-text-brand flex min-w-0 max-w-full items-center gap-75 border px-150 py-75"
          >
            <span className="min-w-0 truncate" title={item}>
              {item}
            </span>
            <button
              type="button"
              onClick={() => removeCustomTag(item)}
              aria-label={`${item} 제거`}
              className="text-text-brand ml-50 shrink-0 hover:opacity-70"
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
            onClick={() => {
              if (showInput) {
                closeCustomInput();

                return;
              }

              setShowInput(true);
            }}
            disabled={!canAddMore && !showInput}
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
          className="rounded-150 border-border-default bg-background-default mt-100 flex flex-col gap-100 border px-150 py-100 sm:flex-row sm:items-center sm:gap-100"
        >
          <BaseInput
            ref={inputRef}
            type="text"
            appearance="bare"
            size="m"
            className="min-w-0 flex-1"
            placeholder={
              canAddMore
                ? 'IT, Back-end, AI'
                : `최대 ${maxSelectable}개까지 선택 가능합니다`
            }
            color={canAddMore ? 'default' : 'error'}
            disabled={!canAddMore}
            value={customInput}
            maxLength={maxCustomLength}
            onChange={(e) =>
              setCustomInput(
                maxCustomLength
                  ? e.target.value.slice(0, maxCustomLength)
                  : e.target.value,
              )
            }
            onKeyDown={handleCustomKeyDown}
          />
          <div className="flex w-full shrink-0 items-center justify-end gap-75 sm:w-auto">
            <Button
              type="button"
              onClick={addCustom}
              disabled={!canAddMore}
              size="small"
              className="shrink-0 whitespace-nowrap"
            >
              추가
            </Button>
            <Button
              type="button"
              color="secondary"
              size="small"
              className="shrink-0 whitespace-nowrap"
              onClick={closeCustomInput}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {!canAddMore && (
        <p
          className={cn(
            'font-designer-12r mt-50',
            isLimitExceeded ? 'text-text-warning' : 'text-text-subtle',
          )}
        >
          최대 {maxSelectable}개까지 선택 가능합니다.
        </p>
      )}
    </div>
  );
}
