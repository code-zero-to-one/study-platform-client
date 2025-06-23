import { getUserProfile } from '@/entities/user/api/get-user-profile';
import StartStudyModal from '@/features/study/ui/start-study-modal';
import UserProfileCard from '@/features/study/ui/user-profile-card';
import { getLoginUserId } from '@/shared/lib/get-login-user';
import Calendar from '@/widgets/home/calendar';
import TodoList from '@/widgets/home/todo-list';

export default async function Sidebar() {
  const memberId = await getLoginUserId();

  const userProfile = await getUserProfile(memberId);

  const hasTodo = false; // 나중에 스터디 참여 유무로 변경할 예정

  return (
    <aside className="flex flex-col gap-300">
      <UserProfileCard
        memberId={memberId}
        name={userProfile?.memberProfile.memberName || '비회원'}
        imageUrl={userProfile?.memberProfile?.profileImage?.resizedImages[0]?.resizedImageUrl || ''}
        matching={userProfile?.autoMatching ?? false}
        subject={
          userProfile?.memberInfo.preferredStudySubject?.name ?? '선택안함'
        }
        time={
          userProfile?.memberInfo.availableStudyTimes?.length
            ? userProfile.memberInfo.availableStudyTimes
                .map((t) => t.label)
                .join(', ')
            : '없음'
        }
        techStacks={
          userProfile?.memberInfo.techStacks?.length
            ? userProfile.memberInfo.techStacks
                .map((t) => t.techStackName)
                .join(', ')
            : '없음'
        }
      />
      {hasTodo ? (
        <TodoList statusList={[true, false, false]} />
      ) : (
        <StartStudyModal memberId={memberId} />
      )}
      <Calendar />
    </aside>
  );
}
