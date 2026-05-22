'use client';

import { ChevronDown, ChevronUp, PenLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

// TODO: 1:1 문의 API not yet available — wire GET /api/v1/inquiries when backend adds it
type InquiryStatus = 'WAITING' | 'ANSWERED';

interface InquiryItem {
  id: number;
  title: string;
  status: InquiryStatus;
  createdAt: string;
  content: string;
  answer?: string;
  answeredAt?: string;
}

const STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  WAITING: { label: '답변 대기', className: 'bg-yellow-50 text-yellow-600' },
  ANSWERED: { label: '답변 완료', className: 'bg-green-50 text-green-600' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MyInquiryPage() {
  const router = useRouter();

  // TODO: replace with useQuery when API is available
  const inquiries: InquiryItem[] = [];
  const isLoading = false;

  return (
    <div className="flex flex-col gap-500">
      <div className="flex items-center justify-between">
        <h1 className="font-designer-24b text-text-default">1:1 문의</h1>
        <button
          type="button"
          onClick={() => router.push('/my-inquiry/write')}
          className="flex items-center gap-100 rounded-100 bg-primary-500 px-300 py-150 font-designer-14m text-white"
        >
          <PenLine size={16} />
          문의 작성하기
        </button>
      </div>

      {/* 안내 박스 */}
      <div className="rounded-200 bg-gray-50 p-300">
        <p className="font-designer-14r text-text-subtle">
          • 문의 접수 후 영업일 기준 1~2일 내 답변드립니다.
        </p>
        <p className="font-designer-14r text-text-subtle">
          • 결제 관련 문의는 결제 관리 페이지에서 직접 요청해 주세요.
        </p>
        <p className="font-designer-14r text-text-subtle">
          • 욕설, 비방 등 부적절한 내용은 처리가 지연될 수 있습니다.
        </p>
      </div>

      {/* 문의 목록 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-600">
          <p className="font-designer-14r text-text-subtle">불러오는 중...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="flex flex-col items-center gap-200 py-600">
          <p className="font-designer-16b text-text-default">
            아직 작성한 문의가 없어요
          </p>
          <p className="font-designer-14r text-text-subtle">
            궁금한 점이 있으시면 문의해 주세요.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-200">
          {inquiries.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} />
          ))}
        </div>
      )}
    </div>
  );
}

function InquiryCard({ inquiry }: { inquiry: InquiryItem }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[inquiry.status];

  return (
    <div className="border-border-subtle overflow-hidden rounded-200 border">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start justify-between gap-200 p-300 text-left"
      >
        <div className="flex flex-col gap-100">
          <p className="font-designer-14b text-text-default">{inquiry.title}</p>
          <div className="flex items-center gap-200">
            <span
              className={cn(
                'rounded-50 px-150 py-50 font-designer-12r',
                status.className,
              )}
            >
              {status.label}
            </span>
            <span className="font-designer-12r text-text-subtlest">
              {formatDate(inquiry.createdAt)}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={20} className="text-text-subtle mt-50 shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-text-subtle mt-50 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-border-subtle flex flex-col gap-300 border-t p-300">
          <div className="flex flex-col gap-100">
            <span className="font-designer-12b text-primary-500">
              문의 내용
            </span>
            <p className="font-designer-14r text-text-default">
              {inquiry.content}
            </p>
          </div>

          {inquiry.answer && (
            <div className="flex flex-col gap-100">
              <span className="font-designer-12b text-rose-500">답변 내용</span>
              <p className="font-designer-14r text-text-default">
                {inquiry.answer}
              </p>
              {inquiry.answeredAt && (
                <p className="font-designer-12r text-text-subtlest">
                  {formatDate(inquiry.answeredAt)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
