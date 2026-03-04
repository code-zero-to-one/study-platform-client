import Image from 'next/image';
import Link from 'next/link';
import { getUserProfileInServer } from '@/api/endpoints/user/get-user-profile.server';
import StartStudyModal from '@/components/common/modals/start-study-modal';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import FeedbackLink from '@/components/home/feedback-link';
import { getSincerityPresetByLevelName } from '@/config/sincerity-temp-presets';
import { getServerCookie } from '@/utils/server-cookie';
import AccessTimeIcon from 'public/icons/access_time.svg';
import AssignmentIcon from 'public/icons/assignment.svg';
import CodeIcon from 'public/icons/code.svg';
import SettingIcon from 'public/icons/setting.svg';

export default async function HomeDashboard() {
  const memberIdStr = await getServerCookie('memberId');
  const memberId = Number(memberIdStr);

  const userProfile = await getUserProfileInServer(memberId);
  const temperPreset = getSincerityPresetByLevelName(
    userProfile.sincerityTemp.levelName,
  );

  // 데이터 가공
  const subject =
    userProfile?.memberInfo.preferredStudySubject?.name || '미설정';
  const timeSlots =
    userProfile?.memberInfo.availableStudyTimes
      ?.map((t) => t.label)
      .join(', ') || '시간 협의 가능';
  const techStacks =
    userProfile?.memberProfile.techStacks
      ?.slice(0, 3)
      .map((t) => t.techStackName)
      .join(' · ') || '미설정';
  const extraTechCount = Math.max(
    0,
    (userProfile?.memberProfile.techStacks?.length || 0) - 3,
  );

  return (
    <div className="w-full space-y-300">
      {/* 상단 프로필 바 */}
      <div className="rounded-200 border-border-subtle from-background-default to-background-alternative flex items-center justify-between border bg-gradient-to-r px-400 py-300 shadow-sm">
        <div className="flex items-center gap-300">
          <div className="relative">
            <UserAvatar
              size={64}
              image={
                userProfile?.memberProfile?.profileImage?.resizedImages[0]
                  ?.resizedImageUrl || ''
              }
            />
            <div
              className={cn(
                'font-designer-11b absolute -right-50 -bottom-50 flex h-[28px] items-center justify-center rounded-full px-100 shadow-sm',
                temperPreset.bgClass,
                temperPreset.textClass,
              )}
            >
              {userProfile.sincerityTemp.temperature.toFixed(1)}℃
            </div>
          </div>

          <div className="flex flex-col gap-50">
            <div className="flex items-center gap-150">
              <h2 className="font-designer-20b text-text-default">
                {userProfile?.memberProfile.nickname || '비회원'}님
              </h2>
              <span className="rounded-100 bg-fill-success-subtle-default font-designer-12m text-fill-success-default-default px-150 py-50">
                {userProfile.studyApplied ? '스터디 참여중' : '스터디 대기중'}
              </span>
            </div>
            <p className="font-designer-14r text-text-subtle max-w-[400px] truncate">
              {userProfile?.memberProfile.simpleIntroduction ||
                '오늘도 힘차게 공부해봐요! 🔥'}
            </p>
          </div>
        </div>

        <Link
          href="/my-page"
          className="rounded-150 bg-background-default font-designer-13m text-text-subtle hover:bg-fill-light hover:text-text-default flex items-center gap-100 px-200 py-150 transition-colors"
        >
          <SettingIcon width={16} height={16} />
          설정
        </Link>
      </div>

      {/* 메인 대시보드 그리드 */}
      <div className="grid grid-cols-1 gap-300 lg:grid-cols-3">
        {/* 1. 스터디 정보 카드 */}
        <div className="rounded-200 border-border-subtle bg-background-default border p-300 shadow-sm">
          <div className="mb-200 flex items-center gap-100">
            <div className="rounded-100 bg-fill-brand-subtle-default flex h-[32px] w-[32px] items-center justify-center">
              <AssignmentIcon className="text-text-brand h-4 w-4" />
            </div>
            <h3 className="font-designer-15b text-text-default">스터디 정보</h3>
          </div>

          <div className="space-y-150">
            <div className="flex items-center justify-between">
              <span className="font-designer-13r text-text-subtle">
                선호 주제
              </span>
              <span className="font-designer-13m text-text-default max-w-[120px] truncate">
                {subject}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-designer-13r text-text-subtle">
                가능 시간
              </span>
              <span className="font-designer-13m text-text-default max-w-[120px] truncate">
                {timeSlots}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-designer-13r text-text-subtle">
                기술 스택
              </span>
              <div className="flex items-center gap-50">
                <span className="font-designer-13m text-text-default max-w-[120px] truncate">
                  {techStacks}
                </span>
                {extraTechCount > 0 && (
                  <span className="font-designer-11m text-text-subtlest">
                    +{extraTechCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. 액션 센터 */}
        <div className="rounded-200 border-border-subtle bg-background-default border p-300 shadow-sm">
          {userProfile.studyApplied ? (
            <>
              <div className="mb-200 flex items-center justify-between">
                <div className="flex items-center gap-100">
                  <div className="rounded-100 bg-fill-success-subtle-default flex h-[32px] w-[32px] items-center justify-center">
                    <AccessTimeIcon className="text-fill-success-default-default h-4 w-4" />
                  </div>
                  <h3 className="font-designer-15b text-text-default">
                    오늘의 할 일
                  </h3>
                </div>
                <span className="rounded-100 bg-fill-warning-subtle-default font-designer-11b text-fill-warning-default-default px-150 py-50">
                  0/3 완료
                </span>
              </div>

              <div className="space-y-100">
                <div className="rounded-100 bg-background-alternative flex items-center gap-150 px-200 py-150">
                  <div className="border-border-subtle h-[16px] w-[16px] rounded-full border-2" />
                  <span className="font-designer-13m text-text-subtle">
                    참고 자료 첨부하기
                  </span>
                </div>
                <div className="rounded-100 bg-background-alternative flex items-center gap-150 px-200 py-150">
                  <div className="border-border-subtle h-[16px] w-[16px] rounded-full border-2" />
                  <span className="font-designer-13m text-text-subtle">
                    스터디 진행 상태 체크하기
                  </span>
                </div>
                <div className="rounded-100 bg-background-alternative flex items-center gap-150 px-200 py-150">
                  <div className="border-border-subtle h-[16px] w-[16px] rounded-full border-2" />
                  <span className="font-designer-13m text-text-subtle">
                    코멘트 확인하기
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-200 flex items-center gap-100">
                <div className="rounded-100 bg-fill-brand-subtle-default flex h-[32px] w-[32px] items-center justify-center">
                  <Image
                    src="/apply-study.svg"
                    alt="icon"
                    width={16}
                    height={16}
                  />
                </div>
                <h3 className="font-designer-15b text-text-default">
                  스터디 시작
                </h3>
              </div>

              <StartStudyModal
                memberId={memberId}
                trigger={
                  <button className="group rounded-150 from-fill-brand-default to-fill-brand-strong-default w-full bg-gradient-to-r px-250 py-200 text-left transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-designer-15b text-text-inverse">
                          CS 스터디 시작하기
                        </p>
                        <p className="font-designer-12r text-text-inverse/80 mt-25">
                          매일 아침 1:1 매칭으로 루틴 만들기
                        </p>
                      </div>
                      <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/20 transition-transform group-hover:scale-110">
                        <Image
                          src="/apply-study.svg"
                          alt="icon"
                          width={20}
                          height={20}
                        />
                      </div>
                    </div>
                  </button>
                }
              />
            </>
          )}
        </div>

        {/* 3. 피드백 & 퀵 액션 */}
        <div className="rounded-200 border-border-subtle bg-background-default border p-300 shadow-sm">
          <div className="mb-200 flex items-center gap-100">
            <div className="rounded-100 bg-fill-warning-subtle-default flex h-[32px] w-[32px] items-center justify-center">
              <Image src="/feedback.svg" alt="피드백" width={16} height={16} />
            </div>
            <h3 className="font-designer-15b text-text-default">의견 보내기</h3>
          </div>

          <FeedbackLink />

          {/* 추가 퀵 스탯 */}
          <div className="mt-200 grid grid-cols-2 gap-150">
            <div className="rounded-100 bg-background-alternative px-150 py-100 text-center">
              <p className="font-designer-11r text-text-subtlest">이번 달</p>
              <p className="font-designer-14b text-text-default">0회</p>
            </div>
            <div className="rounded-100 bg-background-alternative px-150 py-100 text-center">
              <p className="font-designer-11r text-text-subtlest">총 완료</p>
              <p className="font-designer-14b text-text-default">0회</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
