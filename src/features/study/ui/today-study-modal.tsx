'use client';

import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/shared/shadcn/lib/utils';
import { getCookie } from '@/shared/tanstack-query/cookie';
import Button from '@/shared/ui/button';
import { SingleDropdown } from '@/shared/ui/dropdown';
import { BaseInput, TextAreaInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';
import CreateIcon from 'public/icons/create.svg';
import { postDailyRetrospect, putStudyDaily } from '../api/get-study-data';
import {
  DailyStudyDetail,
  PutStudyDailyRequest,
  StudyProgressStatus,
} from '../api/types';
import { STUDY_PROGRESS_OPTIONS } from '../consts/study-const';

interface TodayStudyModalProps {
  data: DailyStudyDetail;
  refetch: () => void;
}

export default function TodayStudyModal({
  data,
  refetch,
}: TodayStudyModalProps) {
  const [memberId, setMemberId] = useState<number | null>(null);

  useEffect(() => {
    const id = getCookie('memberId');
    setMemberId(id ? Number(id) : null);
  }, []);

  if (memberId === null) return null;

  const isReady = memberId !== data.interviewerId;

  return (
    <Modal.Root>
      <Modal.Trigger>
        <div className="rounded-100 font-designer-16b bg-fill-brand-default-default text-text-inverse hover:bg-fill-brand-default-hover active:bg-fill-brand-default-pressed flex cursor-pointer items-center justify-center px-100 py-75">
          <CreateIcon />
          <span className="ml-75">작성하기</span>
        </div>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title>
              {isReady ? '면접 준비하기' : '면접 완료하기'}
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-400">
            {isReady ? (
              <ReadyForm refetch={refetch} data={data} />
            ) : (
              <DoneForm refetch={refetch} />
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function ReadyForm({
  refetch,
  data,
}: {
  refetch: () => void;
  data: DailyStudyDetail;
}) {
  const [interviewTopic, setInterviewTopic] = useState<
    PutStudyDailyRequest['subject']
  >(data.subject ?? '');

  const [referenceLink, setReferenceLink] = useState<
    PutStudyDailyRequest['link']
  >(data.link ?? '');

  const handleSubmit = async (e: React.MouseEvent) => {
    if (!interviewTopic) {
      e.preventDefault();

      return;
    }

    try {
      await putStudyDaily(data.dailyStudyId, {
        subject: interviewTopic,
        description: '',
        link: referenceLink,
      });
      await refetch();
    } catch (err) {
      e.preventDefault();
      console.error(err);
      alert('요청 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-100">
        <label className="font-designer-16b text-text-default inline-block">
          면접 주제
          <span className="font-designer-13m text-text-error pl-100">필수</span>
        </label>
        <span className="font-designer-14r text-text-subtle mb-150">
          이번 스터디에서 다룰 면접 주제를 입력하세요
        </span>
        <BaseInput
          placeholder="네트워크 기초, 운영체제 프로세스 관리, 자료구조 시간복잡도 비교"
          value={interviewTopic}
          onChange={(e) => setInterviewTopic(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-100">
        <label className="font-designer-16b text-text-default inline-block">
          참고 자료
        </label>
        <span className="font-designer-14r text-text-subtle mb-150">
          참고할 링크나 자료가 있다면 입력해 주세요
        </span>
        <BaseInput
          placeholder="https://github.com"
          value={referenceLink}
          onChange={(e) => setReferenceLink(e.target.value)}
        />
      </div>

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
            onClick={handleSubmit}
          >
            작성 완료
          </Button>
        </Modal.Close>
      </Modal.Footer>
    </>
  );
}

function DoneForm({ refetch }: { refetch: () => void }) {
  const [feedback, setFeedback] = useState('');
  const [progressStatus, setProgressStatus] =
    useState<StudyProgressStatus>('BEFORE_PROGRESSED');

  const handleSubmit = async (e: React.MouseEvent) => {
    if (!feedback) {
      e.preventDefault();

      return;
    }

    try {
      await postDailyRetrospect({
        description: feedback,
        parentId: 9007199254740991,
      });
      await refetch();
    } catch (err) {
      e.preventDefault();
      console.error(err);
      alert('요청 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-100">
        <label className="font-designer-16b text-text-default inline-block">
          진행 현황
          <span className="font-designer-13m text-text-error pl-100">필수</span>
        </label>
        <span className="font-designer-14r text-text-subtle mb-150">
          면접 완료 후 해당 지원자의 상태를 업데이트해 주세요.
        </span>
        <SingleDropdown
          options={STUDY_PROGRESS_OPTIONS}
          defaultValue={progressStatus}
          placeholder="선택해주세요"
          onChange={(e) => setProgressStatus(e as StudyProgressStatus)}
        />
      </div>

      <div className="flex flex-col gap-100">
        <label className="font-designer-16b text-text-default inline-block">
          피드백
          <span className="font-designer-13m text-text-error pl-100">필수</span>
        </label>
        <span className="font-designer-14r text-text-subtle mb-150">
          면접 결과에 대한 간단한 피드백을 입력해 주세요.
        </span>
        <TextAreaInput
          placeholder="커뮤니케이션 능력은 우수하나, 자료구조 이해도가 부족해 추가 학습이 필요해 보입니다."
          value={feedback}
          maxLength={100}
          onChange={(e) => setFeedback(e)}
        />
      </div>

      <Modal.Footer className="flex justify-end gap-100">
        <Modal.Close asChild>
          <Button color="secondary" size="large">
            취소
          </Button>
        </Modal.Close>
        <Modal.Close asChild>
          <Button
            size="large"
            color={feedback ? 'primary' : 'secondary'}
            className={cn(!feedback && 'cursor-not-allowed')}
            onClick={handleSubmit}
          >
            작성 완료
          </Button>
        </Modal.Close>
      </Modal.Footer>
    </>
  );
}
