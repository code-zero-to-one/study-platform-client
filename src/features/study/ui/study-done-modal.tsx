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

interface Props {
  data: DailyStudyDetail;
  refetch: () => void;
}

export default function StudyDoneModal({ data, refetch }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger onClick={() => setIsOpen(true)}>
        <div className="rounded-100 bg-fill-brand-default-default font-designer-16b text-text-inverse hover:bg-fill-brand-default-hover cursor-pointer px-150 py-100">
          완료하기
        </div>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <div className="flex w-full items-center justify-between">
              <Modal.Title>면접 완료하기</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>

          <StudyDoneForm
            data={data}
            refetch={refetch}
            onClose={() => setIsOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function StudyDoneForm({
  data,
  refetch,
  onClose,
}: {
  data: DailyStudyDetail;
  refetch: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CompleteStudyRequest>({
    feedback: data.feedback ?? '',
    progressStatus: data.progressStatus ?? 'PENDING',
  });

  const handleSubmit = async (e: React.MouseEvent) => {
    if (!form.feedback || !form.progressStatus) {
      e.preventDefault();

      return;
    }

    try {
      await completeStudy(data.dailyStudyId, form);
      await refetch();
      onClose();
    } catch (err) {
      e.preventDefault();
      console.error(err);
      alert('요청 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <Modal.Body className="flex flex-col gap-400">
        <div className="flex flex-col gap-250">
          <div className="flex flex-col gap-100">
            <label className="font-designer-16b text-text-default inline-block">
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
            defaultValue={form.progressStatus}
            placeholder="선택해주세요"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                progressStatus: e as StudyProgressStatus,
              }))
            }
          />
        </div>

        <div className="flex flex-col gap-250">
          <div className="flex flex-col gap-100">
            <label className="font-designer-16b text-text-default inline-block">
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
            value={form.feedback}
            maxLength={100}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, feedback: value }))
            }
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
            color={
              form.feedback && form.progressStatus ? 'primary' : 'secondary'
            }
            className={cn(
              (!form.feedback || !form.progressStatus) && 'cursor-not-allowed',
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
