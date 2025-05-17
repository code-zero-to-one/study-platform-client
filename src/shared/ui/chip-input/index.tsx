import { Plus } from 'lucide-react';
import Input from '../input';
import { useState } from 'react';
import Chip from '../chip';

interface Props {
  chips: string[];
  onChange: (chips: string[]) => void;
}

export default function ChipInput({ chips, onChange }: Props) {
  const [chipArray, setChipArray] = useState<string[]>(chips);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="flex flex-col gap-[var(--spacing-75)]">
      <div className="flex items-center gap-[var(--spacing-50)]">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div
          className="cursor-pointer rounded-[var(--radius-100)] bg-[var(--color-fill-neutral-default-default)] p-[var(--spacing-100)]"
          onClick={() => {
            if (inputValue) {
              const newChipArray = [...chipArray, inputValue];
              setChipArray(newChipArray);
              onChange(newChipArray);
              setInputValue('');
            }
          }}
        >
          <Plus />
        </div>
      </div>
      <div className="flex flex-wrap gap-[var(--spacing-100)]">
        {chipArray.map((chip) => (
          <Chip
            text={chip}
            isActive
            key={chip}
            onClose={() => {
              const newChipArray = chipArray.filter((c) => c !== chip);
              setChipArray(newChipArray);
              onChange(newChipArray);
            }}
          />
        ))}
      </div>
    </div>
  );
}
