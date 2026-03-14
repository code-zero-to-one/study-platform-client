'use client';

import dayjs from 'dayjs';
import { AlertTriangle, CheckCircle2, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import { BaseInput } from '@/components/common/ui/input';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import { Modal } from '@/components/common/ui/modal';
import { hasSessionConflict } from '@/stores/useMentoringManagementStore';
import type {
  ScheduleEditorModalProps,
  ScheduleEditorSubmitParams,
} from '@/types/mentoring/management-view';

export type { ScheduleEditorSubmitParams as ScheduleEditorSubmitPayload };

const toTimeValue = (iso: string | undefined) => {
  if (!iso) return '';
  if (/^\d{2}:\d{2}$/.test(iso)) return iso;
  const parsed = dayjs(iso);
  if (!parsed.isValid()) return '';

  return parsed.format('HH:mm');
};

const toDateValue = (value: string | undefined) => {
  if (!value) return dayjs().add(3, 'day').format('YYYY-MM-DD');
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = dayjs(value);
  if (!parsed.isValid()) return dayjs().add(3, 'day').format('YYYY-MM-DD');

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
  sessions = [],
  excludeSessionId,
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
    if (!dateValue || !timeValue) return undefined;
    const parsed = dayjs(`${dateValue} ${timeValue}`);
    if (!parsed.isValid()) return undefined;

    return parsed;
  }, [dateValue, timeValue]);

  const endDateTime = useMemo(() => {
    if (!startDateTime) return undefined;

    return startDateTime.add(durationMinutes, 'minute');
  }, [durationMinutes, startDateTime]);

  const conflictingSession = useMemo(() => {
    if (!startDateTime || !endDateTime || sessions.length === 0) return null;

    const startsAt = startDateTime.toISOString();
    const endsAt = endDateTime.toISOString();

    const hasConflict = hasSessionConflict({
      sessions,
      startsAt,
      endsAt,
      excludeSessionId,
    });

    if (!hasConflict) return null;

    return (
      sessions.find((session) => {
        if (session.status !== 'SCHEDULED') return false;
        if (excludeSessionId && session.id === excludeSessionId) return false;

        const sStart = dayjs(session.startsAt);
        const sEnd = dayjs(session.endsAt);

        return startDateTime.isBefore(sEnd) && sStart.isBefore(endDateTime);
      }) ?? null
    );
  }, [startDateTime, endDateTime, sessions, excludeSessionId]);

  const isInvalid =
    !startDateTime ||
    !endDateTime ||
    placeNote.trim() === '' ||
    !!conflictingSession;

  const handleConfirm = () => {
    if (!startDateTime || !endDateTime || isInvalid) return;

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
            {/* 시간 미리보기 + 충돌 상태 */}
            <div
              className={cn(
                'rounded-100 px-150 py-100',
                conflictingSession
                  ? 'bg-background-accent-red-subtle'
                  : 'bg-background-alternative',
              )}
            >
              {conflictingSession ? (
                <div className="flex items-start gap-100">
                  <AlertTriangle className="text-text-error mt-25 h-16 w-16 shrink-0" />
                  <div>
                    <p className="font-designer-13b text-text-error">
                      시간이 겹치는 일정이 있습니다 — 수락 불가
                    </p>
                    <p className="font-designer-13r text-text-error mt-25">
                      {conflictingSession.menteeName}님 상담 (
                      {dayjs(conflictingSession.startsAt).format('MM/DD HH:mm')}{' '}
                      ~ {dayjs(conflictingSession.endsAt).format('HH:mm')})과
                      겹칩니다.
                    </p>
                  </div>
                </div>
              ) : startDateTime && endDateTime ? (
                <div className="flex items-center gap-100">
                  <CheckCircle2 className="text-text-success h-16 w-16 shrink-0" />
                  <div>
                    <p className="font-designer-14b text-text-default">
                      {startDateTime.format('YYYY.MM.DD HH:mm')} ~{' '}
                      {endDateTime.format('HH:mm')}
                    </p>
                    <p className="font-designer-12r text-text-subtle mt-25">
                      상담 시간 {durationMinutes}분 · 중복 없음
                    </p>
                  </div>
                </div>
              ) : (
                <p className="font-designer-13r text-text-subtle">
                  날짜와 시간을 선택하면 중복 여부를 바로 확인합니다.
                </p>
              )}
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
              <BorderedTextarea
                value={mentorNote}
                onChange={(event) => setMentorNote(event.target.value)}
                className={cn('min-h-[110px] px-150 py-125')}
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
