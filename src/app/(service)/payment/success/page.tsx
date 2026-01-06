'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { StudyPaymentDetailResponse } from '@/api/openapi';
import Button from '@/components/ui/button';
import { useConfirmTossPayment } from '@/hooks/queries/payment-user-api';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'waiting'
  >('loading');
  const [paymentData, setPaymentData] =
    useState<StudyPaymentDetailResponse | null>(null);

  const { mutateAsync } = useConfirmTossPayment();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [virtualAccount, setVirtualAccount] = useState<{
    bankName: string;
    accountNumber: string;
    customerName: string;
    dueDate: string;
  } | null>(null);

  const paymentId = Number(searchParams.get('paymentId'));
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method');

  const isVirtualAccount = method === 'VIRTUAL_ACCOUNT';

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('결제 검증에 필요한 정보가 없습니다.');

      return;
    }

    if (isVirtualAccount) {
      let isMounted = true;

      const fetchOrderForVirtualAccount = async () => {
        try {
          setStatus('loading');

          const res = await fetch(`/api/orders/${orderId}`);
          if (!res.ok) throw new Error();

          const data = await res.json();

          if (!isMounted) return;

          setVirtualAccount(data.virtualAccount);
          setStatus('waiting');
        } catch {
          if (isMounted) {
            setStatus('error');
            setErrorMessage('가상계좌 정보를 불러오지 못했습니다.');
          }
        }
      };

      fetchOrderForVirtualAccount().catch((error) => {
        console.error('Error in verifyPaymentWithBackend:', error);
      });

      return () => {
        isMounted = false;
      };
    }

    // ✅ 카드 / 간편결제만 confirm
    let isMounted = true;

    const verifyPaymentWithBackend = async () => {
      try {
        setStatus('loading');

        const result = await mutateAsync({
          paymentId,
          paymentKey,
          orderId,
          amount: Number(amount),
        });

        if (isMounted) {
          setPaymentData(result ?? null);
          setStatus('success');
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
  }, [paymentKey, orderId, amount, mutateAsync, paymentId, isVirtualAccount]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="border-border-brand h-500 w-500 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }
  if (status === 'error') {
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
            onClick={() => router.back()}
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
        return '가상계좌';
      default:
        return method ?? '-';
    }
  };

  if (status === 'waiting' && isVirtualAccount && virtualAccount) {
    return (
      <VirtualAccountWaiting
        bankName={virtualAccount.bankName}
        accountNumber={virtualAccount.accountNumber}
        accountHolder={virtualAccount.customerName}
        amount={Number(amount)}
        dueDate={virtualAccount.dueDate}
        orderId={orderId}
      />
    );
  }

  return (
    <div className="bg-background-alternative flex min-h-dvh items-center justify-center px-400">
      <div className="rounded-150 border-border-default bg-fill-neutral-subtle-default w-[808px] border p-600">
        <div className="mb-500 flex justify-center">
          <Image
            src="/images/payment-success.png"
            alt="결제 성공"
            width={160}
            height={160}
          />
        </div>

        <h1 className="font-designer-32b mb-200 text-center">
          스터디 수강 신청이 완료되었습니다.
        </h1>
        <p className="text-text-subtle mb-500 text-center">
          수강/학습 내역과 결제 내역은 마이페이지에서 확인하실 수 있습니다.
        </p>

        <div className="mb-500 space-y-300">
          <div className="flex items-center justify-between">
            <span className="font-designer-16b">주문 정보</span>
            <span className="text-text-subtle">
              {paymentData?.groupStudyTitle}
            </span>
          </div>

          <div>
            <p className="font-designer-16b mb-100">결제 정보</p>
            <div className="border-border-default flex items-center justify-between border-b py-150">
              <span className="text-text-subtle">상품 금액</span>
              <span>{paymentData?.amount?.toLocaleString()}원</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-designer-16b">결제 수단</span>
            <span className="font-designer-16m text-[#000000]">
              {getMethodLabel(paymentData?.method)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-designer-16b">총 결제 금액</span>
            <span className="font-designer-24b">
              {paymentData?.amount?.toLocaleString()}원
            </span>
          </div>
        </div>

        <div className="flex gap-200">
          <Button
            type="button"
            color="primary"
            size="large"
            className="flex-1"
            onClick={() => router.push('/my-study')}
          >
            마이스터디로 이동
          </Button>
          <Button
            type="button"
            color="secondary"
            size="large"
            className="flex-1"
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
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-24 shadow">
        {/* 상태 아이콘 영역 */}
        <div className="mb-24 text-center">
          <div className="mx-auto mb-12 flex h-48 w-48 items-center justify-center rounded-full bg-yellow-100">
            <span className="text-24">⏳</span>
          </div>
          <h1 className="text-18 font-bold">입금 대기 중입니다</h1>
          <p className="text-14 mt-8 text-gray-600">
            아래 가상계좌로 입금이 완료되면
            <br />
            결제가 자동으로 처리됩니다.
          </p>
        </div>

        {/* 계좌 정보 */}
        <div className="text-14 space-y-12 rounded-md border p-16">
          <InfoRow label="은행" value={bankName} />
          <InfoRow label="계좌번호" value={accountNumber} copy />
          <InfoRow label="예금주" value={accountHolder} />
          <InfoRow label="입금 금액" value={`${amount.toLocaleString()}원`} />
          <InfoRow label="입금 기한" value={dueDate} />
          <InfoRow label="주문 번호" value={orderId} />
        </div>

        {/* 안내 문구 */}
        <p className="text-12 mt-16 text-center text-gray-500">
          입금 확인에는 최대 수 분이 소요될 수 있습니다.
        </p>

        {/* 하단 버튼 */}
        <div className="mt-24 space-y-8">
          <Button className="w-full" color="primary" disabled>
            입금 확인 대기 중
          </Button>
          <Button className="w-full" color="outlined">
            주문 내역으로 이동
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
}: {
  label: string;
  value: string;
  copy?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <div className="flex items-center gap-8">
        <span className="font-medium">{value}</span>
        {copy && (
          <button
            type="button"
            className="text-12 text-blue-600"
            onClick={() => navigator.clipboard.writeText(value)}
          >
            복사
          </button>
        )}
      </div>
    </div>
  );
}
