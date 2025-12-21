'use client';

import React, { useState } from 'react';

import { DateRange } from 'react-day-picker';
import { StudyPaymentSummaryResponse } from '@/api/openapi/models';
import PremiumStudyCancelPaymentModal from '@/components/modals/premium-study-cancel-payment-modal';
import PremiumStudyRefundRequestModal from '@/components/modals/premium-study-refund-request-modal';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import { BaseInput } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { useGetPaymentList } from '@/hooks/queries/payment-user-api';
import CaretDownIcon from 'public/icons/caret-down.svg';
import CaretUpIcon from 'public/icons/caret-up.svg';

type PaymentStatus = '결제대기' | '결제취소' | '결제완료';
// | '환불완료'
// | '환불신청'
// | '환불반려';

const STATUS_TEXT_MAP: Record<
  StudyPaymentSummaryResponse['status'],
  PaymentStatus
> = {
  REQUESTED: '결제대기',
  PENDING: '결제대기',
  SUCCESS: '결제완료',
  FAILED: '결제취소',
  CANCELED: '결제취소',
};

const getStatusBadgeColor = (
  status: PaymentStatus,
): 'primary' | 'red' | 'green' | 'blue' | 'orange' | 'gray' => {
  switch (status) {
    case '결제대기':
      return 'blue';
    case '결제취소':
      return 'red';
    case '결제완료':
      return 'green';
    // case '환불완료':
    //   return 'gray';
    // case '환불신청':
    //   return 'orange';
    // case '환불반려':
    //   return 'red';
    default:
      return 'gray';
  }
};

export default function PaymentManagement() {
  const [page, setPage] = useState<number>(1);
  const [expandedPaymentIds, setExpandedPaymentIds] = useState<Set<number>>(
    new Set(),
  );

  // 검색 필터 상태
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { data: paymentList } = useGetPaymentList(page);

  const toggleHistory = (paymentId: number) => {
    setExpandedPaymentIds((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }

      return newSet;
    });
  };

  return (
    <div className="flex flex-col gap-300">
      <div className="font-designer-20b text-text-default">결제 관리</div>

      {/* 날짜 선택 & 검색 */}
      <div className="flex items-center justify-between">
        {/* 캘린더 자리 */}
        <DatePicker
          mode="range"
          selected={dateRange}
          onSelect={(range) => setDateRange(range as DateRange)}
        />

        {/* 검색 */}
        <div className="w-[240px]">
          <BaseInput
            placeholder="스터디명 혹은 거래 ID 검색"
            size="m"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* 결제 내역 테이블 */}
      <div className="rounded-tl-100 rounded-tr-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-background-alternative border-b-border-default border-b">
            <tr>
              <th className="font-designer-14m text-text-subtlest py-100 pl-250 text-left">
                스터디명
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-[10px] text-left">
                결제 내역
              </th>
              <th className="py-100 pl-[10px]" />
              <th className="py-100 pl-[10px]" />
            </tr>
          </thead>
          <tbody>
            {paymentList?.content && paymentList.content.length > 0 ? (
              paymentList.content.map((payment) => {
                const isExpanded = expandedPaymentIds.has(payment.paymentId);

                return (
                  <React.Fragment key={payment.paymentId}>
                    <tr
                      className={
                        isExpanded ? '' : 'border-b-border-default border-b'
                      }
                    >
                      {/* 왼쪽: 스터디명 + 상태 */}
                      <td className="py-200 pl-250">
                        <div className="flex flex-col gap-50">
                          <div className="flex items-center gap-[10px]">
                            <h3 className="font-designer-16m text-text-default">
                              {payment.groupStudyTitle || '-'}
                            </h3>
                            {payment.status && (
                              <Badge
                                color={getStatusBadgeColor(
                                  STATUS_TEXT_MAP[payment.status],
                                )}
                                shape="rectangle"
                              >
                                {STATUS_TEXT_MAP[payment.status]}
                              </Badge>
                            )}
                          </div>
                          <div className="font-designer-13r text-text-subtlest">
                            {payment.paymentCode || '-'} /{' '}
                            {payment.memberName || '-'}
                          </div>
                        </div>
                      </td>

                      {/* 가운데: 금액 + 날짜 */}
                      <td className="py-200">
                        <div className="flex flex-col gap-50">
                          <div className="font-designer-14m text-text-default">
                            {payment.amount?.toLocaleString() || 0}원
                          </div>
                          <div className="font-designer-13r text-text-subtlest">
                            {payment.createdAt || '-'} / {payment.method || '-'}
                          </div>
                        </div>
                      </td>

                      {/* 액션 버튼 */}
                      <td className="py-200 pr-250">
                        <PaymentActionButtons status={payment.status} />
                      </td>

                      {/* 맨 오른쪽: 토글 버튼 */}
                      <td className="px-300 py-300 text-center">
                        <button
                          onClick={() => toggleHistory(payment.paymentId)}
                        >
                          {isExpanded ? <CaretUpIcon /> : <CaretDownIcon />}
                        </button>
                      </td>
                    </tr>

                    {/* 결제 히스토리 박스 */}
                    {isExpanded && (
                      <tr className="border-b-border-default border-b">
                        <td colSpan={4} className="px-250 pb-200">
                          <div className="bg-background-alternative rounded-100 flex flex-col gap-50 px-300 py-300 pr-200 pb-200 pl-250">
                            <h4 className="font-designer-13m text-text-subtle">
                              결제 히스토리
                            </h4>

                            <div className="font-designer-11r flex justify-between">
                              <span className="text-text-subtlest">
                                환불 완료 / 본인 요청에 의한 취소
                              </span>
                              <span className="text-text-subtlest">
                                2025.12.05 22:01
                              </span>
                            </div>
                            <div className="font-designer-11r flex justify-between">
                              <span className="text-text-subtlest">
                                결제 완료
                              </span>
                              <span className="text-text-subtlest">
                                2025.12.03 22:01
                              </span>
                            </div>
                            <div className="font-designer-11r flex justify-between">
                              <span className="text-text-subtlest">
                                결제 실패 / 한도 초과-카드(하나)
                              </span>
                              <span className="text-text-subtlest">
                                2025.12.01 22:01
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="border-b-border-default border-b py-[200px] text-center"
                >
                  <p className="font-designer-16r text-text-subtlest">
                    결제 내역이 없습니다.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <span className="text-icon-subtlest font-designer-13r">
          총 {paymentList?.totalElements || 0}건
        </span>
        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={paymentList?.totalPages || 1}
        />
        <div />
      </div>
    </div>
  );
}

function PaymentActionButtons({
  status,
}: Pick<StudyPaymentSummaryResponse, 'status'>) {
  const [refundRequestModalOpen, setRefundRequestModalOpen] =
    useState<boolean>(false);
  const [cancelPaymentModalOpen, setCancelPaymentModalOpen] =
    useState<boolean>(false);

  const handlePaymentProceed = () => {
    // TODO: 결제 진행 로직 구현
  };

  const handlePaymentCancel = () => {
    // TODO: 결제 취소 로직 구현
    setCancelPaymentModalOpen(true);
  };

  const handleReceiptView = () => {
    // TODO: 영수증 보기 로직 구현
  };

  const handleRefundRequest = () => {
    // TODO: 환불 요청 로직 구현
    setRefundRequestModalOpen(true);
  };

  switch (status) {
    case 'REQUESTED':
      return (
        <>
          <PremiumStudyCancelPaymentModal
            open={cancelPaymentModalOpen}
            onOpenChange={setCancelPaymentModalOpen}
          />

          <div className="flex flex-col gap-100">
            <Button
              color="outlined"
              size="small"
              className="font-designer-14r"
              onClick={handlePaymentProceed}
            >
              결제 진행
            </Button>
            <Button
              color="outlined"
              size="small"
              className="font-designer-14r"
              onClick={handlePaymentCancel}
            >
              결제 취소
            </Button>
          </div>
        </>
      );
    case 'SUCCESS':
      return (
        <>
          <PremiumStudyRefundRequestModal
            open={refundRequestModalOpen}
            onOpenChange={setRefundRequestModalOpen}
          />
          <div className="flex flex-col gap-100">
            <Button
              color="outlined"
              size="small"
              className="font-designer-14r"
              onClick={handleReceiptView}
            >
              영수증 보기
            </Button>
            <Button
              color="outlined"
              size="small"
              className="font-designer-14r"
              onClick={handleRefundRequest}
            >
              환불 요청
            </Button>
          </div>
        </>
      );
    // case 'REFUND_REQUESTED':
    //   return (
    //     <>
    //       <PremiumStudyRefundRequestModal
    //         open={refundRequestModalOpen}
    //         onOpenChange={setRefundRequestModalOpen}
    //       />
    //       <Button color="outlined" size="small" className="font-designer-14r">
    //         환불 요청
    //       </Button>
    //     </>
    //   );
    // case 'REFUND_REJECTED':
    //   return (
    //     <Button color="outlined" size="small" className="font-designer-14r">
    //       영수증 보기
    //     </Button>
    //   );
    default:
      return null;
  }
}
