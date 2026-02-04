'use client';

import { XIcon } from 'lucide-react';
import React from 'react';
import { Modal } from '@/components/ui/modal';

interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ModalShell({
  open,
  onOpenChange,
  title,
  trigger,
  children,
  footer,
}: ModalShellProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Modal.Trigger asChild>{trigger}</Modal.Trigger> : null}
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title>{title}</Modal.Title>
            <Modal.Close aria-label="닫기">
              <XIcon />
            </Modal.Close>
          </Modal.Header>
          {children}
          {footer ? <Modal.Footer>{footer}</Modal.Footer> : null}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
