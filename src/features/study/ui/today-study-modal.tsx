import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/shadcn/lib/utils';
import Button from '@/shared/ui/button';
import Input from '@/shared/ui/input/base';
import { Modal } from '@/shared/ui/modal';
import CreateIcon from 'public/icons/create.svg';

interface TodayStudyModalProps {
  mode: 'ready' | 'done';
}

export default function TodayStudyModal({ mode }: TodayStudyModalProps) {
  const [interviewTopic, setInterviewTopic] = useState('');
  const [referenceLink, setReferenceLink] = useState('');

  return (
    <Modal.Provider>
      <Modal.Trigger>
        <div className="rounded-100 font-designer-16b bg-fill-brand-default-default text-text-inverse hover:bg-fill-brand-default-hover active:bg-fill-brand-default-pressed flex cursor-pointer items-center justify-center px-100 py-75">
          <CreateIcon />
          <span className="ml-75">작성하기</span>
        </div>
      </Modal.Trigger>
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
                <span className="font-designer-13m text-text-error">필수</span>
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
            <Modal.Close asChild>
              <Button
                size="large"
                color={interviewTopic ? 'primary' : 'secondary'}
                className={cn(!interviewTopic && 'cursor-not-allowed')}
                onClick={(e) => {
                  if (!interviewTopic) {
                    e.preventDefault();

                    return;
                  }
                }}
              >
                작성 완료
              </Button>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Provider>
  );
}
