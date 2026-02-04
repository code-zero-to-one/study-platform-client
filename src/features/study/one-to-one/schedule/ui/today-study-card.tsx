'use client';

import Image from 'next/image';
import Link from 'next/link';
import UserAvatar from '@/components/ui/avatar';
import Badge from '@/components/ui/badge';
import UserPhoneNumberCopyModal from '@/entities/user/ui/user-phone-number-copy-modal';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { DailyStudyDetail } from '@/features/study/interview/api/interview-types';
import { useDailyStudyDetailQuery } from '@/features/study/interview/model/use-interview-query';
import { getStatusBadge } from '@/features/study/interview/ui/status-badge-map';
import StudyDoneModal from '@/features/study/interview/ui/study-done-modal';
import StudyReadyModal from '@/features/study/interview/ui/study-ready-modal';
import { useAuth } from '@/hooks/common/use-auth';

export default function TodayStudyCard({ studyDate }: { studyDate: string }) {
  const { data: authData } = useAuth();
  const memberId = authData?.memberId ?? null;

  const { data: todayStudyData } = useDailyStudyDetailQuery(studyDate);

  if (!todayStudyData || memberId === null) return null;

  // 내가 피면접자(답변하는 사람)인지
  const isInterviewee = memberId === todayStudyData.intervieweeId;

  const partner = {
    id: isInterviewee
      ? todayStudyData.interviewerId
      : todayStudyData.intervieweeId,
    name: isInterviewee
      ? todayStudyData.interviewerName
      : todayStudyData.intervieweeName,
    realName: isInterviewee
      ? todayStudyData.interviewerRealName
      : todayStudyData.intervieweeRealName,
    image: isInterviewee
      ? todayStudyData.interviewerImage
      : todayStudyData.intervieweeImage,
    tel: todayStudyData.partnerTel,
  };

  return (
    <section className="flex w-full flex-col gap-200">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="font-bold-h5 text-text-strong">오늘의 스터디</h3>
      </div>

      <div className="rounded-100 border-border-default flex w-full rounded border">
        <div className="border-r-border-default flex flex-1 items-center justify-between gap-150 border-r p-300">
          <Image src="/icons/group.svg" alt="group" width={24} height={24} />

          <span className="font-designer-16m text-text-default flex-1">
            스터디 조
          </span>

          <span className="font-designer-20b text-text-default">
            {todayStudyData.studySpaceId}조
          </span>
        </div>

        {/* todo: phoneNumber 수정 */}
        <PartnerInfo
          id={partner.id}
          name={partner.name}
          image={partner.image}
          phoneNumber={partner.tel}
          isInterviewee={partner.id === todayStudyData.intervieweeId}
        />
      </div>

      {isInterviewee ? (
        <IntervieweeStudyDetail studyDate={studyDate} {...todayStudyData} />
      ) : (
        <InterviewerStudyDetail studyDate={studyDate} {...todayStudyData} />
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

      <div className="flex flex-col items-center justify-center gap-[10px]">
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
  ...todayStudyData
}: DailyStudyDetail & { studyDate: string }) {
  return (
    <div className="rounded-100 border-border-default flex flex-col justify-between gap-200 border px-300 py-250">
      <div className="flex justify-between">
        <div className="flex items-center gap-150">
          <Image
            src="/icons/book.svg"
            alt="스터디 상세"
            width={24}
            height={24}
          />
          <span className="font-designer-16m text-text-default">
            스터디 상세
          </span>
          {getStatusBadge(todayStudyData.progressStatus)}
        </div>

        <StudyDoneModal data={todayStudyData} studyDate={studyDate} />
      </div>

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
  ...todayStudyData
}: DailyStudyDetail & { studyDate: string }) {
  return (
    <div className="rounded-100 border-border-default flex flex-col justify-between gap-200 border px-300 py-250">
      <div className="flex justify-between">
        <div className="flex items-center gap-150">
          <Image
            src="/icons/book.svg"
            alt="스터디 상세"
            width={24}
            height={24}
          />
          <span className="font-designer-16m text-text-default">
            스터디 상세
          </span>
          {getStatusBadge(todayStudyData.progressStatus)}
        </div>

        <StudyReadyModal data={todayStudyData} studyDate={studyDate} />
      </div>

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
    <div className="flex flex-1 items-center justify-between p-300">
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

      <div className="rounded-75 border-border-subtle font-designer-14m text-text-default flex h-[44px] w-[200px] border">
        <UserPhoneNumberCopyModal
          phoneNumber={phoneNumber}
          realName={realName ?? name}
          trigger={
            <button className="border-r-border-subtle rounded-l-75 hover:bg-fill-neutral-subtle-hover flex flex-1 items-center gap-75 border-r py-75 pr-[10px] pl-150 transition">
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
            <button className="hover:bg-fill-neutral-subtle-hover rounded-r-75 flex-1 px-75 py-75 transition">
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
  return (
    <div className="bg-background-alternative rounded-50 col-span-2 flex items-center gap-300 px-300 py-250">
      <span className="text-sm text-gray-600">스터디 링크</span>

      <Link href={link} target="_blank" rel="noreferrer">
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
