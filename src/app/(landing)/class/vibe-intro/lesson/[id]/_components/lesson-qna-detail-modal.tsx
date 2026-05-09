'use client';

import { Eye, X } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useGetLessonQnaDetail } from '@/hooks/queries/course/course-api';

interface Props {
  qnaId: number | null;
  onClose: () => void;
}

function GradeBadge({ role }: { role: string }) {
  const letter = role.charAt(0).toUpperCase();
  return (
    <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-rose-100 font-designer-14b text-rose-500">
      {letter}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr)
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '.')
    .replace(/\.$/, '');
}

export function LessonQnaDetailModal({ qnaId, onClose }: Props) {
  const { data: qna, isLoading } = useGetLessonQnaDetail(qnaId);

  if (qnaId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-1000/40" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-[800px] flex-col rounded-200 bg-background-default shadow-3 mx-400 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-400 py-300">
          <p className="font-designer-16b text-gray-800">질문 상세</p>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800"
          >
            <X className="h-300 w-300" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-400 py-350">
          {isLoading ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="font-designer-16r text-gray-400">불러오는 중...</p>
            </div>
          ) : !qna ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="font-designer-16r text-gray-400">
                질문을 불러올 수 없어요.
              </p>
            </div>
          ) : (
            <div className="space-y-400">
              {/* Question section */}
              <div>
                {/* Author row */}
                <div className="mb-250 flex items-center gap-150">
                  <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <p className="font-designer-14b text-gray-600">
                      {qna.author.nickname.charAt(0)}
                    </p>
                  </div>
                  <GradeBadge role={qna.author.role} />
                  <div className="flex-1">
                    <p className="font-designer-14b text-gray-800">
                      {qna.author.nickname}
                    </p>
                  </div>
                  <div className="flex items-center gap-125">
                    <div className="flex items-center gap-50 text-gray-400">
                      <Eye className="h-200 w-200" />
                      <p className="font-designer-14r text-gray-400">
                        {qna.viewCount}
                      </p>
                    </div>
                    <p className="font-designer-14r text-gray-400">
                      {formatDate(qna.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Question title */}
                <h3 className="mb-200 font-designer-20b text-gray-800">
                  {qna.title}
                </h3>

                {/* Question content */}
                <p className="whitespace-pre-wrap font-designer-16r text-gray-800 leading-relaxed">
                  {qna.content}
                </p>

                {/* Images */}
                {qna.imageUrls.length > 0 && (
                  <div className="mt-250 flex flex-wrap gap-200">
                    {qna.imageUrls.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={url}
                        alt={`첨부 이미지 ${i + 1}`}
                        className="max-h-[300px] rounded-100 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Answers section */}
              {qna.answers.length > 0 && (
                <div className="border-t border-border-subtle pt-400">
                  <p className="mb-300 font-designer-16b text-gray-800">
                    답변 {qna.answers.length}개
                  </p>
                  <div className="space-y-350">
                    {qna.answers.map((answer) => (
                      <div
                        key={answer.answerId}
                        className="rounded-150 bg-gray-100 p-300"
                      >
                        {/* Answerer row */}
                        <div className="mb-200 flex items-center gap-150">
                          <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-gray-200">
                            <p className="font-designer-14b text-gray-600">
                              {answer.author.nickname.charAt(0)}
                            </p>
                          </div>
                          <GradeBadge role={answer.author.role} />
                          <div className="flex-1">
                            <p className="font-designer-14b text-gray-800">
                              {answer.author.nickname}
                            </p>
                          </div>
                          <p className="font-designer-14r text-gray-400">
                            {formatDate(answer.createdAt)}
                          </p>
                        </div>

                        {/* Answer content */}
                        <p
                          className={cn(
                            'whitespace-pre-wrap font-designer-16r text-gray-800 leading-relaxed',
                          )}
                        >
                          {answer.content}
                        </p>

                        {/* Answer images */}
                        {answer.imageUrls.length > 0 && (
                          <div className="mt-200 flex flex-wrap gap-200">
                            {answer.imageUrls.map((url, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={i}
                                src={url}
                                alt={`답변 이미지 ${i + 1}`}
                                className="max-h-[200px] rounded-100 object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {qna.answers.length === 0 && (
                <div className="border-t border-border-subtle pt-400">
                  <p className="text-center font-designer-14r text-gray-400">
                    아직 답변이 없어요. 빠르게 답변 드릴게요!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
