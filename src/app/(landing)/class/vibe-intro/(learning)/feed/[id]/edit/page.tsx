'use client';

import { ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import {
  useGetBuilderFeedDetail,
  useGetCourseCurriculum,
  useUpdateBuilderFeed,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';

export default function FeedEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const feedId = parseInt(id, 10);
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [text, setText] = useState('');
  const initialized = useRef(false);

  const { data: feed } = useGetBuilderFeedDetail(feedId);
  const { data: curriculum } = useGetCourseCurriculum('vibe-intro');
  const updateFeed = useUpdateBuilderFeed();

  useEffect(() => {
    if (feed && !initialized.current) {
      initialized.current = true;
      setSelectedLessonId(feed.lessonId);
      setText(feed.content);
    }
  }, [feed]);

  const allLessons =
    curriculum?.chapters.flatMap((ch) =>
      ch.lessons.map((l) => ({
        lessonId: l.lessonId,
        label: `Lesson ${String(l.order).padStart(2, '0')}. ${l.title}`,
      })),
    ) ?? [];

  const selectedLessonLabel =
    allLessons.find((l) => l.lessonId === selectedLessonId)?.label ??
    'Lesson 선택';

  function handleSubmit() {
    if (!selectedLessonId) {
      showToast('레슨을 선택해주세요.', 'error');
      return;
    }
    if (!text.replace(/<[^>]*>/g, '').trim()) {
      showToast('내용을 입력해주세요.', 'error');
      return;
    }
    updateFeed.mutate(
      {
        feedId,
        request: {
          lessonId: selectedLessonId,
          content: text,
        },
      },
      {
        onSuccess: () => {
          showToast('피드가 수정되었어요!');
          router.push(`/class/vibe-intro/feed/${feedId}`);
        },
        onError: () => showToast('수정에 실패했어요.', 'error'),
      },
    );
  }

  return (
    <div className="w-full pb-800">
      <div className="mx-auto max-w-page px-600 pt-500">
        <Link
          href={`/class/vibe-intro/feed/${feedId}`}
          className="inline-flex items-center gap-125 font-designer-14m text-gray-800"
        >
          <ArrowLeft className="h-300 w-300" />
          피드로 돌아가기
        </Link>

        <div className="mt-400 space-y-400">
          {/* Lesson selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLessonOpen((p) => !p)}
              className="flex w-full items-center justify-between rounded-100 border border-border-default px-250 py-175 font-designer-16r text-gray-800"
            >
              {selectedLessonLabel}
              <ChevronDown
                className={cn(
                  'h-300 w-300 transition-transform',
                  lessonOpen && 'rotate-180',
                )}
              />
            </button>
            {lessonOpen && (
              <div className="absolute left-0 top-full z-10 mt-75 max-h-[300px] w-full overflow-y-auto rounded-100 border border-border-default bg-background-default shadow-1">
                {allLessons.map((l) => (
                  <button
                    key={l.lessonId}
                    type="button"
                    onClick={() => {
                      setSelectedLessonId(l.lessonId);
                      setLessonOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center px-250 py-175 font-designer-16r text-gray-800 hover:bg-gray-100',
                      l.lessonId === selectedLessonId && 'font-designer-16b',
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text content */}
          <MarkdownEditor
            value={text}
            onChange={setText}
            placeholder="내용을 수정해주세요."
          />

          {/* CTAs */}
          <div className="flex gap-200">
            <Link
              href={`/class/vibe-intro/feed/${feedId}`}
              className="flex h-700 flex-1 items-center justify-center rounded-100 border border-border-default font-designer-16m text-gray-800"
            >
              취소
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={updateFeed.isPending}
              className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:bg-gray-300"
            >
              수정하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
