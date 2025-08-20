import { getUserProfile } from '@/entities/user/api/get-user-profile';
import MyProfileCard from '@/entities/user/ui/user-profile-card';
import StartStudyModal from '@/features/study/ui/start-study-modal';
import { getLoginUserId } from '@/shared/lib/get-login-user';
import Calendar from '@/widgets/home/calendar';
import TodoList from '@/widgets/home/todo-list';

export default async function Sidebar() {
  const memberId = await getLoginUserId();

  const userProfile = await getUserProfile(memberId);

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
        studyApplied={userProfile?.studyApplied ?? false}
      />
      {userProfile.studyApplied ? (
        <TodoList statusList={[false, false, false]} />
      ) : (
        <StartStudyModal memberId={memberId} />
      )}
      <Calendar />
    </aside>
  );
}
