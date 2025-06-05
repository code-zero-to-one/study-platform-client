'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/shared/shadcn/ui/input';
import UserAvatar from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import CreateIcon from 'public/icons/create.svg';

interface TodayStudyCardProps {
  teamName: string;
  interviewer: {
    name: string;
    img?: string;
  };
  topic: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
  feedback: string;
}

export default function TodayStudyCard({
  teamName,
  interviewer,
  topic,
  status,
  feedback,
}: TodayStudyCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'ready' | 'done'>('ready');
  const [interviewTopic, setInterviewTopic] = useState('');
  const [referenceLink, setReferenceLink] = useState('');

  return (
    <section className="flex w-full flex-col gap-150">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="font-bold-h5 text-text-strong">오늘의 스터디</h3>
        <Button
          icon={<CreateIcon />}
          iconPosition="left"
          size="medium"
          onClick={() => {
            setMode('ready');
            setIsOpen(true);
          }}
        >
          작성하기
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-100">
        <InfoBox label="스터디 조" value={teamName} />
        <InfoBox
          label="면접자"
          value={
            <div className="border-border-default bg-background-default flex items-center gap-100 rounded-full border px-100 py-50">
              <UserAvatar image={interviewer.img} />
              <span className="font-designer-14m">{interviewer.name}</span>
            </div>
          }
        />
        <InfoBox label="오늘의 면접 주제" value={topic} />
        <InfoBox label="진행 현황" value={getStatusBadge(status)} />
      </div>

      <div className="rounded-100 bg-background-alternative flex flex-col gap-150 px-300 py-150">
        <div className="text-text-subtle font-designer-14r">피드백</div>
        <p className="leading-relaxed">{feedback}</p>
      </div>

      {renderInterviewModal()}
    </section>
  );

  function InfoBox({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) {
    return (
      <div className="rounded-100 bg-background-alternative flex min-h-[64px] flex-row items-center justify-between gap-150 px-300 py-150">
        <span className="font-designer-14r text-text-subtle">{label}</span>
        <span className="font-designer-16m text-text-default">{value}</span>
      </div>
    );
  }

  function getStatusBadge(status: TodayStudyCardProps['status']) {
    switch (status) {
      case 'IN_PROGRESS':
        return <Badge color="incomplete">진행중</Badge>;
      case 'COMPLETED':
        return <Badge color="completed">완료</Badge>;
      case 'NOT_STARTED':
        return <Badge color="default">미완료</Badge>;
      default:
        return null;
    }
  }

  function renderInterviewModal() {
    return (
      <Modal.Provider open={isOpen} onOpenChange={setIsOpen}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Header className="flex items-center justify-between">
              <Modal.Title>
                {mode === 'ready' ? '면접 준비하기' : '면접 완료하기'}
              </Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </Modal.Header>

            <Modal.Body className="flex flex-col gap-400">
              <div className="flex flex-col gap-100">
                <label className="font-designer-16b text-text-default mb-100 inline-block">
                  면접 주제{' '}
                  <span className="font-designer-13m text-text-error">
                    필수
                  </span>
                </label>
                <span className="font-designer-13m text-text-subtle">
                  이번 스터디에서 다룰 면접 주제를 입력하세요
                </span>
                <Input
                  className="border-border-default rounded-100 border p-150"
                  placeholder="네트워크 기초, 운영체제 프로세스 관리, 자료구조 시간복잡도 비교"
                  value={interviewTopic}
                  onChange={(e) => setInterviewTopic(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-100">
                <label className="font-designer-16b text-text-default mb-100 inline-block">
                  참고 자료
                </label>
                <span className="font-designer-13m text-text-subtle">
                  참고할 링크나 자료가 있다면 입력해 주세요
                </span>
                <Input
                  className="border-border-default rounded-100 border p-150"
                  placeholder="https://github.com"
                  value={referenceLink}
                  onChange={(e) => setReferenceLink(e.target.value)}
                />
              </div>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-100">
              <Modal.Close asChild>
                <Button color="secondary" size="large">
                  취소
                </Button>
              </Modal.Close>
              <Button
                size="large"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                작성 완료
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Provider>
    );
  }
}
