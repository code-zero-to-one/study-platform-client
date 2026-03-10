'use client';

import { XIcon } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import {
  MENTORING_DISCORD_INVITE_URL,
  getMentoringChannelGuide,
  getMentoringProgressCheckGuide,
  getMentoringResponseGuide,
  MENTORING_MENTOR_CHANNEL_GUIDE,
  MENTORING_MENTOR_RESPONSE_EXPECTATION_GUIDE,
} from '@/features/mentoring/model/mentoring-flow-policy';

interface MentoringGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GUIDE_CONTENT = [
  {
    title: '멘토링 소개',
    description:
      '멘토와 멘티를 1:1로 연결해 예약형 상담과 쪽지상담을 운영합니다.',
  },
  {
    title: '관리 화면',
    description:
      '신청 내역은 나의 멘토링, 쪽지상담, 후기 관리에서 보고, 받은 신청과 일정은 멘토 운영 관리에서 처리합니다.',
  },
  {
    title: '상담 방식',
    description: `쪽지상담: ${getMentoringChannelGuide('note')}\n간편/심층상담: ${getMentoringChannelGuide('deep')}\n대면상담: ${getMentoringChannelGuide('offline')}`,
  },
  {
    title: '응답 기준',
    description: `쪽지상담: ${getMentoringResponseGuide('note')}\n예약형 상담: ${getMentoringResponseGuide('deep')}\n진행 확인: ${getMentoringProgressCheckGuide('deep')}`,
  },
  {
    title: '멘토 등록/운영',
    description: `지식공유자 권한이 있으면 등록할 수 있습니다.\n${MENTORING_MENTOR_RESPONSE_EXPECTATION_GUIDE}\n${MENTORING_MENTOR_CHANNEL_GUIDE}`,
  },
];

const GUIDE_STEPS = ['설정', '신청 확인', '수락/거절', '상담 진행'];

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
                <p className="font-designer-16r text-text-subtle leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </section>
            ))}

            <section>
              <h3 className="font-designer-20b text-text-default mb-125">
                ○ 진행 순서
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

            <section>
              <h3 className="font-designer-20b text-text-default mb-75">
                ○ 멘토링 디스코드 채널
              </h3>
              <p className="font-designer-16r text-text-subtle mb-125 leading-relaxed">
                운영 전에 디스코드 채널에 먼저 입장해두세요. 공지와 진행 링크를
                같은 기준으로 공유할 수 있습니다.
              </p>
              <Button asChild color="outlined" size="medium">
                <a
                  href={MENTORING_DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  디스코드 채널 입장
                </a>
              </Button>
            </section>
          </Modal.Body>

          <Modal.Footer className="flex flex-col-reverse gap-100 sm:flex-row sm:items-center sm:justify-end">
            <Link href="/mentoring" className="w-full sm:w-auto">
              <Button
                color="secondary"
                size="large"
                className="w-full sm:w-auto"
              >
                멘토링 소개 보기
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
