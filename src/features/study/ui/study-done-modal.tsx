'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/shadcn/lib/utils';
import Button from '@/shared/ui/button';
import { SingleDropdown } from '@/shared/ui/dropdown';
import { TextAreaInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';
import { completeStudy } from '../api/get-study-data';
import {
  CompleteStudyRequest,
  DailyStudyDetail,
  StudyProgressStatus,
} from '../api/types';
import { STUDY_PROGRESS_OPTIONS } from '../consts/study-const';
import { useInvalidateStudyQueries } from '../model/use-study-query';

interface StudyDoneModalProps {
  data: DailyStudyDetail;
  studyDate: string;
}

export default function StudyDoneModal({
  data,
  studyDate,
}: StudyDoneModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger>
        <div className="rounded-100 bg-fill-brand-default-default font-designer-16b text-text-inverse hover:bg-fill-brand-default-hover cursor-pointer px-150 py-100">
          완료하기
        </div>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title>면접 완료하기</Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <StudyDoneForm
            data={data}
            studyDate={studyDate}
            onClose={() => setIsOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface StudyDoneFormProps {
  data: DailyStudyDetail;
  studyDate: string;
  onClose: () => void;
}

function StudyDoneForm({ data, studyDate, onClose }: StudyDoneFormProps) {
  const [form, setForm] = useState<CompleteStudyRequest>({
    feedback: data.feedback ?? '',
    progressStatus: data.progressStatus ?? 'PENDING',
  });

  const { feedback, progressStatus } = form;
  const { invalidateDailyStudyDetail, invalidateDailyStudies } =
    useInvalidateStudyQueries();

  const handleChange = (key: keyof CompleteStudyRequest) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!feedback.trim() || !progressStatus) return;

    try {
      await completeStudy(data.dailyStudyId, form);
      await invalidateDailyStudyDetail(studyDate);
      await invalidateDailyStudies({ studyDate, cursor: 0, pageSize: 10 });
      onClose();
    } catch (err) {
      console.error(err);
      alert('요청 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <Modal.Body className="flex flex-col gap-400">
        <div className="flex flex-col gap-250">
          <div className="flex flex-col gap-100">
            <label className="font-designer-16b text-text-default">
              진행 현황
              <span className="font-designer-13m text-text-error pl-100">
                필수
              </span>
            </label>
            <span className="font-designer-14r text-text-subtle">
              면접 완료 후 해당 지원자의 상태를 업데이트해 주세요.
            </span>
          </div>

          <SingleDropdown
            options={STUDY_PROGRESS_OPTIONS}
            defaultValue={progressStatus}
            placeholder="선택해주세요"
            onChange={(value) =>
              handleChange('progressStatus')(value as StudyProgressStatus)
            }
          />
        </div>

        {/* 피드백 */}
        <div className="flex flex-col gap-250">
          <div className="flex flex-col gap-100">
            <label className="font-designer-16b text-text-default">
              피드백
              <span className="font-designer-13m text-text-error pl-100">
                필수
              </span>
            </label>
            <span className="font-designer-14r text-text-subtle">
              면접 결과에 대한 간단한 피드백을 입력해 주세요.
            </span>
          </div>

          <TextAreaInput
            placeholder="커뮤니케이션 능력은 우수하나, 자료구조 이해도가 부족해 추가 학습이 필요해 보입니다."
            value={feedback}
            maxLength={100}
            onChange={(value) => handleChange('feedback')(value)}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end gap-100">
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
          <Button
            size="large"
            color={feedback.trim() && progressStatus ? 'primary' : 'secondary'}
            className={cn(
              (!feedback.trim() || !progressStatus) && 'cursor-not-allowed',
            )}
            onClick={handleSubmit}
          >
            작성 완료
          </Button>
        </div>
      </Modal.Footer>
    </>
  );
}
