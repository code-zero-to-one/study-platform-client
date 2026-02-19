'use client';

import { XIcon } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface MentoringGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GUIDE_CONTENT = [
  {
    title: '멘토링이 뭔가요?',
    description:
      '멘토와 멘티를 1:1로 연결해 약속을 잡아주는 기능입니다. 멘토가 가능한 시간과 비용을 설정하면 멘티는 원하는 일정에 멘토링을 신청할 수 있어요.',
  },
  {
    title: '어떤 목적으로 사용할까요?',
    description:
      '커리어 상담, 코드리뷰, 포트폴리오 리뷰, 기술 컨설팅, 모의 면접 등 지식과 경험을 공유하는 목적이라면 다양하게 활용할 수 있습니다.',
  },
  {
    title: '형식이 있나요?',
    description:
      '쪽지상담/15분 전화상담/온라인상담/대면상담 4가지 포맷으로 운영합니다. 멘토가 각 포맷의 가격과 시간을 설정할 수 있습니다.',
  },
  {
    title: '수락 정책은 어떻게 되나요?',
    description:
      '쪽지상담은 결제 후 멘토의 답장 자체가 수락입니다. 전화/온라인/대면 상담은 결제 후 멘토 수락이 필요하며 48시간 내 미응답 시 자동 거절됩니다.',
  },
  {
    title: '멘토가 되려면?',
    description: '지식공유자 권한이 있으면 누구든 멘토가 될 수 있습니다.',
  },
];

const GUIDE_STEPS = [
  '멘토링 설정 후 활성화',
  '멘티가 신청서와 자료를 제출',
  '멘토가 수락 또는 거절 사유 입력',
  '비용 정산',
];

export default function MentoringGuideModal({
  open,
  onOpenChange,
}: MentoringGuideModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-full max-w-[860px]">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title className="font-designer-28b text-text-default">
              멘토링 안내
            </Modal.Title>
            <Modal.Close onClick={() => onOpenChange(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex max-h-[70vh] flex-col gap-200">
            {GUIDE_CONTENT.map((item) => (
              <section key={item.title}>
                <h3 className="font-designer-20b text-text-default mb-75">
                  ○ {item.title}
                </h3>
                <p className="font-designer-16r text-text-subtle leading-relaxed">
                  {item.description}
                </p>
              </section>
            ))}

            <section>
              <h3 className="font-designer-20b text-text-default mb-125">
                ○ 이용 과정
              </h3>
              <div className="flex flex-col gap-100">
                {GUIDE_STEPS.map((step, index) => (
                  <div
                    key={step}
                    className="rounded-100 bg-background-alternative px-150 py-125"
                  >
                    <p className="font-designer-16m text-text-default">
                      {index + 1}. {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Modal.Body>

          <Modal.Footer className="flex flex-col-reverse gap-100 sm:flex-row sm:items-center sm:justify-end">
            <Link href="/mentoring" className="w-full sm:w-auto">
              <Button
                color="secondary"
                size="large"
                className="w-full sm:w-auto"
              >
                멘토링 소개 페이지
              </Button>
            </Link>
            <Button
              color="primary"
              size="large"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              확인
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
