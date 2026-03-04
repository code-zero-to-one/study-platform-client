'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';

interface VotingModalFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function VotingModalFooter({
  isSubmitting,
  onCancel,
}: VotingModalFooterProps) {
  return (
    <Modal.Footer className="flex items-center gap-200">
      <Modal.Close asChild>
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          color="outlined"
          size="large"
          className="flex-1"
        >
          취소
        </Button>
      </Modal.Close>
      <Button
        type="submit"
        form="create-voting"
        disabled={isSubmitting}
        color="primary"
        size="large"
        className="flex-1"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            생성 중...
          </span>
        ) : (
          '주제 만들기'
        )}
      </Button>
    </Modal.Footer>
  );
}
