'use client';

import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
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
import { Modal } from '@/components/common/ui/modal';
import Pagination from '@/components/common/ui/pagination';
import {
  useGetAdminCoursePaymentDetail,
  useGetAdminCoursePayments,
} from '@/hooks/queries/admin/admin-course-payment-queries';
import { useGetTransactionsForAdmin } from '@/hooks/queries/admin/admin-payment-queries';
import type {
  AdminCoursePaymentDetailResponse,
  AdminCoursePaymentListItemResponse,
  CoursePaymentStatus,
} from '@/types/api/course.types';
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

const ALL_FILTER_VALUE = '__ALL__';

const COURSE_PAYMENT_STATUS_MAP: Record<
  CoursePaymentStatus,
  {
    label: string;
    color: 'primary' | 'red' | 'green' | 'blue' | 'orange' | 'gray';
  }
> = {
  REQUESTED: { label: '결제요청', color: 'blue' },
  PENDING: { label: '결제진행', color: 'orange' },
  WAITING_FOR_DEPOSIT: { label: '입금대기', color: 'blue' },
  SUCCESS: { label: '결제완료', color: 'green' },
  FAILED: { label: '결제실패', color: 'red' },
  CANCELED: { label: '결제취소', color: 'red' },
};

type PaymentTarget = 'group-study' | 'course';

const isPaymentTarget = (value: string | undefined): value is PaymentTarget =>
  value === 'group-study' || value === 'course';

const isCoursePaymentStatus = (
  value: string | undefined,
): value is CoursePaymentStatus =>
  value !== undefined && value in COURSE_PAYMENT_STATUS_MAP;

const isPaymentSearchConditionType = (
  value: string | undefined,
): value is PaymentSearchConditionTypeEnum =>
  value !== undefined && value in PAYMENT_HISTORY_TYPE_MAP;

export default function PaymentRefundPage() {
  const [paymentTarget, setPaymentTarget] =
    useState<PaymentTarget>('group-study');
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [page, setPage] = useState<number>(1);
  const [type, setType] = useState<PaymentSearchConditionTypeEnum | undefined>(
    undefined,
  );
  const [courseStatus, setCourseStatus] = useState<
    CoursePaymentStatus | undefined
  >(undefined);

  useEffect(() => {
    setPage(1);
  }, [paymentTarget, type, courseStatus, keyword, dateRange]);

  const typeOptions = useMemo(
    () => [
      {
        label: '전체',
        value: ALL_FILTER_VALUE,
      },
      ...Object.entries(PAYMENT_HISTORY_TYPE_MAP).map(([value, config]) => ({
        label: config.label,
        value,
      })),
    ],
    [],
  );

  const courseStatusOptions = useMemo(
    () => [
      {
        label: '전체',
        value: ALL_FILTER_VALUE,
      },
      ...Object.entries(COURSE_PAYMENT_STATUS_MAP).map(([value, config]) => ({
        label: config.label,
        value,
      })),
    ],
    [],
  );

  const paymentTargetOptions = useMemo(
    () => [
      { label: '그룹스터디', value: 'group-study' },
      { label: '클래스', value: 'course' },
    ],
    [],
  );

  const isPaymentId = keyword.startsWith('PAY-');
  const isGroupStudyTarget = paymentTarget === 'group-study';
  const isCourseTarget = paymentTarget === 'course';

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
    enabled: isGroupStudyTarget,
  });
  const { data: coursePaymentsData } = useGetAdminCoursePayments({
    status: courseStatus,
    paymentCode: keyword ? keyword : undefined,
    page: page - 1,
    size: 20,
    enabled: isCourseTarget,
  });

  const list = transactionsData?.content || [];
  const coursePaymentList = coursePaymentsData?.content || [];
  const totalElements = isCourseTarget
    ? coursePaymentsData?.totalElements
    : transactionsData?.totalElements;
  const totalPages = isCourseTarget
    ? coursePaymentsData?.totalPages
    : transactionsData?.totalPages;

  return (
    <>
      {/* 필터 영역 */}
      <div className="flex items-center justify-between py-100">
        <div className="flex items-center gap-100">
          <div className="w-2000">
            <SingleDropdown
              options={paymentTargetOptions}
              value={paymentTarget}
              onChange={(value) => {
                setPaymentTarget(
                  isPaymentTarget(value) ? value : 'group-study',
                );
                setType(undefined);
                setCourseStatus(undefined);
                setKeyword('');
              }}
              placeholder="결제 대상"
              size="m"
            />
          </div>

          {/* 상태 필터 드롭다운 */}
          <div className="w-2000">
            <SingleDropdown
              options={isCourseTarget ? courseStatusOptions : typeOptions}
              value={(isCourseTarget ? courseStatus : type) ?? ALL_FILTER_VALUE}
              onChange={(value) => {
                if (value === ALL_FILTER_VALUE) {
                  setCourseStatus(undefined);
                  setType(undefined);
                  return;
                }

                if (isCourseTarget) {
                  setCourseStatus(
                    isCoursePaymentStatus(value) ? value : undefined,
                  );
                  return;
                }

                setType(
                  isPaymentSearchConditionType(value) ? value : undefined,
                );
              }}
              placeholder="전체"
              size="m"
            />
          </div>

          {isGroupStudyTarget && (
            <DatePicker
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
            />
          )}
        </div>

        {/* 검색 */}
        <div className="w-3750">
          <BaseInput
            placeholder={
              isCourseTarget ? '결제ID 검색' : '스터디명 혹은 결제ID 검색'
            }
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
                {isCourseTarget ? '클래스명(플랜)' : '스터디명(진행 상태)'}
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
          {isGroupStudyTarget ? (
            <tbody>
              {list && list.length > 0 ? (
                list.map((transaction) => (
                  <GroupStudyPaymentRow
                    key={`${transaction.paymentCode}`}
                    transaction={transaction}
                  />
                ))
              ) : (
                <EmptyPaymentRows />
              )}
            </tbody>
          ) : (
            <tbody>
              {coursePaymentList.length > 0 ? (
                coursePaymentList.map((payment) => (
                  <CoursePaymentRow
                    key={`${payment.paymentCode}`}
                    payment={payment}
                  />
                ))
              ) : (
                <EmptyPaymentRows />
              )}
            </tbody>
          )}
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <span className="text-icon-subtlest font-designer-13r">
          총 {totalElements || 0}건
        </span>
        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={totalPages || 1}
        />
        <div />
      </div>
    </>
  );
}

function GroupStudyPaymentRow({
  transaction,
}: {
  transaction: AdminTransactionListResponse;
}) {
  const statusConfig = transaction.paymentHistoryType
    ? PAYMENT_HISTORY_TYPE_MAP[transaction.paymentHistoryType]
    : null;

  if (!statusConfig) return null;

  return (
    <tr className="border-b-border-default border-b">
      <td className="py-200 pl-250">
        <span className="font-designer-14r text-text-default">
          {transaction.paymentCode || '-'}
        </span>
      </td>

      <td className="py-200 pl-125">
        <span className="font-designer-14r text-text-default">
          {`${transaction.groupStudyName} (${
            STUDY_STATUS_MAP[transaction.groupStudyStatus]
          })`}
        </span>
      </td>

      <td className="py-200 pl-125">
        <span className="font-designer-14r text-text-default">
          {transaction.paymentMemberName || '-'}(
          {transaction.paymentMemberId || '-'})
        </span>
      </td>

      <td className="py-200 pl-125">
        <span className="font-designer-14r text-text-default">
          {transaction.transactionAmount?.toLocaleString() || 0}원(
          {transaction.paymentMethod || '-'})
        </span>
      </td>

      <td className="py-200 pl-125">
        <Badge color={statusConfig.color} shape="rectangle">
          {statusConfig.label}
        </Badge>
      </td>

      <td className="py-200 pl-125">
        <span className="font-designer-14r text-text-default">
          {formatCoursePaymentDateTime(
            transaction.transactionedAt ?? undefined,
          )}
        </span>
      </td>

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
}

function CoursePaymentRow({
  payment,
}: {
  payment: AdminCoursePaymentListItemResponse;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const statusConfig = COURSE_PAYMENT_STATUS_MAP[payment.status];

  return (
    <>
      <tr className="border-b-border-default border-b">
        <td className="py-200 pl-250">
          <span className="font-designer-14r text-text-default">
            {payment.paymentCode || '-'}
          </span>
        </td>
        <td className="py-200 pl-125">
          <span className="font-designer-14r text-text-default">
            {payment.courseTitle} ({payment.planName})
          </span>
        </td>
        <td className="py-200 pl-125">
          <span className="font-designer-14r text-text-default">
            {payment.memberName || payment.memberLoginId || '-'}(
            {payment.memberId || '-'})
          </span>
        </td>
        <td className="py-200 pl-125">
          <span className="font-designer-14r text-text-default">
            {payment.amount.toLocaleString()}원(
            {payment.paymentMethod || '-'})
          </span>
        </td>
        <td className="py-200 pl-125">
          <Badge color={statusConfig.color} shape="rectangle">
            {statusConfig.label}
          </Badge>
        </td>
        <td className="py-200 pl-125">
          <span className="font-designer-14r text-text-default">
            {formatCoursePaymentDate(payment)}
          </span>
        </td>
        <td className="py-200 pr-250">
          <Button
            color="outlined"
            size="small"
            className="font-designer-14r"
            onClick={() => setDetailOpen(true)}
          >
            상세 보기
          </Button>
        </td>
      </tr>
      <CoursePaymentDetailModal
        paymentId={payment.paymentId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}

function formatCoursePaymentDate(payment: AdminCoursePaymentListItemResponse) {
  const sourceDate =
    payment.paidAt ??
    payment.canceledAt ??
    payment.requestedAt ??
    payment.createdAt;

  return formatCoursePaymentDateTime(sourceDate);
}

function EmptyPaymentRows() {
  return (
    <tr>
      <td
        colSpan={7}
        className="border-b-border-default border-b py-2500 text-center"
      >
        <p className="font-designer-16r text-text-subtlest">
          매출 내역이 없습니다.
        </p>
      </td>
    </tr>
  );
}

function CoursePaymentDetailModal({
  paymentId,
  open,
  onOpenChange,
}: {
  paymentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: payment, isLoading } = useGetAdminCoursePaymentDetail({
    paymentId,
    enabled: open,
  });

  const statusConfig = payment
    ? COURSE_PAYMENT_STATUS_MAP[payment.status]
    : undefined;

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium" description="클래스 결제 상세">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title>클래스 결제 상세</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-300">
            {isLoading || !payment ? (
              <p className="font-designer-14r text-text-subtle">
                결제 정보를 불러오는 중입니다.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-200">
                  <div className="flex flex-col gap-50">
                    <span className="font-designer-13r text-text-subtle">
                      {payment.paymentCode}
                    </span>
                    <span className="font-designer-18b text-text-strong">
                      {payment.courseTitle}
                    </span>
                    <span className="font-designer-14r text-text-default">
                      {payment.planName} · {payment.amount.toLocaleString()}원
                    </span>
                  </div>
                  {statusConfig ? (
                    <Badge color={statusConfig.color} shape="rectangle">
                      {statusConfig.label}
                    </Badge>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-150">
                  <PaymentDetailField
                    label="회원"
                    value={formatMember(payment)}
                  />
                  <PaymentDetailField
                    label="결제 수단"
                    value={payment.paymentMethod || '-'}
                  />
                  <PaymentDetailField
                    label="요청 일시"
                    value={formatCoursePaymentDateTime(
                      payment.requestedAt ?? undefined,
                    )}
                  />
                  <PaymentDetailField
                    label="결제 완료"
                    value={formatCoursePaymentDateTime(
                      payment.paidAt ?? undefined,
                    )}
                  />
                  <PaymentDetailField
                    label="취소 일시"
                    value={formatCoursePaymentDateTime(
                      payment.canceledAt ?? undefined,
                    )}
                  />
                  <PaymentDetailField
                    label="Toss 주문 ID"
                    value={payment.tossOrderId || '-'}
                  />
                  <PaymentDetailField
                    label="PG 거래 ID"
                    value={payment.pgTransactionId || '-'}
                  />
                  <PaymentDetailField
                    label="PG 제공자"
                    value={payment.pgProvider || '-'}
                  />
                </div>

                <VirtualAccountSection payment={payment} />
                <CoursePaymentTimeline payment={payment} />
              </>
            )}
          </Modal.Body>

          <Modal.Footer className="flex justify-end gap-100">
            {payment?.tossReceiptUrl ? (
              <Button
                color="outlined"
                size="small"
                className="font-designer-14r"
                onClick={() => {
                  if (payment.tossReceiptUrl) {
                    window.open(payment.tossReceiptUrl, '_blank');
                  }
                }}
              >
                영수증 보기
              </Button>
            ) : null}
            <Button
              color="primary"
              size="small"
              className="font-designer-14r"
              onClick={() => onOpenChange(false)}
            >
              닫기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function PaymentDetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-border-default rounded-100 flex flex-col gap-50 border p-150">
      <span className="font-designer-13r text-text-subtle">{label}</span>
      <span className="font-designer-14m text-text-default break-all">
        {value}
      </span>
    </div>
  );
}

function VirtualAccountSection({
  payment,
}: {
  payment: AdminCoursePaymentDetailResponse;
}) {
  if (!payment.virtualAccountNumber) {
    return null;
  }

  return (
    <div className="border-border-default rounded-100 flex flex-col gap-150 border p-200">
      <span className="font-designer-16b text-text-strong">가상계좌</span>
      <div className="grid grid-cols-2 gap-150">
        <PaymentDetailField
          label="은행"
          value={payment.virtualBankName || payment.virtualBankCode || '-'}
        />
        <PaymentDetailField
          label="계좌번호"
          value={payment.virtualAccountNumber}
        />
        <PaymentDetailField
          label="예금주"
          value={payment.virtualAccountHolderName || '-'}
        />
        <PaymentDetailField
          label="입금 기한"
          value={formatCoursePaymentDateTime(
            payment.virtualAccountDueDate ?? undefined,
          )}
        />
      </div>
    </div>
  );
}

function CoursePaymentTimeline({
  payment,
}: {
  payment: AdminCoursePaymentDetailResponse;
}) {
  if (!payment.timeline.length) {
    return null;
  }

  return (
    <div className="border-border-default rounded-100 flex flex-col gap-150 border p-200">
      <span className="font-designer-16b text-text-strong">처리 이력</span>
      <div className="flex flex-col gap-100">
        {payment.timeline.map((event, index) => (
          <div
            key={`${event.source}-${event.eventType}-${event.occurredAt}-${index}`}
            className="bg-background-alternative rounded-100 flex items-center justify-between gap-200 p-150"
          >
            <div className="flex flex-col gap-50">
              <span className="font-designer-14m text-text-default">
                {event.eventName || event.eventType}
              </span>
              <span className="font-designer-13r text-text-subtle">
                {event.source}
                {event.referenceCode ? ` · ${event.referenceCode}` : ''}
              </span>
            </div>
            <span className="font-designer-13r text-text-subtle">
              {formatCoursePaymentDateTime(event.occurredAt ?? undefined)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatMember(payment: AdminCoursePaymentDetailResponse) {
  return `${payment.memberName || payment.memberLoginId || '-'}(${
    payment.memberId || '-'
  })`;
}

function formatCoursePaymentDateTime(sourceDate?: string) {
  const kstDate = sourceDate ? formatToKST(sourceDate) : undefined;

  return kstDate ? format(kstDate, 'yyyy.MM.dd HH:mm') : '-';
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
