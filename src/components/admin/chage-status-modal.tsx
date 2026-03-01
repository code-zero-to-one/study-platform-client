'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio';
import { MEMBER_STATUS_OPTIONS } from '@/config/admin-member';
import { useChangeMemberStatusMutation } from '@/hooks/queries/use-member-list-query';
import { GetMemberListResponse, MemberStatus } from '@/types/api/admin.types';

interface ChangeStatusModalProps {
  members: GetMemberListResponse['content'];
}

export default function ChangeStatusModal({ members }: ChangeStatusModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button size="small" color="secondary">
          상태 변경
        </Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[390px]">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              계정 상태 변경
            </Modal.Title>
            <Modal.Close onClick={() => setOpen(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <ChangeStatusForm members={members} onClose={() => setOpen(false)} />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function ChangeStatusForm({
  members,
  onClose,
}: {
  members: GetMemberListResponse['content'];
  onClose: () => void;
}) {
  const INIT_STATUS: MemberStatus = 'ACTIVE';
  const [status, setStatus] = useState<MemberStatus>(INIT_STATUS);

  const { mutate: changeStatus } = useChangeMemberStatusMutation();

  const handleChangeStatus = () => {
    changeStatus(
      { members, to: status },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <>
      <Modal.Body className="flex flex-col items-center gap-150 p-400">
        <RadioGroup
          className="w-full"
          defaultValue={INIT_STATUS}
          onValueChange={(status: MemberStatus) => setStatus(status)}
        >
          {MEMBER_STATUS_OPTIONS.map(({ value, label }) => (
            <div className="flex h-[48px] items-center gap-100" key={value}>
              <RadioGroupItem value={value} id={value} />
              <label htmlFor={value}>{label}</label>
            </div>
          ))}
        </RadioGroup>
      </Modal.Body>

      <Modal.Footer className="flex justify-end gap-100">
        <Modal.Close asChild>
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
        </Modal.Close>
        <Button color="primary" size="large" onClick={handleChangeStatus}>
          변경하기
        </Button>
      </Modal.Footer>
    </>
  );
}
