'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { useDailyStudyDetailQuery } from '@/features/study/model/use-study-query';
import { Input } from '@/shared/shadcn/ui/input';
import UserAvatar from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import CreateIcon from 'public/icons/create.svg';
import { StudyProgressStatus } from '../api/types';

const statusBadgeMap: Partial<Record<StudyProgressStatus, React.ReactNode>> = {
  BEFORE_PROGRESSED: <Badge color="default">시작 전</Badge>,
  PENDING: <Badge color="incomplete">보류</Badge>,
  IN_PROGRESS: <Badge color="incomplete">진행중</Badge>,
  COMPLETE: <Badge color="completed">완료</Badge>,
  ABSENT: <Badge color="incomplete">불참</Badge>,
};

export default function TodayStudyCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'ready' | 'done'>('ready');
  const [interviewTopic, setInterviewTopic] = useState('');
  const [referenceLink, setReferenceLink] = useState('');

  const dailyId = 123; // 일단 하드코딩, 나중에 useParams나 Zustand로 대체 가능
  const { data, isLoading, error } = useDailyStudyDetailQuery(dailyId);

  if (isLoading) return <div>로딩 중...</div>;
  if (error || !data) return <div>에러 발생</div>;

  return (
    <section className='w-full flex flex-col gap-150'>
      <div className='flex justify-between items-start mb-4'>
        <h3 className='font-bold-h5 text-text-strong'>오늘의 스터디</h3>
        <Button
          icon={<CreateIcon />}
          iconPosition='left'
          size='medium'
          onClick={() => {
            setMode('ready');
            setIsOpen(true);
          }}
        >
          작성하기
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-100 mb-4'>
        <InfoBox label='스터디 조' value="2조" />
        <InfoBox label='면접자' value={
          <div className='flex items-center px-100 py-50 gap-100 border border-border-default rounded-full bg-background-default'>
            <UserAvatar image={''} />
            <span className='font-designer-14m'>{data.interviewer}</span>
          </div>
        } />
        <InfoBox label='오늘의 면접 주제' value={data.subject} />
        <InfoBox label='진행 현황' value={getStatusBadge(data.progressStatus)} />
      </div>

      <div className='flex flex-col px-300 py-150 gap-150 rounded-100 bg-background-alternative'>
        <div className='text-text-subtle font-designer-14r'>피드백</div>
        <p className='leading-relaxed'>{data.feedBack ?? '-'}</p>
      </div>

      {renderInterviewModal()}
    </section>
  );

  function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className='flex flex-row items-center px-300 py-150 gap-150 min-h-[64px] justify-between rounded-100 bg-background-alternative'>
        <span className='font-designer-14r text-text-subtle'>{label}</span>
        <span className='font-designer-16m text-text-default'>{value}</span>
      </div>
    );
  }

  function getStatusBadge(status: StudyProgressStatus) {
    return statusBadgeMap[status] ?? null;
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

            <Modal.Body className='flex flex-col gap-400'>
              <div className='flex flex-col gap-100'>
                <label className='font-designer-16b text-text-default mb-100 inline-block'>
                  면접 주제 <span className='font-designer-13m text-text-error'>필수</span>
                </label>
                <span className='font-designer-13m text-text-subtle'>이번 스터디에서 다룰 면접 주제를 입력하세요</span>
                <Input
                  className='p-150 border border-border-default rounded-100'
                  placeholder='네트워크 기초, 운영체제 프로세스 관리, 자료구조 시간복잡도 비교'
                  value={interviewTopic}
                  onChange={(e) => setInterviewTopic(e.target.value)}
                />
              </div>

              <div className='flex flex-col gap-100'>
                <label className='font-designer-16b text-text-default mb-100 inline-block'>
                  참고 자료
                </label>
                <span className='font-designer-13m text-text-subtle'>참고할 링크나 자료가 있다면 입력해 주세요</span>
                <Input
                  className='p-150 border border-border-default rounded-100'
                  placeholder='https://github.com'
                  value={referenceLink}
                  onChange={(e) => setReferenceLink(e.target.value)}
                />
              </div>
            </Modal.Body>

            <Modal.Footer className='flex justify-end gap-100'>
              <Modal.Close asChild>
                <Button color='secondary' size='large'>취소</Button>
              </Modal.Close>
              <Button
                size='large'
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
