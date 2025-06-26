'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import Button from '@/shared/ui/button';
import { ToggleButton } from '@/shared/ui/toggle';
import { BaseInput } from '../input';

const DEFAULT_INTERESTS = [
  '운동/헬스',
  '여행',
  '음악',
  '영화/드라마',
  '독서',
  '게임',
  '요리/맛집 탐방',
  '패션/뷰티',
  '사진/영상',
  '자기계발',
];

export default function UserSelector() {
  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(false);

  const toggleItem = (key: string) => {
    setSelected((prev) => {
      const isSelected = prev.includes(key);
      if (isSelected) {
        return prev.filter((item) => item !== key);
      }
      if (prev.length >= 4) {
        return prev;
      }

      return [...prev, key];
    });
  };

  const removeCustomTag = (tag: string) => {
    setSelected(selected.filter((item) => item !== tag));
    setCustomTags(customTags.filter((item) => item !== tag));
  };

  return (
    <div className="flex flex-col gap-50">
      <div className="flex flex-wrap gap-100">
        {DEFAULT_INTERESTS.map((item) => (
          <ToggleButton
            size="sm"
            variant="square"
            key={item}
            pressed={selected.includes(item)}
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

            if (trimmed && !selected.includes(trimmed) && selected.length < 4) {
              setSelected((prev) => [...prev, trimmed]);
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
              selected.length >= 4
                ? '최대 4개까지 선택 가능합니다'
                : 'IT, Back-end, AI'
            }
            color={selected.length >= 4 ? 'error' : 'default'}
            disabled={selected.length >= 4}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
          <Button type="submit" disabled={selected.length >= 4}>
            추가
          </Button>
        </form>
      )}
    </div>
  );
}
