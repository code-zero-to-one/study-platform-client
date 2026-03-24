'use client';

import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';

interface StudyCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudyCompletionModal({
  open,
  onOpenChange,
}: StudyCompletionModalProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRef = useRef<confetti.CreateTypes | null>(null);

  useEffect(() => {
    if (!open) {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
      confettiRef.current = null;

      return;
    }

    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;z-index:45;pointer-events:none;';
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    confettiRef.current = confetti.create(canvas, { resize: true });

    const fire = confettiRef.current;
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      if (Date.now() > end) return;

      fire({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0.3, y: 0.6 },
        colors: ['#7C3AED', '#A78BFA', '#C4B5FD', '#F59E0B', '#34D399'],
      })?.catch(() => {});
      fire({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 0.7, y: 0.6 },
        colors: ['#7C3AED', '#A78BFA', '#C4B5FD', '#F59E0B', '#34D399'],
      })?.catch(() => {});

      requestAnimationFrame(frame);
    };

    frame();

    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
      confettiRef.current = null;
    };
  }, [open]);

  const handleClose = () => onOpenChange(false);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" description="스터디 완주 축하">
          <Modal.Title className="sr-only">
            스터디 완주를 축하합니다!
          </Modal.Title>
          <Modal.Body className="flex flex-col items-center gap-200 py-500">
            <span className="text-[64px] leading-none" aria-hidden="true">
              🎉
            </span>
            <div className="flex flex-col items-center gap-100">
              <h2 className="font-designer-20b text-text-strong text-center">
                스터디 완주를 축하합니다!
              </h2>
              <p className="font-designer-14r text-text-subtle text-center">
                나에게 맞는 새로운 스터디를 탐색해보세요.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer className="flex gap-100">
            <Button
              color="secondary"
              size="large"
              className="flex-1"
              onClick={() => {
                handleClose();
                router.push('/group-study');
              }}
            >
              동료들과 공부하기
            </Button>
            <Button
              color="primary"
              size="large"
              className="flex-1"
              onClick={() => {
                handleClose();
                router.push('/premium-study');
              }}
            >
              멘토님과 공부하기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
