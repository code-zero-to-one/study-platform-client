'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type { LessonQnaMyItem } from '@/types/api/course.types';

interface Props {
  myQnas: LessonQnaMyItem[];
  onAskClick: () => void;
  onSelectQna: (qnaId: number) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function LessonQnaCard({ myQnas, onAskClick, onSelectQna }: Props) {
  const [page, setPage] = useState(0);
  const total = myQnas.length;
  const hasMyQna = total > 0;
  const current = hasMyQna ? myQnas[Math.min(page, total - 1)] : null;

  return (
    <div className="flex flex-col gap-300 rounded-150 border border-gray-300 bg-background-default p-300">
      <div className="flex flex-col gap-125">
        <p className="text-center font-designer-16b text-gray-1000">
          여기서 막히셨나요?
        </p>
        <p className="text-center font-designer-14r text-gray-1000">
          30분 이상 막히면 바로 질문하기!
          <br />
          운영자들이 대기 중입니다.
          <br />
          질문을 남겨주시면 누구보다 빠르게 대답해드릴게요.
        </p>
      </div>

      <button
        type="button"
        onClick={onAskClick}
        className="flex w-full items-center justify-center gap-75 rounded-100 bg-background-brand-default py-200 font-designer-16b text-text-inverse"
      >
        질문하기
      </button>

      <div className="flex flex-col gap-150">
        <div className="flex items-center gap-125">
          <p className="font-designer-14b text-gray-1000">내 질문</p>
          <span className="rounded-100 bg-gray-200 px-100 font-designer-14b text-gray-600">
            {total}
          </span>
        </div>

        {current ? (
          <button
            type="button"
            onClick={() => onSelectQna(current.qnaId)}
            className="flex w-full items-center gap-125 rounded-100 border border-border-subtle bg-gray-100 p-150 text-left hover:border-border-brand"
          >
            <p className="flex-1 truncate font-designer-14b text-gray-800">
              {current.title}
            </p>
            <p className="shrink-0 font-designer-13m text-gray-400">
              {formatDate(current.createdAt)}
            </p>
          </button>
        ) : (
          <p className="rounded-100 border border-border-subtle bg-gray-100 p-150 text-center font-designer-13m text-gray-400">
            아직 질문이 없어요.
          </p>
        )}

        {hasMyQna && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="이전 질문"
              className="text-border-default disabled:opacity-50"
            >
              <ChevronLeft className="h-300 w-300" />
            </button>
            <div className="flex gap-50">
              {myQnas.map((q, i) => (
                <span
                  key={q.qnaId}
                  className={cn(
                    'h-75 w-75 rounded-full',
                    i === page ? 'bg-background-brand-default' : 'bg-gray-300',
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
              disabled={page >= total - 1}
              aria-label="다음 질문"
              className="text-border-default disabled:opacity-50"
            >
              <ChevronRight className="h-300 w-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
