import { LibraryBig } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface ArchiveHeaderProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export default function ArchiveHeader({
  isAdmin,
  onToggleAdmin,
}: ArchiveHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
        제로원 아카이브
        <LibraryBig className="text-text-brand h-8 w-8" />
      </h2>

      <button
        onClick={onToggleAdmin}
        className={cn(
          'rounded-100 px-200 py-100 font-mono text-xs transition-colors',
          isAdmin
            ? 'bg-red-100 text-red-600'
            : 'bg-transparent text-transparent hover:text-gray-300',
        )}
      >
        {isAdmin ? 'Admin Mode ON' : 'Admin'}
      </button>
    </div>
  );
}
