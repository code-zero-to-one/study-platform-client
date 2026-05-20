'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import UserAvatar from '@/components/common/ui/avatar';
import { Modal } from '@/components/common/ui/modal';
import { useUserProfileQuery } from '@/hooks/queries/user/use-user-profile-query';

interface UserProfileModalProps {
  memberId: number;
  trigger: React.ReactNode;
}

export default function UserProfileModal({
  memberId,
  trigger,
}: UserProfileModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>

      {open && (
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content size="large" className="w-full">
            <UserProfileBody
              memberId={memberId}
              onClose={() => setOpen(false)}
            />
          </Modal.Content>
        </Modal.Portal>
      )}
    </Modal.Root>
  );
}

function UserProfileBody({
  memberId,
  onClose,
}: {
  memberId: number;
  onClose: () => void;
}) {
  const { data: profile, isLoading, isError } = useUserProfileQuery(memberId);

  if (isLoading) {
    return (
      <>
        <Header title="프로필" onClose={onClose} />
        <Modal.Body className="p-400">불러오는 중…</Modal.Body>
      </>
    );
  }

  if (isError || !profile) {
    return (
      <>
        <Header title="프로필" onClose={onClose} />
        <Modal.Body className="p-400">프로필을 불러오지 못했습니다.</Modal.Body>
      </>
    );
  }

  const nickname = profile.memberProfile.nickname ?? '익명';
  const avatarImage =
    profile.memberProfile.profileImage?.resizedImages[0]?.resizedImageUrl;
  const isBuilder = profile.premiumCreator === true;
  const jobDescription = profile.memberInfo.jobs?.[0]?.description;
  const careerDescription = profile.memberInfo.career?.description;
  const subtitle = [jobDescription, careerDescription]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <Header title={`${nickname}님의 프로필`} onClose={onClose} />

      <Modal.Body className="flex flex-col gap-400 p-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-300">
            <UserAvatar image={avatarImage} size={64} className="shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-100">
                <span className="font-designer-14b text-text-strong">
                  {nickname}
                </span>
                {isBuilder && (
                  <span className="font-designer-12b bg-brand-primary-500 inline-flex h-250 w-250 shrink-0 items-center justify-center rounded-full text-white">
                    B
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="font-designer-12m text-text-subtle mt-50">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-1125">
            <StatItem label="빌더피드" count={0} />
            <StatItem label="팔로워" count={0} />
            <StatItem label="팔로잉" count={0} />
          </div>
        </div>

        <button
          type="button"
          disabled
          className="bg-brand-primary-500 font-designer-16b h-775 w-full cursor-not-allowed rounded-100 text-white opacity-60"
        >
          팔로우
        </button>

        {profile.memberProfile.simpleIntroduction && (
          <p className="font-designer-15r text-text-default leading-300">
            {profile.memberProfile.simpleIntroduction}
          </p>
        )}

        {profile.memberInfo.goal && (
          <p className="font-designer-15r text-text-default">
            <span className="font-designer-15b text-text-strong">
              만들어보고 싶은 것{' '}
            </span>
            {profile.memberInfo.goal}
          </p>
        )}
      </Modal.Body>
    </>
  );
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <Modal.Header className="border-border-default flex justify-between border-b">
      <Modal.Title className="font-designer-20b text-text-strong">
        {title}
      </Modal.Title>
      <Modal.Close onClick={onClose}>
        <XIcon />
      </Modal.Close>
    </Modal.Header>
  );
}

function StatItem({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex flex-col items-center gap-50">
      <span className="font-designer-22m text-text-strong">
        {count.toLocaleString()}
      </span>
      <span className="font-designer-14r text-text-subtle">{label}</span>
    </div>
  );
}
