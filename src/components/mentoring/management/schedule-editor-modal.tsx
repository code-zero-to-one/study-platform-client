'use client';

import dayjs from 'dayjs';
import { XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import { BaseInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

export interface ScheduleEditorSubmitPayload {
  startsAt: string;
  endsAt: string;
  placeNote: string;
  mentorNote: string;
}

interface ScheduleEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  durationMinutes: number;
  defaultDate?: string;
  defaultTime?: string;
  defaultPlaceNote?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  onConfirm: (payload: ScheduleEditorSubmitPayload) => void;
}

const toTimeValue = (iso: string | undefined) => {
  if (!iso) {
    return '';
  }

  if (/^\d{2}:\d{2}$/.test(iso)) {
    return iso;
  }

  const parsed = dayjs(iso);
  if (!parsed.isValid()) {
    return '';
  }

  return parsed.format('HH:mm');
};

const toDateValue = (value: string | undefined) => {
  if (!value) {
    return dayjs().add(3, 'day').format('YYYY-MM-DD');
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return dayjs().add(3, 'day').format('YYYY-MM-DD');
  }

  return parsed.format('YYYY-MM-DD');
};

export default function ScheduleEditorModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  durationMinutes,
  defaultDate,
  defaultTime,
  defaultPlaceNote,
  isSubmitting = false,
  errorMessage,
  onConfirm,
}: ScheduleEditorModalProps) {
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [placeNote, setPlaceNote] = useState('');
  const [mentorNote, setMentorNote] = useState('');

  useEffect(() => {
    if (open) {
      setDateValue(toDateValue(defaultDate));
      setTimeValue(toTimeValue(defaultTime));
      setPlaceNote(defaultPlaceNote ?? '');
      setMentorNote('');
    }
  }, [defaultDate, defaultPlaceNote, defaultTime, open]);

  const startDateTime = useMemo(() => {
    if (!dateValue || !timeValue) {
      return undefined;
    }

    const parsed = dayjs(`${dateValue} ${timeValue}`);
    if (!parsed.isValid()) {
      return undefined;
    }

    return parsed;
  }, [dateValue, timeValue]);

  const endDateTime = useMemo(() => {
    if (!startDateTime) {
      return undefined;
    }

    return startDateTime.add(durationMinutes, 'minute');
  }, [durationMinutes, startDateTime]);

  const isInvalid = !startDateTime || !endDateTime || placeNote.trim() === '';

  const handleConfirm = () => {
    if (!startDateTime || !endDateTime || isInvalid) {
      return;
    }

    onConfirm({
      startsAt: startDateTime.toISOString(),
      endsAt: endDateTime.toISOString(),
      placeNote: placeNote.trim(),
      mentorNote: mentorNote.trim(),
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content
          className="w-full max-w-[640px]"
          description={description}
        >
          <Modal.Header className="flex items-center justify-between">
            <div>
              <Modal.Title>{title}</Modal.Title>
              <p className="font-designer-13r text-text-subtle mt-50">
                {description}
              </p>
            </div>
            <Modal.Close>
              <XIcon className="text-text-subtle h-18 w-18" />
            </Modal.Close>
          </Modal.Header>
          <Modal.Body className="space-y-150">
            <div className="rounded-100 bg-background-alternative px-150 py-100">
              <p className="font-designer-13r text-text-subtle">
                상담 시간은 자동으로 {durationMinutes}분이 반영됩니다.
              </p>
              <p className="font-designer-14b text-text-default mt-50">
                {startDateTime && endDateTime
                  ? `${startDateTime.format('YYYY.MM.DD HH:mm')} ~ ${endDateTime.format(
                      'HH:mm',
                    )}`
                  : '날짜와 시간을 선택해주세요.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-100 sm:grid-cols-2">
              <div className="space-y-75">
                <label className="font-designer-13b text-text-default">
                  날짜
                </label>
                <BaseInput
                  type="date"
                  value={dateValue}
                  onValueChange={setDateValue}
                  min={dayjs().format('YYYY-MM-DD')}
                />
              </div>
              <div className="space-y-75">
                <label className="font-designer-13b text-text-default">
                  시작 시간
                </label>
                <BaseInput
                  type="time"
                  value={timeValue}
                  onValueChange={setTimeValue}
                  step={1800}
                />
              </div>
            </div>

            <div className="space-y-75">
              <label className="font-designer-13b text-text-default">
                진행 방식 / 장소
              </label>
              <BaseInput
                value={placeNote}
                onValueChange={setPlaceNote}
                placeholder="예: Google Meet 링크 전송 / 강남역 카페"
              />
            </div>

            <div className="space-y-75">
              <label className="font-designer-13b text-text-default">
                멘티에게 전달할 메모 (선택)
              </label>
              <textarea
                value={mentorNote}
                onChange={(event) => setMentorNote(event.target.value)}
                className={cn(
                  'rounded-100 border-border-default bg-background-default w-full border px-150 py-125',
                  'font-designer-14r text-text-default min-h-[110px] resize-y',
                  'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
                )}
                placeholder="준비해오면 좋은 내용이나 접속 안내를 남겨주세요."
              />
            </div>

            {errorMessage && (
              <p className="font-designer-13r text-text-error">
                {errorMessage}
              </p>
            )}
          </Modal.Body>
          <Modal.Footer className="flex items-center justify-end gap-100">
            <Modal.Close asChild>
              <Button type="button" size="medium" color="outlined">
                취소
              </Button>
            </Modal.Close>
            <Button
              type="button"
              size="medium"
              color="primary"
              onClick={handleConfirm}
              disabled={isInvalid || isSubmitting}
            >
              {isSubmitting ? '처리 중...' : confirmLabel}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
