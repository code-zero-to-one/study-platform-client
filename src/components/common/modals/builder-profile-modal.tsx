'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { RoleBadge } from '@/components/class/builder-feed-utils';
import { Modal } from '@/components/common/ui/modal';
import { useUserProfileQuery } from '@/hooks/queries/user/use-user-profile-query';

interface BuilderProfileModalProps {
  memberId: number;
  nickname: string;
  role?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BuilderProfileModal({
  memberId,
  nickname,
  role,
  open,
  onOpenChange,
}: BuilderProfileModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="large">
          <BuilderProfileBody
            memberId={memberId}
            nickname={nickname}
            role={role}
            onClose={() => onOpenChange(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function BuilderProfileBody({
  memberId,
  nickname,
  role,
  onClose,
}: {
  memberId: number;
  nickname: string;
  role?: string;
  onClose: () => void;
}) {
  const { data: profile, isLoading } = useUserProfileQuery(memberId);

  const avatarUrl =
    profile?.memberProfile.profileImage?.resizedImages[0]?.resizedImageUrl;

  const jobs = profile?.memberInfo.jobs ?? [];
  const career = profile?.memberInfo.career;
  const jobLabel =
    jobs.length > 0
      ? jobs
          .map((j) => j.description ?? j.job ?? '')
          .filter(Boolean)
          .join(', ')
      : undefined;
  const careerLabel = career?.description ?? career?.career;
  const roleDisplay = [jobLabel, careerLabel].filter(Boolean).join(' / ');

  return (
    <>
      <Modal.Header className="flex items-center justify-between">
        <Modal.Title className="font-designer-20b text-gray-800">
          {nickname}님의 프로필
        </Modal.Title>
        <Modal.Close onClick={onClose}>
          <X className="h-300 w-300" />
        </Modal.Close>
      </Modal.Header>

      <Modal.Body className="p-400">
        {isLoading ? (
          <p className="font-designer-14r text-gray-400">불러오는 중...</p>
        ) : (
          <div className="flex flex-col gap-400">
            <div className="flex items-center gap-200">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  width={64}
                  height={64}
                  alt={nickname}
                  unoptimized
                  className="size-800 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-800 shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <span className="font-designer-16b text-gray-600">
                    {nickname.charAt(0)}
                  </span>
                </div>
              )}

              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-col gap-75">
                  <div className="flex items-center gap-100">
                    <p className="font-designer-14m text-gray-800">
                      {nickname}
                    </p>
                    {role && <RoleBadge variant={role} />}
                  </div>
                  {roleDisplay && (
                    <p className="font-designer-12m text-gray-400">
                      {roleDisplay}
                    </p>
                  )}
                </div>

                {/* TODO: 팔로우/팔로잉/게시물 수 API 미구현 — 값 없어 placeholder */}
                <div className="flex gap-1125">
                  <StatColumn label="빌더 피드" value="—" />
                  <StatColumn label="팔로우" value="—" />
                  <StatColumn label="팔로잉" value="—" />
                </div>
              </div>
            </div>

            {profile?.memberProfile.simpleIntroduction && (
              <p className="font-designer-16m text-gray-800">
                {profile.memberProfile.simpleIntroduction}
              </p>
            )}

            {/* TODO: follow API 미구현 */}
            <button
              type="button"
              disabled
              className="h-775 w-full rounded-100 bg-background-brand-default font-designer-18b text-gray-0 disabled:opacity-50"
            >
              팔로우
            </button>
          </div>
        )}
      </Modal.Body>
    </>
  );
}

function StatColumn({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-50">
      <p className="font-designer-22m text-gray-800">{value}</p>
      <p className="font-designer-14r text-gray-800">{label}</p>
    </div>
  );
}
