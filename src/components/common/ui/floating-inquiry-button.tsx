'use client';

import { MessageCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useLazyMount } from '@/hooks/common/use-lazy-mount';
import { useUserStore } from '@/stores/useUserStore';

const CreateQuestionModal = dynamic(
  () => import('@/components/group-study/modals/create-question-modal'),
  { ssr: false },
);

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
  { ssr: false },
);

const STUDY_DETAIL_PATTERN = /^\/(group-study|premium-study)\/(\d+)/;

export default function FloatingInquiryButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const shouldMount = useLazyMount(open);
  const { memberId } = useUserStore();

  const match = pathname.match(STUDY_DETAIL_PATTERN);
  if (!match) return null;

  const studyType = match[1] === 'group-study' ? 'group' : ('premium' as const);
  const studyId = Number(match[2]);

  const triggerButton = (
    <button
      type="button"
      className="bg-fill-brand-default-default hover:bg-fill-brand-default-hover fixed right-600 bottom-600 z-50 flex items-center gap-100 rounded-full px-300 py-200 shadow-lg transition-all hover:shadow-xl"
      aria-label="스터디 문의하기"
    >
      <MessageCircle className="text-icon-inverse h-200 w-200" />
      <span className="font-designer-16b text-text-inverse">
        스터디 문의하기
      </span>
    </button>
  );

  if (!memberId) {
    return <LoginModal openTrigger={triggerButton} />;
  }

  return (
    <>
      <button
        type="button"
        className="bg-fill-brand-default-default hover:bg-fill-brand-default-hover fixed right-600 bottom-600 z-50 flex items-center gap-100 rounded-full px-300 py-200 shadow-lg transition-all hover:shadow-xl"
        aria-label="스터디 문의하기"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="text-icon-inverse h-200 w-200" />
        <span className="font-designer-16b text-text-inverse">
          스터디 문의하기
        </span>
      </button>
      {shouldMount && (
        <CreateQuestionModal
          open={open}
          onOpenChange={setOpen}
          groupStudyId={studyId}
          studyType={studyType}
        />
      )}
    </>
  );
}
