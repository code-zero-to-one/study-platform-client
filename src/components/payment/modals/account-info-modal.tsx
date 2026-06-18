import { useState } from 'react';
import { SettlementAccountResponse } from '@/api/openapi';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { useSearchBanks } from '@/hooks/queries/bank-search-queries';
import AddAccountModal from './add-account-modal';

interface AccountInfoModalProps {
  data?: SettlementAccountResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccountInfoModal({
  data,
  open,
  onOpenChange,
}: AccountInfoModalProps) {
  const { data: banks } = useSearchBanks();
  const bankName = banks?.find(
    (bank) => bank.bankCode === data?.bankName,
  )?.bankName;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Modal.Root open={open} onOpenChange={onOpenChange}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content className="w-[840px]">
            <Modal.Header variant="form">
              <Modal.Title className="font-designer-20b text-text-strong">
                계좌 정보
              </Modal.Title>
              <Modal.CloseButton onClick={() => onOpenChange(false)} />
            </Modal.Header>

            <Modal.Body>
              <div className="bg-background-alternative rounded-150 flex flex-col gap-300 px-400 py-300">
                <h3 className="font-designer-16b text-text-strong">
                  정산 계좌
                </h3>

                <div className="flex items-center gap-150">
                  <p className="font-designer-16m text-text-subtle">
                    {bankName} {data?.accountNumber}
                  </p>
                  <Button
                    color="outlined"
                    size="small"
                    onClick={handleEdit}
                    className="font-designer-14r bg-background-default w-[96px]"
                  >
                    계좌 변경
                  </Button>
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer variant="form">
              <Modal.Close asChild>
                <Button
                  color="secondary"
                  size="large"
                  onClick={() => onOpenChange(false)}
                >
                  닫기
                </Button>
              </Modal.Close>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <AddAccountModal
        defaultValues={{
          bankName: data?.bankName,
          accountNumber: data?.accountNumber,
          accountHolder: data?.accountHolder,
        }}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </>
  );
}
