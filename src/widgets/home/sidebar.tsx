import Image from 'next/image';
import Link from 'next/link';
import { getUserProfileInServer } from '@/entities/user/api/get-user-profile.server';
import MyProfileCard from '@/entities/user/ui/my-profile-card';
import StartStudyModal from '@/features/study/participation/ui/start-study-modal';
import { getServerCookie } from '@/shared/lib/server-cookie';
import Calendar from '@/widgets/home/calendar';
import TodoList from '@/widgets/home/todo-list';

export default async function Sidebar() {
  const memberIdStr = await getServerCookie('memberId');
  const memberId = Number(memberIdStr);

  const userProfile = await getUserProfileInServer(memberId);

  return (
    <aside className="flex w-[335px] flex-col gap-300">
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
        sincerityTemp={userProfile.sincerityTemp}
      />
      {userProfile.studyApplied ? (
        <TodoList statusList={[false, false, false]} />
      ) : (
        <StartStudyModal
          memberId={memberId}
          trigger={
            <button className="bg-background-alternative rounded-100 flex items-center justify-between px-250 py-300">
              <p className="flex flex-col items-start gap-50">
                <span className="font-designer-15b text-text-default">
                  CS 스터디를 시작해 보세요!
                </span>
                <span className="font-designer-12m text-text-subtlest">
                  스터디 신청하기
                </span>
              </p>

              <Image
                src="/apply-study.svg"
                alt="스터디 시작 버튼"
                width={68}
                height={56}
              />
            </button>
          }
        />
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

        <Image src="/feedback.svg" alt="피드백" width={86} height={56} />
      </Link>
      <Calendar />
    </aside>
  );
}
