'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import InquiryList from '@/components/lists/inquiry-list';
import InquiryModal from '@/components/modals/inquiry-modal';
import InquiryDetail from '@/components/section/inquiry-detail-section';
import { canViewInquiry, Inquiry, MOCK_INQUIRIES } from '@/mocks/inquiry-mock-data';
import { useToastStore } from '@/stores/use-toast-store';

interface InquirySectionProps {
  studyId: number;
  studyTitle: string;
  currentUserId?: number;
  isMentor?: boolean;
  isAdmin?: boolean;
  isEmbedded?: boolean; // 스터디 소개 하단 임베드 모드
  isGroupStudy?: boolean; // 그룹스터디 여부
}

/**
 * 문의 게시판 섹션
 * - 문의 리스트 + 문의 상세 + 문의 작성 모달
 * - 상태 관리 (목록/상세 뷰 전환)
 * - 임베드 모드: 스터디 소개 페이지 하단용
 */
export default function InquirySection({
  studyId,
  studyTitle,
  currentUserId,
  isMentor = false,
  isAdmin = false,
  isEmbedded = false,
  isGroupStudy = true,
}: InquirySectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);
  const [inquiries, setInquiries] = useState<Inquiry[]>(MOCK_INQUIRIES);
  
  // URL에서 선택된 문의 ID 읽기
  const inquiryIdParam = searchParams.get('inquiryId');
  const selectedInquiryId = inquiryIdParam ? Number(inquiryIdParam) : null;

  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId);

  const handleInquirySubmit = (data: any) => {
    // 프로토타입: 새 문의 추가
    const newInquiry: Inquiry = {
      id: Date.now(),
      type: data.type,
      title: data.title,
      content: data.content,
      authorId: currentUserId || 1,
      authorName: '나',
      status: 'PENDING',
      viewCount: 1,
      images: data.images.length > 0 ? ['mock-image.png'] : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInquiries((prev) => [newInquiry, ...prev]);
  };

  const handleInquiryClick = (inquiryId: number) => {
    const inquiry = inquiries.find((i) => i.id === inquiryId);
    if (!inquiry) return;

    // 조회수 증가 (프로토타입)
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === inquiryId ? { ...i, viewCount: i.viewCount + 1 } : i,
      ),
    );

    // 멘토/관리자가 처음 조회 시 상태 변경 (접수 → 답변 대기)
    if ((isMentor || isAdmin) && inquiry.status === 'PENDING') {
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === inquiryId ? { ...i, status: 'IN_REVIEW' } : i,
        ),
      );
    }

    // URL 업데이트 (탭 모드) 또는 상태 업데이트 (임베드 모드)
    if (isEmbedded) {
      // 임베드 모드에서는 같은 페이지에서 스크롤하여 문의 상세로 이동
      router.push(`/group-study/${studyId}?inquiryId=${inquiryId}`, { scroll: false });
    } else {
      // 탭 모드에서는 URL만 업데이트
      router.push(`?tab=inquiry&inquiryId=${inquiryId}`, { scroll: false });
    }
  };

  const handleBack = () => {
    if (isEmbedded) {
      router.push(`/group-study/${studyId}`, { scroll: false });
    } else {
      router.push('?tab=inquiry', { scroll: false });
    }
  };

  const handleAnswer = (inquiryId: number, answer: string) => {
    // 프로토타입: 답변 추가
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === inquiryId
          ? {
              ...i,
              status: 'ANSWERED',
              answer: {
                content: answer,
                authorId: currentUserId || 1,
                authorName: isMentor ? 'djyun' : '관리자',
                createdAt: new Date().toISOString(),
              },
            }
          : i,
      ),
    );

    // 목록으로 돌아가기
    setTimeout(() => {
      handleBack();
    }, 1000);
  };

  // URL 파라미터와 상태 동기화
  useEffect(() => {
    if (selectedInquiryId && selectedInquiry) {
      // 조회수 증가는 한 번만 (이미 handleInquiryClick에서 처리)
    }
  }, [selectedInquiryId]);

  // 프로토타입: 첫 번째 비공개 항목을 강제 공개
  const forceShownId = useMemo(() => {
    const firstLocked = inquiries.find(
      (inquiry) =>
        !canViewInquiry(inquiry, currentUserId, isMentor, isAdmin),
    );
    return firstLocked?.id || null;
  }, [inquiries, currentUserId, isMentor, isAdmin]);

  // 임베드 모드
  if (isEmbedded) {
    // 상세 뷰가 선택된 경우
    if (selectedInquiry) {
      const isForceShown = forceShownId === selectedInquiry.id;
      
      return (
        <div className="flex flex-col gap-400">
          <InquiryDetail
            inquiry={selectedInquiry}
            currentUserId={currentUserId}
            isMentor={isMentor}
            isAdmin={isAdmin}
            onBack={handleBack}
            onAnswer={handleAnswer}
            isGroupStudy={isGroupStudy}
            isForceShown={isForceShown}
          />
        </div>
      );
    }
    
    // 목록 뷰
    return (
      <div className="flex flex-col gap-400">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-100">
              <h2 className="font-designer-20b text-text-default">
                문의 게시판
              </h2>
              <span className="font-designer-20b text-[#A4A7AE]">{inquiries.length}개</span>
            </div>
            <p className="font-designer-14m text-text-subtle mt-100">
              스터디 관련 문의사항을 남겨주세요
            </p>
            <p className="font-designer-13m text-text-default mt-50">
              비공개 문의는 작성자, {isGroupStudy ? '리더' : '멘토'}, 관리자만 확인할 수 있어요.
            </p>
          </div>
          <InquiryModal
            studyId={studyId}
            studyTitle={studyTitle}
            onSubmit={handleInquirySubmit}
            isGroupStudy={isGroupStudy}
          />
        </div>

        <InquiryList
          inquiries={inquiries}
          currentUserId={currentUserId}
          isMentor={isMentor}
          isAdmin={isAdmin}
          onInquiryClick={handleInquiryClick}
          forceShowOne={true}
          isGroupStudy={isGroupStudy}
        />
      </div>
    );
  }

  // 탭 모드: 목록/상세 전환
  return (
    <div className="m-auto mt-500 w-[1164px]">
      {selectedInquiry ? (
        // 상세 뷰
        <InquiryDetail
          inquiry={selectedInquiry}
          currentUserId={currentUserId}
          isMentor={isMentor}
          isAdmin={isAdmin}
          onBack={handleBack}
          onAnswer={handleAnswer}
          isGroupStudy={isGroupStudy}
          isForceShown={forceShownId === selectedInquiry.id}
        />
      ) : (
        // 목록 뷰
        <div className="flex flex-col gap-400">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-100">
                <h2 className="font-designer-20b text-text-default">
                  문의 게시판
                </h2>
                <span className="font-designer-20b text-[#A4A7AE]">{inquiries.length}개</span>
              </div>
              <p className="font-designer-14m text-text-subtle mt-100">
                스터디 관련 문의사항을 남겨주세요
              </p>
              <p className="font-designer-13m text-text-default mt-50">
                비공개 문의는 작성자, {isGroupStudy ? '리더' : '멘토'}, 관리자만 확인할 수 있어요.
              </p>
            </div>
            <InquiryModal
              studyId={studyId}
              studyTitle={studyTitle}
              onSubmit={handleInquirySubmit}
              isGroupStudy={isGroupStudy}
            />
          </div>

          {/* 리스트 */}
          <InquiryList
            inquiries={inquiries}
            currentUserId={currentUserId}
            isMentor={isMentor}
            isAdmin={isAdmin}
            onInquiryClick={handleInquiryClick}
            forceShowOne={true}
            isGroupStudy={isGroupStudy}
          />
        </div>
      )}
    </div>
  );
}
