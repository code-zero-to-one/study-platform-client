import { getUserProfile } from '@/entities/user/api/get-user-profile';
import { GetUserProfileResponse } from '@/entities/user/api/types';
import MyProfileCard from '@/features/study/ui/my-profile-card';
import StartStudyModal from '@/features/study/ui/start-study-modal';
import { getLoginUserId } from '@/shared/lib/get-login-user';
import Calendar from '@/widgets/home/calendar';
import TodoList from '@/widgets/home/todo-list';

export interface ISidebarProps {
  memberId: number;
  userProfile: GetUserProfileResponse;
  hasTodo: boolean;
}

  const userProfile = await getUserProfile(memberId);
export const SidebarClient = ({
  userProfile,
  memberId,
  hasTodo,
}: ISidebarProps) => {
  return (
    <aside className="flex flex-col gap-300">
      <MyProfileCard
        memberId={memberId}
        name={userProfile?.memberProfile.memberName}
        imageUrl={
          userProfile?.memberProfile?.profileImage?.resizedImages[0]
            ?.resizedImageUrl
        }
        matching={userProfile?.autoMatching ?? false}
        subject={userProfile?.memberInfo.preferredStudySubject?.name}
        time={userProfile?.memberInfo.availableStudyTimes
          ?.map((t) => t.label)
          .join(', ')}
        techStacks={userProfile?.memberInfo.techStacks
          ?.map((t) => t.techStackName)
          .join(', ')}
      />
      {userProfile?.studyApplied ? (
        <TodoList statusList={[false, false, false]} />
      ) : (
        <StartStudyModal memberId={memberId} />
      )}
      <Calendar />
    </aside>
  );
};

export default async function Sidebar() {
  const memberId = await getLoginUserId();

  const userProfile = await getUserProfile(memberId);

  const hasTodo = false; // 나중에 스터디 참여 유무로 변경할 예정

  return (
    <SidebarClient
      memberId={memberId}
      userProfile={userProfile}
      hasTodo={hasTodo}
    />
  );
}
