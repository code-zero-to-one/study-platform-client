import UserProfileModal from '@/components/common/modals/user-profile-modal';
import UserAvatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import { Participant } from '@/types/api/participation.types';

interface ReservationCardProps {
  participant: Participant;
  currentMemberId?: number;
}

export default function ReservationCard({
  participant,
  currentMemberId,
}: ReservationCardProps) {
  const isCurrentUser =
    currentMemberId !== null && participant.id === currentMemberId;

  // 참여자 리스트에서는 닉네임 우선, 없으면 이름
  const displayName = participant.nickname || participant.name;

  return (
    <div className="rounded-100 border-border-subtle flex h-[100px] items-center justify-between gap-150 border px-200 py-300">
      <UserAvatar size={48} image={participant.avatarUrl?.trim() || ''} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-row items-center gap-1">
          <div className="font-designer-16b">{displayName}</div>
          {isCurrentUser && (
            <Badge color="blue" className="ml-100">
              본인
            </Badge>
          )}
        </div>
        <div className="font-designer-13r truncate">
          {participant.simpleIntroduction}
        </div>
      </div>
      <UserProfileModal
        memberId={participant.id}
        trigger={
          <div className="bg-fill-neutral-default-default text-text-default hover:bg-fill-neutral-default-hover active:bg-fill-neutral-default-pressed font-designer-14b rounded-75 flex cursor-pointer items-center justify-center px-75 py-50">
            프로필
          </div>
        }
      />
    </div>
  );
}
