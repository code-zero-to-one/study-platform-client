'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import {
  useGetNotificationSetting,
  useUpdateNotificationSetting,
} from '@/hooks/queries/notification/use-notification-setting';
import { useToastStore } from '@/stores/use-toast-store';

interface LearningNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 10, 20, 30, 40, 50];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function LearningNotificationModal({
  open,
  onOpenChange,
  onSuccess,
}: LearningNotificationModalProps) {
  const showToast = useToastStore((s) => s.showToast);
  const { data: setting } = useGetNotificationSetting();
  const updateSettingMutation = useUpdateNotificationSetting();

  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (typeof setting?.notifyHour === 'number') setHour(setting.notifyHour);
    if (typeof setting?.notifyMinute === 'number')
      setMinute(setting.notifyMinute);
  }, [setting]);

  const handleSave = async () => {
    try {
      await updateSettingMutation.mutateAsync({
        notifyHour: hour,
        notifyMinute: minute,
      });
      showToast('알림 시간이 저장되었습니다.', 'success');
      onOpenChange(false);
      onSuccess?.();
    } catch {
      showToast('알림 시간 저장에 실패했습니다.', 'error');
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium">
          <Modal.Header variant="alert">
            <Modal.Title>학습 알림톡 시간 설정</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <div className="flex flex-col gap-300">
              <p className="font-designer-14r text-text-subtle text-center">
                매일 학습 알림을 받을 시간을 설정해 주세요.
              </p>
              <div className="flex items-center justify-center gap-200">
                <div className="flex flex-col gap-100">
                  <label
                    htmlFor="notify-hour"
                    className="font-designer-12r text-text-subtle text-center"
                  >
                    시
                  </label>
                  <select
                    id="notify-hour"
                    value={hour}
                    onChange={(e) => setHour(Number(e.target.value))}
                    className="border-border-default rounded-100 font-designer-16m text-text-default w-1250 border px-200 py-150 outline-none"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {pad(h)}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="font-designer-20b text-text-default mt-300">
                  :
                </span>

                <div className="flex flex-col gap-100">
                  <label
                    htmlFor="notify-minute"
                    className="font-designer-12r text-text-subtle text-center"
                  >
                    분
                  </label>
                  <select
                    id="notify-minute"
                    value={minute}
                    onChange={(e) => setMinute(Number(e.target.value))}
                    className="border-border-default rounded-100 font-designer-16m text-text-default w-1250 border px-200 py-150 outline-none"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {pad(m)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="font-designer-12r text-text-subtlest text-center">
                설정한 시간: {pad(hour)}:{pad(minute)}
              </p>
            </div>
          </Modal.Body>

          <Modal.Footer variant="alert">
            <div className="flex gap-200">
              <Button
                color="secondary"
                size="medium"
                className="flex-1 whitespace-nowrap"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button
                color="primary"
                size="medium"
                className="flex-1 whitespace-nowrap"
                disabled={updateSettingMutation.isPending}
                onClick={handleSave}
              >
                {updateSettingMutation.isPending ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
