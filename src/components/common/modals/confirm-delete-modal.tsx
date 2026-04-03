'use client';
import CloseIcon from 'public/icons/modal-close.svg';
import { ReactNode } from 'react';

import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';


interface ConfirmDeleteModalProps {
  title: string;
  content: ReactNode;
  confirmText: string;
  onConfirm: () => void;
  open: boolean;
  onOpenChange: () => void;
}

export default function ConfirmDeleteModal({
  title,
  content,
  confirmText,
  onConfirm,
  open,
  onOpenChange,
}: ConfirmDeleteModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[400px]">
          <Modal.Header className="flex items-center gap-100 px-400 pt-300 pb-150">
            <CloseIcon />
            <Modal.Title className="font-designer-20b text-text-strong">
              {title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="font-designer-16r px-400 pt-0 pb-150 text-[#838486]">
            {content}
          </Modal.Body>
          <Modal.Footer className="flex justify-end gap-100 border-none px-400 py-200">
            <Button
              color="secondary"
              className="font-designer-16b h-600 px-200"
              onClick={onOpenChange}
            >
              취소
            </Button>
            <Button
              color="primary"
              className="font-designer-16b h-600 px-200"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
