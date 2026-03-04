'use client';

import React from 'react';
import {
  BALANCE_GAME_TAG_MAX_COUNT,
  BALANCE_GAME_TAG_MAX_LEN,
  BALANCE_GAME_TAG_MIN_QUERY_LEN,
} from '@/config/balance-game-tags';
import TagAutocomplete from '@/components/balance-game/tag-autocomplete';

interface VotingTagFieldProps {
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: (tag: string) => void;
  selectedTags: string[];
  onRemoveTag: (tag: string) => void;
  suggestions: { name: string; count?: number }[];
  isLoading: boolean;
}

export default function VotingTagField({
  tagInput,
  onTagInputChange,
  onAddTag,
  selectedTags,
  onRemoveTag,
  suggestions,
  isLoading,
}: VotingTagFieldProps) {
  return (
    <div className="flex flex-col gap-200">
      <div className="font-designer-14b text-text-strong">
        태그 (선택)
        <span className="font-designer-12r text-text-subtle ml-100">
          (최대 3개)
        </span>
      </div>
      <TagAutocomplete
        value={tagInput}
        onValueChange={onTagInputChange}
        onAddTag={onAddTag}
        selectedTags={selectedTags}
        onRemoveTag={onRemoveTag}
        suggestions={suggestions}
        isLoading={isLoading}
        minQueryLength={BALANCE_GAME_TAG_MIN_QUERY_LEN}
        maxLength={BALANCE_GAME_TAG_MAX_LEN}
        disabled={selectedTags.length >= BALANCE_GAME_TAG_MAX_COUNT}
        placeholder="태그 입력 후 Enter"
        layout="stacked"
        className="w-full"
        inputClassName="h-600 w-full"
      />
    </div>
  );
}
