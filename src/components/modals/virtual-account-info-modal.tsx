import { format } from 'date-fns';
import { useState } from 'react';
import { VirtualAccountInfo } from '@/api/openapi/models';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface VirtualAccountInfoModalProps {
  virtualAccountInfo: VirtualAccountInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VirtualAccountInfoModal({
  virtualAccountInfo,
  open,
  onOpenChange,
}: VirtualAccountInfoModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (virtualAccountInfo.accountNumber) {
      try {
        await navigator.clipboard.writeText(virtualAccountInfo.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header variant="alert">
            <Modal.Title>입금계좌 정보</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <div className="space-y-300">
              <div className="flex items-start gap-200">
                <span className="font-designer-14m text-text-subtle w-[100px] flex-shrink-0">
                  은행
                </span>
                <span className="font-designer-14m text-text-default">
                  {virtualAccountInfo.bankName || '-'}
                </span>
              </div>
              <div className="flex items-start gap-200">
                <span className="font-designer-14m text-text-subtle w-[100px] flex-shrink-0">
                  계좌번호
                </span>
                <div className="flex items-center gap-200 flex-1">
                  <span className="font-designer-14m text-text-default">
                    {virtualAccountInfo.accountNumber || '-'}
                  </span>
                  {virtualAccountInfo.accountNumber && (
                    <button
                      type="button"
                      className="font-designer-14m text-text-brand hover:text-text-brand-pressed cursor-pointer transition-colors whitespace-nowrap"
                      onClick={handleCopy}
                    >
                      {copied ? '복사됨' : '복사'}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-200">
                <span className="font-designer-14m text-text-subtle w-[100px] flex-shrink-0">
                  예금주
                </span>
                <span className="font-designer-14m text-text-default">
                  {virtualAccountInfo.customerName || '-'}
                </span>
              </div>
              {virtualAccountInfo.dueDate && (
                <div className="flex items-start gap-200">
                  <span className="font-designer-14m text-text-subtle w-[100px] flex-shrink-0">
                    입금 기한
                  </span>
                  <span className="font-designer-14m text-text-default">
                    {format(new Date(virtualAccountInfo.dueDate), 'yyyy.MM.dd HH:mm')}
                  </span>
                </div>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer variant="alert">
            <Button
              color="primary"
              size="medium"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              확인
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

