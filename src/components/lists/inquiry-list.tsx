'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Eye, Lock } from 'lucide-react';
import { useState } from 'react';
import InquiryStatusBadge from '@/components/ui/badge/inquiry-status-badge';
import { canViewInquiry, Inquiry } from '@/mocks/inquiry-mock-data';
import { useToastStore } from '@/stores/use-toast-store';

interface InquiryListProps {
  inquiries: Inquiry[];
  currentUserId?: number;
  isMentor?: boolean;
  isAdmin?: boolean;
  onInquiryClick?: (inquiryId: number) => void;
  forceShowOne?: boolean; // 프로토타입: 1개 강제 공개
  isGroupStudy?: boolean; // 그룹스터디 여부 (리더/멘토 구분)
}

/**
 * 문의 게시판 리스트 컴포넌트
 * - 테이블 형태
 * - 비공개 처리 (권한 없으면 "비공개 문의입니다 🔒")
 * - 상태 배지 표시
 */
export default function InquiryList({
  inquiries,
  currentUserId,
  isMentor = false,
  isAdmin = false,
  onInquiryClick,
  forceShowOne = true, // 기본값 true로 프로토타입 모드
  isGroupStudy = true, // 기본값 그룹스터디
}: InquiryListProps) {
  const showToast = useToastStore((state) => state.showToast);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleInquiryClick = (inquiry: Inquiry, isForceShown: boolean) => {
    // 강제 공개된 항목은 권한 체크 건너뛰기
    if (isForceShown) {
      onInquiryClick?.(inquiry.id);

      return;
    }

    const hasPermission = canViewInquiry(
      inquiry,
      currentUserId,
      isMentor,
      isAdmin,
    );

    if (!hasPermission) {
      showToast('작성자만 확인할 수 있는 문의입니다', 'error');

      return;
    }

    onInquiryClick?.(inquiry.id);
  };

  const getInquiryTypeLabel = (
    type: Inquiry['type'],
    isGroupStudy: boolean = true,
  ) => {
    const labels: Record<Inquiry['type'], string> = {
      PAYMENT: '결제',
      STUDY: '스터디 일반',
      LEADER: isGroupStudy ? '리더' : '멘토',
      MENTOR: '멘토',
      BUG: '버그',
      GENERAL: '고민',
    };

    return labels[type];
  };

  // 프로토타입: 첫 번째 비공개 항목을 강제 공개
  let forceShownId: number | null = null;
  if (forceShowOne) {
    const firstLocked = inquiries.find(
      (inquiry) => !canViewInquiry(inquiry, currentUserId, isMentor, isAdmin),
    );
    if (firstLocked) {
      forceShownId = firstLocked.id;
    }
  }

  return (
    <div className="flex flex-col gap-300">
      {/* 테이블 */}
      <div className="rounded-200 border-border-default overflow-hidden border">
        <table className="w-full">
          <thead className="bg-background-neutral-subtle">
            <tr className="border-border-default border-b">
              <th className="font-designer-14b text-text-default w-[100px] px-200 py-150 text-left">
                번호
              </th>
              <th className="font-designer-14b text-text-default w-[120px] px-200 py-150 text-left">
                분류
              </th>
              <th className="font-designer-14b text-text-default flex-1 px-200 py-150 text-left">
                제목
              </th>
              <th className="font-designer-14b text-text-default w-[140px] px-200 py-150 text-left">
                작성자
              </th>
              <th className="font-designer-14b text-text-default w-[160px] px-200 py-150 text-left">
                작성일시
              </th>
              <th className="font-designer-14b text-text-default w-[120px] px-200 py-150 text-center">
                조회수
              </th>
              <th className="font-designer-14b text-text-default w-[120px] px-200 py-150 text-center">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="font-designer-14m text-text-subtle px-200 py-600 text-center"
                >
                  등록된 문의가 없습니다
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry, index) => {
                const isForceShown = forceShownId === inquiry.id;
                const hasPermission =
                  isForceShown ||
                  canViewInquiry(inquiry, currentUserId, isMentor, isAdmin);
                const isLocked = !hasPermission;

                return (
                  <tr
                    key={inquiry.id}
                    className={`hover:bg-background-neutral-subtle transition-colors ${
                      isLocked ? 'opacity-60' : 'cursor-pointer'
                    }`}
                    onClick={() => handleInquiryClick(inquiry, isForceShown)}
                    onMouseEnter={() => setHoveredId(inquiry.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* 번호 */}
                    <td className="font-designer-14m text-text-subtle px-200 py-150">
                      {inquiries.length - index}
                    </td>

                    {/* 분류 */}
                    <td className="px-200 py-150">
                      <span className="font-designer-13m text-text-subtle">
                        {getInquiryTypeLabel(inquiry.type, isGroupStudy)}
                      </span>
                    </td>

                    {/* 제목 */}
                    <td className="px-200 py-150">
                      <div className="flex items-center gap-150">
                        {isLocked ? (
                          <>
                            <Lock className="text-text-subtle h-150 w-150 flex-shrink-0" />
                            <span className="font-designer-14m text-text-subtle">
                              비공개 문의입니다
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className={`font-designer-14m text-text-default truncate ${
                                hoveredId === inquiry.id
                                  ? 'text-text-brand underline'
                                  : ''
                              }`}
                            >
                              {inquiry.title}
                            </span>
                            {inquiry.images && inquiry.images.length > 0 && (
                              <span className="font-designer-12m text-text-subtle">
                                📷 {inquiry.images.length}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* 작성자 */}
                    <td className="px-200 py-150">
                      <span className="font-designer-14m text-text-default">
                        {isLocked ? '***' : inquiry.authorName}
                      </span>
                    </td>

                    {/* 작성일시 (연도 포함) */}
                    <td className="px-200 py-150">
                      <span className="font-designer-13m text-text-subtle">
                        {format(new Date(inquiry.createdAt), 'yyyy.MM.dd', {
                          locale: ko,
                        })}
                      </span>
                    </td>

                    {/* 조회수 */}
                    <td className="px-200 py-150 text-center">
                      <div className="flex items-center justify-center gap-50">
                        <Eye className="text-text-subtle h-150 w-150" />
                        <span className="font-designer-13m text-text-subtle">
                          {inquiry.viewCount}
                        </span>
                      </div>
                    </td>

                    {/* 상태 */}
                    <td className="px-200 py-150 text-center">
                      <InquiryStatusBadge status={inquiry.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
