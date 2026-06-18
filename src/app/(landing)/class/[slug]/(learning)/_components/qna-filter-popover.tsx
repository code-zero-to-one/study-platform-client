'use client';

import { ChevronDown, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useGetCourseCurriculum } from '@/hooks/queries/course/course-queries';

export function SortLinesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <line x1="1" y1="2" x2="17" y2="2" />
      <line x1="1" y1="6" x2="11" y2="6" />
      <line x1="1" y1="10" x2="6" y2="10" />
    </svg>
  );
}

interface DropdownProps {
  label: string;
  options: { label: string; value: number }[];
  value: number | null;
  placeholder: string;
  disabled?: boolean;
  onSelect: (value: number) => void;
}

function Dropdown({
  label,
  options,
  value,
  placeholder,
  disabled,
  onSelect,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-100">
      <span className="font-designer-14m text-gray-800">{label}</span>
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'flex w-full items-center justify-between rounded-150 border border-gray-300 px-250 py-150 font-designer-14r transition-colors',
            disabled ? 'cursor-not-allowed text-gray-400' : 'text-gray-800',
            selected ? 'text-gray-800' : 'text-gray-400',
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown className="size-200 shrink-0 text-gray-400" />
        </button>
        {open && !disabled && options.length > 0 && (
          <div className="absolute left-0 top-full z-20 mt-100 max-h-3000 w-full overflow-y-auto rounded-150 border border-border-subtle bg-background-default shadow-md">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-250 py-200 text-left font-designer-14r hover:bg-gray-100 active:bg-gray-100',
                  opt.value === value
                    ? 'font-designer-14m text-rose-500'
                    : 'text-gray-700',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface QnaFilterPopoverProps {
  slug: string;
  courseTitle: string;
  appliedChapterId?: number;
  appliedLessonId?: number;
  onApply: (lessonId?: number, chapterId?: number) => void;
}

export function QnaFilterPopover({
  slug,
  courseTitle,
  appliedChapterId,
  appliedLessonId,
  onApply,
}: QnaFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(
    appliedChapterId ?? null,
  );
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(
    appliedLessonId ?? null,
  );
  const popoverRef = useRef<HTMLDivElement>(null);

  const { data: curriculum } = useGetCourseCurriculum(slug);
  const chapters = curriculum?.chapters ?? [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const chapterOptions = chapters.map((c) => ({
    label: c.title,
    value: c.chapterId,
  }));
  const lessonOptions =
    chapters
      .find((c) => c.chapterId === selectedChapterId)
      ?.lessons.map((l) => ({ label: l.title, value: l.lessonId })) ?? [];

  const handleReset = () => {
    setSelectedChapterId(null);
    setSelectedLessonId(null);
  };

  const handleApply = () => {
    onApply(selectedLessonId ?? undefined, selectedChapterId ?? undefined);
    setOpen(false);
  };

  return (
    <div ref={popoverRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-75 whitespace-nowrap rounded-full border border-gray-800 px-175 py-100 font-designer-14m text-gray-800 hover:border-gray-400 active:border-gray-400 md:px-250 md:py-125 md:font-designer-16m"
      >
        <SortLinesIcon className="h-150 w-225" />
        필터
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-100 flex w-[calc(100vw-2rem)] max-w-4250 flex-col gap-300 rounded-200 border border-border-subtle bg-background-default p-300 shadow-md md:w-4250">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-designer-18b text-gray-800">질문</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="필터 닫기"
            >
              <X className="size-250 text-gray-500" />
            </button>
          </div>

          {/* Cascading selects */}
          <div className="flex flex-col gap-200">
            <Dropdown
              label="코스 선택"
              options={
                curriculum
                  ? [
                      {
                        label: courseTitle,
                        value: curriculum.courseId,
                      },
                    ]
                  : []
              }
              value={curriculum?.courseId ?? null}
              placeholder="코스를 선택해주세요"
              onSelect={() => {}}
            />
            <Dropdown
              label="챕터 선택"
              options={chapterOptions}
              value={selectedChapterId}
              placeholder="챕터를 선택해주세요"
              onSelect={(v) => {
                setSelectedChapterId(v);
                setSelectedLessonId(null);
              }}
            />
            <Dropdown
              label="레슨 선택"
              options={lessonOptions}
              value={selectedLessonId}
              placeholder="레슨을 선택해주세요"
              disabled={selectedChapterId === null}
              onSelect={(v) => setSelectedLessonId(v)}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-200">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-75 whitespace-nowrap font-designer-14m text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="size-200" />
              초기화
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 rounded-full bg-rose-500 py-200 font-designer-16m text-white hover:bg-rose-600 active:bg-rose-600"
            >
              적용하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
