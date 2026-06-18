'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import UserAvatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import InlineSectionHeader from '@/components/common/ui/inline-section-header';
import SectionHeader from '@/components/common/ui/section-header';
import { getStatusBadge } from '@/components/one-to-one/interview/status-badge-map';
import { TUTORIAL_DAILY_STUDY_MOCK } from '@/config/tutorial-mock';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useDailyStudyDetailQuery } from '@/hooks/queries/one-to-one/use-interview-query';
import { DailyStudyDetail } from '@/types/api/interview.types';
import { formatExternalLink } from '@/utils/format';

const StudyDoneModal = dynamic(
  () => import('@/components/group-study/modals/study-done-modal'),
  { ssr: false },
);

const StudyReadyModal = dynamic(
  () => import('@/components/group-study/modals/study-ready-modal'),
  { ssr: false },
);

const UserPhoneNumberCopyModal = dynamic(
  () => import('@/components/my-page/modals/user-phone-number-copy-modal'),
  { ssr: false },
);

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);

interface TodayStudyCardProps {
  studyDate: string;
  tutorialMode?: boolean;
  forcedRole?: 'INTERVIEWEE' | 'INTERVIEWER';
  forceOpenReadyModal?: boolean;
  forceOpenDoneModal?: boolean;
}

export default function TodayStudyCard({
  studyDate,
  tutorialMode,
  forcedRole,
  forceOpenReadyModal,
  forceOpenDoneModal,
}: TodayStudyCardProps) {
  const { memberId: authMemberId } = useAuthReady();
  const memberId = tutorialMode
    ? forcedRole === 'INTERVIEWER'
      ? TUTORIAL_DAILY_STUDY_MOCK.interviewerId
      : TUTORIAL_DAILY_STUDY_MOCK.intervieweeId
    : (authMemberId ?? null);

  const queryStudyDate = tutorialMode ? '' : studyDate;
  const { data: todayStudyData } = useDailyStudyDetailQuery(queryStudyDate);

  const resolvedStudyData = tutorialMode
    ? (todayStudyData ?? TUTORIAL_DAILY_STUDY_MOCK)
    : todayStudyData;

  if (!resolvedStudyData || memberId === null) return null;

  // 내가 피면접자(답변하는 사람)인지
  const isInterviewee =
    forcedRole === 'INTERVIEWER'
      ? false
      : forcedRole === 'INTERVIEWEE'
        ? true
        : memberId === resolvedStudyData.intervieweeId;

  const partner = {
    id: isInterviewee
      ? resolvedStudyData.interviewerId
      : resolvedStudyData.intervieweeId,
    name: isInterviewee
      ? resolvedStudyData.interviewerName
      : resolvedStudyData.intervieweeName,
    realName: isInterviewee
      ? resolvedStudyData.interviewerRealName
      : resolvedStudyData.intervieweeRealName,
    image: isInterviewee
      ? resolvedStudyData.interviewerImage
      : resolvedStudyData.intervieweeImage,
    tel: resolvedStudyData.partnerTel,
  };

  return (
    <section className="flex w-full flex-col gap-200">
      <SectionHeader
        title="오늘의 스터디"
        description={
          isInterviewee ? '당신은 지원자입니다.' : '당신은 면접관입니다.'
        }
        className="mb-200"
        titleClassName="font-designer-20b"
        descriptionClassName="font-designer-14r"
      />

      <div className="rounded-100 border-border-default flex w-full rounded border">
        <div className="border-r-border-default flex flex-1 items-center justify-between gap-150 border-r p-300">
          <Image src="/icons/group.svg" alt="group" width={24} height={24} />

          <span className="font-designer-16m text-text-default flex-1">
            스터디 조
          </span>

          <span className="font-designer-20b text-text-default">
            {resolvedStudyData.studySpaceId}조
          </span>
        </div>

        {/* todo: phoneNumber 수정 */}
        <PartnerInfo
          id={partner.id}
          name={partner.name}
          image={partner.image}
          phoneNumber={partner.tel}
          isInterviewee={partner.id === resolvedStudyData.intervieweeId}
        />
      </div>

      {isInterviewee ? (
        <IntervieweeStudyDetail
          studyDate={studyDate}
          forceOpenReadyModal={forceOpenReadyModal}
          {...resolvedStudyData}
        />
      ) : (
        <InterviewerStudyDetail
          studyDate={studyDate}
          forceOpenDoneModal={forceOpenDoneModal}
          {...resolvedStudyData}
        />
      )}
    </section>
  );
}

const renderFeedback = (
  feedback: DailyStudyDetail['feedback'],
  noFeedbackMessage: string,
) => {
  if (feedback) {
    return (
      <div className="bg-background-alternative rounded-50 col-span-1 flex flex-col gap-100 px-300 py-250">
        <h3 className="font-designer-14m text-text-subtle">피드백</h3>

        <p className="text-text-default font-designer-16m">{feedback}</p>
      </div>
    );
  }

  return (
    <div className="bg-background-alternative rounded-50 col-span-1 flex flex-col gap-100 px-300 py-250">
      <h3 className="font-designer-14m text-text-subtle">피드백</h3>

      <div className="flex flex-col items-center justify-center gap-125">
        <Image
          src="/icons/feedback.svg"
          width={65}
          height={65}
          alt="스터디 시작 전"
        />
        <span className="font-designer-14r text-text-subtlest">
          {noFeedbackMessage}
        </span>
      </div>
    </div>
  );
};

// 사용자가 면접자(질문하는 사람)이면 보여줄 컴포넌트
function InterviewerStudyDetail({
  studyDate,
  forceOpenDoneModal,
  ...todayStudyData
}: DailyStudyDetail & { studyDate: string; forceOpenDoneModal?: boolean }) {
  return (
    <div className="rounded-100 border-border-default flex flex-col justify-between gap-200 border px-300 py-250">
      <InlineSectionHeader
        title="스터디 상세"
        icon={
          <Image
            src="/icons/book.svg"
            alt="스터디 상세"
            width={24}
            height={24}
          />
        }
        badge={getStatusBadge(todayStudyData.progressStatus)}
        rightSlot={
          <StudyDoneModal
            data={todayStudyData}
            studyDate={studyDate}
            forceOpen={forceOpenDoneModal}
          />
        }
      />

      {todayStudyData.progressStatus === 'PENDING' ? (
        <BeforeStudy description="아직 지원자가 면접 준비하기를 작성하지 않았어요." />
      ) : (
        <div className="grid grid-cols-2 gap-x-150 gap-y-200">
          <StudySubject subject={todayStudyData.subject} />

          {renderFeedback(
            todayStudyData.feedback,
            '완료하기를 눌러 피드백을 작성해주세요.',
          )}

          <StudyLink link={todayStudyData.link} />
        </div>
      )}
    </div>
  );
}

// 사용자가 피면접자(답변하는 사람)이면 보여줄 컴포넌트
function IntervieweeStudyDetail({
  studyDate,
  forceOpenReadyModal,
  ...todayStudyData
}: DailyStudyDetail & { studyDate: string; forceOpenReadyModal?: boolean }) {
  return (
    <div className="rounded-100 border-border-default flex flex-col justify-between gap-200 border px-300 py-250">
      <InlineSectionHeader
        title="스터디 상세"
        icon={
          <Image
            src="/icons/book.svg"
            alt="스터디 상세"
            width={24}
            height={24}
          />
        }
        badge={getStatusBadge(todayStudyData.progressStatus)}
        rightSlot={
          <StudyReadyModal
            data={todayStudyData}
            studyDate={studyDate}
            forceOpen={forceOpenReadyModal}
          />
        }
      />

      {todayStudyData.progressStatus === 'PENDING' ? (
        <BeforeStudy description="‘준비하기’ 버튼을 눌러 스터디를 시작해 주세요." />
      ) : (
        <div className="grid grid-cols-2 gap-x-150 gap-y-200">
          <StudySubject subject={todayStudyData.subject} />

          {renderFeedback(
            todayStudyData.feedback,
            '아직 면접관이 피드백을 작성하지 않았어요.',
          )}

          <StudyLink link={todayStudyData.link} />
        </div>
      )}
    </div>
  );
}

function PartnerInfo({
  id,
  name,
  realName,
  image,
  phoneNumber,
  isInterviewee,
}: {
  id: number;
  name: string;
  realName?: string;
  image?: string;
  phoneNumber: string;
  isInterviewee: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col gap-150 p-300 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-150">
        <UserProfileModal
          memberId={id}
          trigger={
            <div className="cursor-pointer">
              <UserAvatar image={image} alt={name} size={32} />
            </div>
          }
        />

        <div className="flex items-center gap-100">
          <span className="font-designer-16m text-text-default">{name}</span>
          {isInterviewee ? (
            <Badge color="blue">지원자</Badge>
          ) : (
            <Badge color="red">면접관</Badge>
          )}
        </div>
      </div>

      <div className="rounded-75 border-border-subtle font-designer-14m text-text-default flex h-[44px] w-full border sm:w-[200px]">
        <UserPhoneNumberCopyModal
          phoneNumber={phoneNumber}
          realName={realName ?? name}
          trigger={
            <button
              type="button"
              data-tutorial="study-contact-button"
              className="border-r-border-subtle rounded-l-75 hover:bg-fill-neutral-subtle-hover flex flex-1 items-center gap-75 border-r py-75 pr-125 pl-150 transition"
            >
              <Image
                src="/icons/phone.svg"
                alt="연락하기"
                width={16}
                height={16}
              />
              연락하기
            </button>
          }
        />
        <UserProfileModal
          memberId={id}
          trigger={
            <button
              data-tutorial="study-profile-button"
              className="hover:bg-fill-neutral-subtle-hover rounded-r-75 flex-1 px-75 py-75 transition"
            >
              프로필 보기
            </button>
          }
        />
      </div>
    </div>
  );
}

function BeforeStudy({ description }: { description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-75 px-300 pt-75 pb-300">
      <Image
        src="/icons/empty-study-case.svg"
        width={65}
        height={65}
        alt="스터디 시작 전"
      />
      <p className="font-designer-14r text-text-subtlest flex flex-col items-center">
        <span>스터디 시작 전입니다.</span>
        <span>{description}</span>
      </p>
    </div>
  );
}

function StudySubject({ subject }: Pick<DailyStudyDetail, 'subject'>) {
  return (
    <div className="bg-background-alternative rounded-50 col-span-1 flex flex-col gap-100 px-300 py-250">
      <h3 className="font-designer-14m text-text-subtle">스터디 주제</h3>
      <p className="text-text-default font-designer-16m">{subject}</p>
    </div>
  );
}

function StudyLink({ link }: Pick<DailyStudyDetail, 'link'>) {
  if (!link) return null;

  return (
    <div className="bg-background-alternative rounded-50 col-span-2 flex items-center gap-300 px-300 py-250">
      <span className="font-designer-14r text-text-subtle">스터디 링크</span>

      <Link href={formatExternalLink(link)} target="_blank" rel="noreferrer">
        <div className="flex cursor-pointer gap-75">
          <Image
            src="icons/Link.svg"
            width={24}
            height={24}
            alt="스터디 링크"
          />
          <span className="text-text-default font-designer-14m break-all">
            {link}
          </span>
        </div>
      </Link>
    </div>
  );
}
