'use client';

import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import {
  AdminTransactionListResponse,
  PaymentSearchConditionTypeEnum,
} from '@/api/openapi';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import DatePicker from '@/components/common/ui/date-picker';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import { BaseInput } from '@/components/common/ui/input';
import Pagination from '@/components/common/ui/pagination';
import { useGetTransactionsForAdmin } from '@/hooks/queries/admin/admin-payment-api';
import { formatToKST } from '@/utils/time';

const AdminForcedCancellationModal = dynamic(
  () => import('@/components/admin/modals/admin-forced-cancellation-modal'),
  { ssr: false },
);

const AdminRefundApprovalModal = dynamic(
  () => import('@/components/payment/modals/admin-refund-approval-modal'),
  { ssr: false },
);

const PAYMENT_HISTORY_TYPE_MAP: Record<
  NonNullable<AdminTransactionListResponse['paymentHistoryType']>,
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
  REFUND_COMPLETED: { label: '환불완료', color: 'green' },
  REFUND_REJECTED: { label: '환불반려', color: 'gray' },
  REFUND_CANCELED: { label: '환불취소', color: 'red' },
  REFUND_FAILED: { label: '환불실패', color: 'red' },
};

const STUDY_STATUS_MAP: Record<
  NonNullable<AdminTransactionListResponse['groupStudyStatus']>,
  string
> = {
  RECRUITING: '진행전',
  ENDING_SOON: '마감 임박',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
};

export default function PaymentRefundPage() {
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [page, setPage] = useState<number>(1);
  const [type, setType] = useState<PaymentSearchConditionTypeEnum | undefined>(
    undefined,
  );

  const typeOptions = [
    {
      label: '전체',
      value: undefined,
    },
    ...Object.keys(PAYMENT_HISTORY_TYPE_MAP).map((key) => ({
      label:
        PAYMENT_HISTORY_TYPE_MAP[key as keyof typeof PAYMENT_HISTORY_TYPE_MAP]
          .label,
      value: key,
    })),
  ];

  const isPaymentId = keyword.startsWith('PAY-');

  const { data: transactionsData } = useGetTransactionsForAdmin({
    type,
    startDate:
      dateRange?.from && dateRange.from.toISOString()
        ? format(formatToKST(dateRange.from.toISOString()), 'yyyy-MM-dd')
        : undefined,
    endDate:
      dateRange?.to && dateRange.to.toISOString()
        ? format(formatToKST(dateRange.to.toISOString()), 'yyyy-MM-dd')
        : undefined,
    studyTitle: !isPaymentId && keyword ? keyword : undefined,
    paymentCode: isPaymentId && keyword ? keyword : undefined,
    page: page - 1,
    size: 20,
  });

  const list = transactionsData?.content || [];

  return (
    <>
      {/* 필터 영역 */}
      <div className="flex items-center justify-between py-100">
        <div className="flex items-center gap-100">
          {/* 상태 필터 드롭다운 */}
          <div className="w-[160px]">
            <SingleDropdown
              options={typeOptions}
              value={type}
              onChange={(value) =>
                setType(value as PaymentSearchConditionTypeEnum)
              }
              placeholder="전체"
              size="m"
            />
          </div>

          <DatePicker
            mode="range"
            selected={dateRange}
            onSelect={(range) => setDateRange(range as DateRange)}
          />
        </div>

        {/* 검색 */}
        <div className="w-[300px]">
          <BaseInput
            placeholder="스터디명 혹은 결제ID 검색"
            size="m"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-tl-100 rounded-tr-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-background-alternative border-b-border-default border-b">
            <tr>
              <th className="font-designer-14m text-text-subtlest py-100 pl-250 text-left">
                거래 ID
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-125 text-left">
                스터디명(진행 상태)
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-125 text-left">
                결제자(ID)
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-125 text-left">
                결제 내역(결제 수단)
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-125 text-left">
                상태
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-125 text-left">
                일시
              </th>
              <th className="py-100 pr-250" />
            </tr>
          </thead>
          <tbody>
            {list && list.length > 0 ? (
              list.map((transaction, index) => {
                const statusConfig = transaction.paymentHistoryType
                  ? PAYMENT_HISTORY_TYPE_MAP[transaction.paymentHistoryType]
                  : null;

                if (!statusConfig) return null;

                return (
                  <tr
                    key={`${transaction.paymentCode}`}
                    className="border-b-border-default border-b"
                  >
                    {/* 거래 ID */}
                    <td className="py-200 pl-250">
                      <span className="font-designer-14r text-text-default">
                        {transaction.paymentCode || '-'}
                      </span>
                    </td>

                    {/* 스터디명 */}
                    <td className="py-200 pl-125">
                      <span className="font-designer-14r text-text-default">
                        {`${transaction.groupStudyName} (${
                          STUDY_STATUS_MAP[transaction.groupStudyStatus]
                        })`}
                      </span>
                    </td>

                    {/* 결제자 */}
                    <td className="py-200 pl-125">
                      <span className="font-designer-14r text-text-default">
                        {transaction.paymentMemberName || '-'}(
                        {transaction.paymentMemberId || '-'})
                      </span>
                    </td>

                    {/* 결제 내역 */}
                    <td className="py-200 pl-125">
                      <span className="font-designer-14r text-text-default">
                        {transaction.transactionAmount?.toLocaleString() || 0}
                        원(
                        {transaction.paymentMethod || '-'})
                      </span>
                    </td>

                    {/* 상태 */}
                    <td className="py-200 pl-125">
                      <Badge color={statusConfig.color} shape="rectangle">
                        {statusConfig.label}
                      </Badge>
                    </td>

                    {/* 일시 */}
                    <td className="py-200 pl-125">
                      <span className="font-designer-14r text-text-default">
                        {formatToKST(transaction.transactionedAt)
                          ? format(
                              formatToKST(transaction.transactionedAt)!,
                              'yyyy.MM.dd HH:mm',
                            )
                          : '-'}
                      </span>
                    </td>

                    {/* 액션 버튼 */}
                    <td className="py-200 pr-250">
                      <SalesActionButtons
                        paymentId={transaction.paymentId}
                        paymentReceiptUrl={transaction.paymentReceiptUrl}
                        paymentHistoryType={transaction.paymentHistoryType}
                        groupStudyName={transaction.groupStudyName}
                        paymentMemberName={transaction.paymentMemberName}
                        paymentMemberId={transaction.paymentMemberId}
                        transactionAmount={transaction.transactionAmount}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="border-b-border-default border-b py-[200px] text-center"
                >
                  <p className="font-designer-16r text-text-subtlest">
                    매출 내역이 없습니다.
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
          총 {transactionsData?.totalElements || 0}건
        </span>
        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={transactionsData?.totalPages || 1}
        />
        <div />
      </div>
    </>
  );
}

function SalesActionButtons({
  paymentId,
  paymentReceiptUrl,
  paymentHistoryType,
  groupStudyName,
  paymentMemberName,
  paymentMemberId,
  transactionAmount,
}: Pick<
  AdminTransactionListResponse,
  | 'paymentId'
  | 'paymentReceiptUrl'
  | 'paymentHistoryType'
  | 'groupStudyName'
  | 'paymentMemberName'
  | 'paymentMemberId'
  | 'transactionAmount'
>) {
  switch (paymentHistoryType) {
    case 'PAYMENT_SUCCESS':
      return (
        <div className="flex items-center gap-100">
          <ForcedCancellationButton paymentId={paymentId} />
          <ReceiptButton paymentReceiptUrl={paymentReceiptUrl} />
        </div>
      );

    case 'REFUND_REQUESTED':
      return (
        <div className="flex items-center gap-100">
          <RefundButton
            groupStudyName={groupStudyName}
            paymentMemberName={paymentMemberName}
            paymentMemberId={paymentMemberId}
            transactionAmount={transactionAmount}
          />
          <ReceiptButton paymentReceiptUrl={paymentReceiptUrl} />
        </div>
      );

    case 'REFUND_REJECTED':
      return <ReceiptButton paymentReceiptUrl={paymentReceiptUrl} />;

    default:
      return null;
  }
}

function ReceiptButton({
  paymentReceiptUrl,
}: Pick<AdminTransactionListResponse, 'paymentReceiptUrl'>) {
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
    >
      영수증 보기
    </Button>
  );
}

function ForcedCancellationButton({
  paymentId,
}: Pick<AdminTransactionListResponse, 'paymentId'>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdminForcedCancellationModal
        open={open}
        onOpenChange={setOpen}
        paymentId={paymentId}
      />
      <Button
        size="small"
        className="font-designer-14r bg-background-danger-default text-text-inverse"
        onClick={() => setOpen(true)}
      >
        강제 취소
      </Button>
    </>
  );
}

function RefundButton({
  groupStudyName,
  paymentMemberName,
  paymentMemberId,
  transactionAmount,
}: Pick<
  AdminTransactionListResponse,
  | 'groupStudyName'
  | 'paymentMemberName'
  | 'paymentMemberId'
  | 'transactionAmount'
>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdminRefundApprovalModal
        open={open}
        onOpenChange={setOpen}
        groupStudyName={groupStudyName}
        paymentMemberName={paymentMemberName}
        paymentMemberId={paymentMemberId}
        transactionAmount={transactionAmount}
      />
      <Button color="outlined" size="small" className="font-designer-14r">
        환불하기
      </Button>
    </>
  );
}
