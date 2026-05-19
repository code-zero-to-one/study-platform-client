'use client';

import { X } from 'lucide-react';

interface TosModalProps {
  open: boolean;
  onClose: () => void;
}

// TODO: Replace placeholder content with final copy from designer
const TOS_SECTIONS = [
  {
    title: '결제 및 서비스 제공',
    content:
      '결제가 완료되면 즉시 모든 강의 콘텐츠에 접근하실 수 있습니다. 서비스는 결제일로부터 이용 가능하며, 별도의 기간 제한 없이 수강하실 수 있습니다.',
  },
  {
    title: '환불 가능 기간',
    content:
      '결제일로부터 7일 이내, 수강 진도가 20% 미만인 경우 전액 환불이 가능합니다. 수강 진도가 20% 이상인 경우 또는 결제 후 7일이 경과한 경우에는 환불이 제한될 수 있습니다.',
  },
  {
    title: '환불 접수 방법',
    content:
      '환불을 원하시는 경우 고객센터(support@zeroone.it.kr)로 문의하시거나 마이페이지 > 결제 내역에서 환불 신청을 해주세요. 환불 처리는 영업일 기준 3~5일이 소요됩니다.',
  },
  {
    title: '강제 퇴장',
    content:
      '타인에게 콘텐츠를 공유하거나 불법으로 배포하는 경우, 커뮤니티 가이드라인을 심각하게 위반하는 경우 사전 경고 없이 서비스 이용이 제한될 수 있습니다.',
  },
];

export function TosModal({ open, onClose }: TosModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-1000/60"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[730px] w-full max-w-[840px] flex-col overflow-hidden rounded-200 bg-background-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 px-500 py-400">
          <h2 className="font-designer-20b text-gray-800">
            ZeroOne IT 서비스 이용약관
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="이용약관 모달 닫기"
          >
            <X className="h-350 w-350 text-gray-800" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-500 py-400">
          <div className="flex flex-col gap-400">
            {TOS_SECTIONS.map((section) => (
              <div key={section.title}>
                <h3 className="mb-150 font-designer-16b text-gray-800">
                  {section.title}
                </h3>
                <p className="font-designer-16r text-gray-500">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 px-500 py-300">
          <button
            type="button"
            onClick={onClose}
            className="flex h-600 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-16b text-gray-0"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
