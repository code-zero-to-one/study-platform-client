'use client';

import CheckIcon from 'public/icons/check.svg';
import { useState } from 'react';
import { usePhoneVerificationStore } from '@/features/phone-verification/model/store';
import PhoneVerificationModal from '@/features/phone-verification/ui/phone-verification-modal';
import Button from '@/components/ui/button';

interface TodoListProps {
  statusList: boolean[];
}

const todoItems = [
  { key: 'attachMaterial', label: '참고 자료 첨부하기' },
  { key: 'checkProgress', label: '스터디 진행 상태 체크하기' },
  { key: 'checkComment', label: '코멘트 확인하기' },
] as const;

export default function TodoList({ statusList }: TodoListProps) {
  const { isVerified, setVerified } = usePhoneVerificationStore();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const handleVerificationComplete = (phoneNumber: string) => {
    setVerified(phoneNumber);
  };

  return (
    <section className="rounded-200 border-border-subtle bg-background-default flex flex-col gap-150 border p-250">
      <h4 className="font-designer-18b text-text-default">오늘 할 일</h4>

      {isVerified ? (
        <ul>
          {todoItems.map((item, idx) => {
            const done = statusList[idx];
            const isLast = idx === todoItems.length - 1;

            return (
              <li key={item.key} className="flex flex-col">
                <div className="flex flex-row items-center gap-75">
                  <CheckIcon
                    width={28}
                    height={28}
                    className={`${done ? 'text-icon-brand' : 'text-icon-disabled'}`}
                  />

                  <span
                    className={`font-designer-15m ${done ? 'text-text-default' : 'text-text-disabled'}`}
                  >
                    {item.label}
                  </span>
                </div>
                {!isLast && (
                  <div className="bg-border-subtle ml-[13px] h-[15px] w-[2px]" />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-100 py-200">
          <p className="font-designer-14m text-text-subtle text-center">
            스터디 시작을 위해
            <br />
            전화번호 인증이 필요합니다
          </p>
          <Button
            color="primary"
            size="small"
            onClick={() => setIsVerificationModalOpen(true)}
          >
            인증하기
          </Button>
        </div>
      )}

      <PhoneVerificationModal
        open={isVerificationModalOpen}
        onOpenChange={setIsVerificationModalOpen}
        onVerificationComplete={handleVerificationComplete}
      />
    </section>
  );
}
