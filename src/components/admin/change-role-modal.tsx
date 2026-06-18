'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { RadioGroup, RadioGroupItem } from '@/components/common/ui/radio';
import { isManageableRoleId, ROLE_OPTIONS } from '@/config/admin-member';
import { useChangeMemberRoleMutation } from '@/hooks/queries/user/use-member-list-query';
import {
  type GetMemberListResponse,
  type ManageableRoleId,
} from '@/types/api/admin.types';

interface ChangeRoleModalProps {
  members: GetMemberListResponse['content'];
}

export default function ChangeRoleModal({ members }: ChangeRoleModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button size="small" color="secondary">
          권한 변경
        </Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[390px]">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              권한 변경
            </Modal.Title>
            <Modal.Close onClick={() => setOpen(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <ChangeRoleForm members={members} onClose={() => setOpen(false)} />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function ChangeRoleForm({
  members,
  onClose,
}: {
  members: GetMemberListResponse['content'];
  onClose: () => void;
}) {
  const INIT_ROLE: ManageableRoleId = 'ROLE_MEMBER';
  const [role, setRole] = useState<ManageableRoleId>(INIT_ROLE);

  const { mutate: changeStatus } = useChangeMemberRoleMutation();

  const handleChangeStatus = () => {
    changeStatus(
      { members, roleId: role },
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
          defaultValue={INIT_ROLE}
          onValueChange={(roleId) => {
            if (isManageableRoleId(roleId)) {
              setRole(roleId);
            }
          }}
        >
          {ROLE_OPTIONS.map(({ value, label }) => (
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
