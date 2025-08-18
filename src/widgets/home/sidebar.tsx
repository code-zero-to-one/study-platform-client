import Image from 'next/image';
import Link from 'next/link';
import { getUserProfile } from '@/entities/user/api/get-user-profile';
import MyProfileCard from '@/features/study/ui/my-profile-card';
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
      <Link
        href={''}
        className="bg-background-alternative rounded-100 flex items-center justify-between px-250 py-300"
      >
        <p className="flex flex-col items-start gap-50">
          <span className="font-designer-15b text-text-default">
            여러분의 의견이 궁금해요!
          </span>
          <span className="font-designer-12m text-text-subtlest">
            소중한 피드백을 기다리고 있어요
          </span>
        </p>

        <Image src="/feedback.svg" alt="피드백" width={68} height={56} />
      </Link>
      <Calendar />
    </aside>
  );
}
