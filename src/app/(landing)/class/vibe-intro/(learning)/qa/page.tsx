'use client';

import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { LessonQnaDetailModal } from '@/app/(class-lesson)/class/vibe-intro/lesson/[id]/_components/lesson-qna-detail-modal';
import {
  useGetCourseDetail,
  useGetCourseQnas,
} from '@/hooks/queries/course/course-api';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function ClassQnaPage() {
  const [selectedQnaId, setSelectedQnaId] = useState<number | null>(null);
  const { data: courseData } = useGetCourseDetail('vibe-intro');
  const courseId = courseData?.courseId ?? 0;
  const { data, isLoading } = useGetCourseQnas({ courseId });

  const myQnas = data?.myQnas ?? [];
  const qnas = data?.qnas ?? [];

  return (
    <>
      <div className="mx-auto w-full max-w-page px-600 py-750">
        <div className="flex flex-col gap-500">
          {myQnas.length > 0 && (
            <section>
              <div className="mb-300 flex items-center gap-125">
                <h2 className="font-designer-18b text-gray-800">내 질문</h2>
                <span className="rounded-full bg-gray-200 px-125 font-designer-14b text-gray-600">
                  {myQnas.length}
                </span>
              </div>
              <div className="flex flex-col gap-150">
                {myQnas.map((q) => (
                  <button
                    key={q.qnaId}
                    type="button"
                    onClick={() => setSelectedQnaId(q.qnaId)}
                    className="flex w-full items-center gap-200 rounded-150 border border-border-subtle bg-gray-100 p-250 text-left hover:border-border-brand"
                  >
                    <p className="flex-1 truncate font-designer-16m text-gray-800">
                      {stripHtml(q.title)}
                    </p>
                    <div className="flex shrink-0 items-center gap-75 text-gray-400">
                      <MessageSquare className="h-225 w-225" />
                      <span className="font-designer-13m">{q.answerCount}</span>
                    </div>
                    <p className="shrink-0 font-designer-13m text-gray-400">
                      {formatDate(q.createdAt)}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-300 flex items-center gap-125">
              <h2 className="font-designer-18b text-gray-800">전체 질문</h2>
              <span className="rounded-full bg-gray-200 px-125 font-designer-14b text-gray-600">
                {data?.totalCount ?? 0}
              </span>
            </div>

            {isLoading || !courseId ? (
              <div className="flex h-2500 items-center justify-center">
                <p className="font-designer-16r text-gray-400">
                  불러오는 중...
                </p>
              </div>
            ) : qnas.length === 0 ? (
              <div className="flex h-2500 items-center justify-center rounded-150 border border-border-subtle bg-gray-100">
                <p className="font-designer-16r text-gray-400">
                  아직 등록된 질문이 없어요. 레슨에서 직접 질문해보세요!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-150">
                {qnas.map((q) => (
                  <button
                    key={q.qnaId}
                    type="button"
                    onClick={() => setSelectedQnaId(q.qnaId)}
                    className="flex w-full items-center gap-200 rounded-150 border border-border-subtle bg-background-default p-250 text-left hover:border-border-brand"
                  >
                    <p className="flex-1 truncate font-designer-16m text-gray-800">
                      {stripHtml(q.title)}
                    </p>
                    <div className="flex shrink-0 items-center gap-75 text-gray-400">
                      <MessageSquare className="h-225 w-225" />
                      <span className="font-designer-13m">{q.answerCount}</span>
                    </div>
                    <p className="shrink-0 font-designer-13m text-gray-400">
                      {formatDate(q.createdAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <LessonQnaDetailModal
        qnaId={selectedQnaId}
        onClose={() => setSelectedQnaId(null)}
      />
    </>
  );
}
