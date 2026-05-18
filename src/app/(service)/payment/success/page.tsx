'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { StudyPaymentDetailResponse, VirtualAccountInfo } from '@/api/openapi';
import Button from '@/components/common/ui/button';
import { useConfirmCourseTossPayment } from '@/hooks/queries/course/course-api';
import { useConfirmTossPayment } from '@/hooks/queries/payment/payment-user-api';
import type { CoursePaymentConfirmResponse } from '@/types/api/course.types';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'waiting'
  >('loading');
  const [paymentData, setPaymentData] =
    useState<StudyPaymentDetailResponse | null>(null);
  const [coursePaymentData, setCoursePaymentData] =
    useState<CoursePaymentConfirmResponse | null>(null);

  const { mutateAsync } = useConfirmTossPayment();
  const { mutateAsync: confirmCoursePayment } = useConfirmCourseTossPayment();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [virtualAccount, setVirtualAccount] =
    useState<VirtualAccountInfo | null>(null);

  const paymentId = Number(searchParams.get('paymentId'));
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method');
  const type = searchParams.get('type');
  const courseId = Number(searchParams.get('courseId'));

  const isVirtualAccount = method === 'VIRTUAL_ACCOUNT';
  const isCoursePayment = type === 'course';

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('결제 검증에 필요한 정보가 없습니다.');

      return;
    }

    if (isCoursePayment && !Number.isFinite(courseId)) {
      setStatus('error');
      setErrorMessage('코스 결제 정보가 올바르지 않습니다.');

      return;
    }

    let isMounted = true;

    const verifyPaymentWithBackend = async () => {
      try {
        setStatus('loading');

        const request = {
          paymentId,
          paymentKey,
          orderId,
          amount: Number(amount),
        };
        const result = isCoursePayment
          ? await confirmCoursePayment({ courseId, request })
          : await mutateAsync(request);

        if (isMounted) {
          if (isCoursePayment) {
            setCoursePaymentData(result as CoursePaymentConfirmResponse);
            setStatus('success');
            return;
          }

          const studyPaymentResult = result as StudyPaymentDetailResponse;
          setPaymentData(studyPaymentResult ?? null);

          // 가상계좌 결제인 경우
          if (isVirtualAccount && studyPaymentResult?.virtualAccount) {
            setVirtualAccount(studyPaymentResult.virtualAccount);
            setStatus('waiting');
          } else {
            // 카드 / 간편결제 등 즉시 결제
            setStatus('success');
          }
        }
      } catch {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('결제 검증에 실패했습니다.');
        }
      }
    };

    verifyPaymentWithBackend().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [
    paymentKey,
    orderId,
    amount,
    mutateAsync,
    paymentId,
    isVirtualAccount,
    isCoursePayment,
    confirmCoursePayment,
    courseId,
  ]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="border-border-brand h-500 w-500 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }
  if (status === 'error') {
    const handleRetry = () => {
      // paymentData는 검증 실패 시 null일 수 있으므로,
      // paymentId로 결제 정보를 다시 조회하거나 홈으로 이동
      if (paymentData?.groupStudyId) {
        router.push(`/group-study/${paymentData.groupStudyId}`);
      } else {
        // groupStudyId를 알 수 없는 경우 홈으로 이동
        router.push('/');
      }
    };

    return (
      <div className="bg-background-alternative flex min-h-dvh items-center justify-center">
        <div className="rounded-150 border-border-default bg-fill-neutral-subtle-default mx-auto max-w-md border p-600 text-center">
          <h1 className="font-designer-24b mb-200">결제 승인 실패</h1>
          <p className="text-text-subtle mb-400">{errorMessage}</p>
          <Button
            type="button"
            color="primary"
            size="medium"
            className="w-full"
            onClick={handleRetry}
          >
            다시 시도하기
          </Button>
        </div>
      </div>
    );
  }

  const getMethodLabel = (method?: string) => {
    switch (method) {
      case 'CARD':
        return '카드결제';
      case 'VBANK':
      case 'VIRTUAL_ACCOUNT':
        return '가상계좌';
      default:
        return method ?? '-';
    }
  };

  if (status === 'waiting' && isVirtualAccount && virtualAccount) {
    return (
      <VirtualAccountWaiting
        bankName={virtualAccount.bankName ?? ''}
        accountNumber={virtualAccount.accountNumber ?? ''}
        accountHolder={virtualAccount.customerName ?? ''}
        amount={Number(amount)}
        dueDate={virtualAccount.dueDate ?? ''}
        orderId={orderId ?? ''}
      />
    );
  }

  return (
    <div className="bg-background-alternative flex min-h-dvh items-center justify-center">
      <div className="rounded-150 bg-fill-neutral-subtle-default shadow-2 mx-auto w-full max-w-[860px] p-500">
        {/* 상태 아이콘 영역 */}
        <div className="mb-600 text-center">
          <div className="mx-auto mb-150">
            <Image
              className="mx-auto"
              src="/images/payment-success.png"
              alt="결제 완료"
              width={280}
              height={280}
            />
          </div>
          <h1 className="font-designer-24b text-text-default mb-200">
            결제가 완료되었습니다.
          </h1>
          <p className="font-designer-16m text-text-subtle">
            수강/학습 내역과 결제 내역은 마이페이지에서 확인하실 수 있습니다.
          </p>
        </div>

        {/* 결제 정보 */}
        <div className="border-border-default bg-background-default rounded-100 mb-200">
          <div className="space-y-200">
            <InfoRow
              label="주문 정보"
              value={
                isCoursePayment
                  ? (coursePaymentData?.planCode ?? '-')
                  : (paymentData?.groupStudyTitle ?? '-')
              }
              bold
            />

            <p className="font-designer-18b text-text-default">결제 정보</p>

            <InfoRow
              label="상품 금액"
              value={`${(isCoursePayment ? coursePaymentData?.amount : paymentData?.amount)?.toLocaleString()}원`}
            />

            <div className="border-border-default space-y-200 border-t pt-200">
              <InfoRow
                label="결제 수단"
                value={getMethodLabel(
                  isCoursePayment ? (method ?? undefined) : paymentData?.method,
                )}
                bold
              />
              <InfoRow
                label="총 결제 금액"
                value={`${(isCoursePayment ? coursePaymentData?.amount : paymentData?.amount)?.toLocaleString()}원`}
                bold
              />
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-200">
          <Button
            className="w-full"
            color="primary"
            size="large"
            onClick={() =>
              router.push(isCoursePayment ? '/class' : '/my-study')
            }
          >
            {isCoursePayment ? '코스 학습으로 이동' : '마이스터디로 이동'}
          </Button>
          <Button
            className="w-full"
            color="outlined"
            size="large"
            onClick={() => router.push('/')}
          >
            홈으로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background-alternative flex min-h-dvh items-center justify-center">
          <div className="text-center">
            <div className="border-border-default mx-auto mb-400 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="font-designer-16m text-text-subtle">
              결제를 처리하고 있습니다...
            </p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

interface VirtualAccountWaitingProps {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  dueDate: string;
  orderId: string;
}

function VirtualAccountWaiting({
  bankName,
  accountNumber,
  accountHolder,
  amount,
  dueDate,
  orderId,
}: VirtualAccountWaitingProps) {
  const router = useRouter();

  return (
    <div className="bg-background-alternative flex min-h-dvh items-center justify-center">
      <div className="rounded-150 border-border-default bg-fill-neutral-subtle-default shadow-2 mx-auto w-full max-w-[600px] border p-600">
        {/* 상태 아이콘 영역 */}
        <div className="mb-600 text-center">
          <div className="bg-fill-warning-subtle-default mx-auto mb-300 flex h-[80px] w-[80px] items-center justify-center rounded-full">
            <Image
              src="/icons/hourglass.svg"
              alt="입금 대기"
              width={40}
              height={40}
            />
          </div>
          <h1 className="font-designer-24b text-text-default mb-200">
            입금 대기 중입니다.
          </h1>
          <p className="font-designer-16m text-text-subtle">
            아래 가상계좌로 입금이 완료되면 결제가 자동으로 처리됩니다.
            <br />
            입금 확인에는 최대 수 분이 소요될 수 있습니다.
          </p>
        </div>

        {/* 결제 정보 */}
        <div className="border-border-default bg-background-default rounded-100 mb-400 border p-400">
          <h2 className="font-designer-18b text-text-default mb-300">
            결제 정보
          </h2>
          <div className="space-y-300">
            <InfoRow label="은행" value={bankName} />
            <InfoRow label="계좌번호" value={accountNumber} copy />
            <InfoRow label="예금주" value={accountHolder} />
            <InfoRow
              label="입금 금액"
              value={`${amount.toLocaleString()}원`}
              bold
            />
            <InfoRow label="입금 기한" value={dueDate} />
            <InfoRow label="주문 번호" value={orderId} />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-200">
          <Button
            className="w-full"
            color="primary"
            size="large"
            onClick={() => router.push('/payment-management')}
          >
            결제 관리로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  copy = false,
  bold = false,
}: {
  label: string;
  value: string;
  copy?: boolean;
  bold?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <span
        className={
          bold
            ? 'font-designer-18b text-text-default'
            : 'font-designer-16m text-text-subtle'
        }
      >
        {label}
      </span>
      <div className="flex items-center gap-200">
        <span
          className={
            bold
              ? 'font-designer-18b text-text-default'
              : 'font-designer-16m text-text-default'
          }
        >
          {value}
        </span>
        {copy && (
          <button
            type="button"
            className="font-designer-14m text-text-brand hover:text-text-brand-pressed cursor-pointer transition-colors"
            onClick={handleCopy}
          >
            {copied ? '복사됨' : '복사'}
          </button>
        )}
      </div>
    </div>
  );
}
