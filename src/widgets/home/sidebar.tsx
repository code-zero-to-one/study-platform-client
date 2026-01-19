import Image from 'next/image';
import Link from 'next/link';
import { getUserProfileInServer } from '@/entities/user/api/get-user-profile.server';
import MyProfileCard from '@/entities/user/ui/my-profile-card';
import StartStudyModal from '@/features/study/participation/ui/start-study-modal';
import { getServerCookie } from '@/utils/server-cookie';
import Calendar from '@/widgets/home/calendar';
import FeedbackLink from '@/widgets/home/feedback-link';
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
        nickname={userProfile?.memberProfile.nickname}
        imageUrl={
          userProfile?.memberProfile?.profileImage?.resizedImages[0]
            ?.resizedImageUrl
        }
        matching={userProfile?.autoMatching ?? false}
        subject={userProfile?.memberInfo.preferredStudySubject?.name}
        time={userProfile?.memberInfo.availableStudyTimes
          ?.map((t) => t.label)
          .join(', ')}
        techStacks={userProfile?.memberProfile.techStacks
          ?.map((t) => t.techStackName)
          .join(', ')}
        studyApplied={userProfile?.studyApplied ?? false}
        sincerityTemp={userProfile.sincerityTemp}
      />
      
      {/* 랭킹 & 도서관 바로가기 (통합 페이지로 연결) */}
      <div className="flex gap-100">
        <Link href="/one-on-one" className="flex-1">
          <button className="bg-white hover:bg-fill-neutral-subtle-hover transition-colors rounded-100 border border-border-subtle w-full py-200 flex flex-col items-center gap-50">
            <span className="text-[24px]">✨</span>
            <span className="font-designer-14b text-text-default">1:1 인사이트</span>
          </button>
        </Link>
      </div>

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
      <FeedbackLink />
      <Calendar />
    </aside>
  );
}
