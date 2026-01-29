'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ExternalLink,
  Sparkles,
  XIcon,
  MessageCircle,
  Phone,
  Users,
} from 'lucide-react';
import UserAvatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface Mentor {
  id: number;
  // name: string;
  nickname: string;
  imageUrl?: string;
  field: string;
  keywords: string[];
  description: string;
  notionUrl: string;
  availableMethods: {
    chat: boolean; // 채팅상담
    call: boolean; // 전화/온라인 상담
    offline: boolean; // 대면 컨설팅
  };
}

interface MentorCardProps {
  mentor: Mentor;
}

export default function MentorCard({ mentor }: MentorCardProps) {
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);

  const handleProfileClick = () => {
    if (mentor.notionUrl) {
      window.open(mentor.notionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsComingSoonModalOpen(true);
  };

  return (
    <div
      className="hover:shadow-2 hover:border-border-brand rounded-150 cursor-pointer overflow-hidden border border-[#E5E7EB] bg-white transition-all"
      onClick={() => {
        // 모달이 열려 있으면 카드 클릭 무시
        if (!isComingSoonModalOpen) {
          handleProfileClick();
        }
      }}
    >
      {/* 프로필 이미지 영역 */}
      <div className="relative flex h-[180px] items-center justify-center bg-linear-to-br from-[#F87171] to-[#EC4899]">
        {mentor.imageUrl ? (
          <Image
            src={mentor.imageUrl}
            alt={mentor.nickname}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-400 w-400 items-center justify-center overflow-hidden rounded-full bg-white/20">
            <UserAvatar size={100} image="" alt={mentor.nickname} />
          </div>
        )}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-300 py-200">
        {/* 뱃지 */}
        <div className="mb-100">
          <Badge color="blue">{mentor.field}</Badge>
        </div>

        {/* 제목 */}
        <div className="mb-100 flex items-center gap-100">
          <h3 className="font-designer-20b text-text-default truncate">
            {mentor.nickname}
          </h3>
          <ExternalLink className="h-16 w-16 shrink-0 text-text-subtle" />
        </div>

        {/* 설명 */}
        <p className="font-designer-16r text-text-subtle mb-150 line-clamp-2">
          {mentor.description}
        </p>

        {/* 키워드 */}
        {mentor.keywords.length > 0 && (
          <div className="mb-200 flex flex-wrap gap-100">
            {mentor.keywords.map((keyword) => (
              <span
                key={keyword}
                className="bg-fill-neutral-subtle-default text-text-subtle font-designer-12r rounded-75 px-100 py-50"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        {/* 멘토링 방식 */}
        <div className="mb-200 flex items-center gap-200">
          <div className="flex items-center gap-100">
            <MessageCircle
              className={cn(
                'h-20 w-20',
                mentor.availableMethods.chat
                  ? 'text-text-brand'
                  : 'text-text-subtlest',
              )}
            />
            <span
              className={cn(
                'font-designer-12r',
                mentor.availableMethods.chat
                  ? 'text-text-default'
                  : 'text-text-subtlest',
              )}
            >
              채팅상담
            </span>
          </div>
          <div className="flex items-center gap-100">
            <Phone
              className={cn(
                'h-20 w-20',
                mentor.availableMethods.call
                  ? 'text-text-brand'
                  : 'text-text-subtlest',
              )}
            />
            <span
              className={cn(
                'font-designer-12r',
                mentor.availableMethods.call
                  ? 'text-text-default'
                  : 'text-text-subtlest',
              )}
            >
              전화/온라인 상담
            </span>
          </div>
          <div className="flex items-center gap-100">
            <Users
              className={cn(
                'h-20 w-20',
                mentor.availableMethods.offline
                  ? 'text-text-brand'
                  : 'text-text-subtlest',
              )}
            />
            <span
              className={cn(
                'font-designer-12r',
                mentor.availableMethods.offline
                  ? 'text-text-default'
                  : 'text-text-subtlest',
              )}
            >
              대면 컨설팅
            </span>
          </div>
        </div>

        {/* 멘토링 문의하기 버튼 */}
        <Button
          color="primary"
          size="medium"
          className="w-full"
          onClick={handleApplyClick}
        >
          도움 요청
        </Button>
      </div>

      {/* 곧 오픈 예정 모달 */}
      <Modal.Root
        open={isComingSoonModalOpen}
        onOpenChange={setIsComingSoonModalOpen}
      >
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content
            size="small"
            onClick={(e) => e.stopPropagation()}
          >
            <Modal.Header className="border-border-default flex items-center justify-between border-b">
              <Modal.Title className="font-designer-20b text-text-strong">
                멘토링 서비스
              </Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </Modal.Header>

            <Modal.Body className="flex flex-col items-center gap-300 py-400">
              <div className="bg-fill-brand-subtle-default flex h-[80px] w-[80px] items-center justify-center rounded-full">
                <Sparkles className="text-text-brand h-[40px] w-[40px]" />
              </div>

              <div className="flex flex-col items-center gap-200 text-center">
                <h3 className="font-designer-20b text-text-strong">
                  곧 오픈 예정입니다!
                </h3>
                <p className="font-designer-16r text-text-default">
                  1:1 멘토링 서비스를 준비하고 있어요.
                  <br />
                  조금만 기다려주시면 멘토와 함께
                  <br />
                  성장할 수 있는 기회를 제공해드릴게요.
                </p>
                <p className="font-designer-14r text-text-subtle mt-100">
                  곧 만나요! 🚀
                </p>
              </div>
            </Modal.Body>

            <Modal.Footer className="flex justify-end">
              <Button
                color="primary"
                size="medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsComingSoonModalOpen(false);
                }}
              >
                확인
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </div>
  );
}

