import { Plus } from 'lucide-react';
import Input from '../input';

export default function ChipInput() {
  return (
    <div className="flex items-center gap-[var(--spacing-50)]">
      <Input />
      <div>
        <Plus />
      </div>
    </div>
  );
}
