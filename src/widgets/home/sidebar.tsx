import { getUserProfile } from '@/entities/user/api/get-user-profile';
import StartStudyModal from '@/features/study/ui/start-study-modal';
import UserProfileCard from '@/features/study/ui/user-profile-card';
import { getServerCookie } from '@/shared/lib/server-cookie';
import Calendar from '@/widgets/home/calendar/index';
import TodoList from '@/widgets/home/todo-list';

export default async function Sidebar() {
  const memberIdStr = await getServerCookie('memberId');
  const memberId = Number(memberIdStr ?? 0);

  let userProfile = null;
  if (memberId) {
    try {
      userProfile = await getUserProfile(memberId);
    } catch (e) {
      console.error('Fail to get userProfile', e);
    }
  }

  const hasTodo = false; // 나중에 스터디 참여 유무로 변경할 예정

  return (
    <aside className="flex flex-col gap-300">
      <UserProfileCard
        memberId={memberId}
        name={userProfile?.memberProfile.memberName || '비회원'}
        // 프로필 오류로 인한 임시
        // imageUrl={userProfile?.memberProfile.profileImage.resizedImages[0]?.resizedImageUrl || ''}
        imageUrl={''}
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
        <StartStudyModal />
      )}
      <Calendar />
    </aside>
  );
}
