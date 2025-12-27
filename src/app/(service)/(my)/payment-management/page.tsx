'use client';

import React, { useState } from 'react';

import { DateRange } from 'react-day-picker';

import type { UserTransactionListResponseLatestTransactionTypeEnum } from '@/api/openapi/models';
import PremiumStudyCancelPaymentModal from '@/components/modals/premium-study-cancel-payment-modal';
import PremiumStudyRefundRequestModal from '@/components/modals/premium-study-refund-request-modal';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import { BaseInput } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import {
  useGetMyTransactions,
  useGetMyTransactionsByGroupStudy,
} from '@/hooks/queries/payment-user-api';
import CaretDownIcon from 'public/icons/caret-down.svg';
import CaretUpIcon from 'public/icons/caret-up.svg';

type PaymentStatus =
  | '결제대기'
  | '결제취소'
  | '결제실패'
  | '결제완료'
  | '환불완료'
  | '환불요청'
  | '환불승인'
  | '환불반려'
  | '환불취소'
  | '환불실패';

const STATUS_TEXT_MAP: Record<
  UserTransactionListResponseLatestTransactionTypeEnum,
  PaymentStatus
> = {
  PAYMENT_REQUESTED: '결제대기',
  PAYMENT_SUCCESS: '결제완료',
  PAYMENT_FAILED: '결제실패',
  PAYMENT_CANCELED: '결제취소',
  REFUND_REQUESTED: '환불요청',
  REFUND_APPROVED: '환불승인',
  REFUND_COMPLETED: '환불완료',
  REFUND_REJECTED: '환불반려',
  REFUND_CANCELED: '환불취소',
  REFUND_FAILED: '환불실패',
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
    case '환불완료':
      return 'gray';
    case '환불요청':
      return 'orange';
    case '환불승인':
      return 'orange';
    case '환불반려':
      return 'red';
    default:
      return 'gray';
  }
};

export default function PaymentManagement() {
  const [page, setPage] = useState<number>(1);
  const [expandedGroupStudyIds, setExpandedGroupStudyIds] = useState<
    Set<number>
  >(new Set());

  // 검색 필터 상태
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { data: paymentListData } = useGetMyTransactions({
    page: page - 1,
    size: 8,
    startDate: dateRange?.from?.toISOString().split('T')[0],
    endDate: dateRange?.to?.toISOString().split('T')[0],
    studyTitle: keyword || undefined,
    paymentCode: keyword || undefined,
  });

  const paymentList = paymentListData?.content;

  const toggleHistory = (groupStudyId: number) => {
    setExpandedGroupStudyIds((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(groupStudyId)) {
        newSet.delete(groupStudyId);
      } else {
        newSet.add(groupStudyId);
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
            {paymentList && paymentList.length > 0 ? (
              paymentList.map((transaction) => {
                const isExpanded = expandedGroupStudyIds.has(
                  transaction.groupStudyId!,
                );

                return (
                  <React.Fragment key={transaction.groupStudyId}>
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
                              {transaction.groupStudyTitle || '-'}
                            </h3>
                            {transaction.latestTransactionType && (
                              <Badge
                                color={getStatusBadgeColor(
                                  STATUS_TEXT_MAP[
                                    transaction.latestTransactionType
                                  ],
                                )}
                                shape="rectangle"
                              >
                                {
                                  STATUS_TEXT_MAP[
                                    transaction.latestTransactionType
                                  ]
                                }
                              </Badge>
                            )}
                          </div>
                          <div className="font-designer-13r text-text-subtlest">
                            {transaction.paymentCode || '-'}
                          </div>
                        </div>
                      </td>

                      {/* 가운데: 금액 + 날짜 */}
                      <td className="py-200">
                        <div className="flex flex-col gap-50">
                          <div className="font-designer-14m text-text-default">
                            {transaction.latestTransactionAmount?.toLocaleString() ||
                              0}
                            원
                          </div>
                          <div className="font-designer-13r text-text-subtlest">
                            {transaction.paidAt || '-'} /{' '}
                            {transaction.paymentMethod || '-'}
                          </div>
                        </div>
                      </td>

                      {/* 액션 버튼 */}
                      <td className="py-200 pr-250">
                        <PaymentActionButtons
                          transactionType={transaction.latestTransactionType}
                          receiptUrl={transaction.paymentReceiptUrl}
                        />
                      </td>

                      {/* 맨 오른쪽: 토글 버튼 */}
                      <td className="px-300 py-300 text-center">
                        <button
                          onClick={() =>
                            toggleHistory(transaction.groupStudyId!)
                          }
                        >
                          {isExpanded ? <CaretUpIcon /> : <CaretDownIcon />}
                        </button>
                      </td>
                    </tr>

                    {/* 결제 히스토리 박스 */}
                    {isExpanded && (
                      <TransactionHistory
                        groupStudyId={transaction.groupStudyId!}
                      />
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
          총 {paymentListData?.totalElements || 0}건
        </span>
        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={paymentListData?.totalPages || 1}
        />
        <div />
      </div>
    </div>
  );
}

function TransactionHistory({ groupStudyId }: { groupStudyId: number }) {
  const { data: transactionsData } = useGetMyTransactionsByGroupStudy({
    groupStudyId,
    page: 0,
    size: 20,
  });

  const transactions = transactionsData?.content || [];

  return (
    <tr className="border-b-border-default border-b">
      <td colSpan={4} className="px-250 pb-200">
        <div className="bg-background-alternative rounded-100 flex flex-col gap-50 px-300 py-300 pr-200 pb-200 pl-250">
          <h4 className="font-designer-13m text-text-subtle">결제 히스토리</h4>

          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <div
                key={index}
                className="font-designer-11r flex justify-between"
              >
                <span className="text-text-subtlest">
                  {transaction.transactionTypeDisplayName || '-'}
                  {transaction.reason && ` / ${transaction.reason}`}
                </span>
                <span className="text-text-subtlest">
                  {transaction.transactionedAt || '-'}
                </span>
              </div>
            ))
          ) : (
            <div className="font-designer-11r text-text-subtlest">
              히스토리가 없습니다.
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function PaymentActionButtons({
  transactionType,
  receiptUrl,
}: {
  transactionType?: UserTransactionListResponseLatestTransactionTypeEnum;
  receiptUrl?: string;
}) {
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
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    }
  };

  const handleRefundRequest = () => {
    // TODO: 환불 요청 로직 구현
    setRefundRequestModalOpen(true);
  };

  switch (transactionType) {
    case 'PAYMENT_REQUESTED':
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
    case 'PAYMENT_SUCCESS':
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
              disabled={!receiptUrl}
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
    default:
      return null;
  }
}
