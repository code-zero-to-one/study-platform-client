'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/shadcn/lib/utils';
import Button from '@/shared/ui/button';
import { BaseInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';
import { putStudyDaily } from '../api/get-study-data';
import { DailyStudyDetail, PrepareStudyRequest } from '../api/types';
import { useInvalidateStudyQueries } from '../model/use-study-query';

interface StudyReadyModalProps {
  data: DailyStudyDetail;
  studyDate: string;
}

export default function StudyReadyModal({
  data,
  studyDate,
}: StudyReadyModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger>
        <div className="rounded-100 bg-fill-brand-default-default font-designer-16b text-text-inverse hover:bg-fill-brand-default-hover cursor-pointer px-150 py-100">
          준비하기
        </div>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title>면접 준비하기</Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <StudyReadyForm
            data={data}
            studyDate={studyDate}
            onClose={() => setIsOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface StudyReadyFormProps {
  data: DailyStudyDetail;
  studyDate: string;
  onClose: () => void;
}

function StudyReadyForm({ data, studyDate, onClose }: StudyReadyFormProps) {
  const [form, setForm] = useState<PrepareStudyRequest>({
    subject: data.subject ?? '',
    link: data.link ?? '',
  });

  const { invalidateDailyStudyDetail, invalidateDailyStudies } =
    useInvalidateStudyQueries();
  const { subject, link } = form;

  const handleChange =
    (key: keyof PrepareStudyRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!subject.trim()) return;

    try {
      await putStudyDaily(data.dailyStudyId, { subject, link });
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
              면접 주제
              <span className="font-designer-13m text-text-error pl-100">
                필수
              </span>
            </label>
            <span className="font-designer-14r text-text-subtle">
              이번 스터디에서 다룰 면접 주제를 입력하세요
            </span>
          </div>

          <BaseInput
            placeholder="네트워크 기초, 운영체제 프로세스 관리, 자료구조 시간복잡도 비교"
            value={subject}
            onChange={handleChange('subject')}
          />
        </div>

        <div className="flex flex-col gap-250">
          <div className="flex flex-col gap-100">
            <label className="font-designer-16b text-text-default">
              참고 자료
            </label>
            <span className="font-designer-14r text-text-subtle">
              참고할 링크나 자료가 있다면 입력해 주세요
            </span>
          </div>

          <BaseInput
            placeholder="https://github.com"
            value={link}
            onChange={handleChange('link')}
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
            color={subject.trim() ? 'primary' : 'secondary'}
            className={cn(!subject.trim() && 'cursor-not-allowed')}
            onClick={handleSubmit}
          >
            작성 완료
          </Button>
        </div>
      </Modal.Footer>
    </>
  );
}
