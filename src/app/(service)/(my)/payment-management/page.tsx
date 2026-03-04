'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { DateRange } from 'react-day-picker';

import type {
  UserTransactionListResponse,
  UserTransactionListResponseLatestTransactionTypeEnum,
} from '@/api/openapi/models';
import PremiumStudyCancelPaymentModal from '@/components/common/modals/premium-study-cancel-payment-modal';
import PremiumStudyRefundRequestModal from '@/components/common/modals/premium-study-refund-request-modal';
import VirtualAccountInfoModal from '@/components/common/modals/virtual-account-info-modal';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import DatePicker from '@/components/common/ui/date-picker';
import { BaseInput } from '@/components/common/ui/input';
import Pagination from '@/components/common/ui/pagination';
import {
  useCancelPayment,
  useGetMyTransactions,
  useGetMyTransactionsByGroupStudy,
} from '@/hooks/queries/payment-user-api';
import { formatToKST } from '@/utils/time';
import CaretDownIcon from 'public/icons/caret-down.svg';
import CaretUpIcon from 'public/icons/caret-up.svg';

const TRANSACTION_TYPE_MAP: Record<
  UserTransactionListResponseLatestTransactionTypeEnum,
  {
    label: string;
    color: 'primary' | 'red' | 'green' | 'blue' | 'orange' | 'gray';
  }
> = {
  PAYMENT_REQUESTED: { label: '결제대기', color: 'blue' },
  PAYMENT_WAITING_FOR_DEPOSIT: { label: '입금대기', color: 'blue' },
  PAYMENT_SUCCESS: { label: '결제완료', color: 'green' },
  PAYMENT_FAILED: { label: '결제실패', color: 'red' },
  PAYMENT_CANCELED: { label: '결제취소', color: 'red' },
  REFUND_REQUESTED: { label: '환불요청', color: 'blue' },
  REFUND_APPROVED: { label: '환불승인', color: 'orange' },
  REFUND_COMPLETED: { label: '환불완료', color: 'orange' },
  REFUND_REJECTED: { label: '환불반려', color: 'gray' },
  REFUND_CANCELED: { label: '환불취소', color: 'red' },
  REFUND_FAILED: { label: '환불실패', color: 'red' },
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

  const isPaymentCode = keyword.startsWith('PAY-');

  const { data: paymentListData } = useGetMyTransactions({
    page: page - 1,
    size: 8,
    startDate:
      dateRange?.from && dateRange.from.toISOString()
        ? format(formatToKST(dateRange.from.toISOString()), 'yyyy-MM-dd')
        : undefined,
    endDate:
      dateRange?.to && dateRange.to.toISOString()
        ? format(formatToKST(dateRange.to.toISOString()), 'yyyy-MM-dd')
        : undefined,
    studyTitle: isPaymentCode ? undefined : keyword,
    paymentCode: isPaymentCode ? keyword : undefined,
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
                const kstDate = formatToKST(transaction.groupStudyStartDate);
                const beforeStarting = kstDate ? kstDate < new Date() : false;

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
                                color={
                                  TRANSACTION_TYPE_MAP[
                                    transaction.latestTransactionType
                                  ].color
                                }
                                shape="rectangle"
                              >
                                {
                                  TRANSACTION_TYPE_MAP[
                                    transaction.latestTransactionType
                                  ].label
                                }
                              </Badge>
                            )}
                          </div>
                          <div className="font-designer-13r text-text-subtlest">
                            {`${transaction.paymentCode}${beforeStarting && ' / 시작 전'}` ||
                              '-'}
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
                            {formatToKST(transaction.paidAt)
                              ? format(
                                  formatToKST(transaction.paidAt)!,
                                  'yyyy.MM.dd HH:mm',
                                )
                              : '-'}{' '}
                            {transaction.paymentMethod}
                          </div>
                        </div>
                      </td>

                      {/* 액션 버튼 */}
                      <td className="py-200 pr-250">
                        <PaymentActionButtons
                          paymentId={transaction.paymentId}
                          groupStudyId={transaction.groupStudyId}
                          latestTransactionType={
                            transaction.latestTransactionType
                          }
                          paymentReceiptUrl={transaction.paymentReceiptUrl}
                          virtualAccountInfo={transaction.virtualAccountInfo}
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
                  <p className="font-designer-16r text-text-default">
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
                  {formatToKST(transaction.transactionedAt)
                    ? format(
                        formatToKST(transaction.transactionedAt)!,
                        'yyyy.MM.dd HH:mm',
                      )
                    : '-'}
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
  paymentId,
  groupStudyId,
  latestTransactionType,
  paymentReceiptUrl,
  virtualAccountInfo,
}: Pick<
  UserTransactionListResponse,
  | 'paymentId'
  | 'latestTransactionType'
  | 'paymentReceiptUrl'
  | 'groupStudyId'
  | 'virtualAccountInfo'
>) {
  switch (latestTransactionType) {
    case 'PAYMENT_REQUESTED':
      return (
        <div className="flex flex-col gap-100">
          <PaymentProceedButton groupStudyId={groupStudyId} />
          <PaymentCancelButton paymentId={paymentId} />
        </div>
      );

    case 'PAYMENT_WAITING_FOR_DEPOSIT':
      return (
        <div className="flex flex-col gap-100">
          <VirtualAccountInfoButton virtualAccountInfo={virtualAccountInfo} />
          <PaymentCancelButton paymentId={paymentId} />
        </div>
      );

    case 'PAYMENT_FAILED':
      return <PaymentCancelButton paymentId={paymentId} />;

    case 'PAYMENT_SUCCESS':
      return (
        <div className="flex flex-col gap-100">
          <ReceiptButton paymentReceiptUrl={paymentReceiptUrl} />
          <RefundRequestButton paymentId={paymentId} />
        </div>
      );

    case 'REFUND_REQUESTED':
    case 'REFUND_APPROVED':
    case 'REFUND_CANCELED':
    case 'REFUND_FAILED':
    case 'REFUND_REJECTED':
      return <ReceiptButton paymentReceiptUrl={paymentReceiptUrl} />;

    default:
      return null;
  }
}

function ReceiptButton({
  paymentReceiptUrl,
}: Pick<UserTransactionListResponse, 'paymentReceiptUrl'>) {
  const handleReceiptView = () => {
    if (paymentReceiptUrl) {
      window.open(paymentReceiptUrl, '_blank');
    }
  };

  return (
    <Button
      color="outlined"
      size="small"
      className="font-designer-14r"
      onClick={handleReceiptView}
      disabled={!paymentReceiptUrl}
    >
      영수증 보기
    </Button>
  );
}

function PaymentProceedButton({
  groupStudyId,
}: Pick<UserTransactionListResponse, 'groupStudyId'>) {
  const router = useRouter();

  const handlePaymentProceed = () => {
    router.push(`/payment/${groupStudyId}`);
  };

  return (
    <Button
      color="primary"
      size="small"
      className="font-designer-14r"
      onClick={handlePaymentProceed}
    >
      결제 진행
    </Button>
  );
}

function PaymentCancelButton({
  paymentId,
}: Pick<UserTransactionListResponse, 'paymentId'>) {
  const [cancelPaymentModalOpen, setCancelPaymentModalOpen] =
    useState<boolean>(false);

  const { isPending } = useCancelPayment();

  const handlePaymentCancel = () => {
    if (isPending) return;
    setCancelPaymentModalOpen(true);
  };

  return (
    <>
      <PremiumStudyCancelPaymentModal
        paymentId={paymentId}
        open={cancelPaymentModalOpen}
        onOpenChange={setCancelPaymentModalOpen}
      />

      <Button
        color="outlined"
        size="small"
        className="font-designer-14r"
        onClick={handlePaymentCancel}
        disabled={isPending}
      >
        {isPending ? '취소 중...' : '결제 취소'}
      </Button>
    </>
  );
}

function VirtualAccountInfoButton({
  virtualAccountInfo,
}: {
  virtualAccountInfo?: UserTransactionListResponse['virtualAccountInfo'];
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!virtualAccountInfo || !virtualAccountInfo.accountNumber) {
    return null;
  }

  return (
    <>
      <VirtualAccountInfoModal
        virtualAccountInfo={virtualAccountInfo}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
      <Button
        color="primary"
        size="small"
        className="font-designer-14r"
        onClick={() => setIsOpen(true)}
      >
        입금계좌 확인
      </Button>
    </>
  );
}

function RefundRequestButton({
  paymentId,
}: Pick<UserTransactionListResponse, 'paymentId'>) {
  const [refundRequestModalOpen, setRefundRequestModalOpen] =
    useState<boolean>(false);

  const handleRefundRequest = () => {
    setRefundRequestModalOpen(true);
  };

  return (
    <>
      <PremiumStudyRefundRequestModal
        paymentId={paymentId}
        open={refundRequestModalOpen}
        onOpenChange={setRefundRequestModalOpen}
      />

      <Button
        color="outlined"
        size="small"
        className="font-designer-14r"
        onClick={handleRefundRequest}
      >
        환불 요청
      </Button>
    </>
  );
}
