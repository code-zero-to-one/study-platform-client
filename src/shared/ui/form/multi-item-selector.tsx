'use client';

import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '@/shared/ui/button';
import { ToggleButton } from '@/shared/ui/toggle';
import { BaseInput } from '../input';

interface Props {
  value: string[];
  onChange: (updated: string[]) => void;
  options?: string[];
}

export default function SelectableTagsInput({
  value,
  onChange,
  options = [],
}: Props) {
  const [customInput, setCustomInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(false);

  const toggleItem = (key: string) => {
    onChange(
      value.includes(key)
        ? value.filter((item) => item !== key)
        : value.length < 4
          ? [...value, key]
          : value,
    );
  };

  const removeCustomTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag));
    setCustomTags((prev) => prev.filter((item) => item !== tag));
  };

  useEffect(() => {
    const customOnly = value.filter((v) => !options.includes(v));
    setCustomTags(customOnly);
  }, [value, options]);

  return (
    <div className="flex flex-col gap-50">
      <div className="flex flex-wrap gap-100">
        {options.map((item) => (
          <ToggleButton
            size="sm"
            variant="square"
            key={item}
            pressed={value.includes(item)}
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
            <div onClick={() => removeCustomTag(item)}>✕</div>
          </div>
        ))}
        <Button size="small" onClick={() => setShowInput(true)}>
          <Plus className="h-250 w-250" />
        </Button>
      </div>

      {showInput && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.target as HTMLFormElement).elements.namedItem(
              'custom',
            ) as HTMLInputElement;
            const trimmed = input?.value.trim();

            if (trimmed && !value.includes(trimmed) && value.length < 4) {
              onChange([...value, trimmed]);
              setCustomTags((prev) => [...prev, trimmed]);
              setCustomInput('');
            }
          }}
          className="flex items-center gap-50 pt-100"
        >
          <BaseInput
            name="custom"
            type="text"
            placeholder={
              value.length >= 4
                ? '최대 4개까지 선택 가능합니다'
                : 'IT, Back-end, AI'
            }
            color={value.length >= 4 ? 'error' : 'default'}
            disabled={value.length >= 4}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
          <Button type="submit" disabled={value.length >= 4}>
            추가
          </Button>
        </form>
      )}
    </div>
  );
}
