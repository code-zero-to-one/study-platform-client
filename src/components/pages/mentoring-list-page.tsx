'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { Plus, Sparkles, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import MentorProfileList from '@/components/mentoring/mentor-profile-list';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/hooks/common/use-auth';

// Carousel이 클라이언트 전용이므로 dynamic import로 로드
const Banner = dynamic(() => import('@/widgets/home/banner'), {
  ssr: false,
});

export default function MentoringListPage() {
  const { isAuthenticated } = useAuth();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);

  return (
    <div className="mx-auto w-[1280px] px-400 py-600">
      {/* 배너 */}
      <div className="mb-600">
        <Banner />
      </div>

      {/* 헤더 */}
      <div className="mb-400 flex items-center justify-between">
        <h1 className="font-designer-24b text-text-default">1:1 멘토링</h1>
        <Button
          color="primary"
          size="small"
          icon={<Plus className="h-200 w-200" />}
          iconPosition="left"
          disabled={!isAuthenticated}
          onClick={() => {
            // GA4 이벤트 전송
            sendGTMEvent({
              event: 'mentor_register_click',
              location: 'mentoring_page',
              is_authenticated: isAuthenticated,
            });

            setIsComingSoonModalOpen(true);
          }}
        >
          멘토 등록하기
        </Button>
      </div>

      {/* 멘토 프로필 리스트 */}
      <MentorProfileList />

      {/* 곧 오픈 예정 모달 */}
      <Modal.Root
        open={isComingSoonModalOpen}
        onOpenChange={setIsComingSoonModalOpen}
      >
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content size="small">
            <Modal.Header className="border-border-default flex items-center justify-between border-b">
              <Modal.Title className="font-designer-20b text-text-strong">
                멘토 등록
              </Modal.Title>
              <Modal.Close>
                <X className="h-20 w-20" />
              </Modal.Close>
            </Modal.Header>

            <Modal.Body className="flex flex-col items-center gap-300 py-400">
              <div className="bg-fill-brand-subtle-default flex h-[80px] w-[80px] items-center justify-center rounded-full">
                <Sparkles className="text-text-brand h-[40px] w-[40px]" />
              </div>

              <div className="flex flex-col items-center gap-200 text-center">
                <h3 className="font-designer-20b text-text-strong">
                  곧 오픈 예정입니다!
                </h3>
                <p className="font-designer-16r text-text-default">
                  멘토 등록 기능을 준비하고 있어요.
                  <br />
                  조금만 기다려주시면 멘토로 등록하여
                  <br />
                  멘티들에게 지식을 나눌 수 있어요.
                </p>
                <p className="font-designer-14r text-text-subtle mt-100">
                  곧 만나요! 🚀
                </p>
              </div>
            </Modal.Body>

            <Modal.Footer className="flex justify-end">
              <Button
                color="primary"
                size="medium"
                onClick={() => setIsComingSoonModalOpen(false)}
              >
                확인
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </div>
  );
}
