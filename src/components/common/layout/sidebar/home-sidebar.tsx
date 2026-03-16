import Image from 'next/image';
import { tryGetUserProfileInServer } from '@/api/endpoints/user/get-user-profile.server';
import MyProfileCard from '@/components/common/cards/my-profile-card';
import StartStudyModal from '@/components/common/modals/start-study-modal';
import Calendar from '@/components/home/calendar';
import FeedbackLink from '@/components/home/feedback-link';
import TodoList from '@/components/lists/todo-list';
import { readAuthenticatedMemberId } from '@/features/auth/model/server-auth-session';
import type { SincerityTemp } from '@/types/api/user.types';

export default async function Sidebar() {
  const memberId = await readAuthenticatedMemberId();

  if (!memberId) {
    return null;
  }

  const userProfile = await tryGetUserProfileInServer(memberId);

  const fallbackSincerityTemp: SincerityTemp = {
    temperature: 36.5,
    levelId: 0,
    levelName: '1단계',
  };
  const resolvedSincerityTemp =
    userProfile?.sincerityTemp ?? fallbackSincerityTemp;
  const isStudyApplied = userProfile?.studyApplied ?? false;

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
        studyApplied={isStudyApplied}
        sincerityTemp={resolvedSincerityTemp}
      />

      {/* 1:1 인사이트 버튼 제거됨 - 이제 홈 페이지 탭에서 접근 가능 */}

      {isStudyApplied ? (
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
