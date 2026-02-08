'use client';

import { XIcon } from 'lucide-react';
import Image from 'next/image';
import UserAvatar from '@/components/ui/avatar';
import Badge from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import CakeIcon from '@/features/my-page/ui/icon/cake.svg';
import GithubIcon from '@/features/my-page/ui/icon/github-logo.svg';
import GlobeIcon from '@/features/my-page/ui/icon/globe-simple.svg';
import PhoneIcon from '@/features/my-page/ui/icon/phone.svg';
import TechStackIcon from '@/features/my-page/ui/icon/tech-stack.svg';
import VerifiedCheckIcon from '@/features/my-page/ui/icon/verified-check.svg';
import { MOCK_PARTICIPANT_PROFILES } from '@/mocks/group-study-mock-data';

interface MockProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: number;
}

export default function MockProfileModal({
  isOpen,
  onClose,
  participantId,
}: MockProfileModalProps) {
  const profile = MOCK_PARTICIPANT_PROFILES[participantId];

  if (!profile) {
    return null;
  }

  // 기본 더미 데이터 (1번 리더 외에는 간단한 정보만)
  const fullProfile = {
    nickname: profile.nickname,
    mbti: profile.mbti || 'INFP',
    interests: profile.interests || ['러닝', '음악', '독서', '🌙'],
    temperature: profile.temperature || 68.0,
    simpleIntroduction:
      profile.simpleIntroduction ||
      '함께 공명하는 프로덕트를 만들기 위한 수단으로 프로그래밍을 합니다.',
    birthDate: profile.birthDate || '1998-06-16',
    skills: profile.skills || ['JavaScript', 'TypeScript', 'React'],
    github: profile.github || 'https://github.com/dongjooYun',
    linkedIn: profile.linkedIn || 'https://linktr.ee/djyun',
    phone: profile.phone || '010-8220-4131',
    isVerified: profile.isVerified ?? true,
    selfIntroduction:
      profile.selfIntroduction ||
      '사실 단순 개발보다 프로덕트 품질 향상에 기여하는 모든 활동(기획, QA, UX, HR, 운영 등)에 더 관심이 많습니다. 협업·성장·공유의 가치를 중요시하고 사용자 관점에서 생각하는 것을 좋아합니다. 다양한 분야의 CS 지식 교류 활동에 흥미가 있습니다.',
    studyPlan: profile.studyPlan || '분야 상관 없이 자유롭게 Q&A',
    preferredStudySubject: profile.preferredStudySubject || 'CS Deep Dive',
    availableTime:
      profile.availableTime ||
      '저녁(18:00~21:00), 심야(21:00~23:00), 시간 협의 가능',
    jobTitle: profile.jobTitle || 'IT 실무자 - PM/PO/기획, IT 실무자 - QA',
    experienceLevel: profile.experienceLevel || '주니어',
    studyTypes: profile.studyTypes || ['챌린지', '책/강의', '세미나', '멘토링'],
    studyGoals:
      profile.studyGoals || '지식의 확장, 새로운 인사이트 얻기, 사람과의 연결',
    positiveKeywords: profile.positiveKeywords || [
      {
        content: '시간 약속을 잘 지켜서 스터디가 매끄럽게 진행됐어요.',
        count: 3,
      },
      { content: '자료를 보기 좋게 정리해서 이해가 쉬웠어요.', count: 3 },
      { content: '질문이 체계적으로 준비되어 있었어요.', count: 2 },
      {
        content: '공유해주신 자료가 깊이 있게 학습한 것이 느껴졌어요.',
        count: 1,
      },
      {
        content: '통찰력 있는 피드백 덕분에 부족한 부분을 보완할 수 있었어요.',
        count: 1,
      },
    ],
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={onClose}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="large" className="w-full">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              {fullProfile.nickname}님의 프로필
            </Modal.Title>
            <Modal.Close onClick={onClose}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-400 p-400">
            <div className="flex flex-row gap-300 px-200">
              <UserAvatar image="/images/profile-default.svg" size={80} />

              <div>
                <div className="flex flex-wrap gap-75 pb-75">
                  <Badge color="orange">{fullProfile.mbti}</Badge>
                  {fullProfile.interests.map(
                    (interest: string, idx: number) => (
                      <Badge key={idx} color="purple">
                        {interest}
                      </Badge>
                    ),
                  )}
                </div>

                <div className="flex items-center justify-start">
                  <div className="font-designer-28b flex items-center gap-50 pb-50">
                    {fullProfile.nickname}
                    {fullProfile.isVerified && (
                      <VerifiedCheckIcon className="shrink-0" />
                    )}
                  </div>

                  <span
                    className="bg-border-default mx-150 block h-[12px] w-[1px]"
                    aria-hidden="true"
                  />

                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      fill="none"
                      className="h-400 w-400"
                    >
                      <path
                        fill="#FD853A"
                        d="M25.2 19.2c0 7.07-4.298 9.6-9.6 9.6S6 26.27 6 19.2c0-2.327 2.8-10.4 4-10.4.8 0 2.419 2.91 2.8 2.4 1.2-1.6 2-8 2.8-8s9.6 8.93 9.6 16"
                      />
                      <path
                        fill="#FFF6ED"
                        d="M19.6 23c0 3.093-1.79 4.2-4 4.2s-4-1.107-4-4.2 4-7 4-7 4 3.907 4 7"
                      />
                    </svg>
                    <span className="font-designer-14b pl-[2px] text-orange-400">
                      {fullProfile.temperature.toFixed(1)} ℃
                    </span>
                  </div>
                </div>

                <div className="font-designer-15m pb-300">
                  {fullProfile.simpleIntroduction}
                </div>

                <div className="grid grid-cols-2 gap-x-250 gap-y-100">
                  <Field icon={<CakeIcon />} value={fullProfile.birthDate} />
                  <Field
                    icon={<TechStackIcon />}
                    value={fullProfile.skills.join(', ')}
                  />
                  <Field icon={<GithubIcon />} value={fullProfile.github} />
                  <Field icon={<GlobeIcon />} value={fullProfile.linkedIn} />
                  {fullProfile.isVerified && (
                    <div className="flex items-center gap-100">
                      <Field icon={<PhoneIcon />} value={fullProfile.phone} />
                      <Badge color="green" shape="rectangle">
                        인증완료
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-200">
              <ProfileInfoCard
                title="자기소개"
                content={fullProfile.selfIntroduction}
              />
              <ProfileInfoCard
                title="공부 주제 및 계획"
                content={fullProfile.studyPlan}
              />
              <ProfileInfoCard
                title="선호하는 스터디 주제"
                content={fullProfile.preferredStudySubject}
              />
              <ProfileInfoCard
                title="가능 시간대"
                content={fullProfile.availableTime}
              />
              <ProfileInfoCard title="직무" content={fullProfile.jobTitle} />
              <ProfileInfoCard
                title="경력"
                content={fullProfile.experienceLevel}
              />
              <ProfileInfoCard
                title="스터디 형태"
                content={fullProfile.studyTypes.join(', ')}
              />
              <ProfileInfoCard
                title="스터디 목표"
                content={fullProfile.studyGoals}
              />
            </div>

            <div className="bg-border-subtle h-[2px] w-full flex-none" />

            <div className="flex gap-400 pl-250">
              <span className="font-designer-16b text-text-default w-[132px] shrink-0">
                받은 평가
              </span>

              <div className="text-text-default font-designer-14r grow-1">
                <ul className="flex flex-col gap-100">
                  {fullProfile.positiveKeywords.map(
                    (keyword: any, idx: number) => (
                      <li
                        key={idx}
                        className="bg-background-accent-gray-default text-text-default rounded-50 flex justify-between px-200 py-100"
                      >
                        <span className="font-designer-14r">
                          {keyword.content}
                        </span>
                        <span className="font-designer-14b">
                          {keyword.count}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function Field({ icon, value }: { icon: React.ReactNode; value?: string }) {
  return (
    <div className="flex items-center gap-100">
      {icon}
      <span className="font-designer-14r text-text-subtle leading-none">
        {value ?? ''}
      </span>
    </div>
  );
}

function ProfileInfoCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-75 bg-background-alternative flex gap-400 p-250">
      <div className="font-designer-16b text-text-default w-[132px] shrink-0">
        {title}
      </div>
      <div className="font-designer-15r text-text-default flex-1">
        {content}
      </div>
    </div>
  );
}
