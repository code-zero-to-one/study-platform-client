'use client';

import { X } from 'lucide-react';
import React from 'react';
import { Modal } from '@/components/ui/modal';

interface VotingModalHeaderProps {
  title: string;
  onClose: () => void;
  disabled?: boolean;
}

export default function VotingModalHeader({
  title,
  onClose,
  disabled = false,
}: VotingModalHeaderProps) {
  return (
    <Modal.Header className="border-border-subtle flex items-center justify-between border-b">
      <Modal.Title className="font-bold-h4 text-text-strong">
        {title}
      </Modal.Title>
      <Modal.Close asChild>
        <button
          onClick={onClose}
          disabled={disabled}
          className="rounded-100 text-text-subtle hover:bg-fill-neutral-subtle-default hover:text-text-strong p-100 transition-colors disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5" />
        </button>
      </Modal.Close>
    </Modal.Header>
  );
}
