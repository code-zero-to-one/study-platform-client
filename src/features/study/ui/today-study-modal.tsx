import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/shadcn/lib/utils';
import Button from '@/shared/ui/button';
import { SingleDropdown } from '@/shared/ui/dropdown';
import { BaseInput, TextAreaInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';
import CreateIcon from 'public/icons/create.svg';
import { postDailyRetrospect, postStudyDaily } from '../api/get-study-data';
import { StudyProgressStatus } from '../api/types';

interface TodayStudyModalProps {
  mode: 'ready' | 'done';
  refetchKey: ['dailyStudyDetail', any];
}

const STUDY_PROGRESS_OPTIONS = [
  { label: '시작 전', value: 'BEFORE_PROGRESSED' },
  { label: '미완료', value: 'ABSENT' },
  { label: '완료', value: 'COMPLETE' },
];

export default function TodayStudyModal({
  mode,
  refetchKey,
}: TodayStudyModalProps) {
  const [interviewTopic, setInterviewTopic] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [progressStatus, setProgressStatus] =
    useState<StudyProgressStatus>('BEFORE_PROGRESSED');
  const queryClient = useQueryClient();

  const now = new Date();

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
              {mode === 'ready' ? '면접 준비하기' : '면접 완료하기'}
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-400">
            {mode === 'ready' ? (
              <>
                <div className="flex flex-col gap-100">
                  <label className="font-designer-16b text-text-default inline-block">
                    면접 주제
                    <span className="font-designer-13m text-text-error pl-100">
                      필수
                    </span>
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
              </>
            ) : (
              <>
                <div className="flex flex-col gap-100">
                  <label className="font-designer-16b text-text-default inline-block">
                    진행 현황
                    <span className="font-designer-13m text-text-error pl-100">
                      필수
                    </span>
                  </label>
                  <span className="font-designer-14r text-text-subtle mb-150">
                    면접 완료 후 해당 지원자의 상태를 업데이트해 주세요.
                  </span>
                  <SingleDropdown
                    options={STUDY_PROGRESS_OPTIONS}
                    defaultValue={progressStatus}
                    placeholder="선택해주세요"
                    onChange={(e) =>
                      setProgressStatus(e as StudyProgressStatus)
                    }
                  />
                </div>

                <div className="flex flex-col gap-100">
                  <label className="font-designer-16b text-text-default inline-block">
                    피드백
                    <span className="font-designer-13m text-text-error pl-100">
                      필수
                    </span>
                  </label>
                  <span className="font-designer-14r text-text-subtle mb-150">
                    면접 결과에 대한 간단한 피드백을 입력해 주세요.
                  </span>
                  <TextAreaInput
                    placeholder="커뮤니케이션 능력은 우수하나, 자료구조 이해도가 부족해 추가 학습이 필요해 보입니다."
                    value={interviewTopic}
                    maxLength={100}
                    onChange={(e) => setInterviewTopic(e)}
                  />
                </div>
              </>
            )}
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
                onClick={async (e) => {
                  if (!interviewTopic) {
                    e.preventDefault();

                    return;
                  }

                  try {
                    if (mode === 'ready') {
                      await postStudyDaily({
                        subject: interviewTopic,
                        description: '',
                        link: referenceLink,
                        privated: true,
                        planTime: now.toISOString(),
                      });
                    } else {
                      await postDailyRetrospect({
                        description: interviewTopic,
                        parentId: 9007199254740991,
                      });

                      // ? dl_study_id와 dl_attendee_id를 어떻게 설정하면 좋을지 고민
                      // const memberId = getCookie('memberId');

                      // sendGTMEvent({
                      //   event_name: 'study_complete',
                      //   timestamp: new Date().toISOString(),
                      //   // dl_study_id: 'study_2103',
                      //   dl_member_id: hashValue(memberId),
                      //   // dl_attendee_id: 'member_1023',
                      // });
                    }

                    await queryClient.invalidateQueries({
                      queryKey: refetchKey,
                    });
                  } catch (err) {
                    e.preventDefault();
                    console.error(err);
                    alert('요청 처리에 실패했습니다. 다시 시도해주세요.');
                  }
                }}
              >
                작성 완료
              </Button>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
