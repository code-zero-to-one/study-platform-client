import { BookOpen } from 'lucide-react';

interface ChapterHeaderProps {
  chapterNumber: number;
  title: string;
}

export function ChapterHeader({ chapterNumber, title }: ChapterHeaderProps) {
  return (
    <div className="flex w-full flex-col items-center gap-250">
      <div className="relative flex w-full items-center">
        <div className="h-px flex-1 bg-rose-500" />
        <div className="mx-0 flex items-center gap-125 rounded-full border border-rose-500 bg-background-default px-250 py-125">
          <BookOpen className="h-300 w-300 text-text-brand" />
          <p className="font-designer-24b text-text-brand">
            Chapter {String(chapterNumber).padStart(2, '0')}
          </p>
        </div>
        <div className="h-px flex-1 bg-rose-500" />
      </div>
      <p className="font-designer-20b text-text-brand">{title}</p>
    </div>
  );
}
