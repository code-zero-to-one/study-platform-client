'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';
import { useKickMember } from '@/hooks/queries/group-study-member-api';
import Button from '../ui/button';
import { Modal } from '../ui/modal';

interface EndGroupStudyModalProps {
  targetMemberId: number;
  groupStudyId: number;
}

export default function EndGroupStudyModal({
  targetMemberId,
  groupStudyId,
}: EndGroupStudyModalProps) {
  const [open, setOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const handleClose = () => {
    setOpen(false);
    startTransition(() => {
      // 모달 닫힌 후 step 상태 초기화
      setTimeout(() => {
        setCurrentStep(1);
      }, 300); // 모달 닫히는 애니메이션 시간 고려
    });
  };

  const goToStep2 = () => {
    setCurrentStep(2);
  };

  const goToStep3 = () => {
    setCurrentStep(3);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          color="outlined"
          className="border-border-error text-text-error font-designer-14r w-fit"
          size="small"
        >
          종료하기
        </Button>
      </Modal.Trigger>

      <Modal.Portal>
        {currentStep === 1 && (
          <Step1Modal onClose={handleClose} onNext={goToStep2} />
        )}
        {currentStep === 2 && (
          <Step2Modal onClose={handleClose} onNext={goToStep3} />
        )}
        {currentStep === 3 && (
          <Step3Modal
            groupStudyId={groupStudyId}
            targetMemberId={targetMemberId}
            onClose={handleClose}
          />
        )}
      </Modal.Portal>
    </Modal.Root>
  );
}

interface Step1ModalProps {
  onClose: () => void;
  onNext: () => void;
}

function Step1Modal({ onClose, onNext }: Step1ModalProps) {
  return (
    <>
      <Modal.Overlay />
      <Modal.Content
        size="small"
        className="w-[423px]"
        onInteractOutside={onClose}
      >
        <Modal.Header variant="alert">
          <Modal.Title>스터디 참여 종료하기</Modal.Title>
        </Modal.Header>

        <Modal.Body variant="alert" className="flex-col gap-100">
          <p className="font-designer-14r">
            지금까지의 참여 기록이 모두 종료됩니다.
          </p>
          <p className="font-designer-14r">
            조금만 더 도전해보시는 건 어떨까요?
          </p>
        </Modal.Body>

        <Modal.Footer variant="alert">
          <Button
            color="primary"
            className="font-designer-14b w-[160px]"
            size="medium"
            onClick={onClose}
          >
            돌아가기
          </Button>
          <Button
            color="secondary"
            className="font-designer-14b w-[160px]"
            size="medium"
            onClick={onNext}
          >
            종료하기
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </>
  );
}

interface Step2ModalProps {
  onClose: () => void;
  onNext: () => void;
}

function Step2Modal({ onClose, onNext }: Step2ModalProps) {
  return (
    <>
      <Modal.Overlay />
      <Modal.Content
        size="medium"
        description="스터디 참여 종료하기"
        onInteractOutside={onClose}
      >
        <Modal.Header variant="form" className="items-center">
          <Modal.Title>스터디 참여 종료하기</Modal.Title>
          <Modal.CloseButton onClick={onClose} />
        </Modal.Header>
        <Modal.Body className="space-y-400 text-sm">
          <p className="text-text-subtle">
            환불은 진행된 기간에 따라 달라지며, 환불이 불가한 경우도 있습니다.
          </p>

          <section className="space-y-150">
            <h4 className="font-designer-16b">1. 참여 종료 전 안내 사항</h4>
            <p className="text-text-subtle">
              지금 스터디에서 나가시면 참여 상태는 즉시 종료되며, 환불 금액은
              스터디 진행 여부에 따라 달라집니다.
            </p>
          </section>

          <section className="space-y-150">
            <h4 className="font-designer-16b">2. 환불 가능 기간</h4>
            <p className="text-text-subtle">
              서비스 특성상 다음과 같은 환불 기준을 적용합니다.
            </p>
          </section>

          <section className="space-y-150">
            <h4 className="font-designer-16b">3. 전액 환불</h4>
            <ul className="text-text-subtle ml-200 list-disc space-y-50 pl-4">
              <li>결제일로부터 7일 이내</li>
              <li>
                스터디 자료 열람 및 참여 이력이 0회일 경우 가능(예: 강의 시청,
                자료 다운로드, 미션 수행, 커뮤니티 글 열람/참여 등)
              </li>
            </ul>
          </section>

          <section className="space-y-150">
            <h4 className="font-designer-16b">4. 부분 환불</h4>
            <ul className="text-text-subtle ml-200 list-disc space-y-50 pl-4">
              <li>아래 조건을 모두 충족할 경우 부분 환불이 가능합니다.</li>
              <li>결제일로부터 7일 이내</li>
              <li>스터디 자료 사용 또는 참여 이력이 있을 경우</li>
              <li>
                계산 방식 : 환불액 = 결제금액 - 총 금액 × (이용일수/총 스터디
                일수)
              </li>
              <li>컨텐츠/세션 이용 횟수에 따른 차감 후 환불</li>
            </ul>
          </section>

          <section className="space-y-150">
            <h4 className="font-designer-16b">5. 환불 불가</h4>
            <ul className="text-text-subtle ml-200 list-disc space-y-50 pl-4">
              <li>결제일로부터 7일 경과 후</li>
              <li>서비스 기간의 50% 이상 이용 시</li>
              <li>
                스터디 자료 다운로드, 핵심 콘텐츠 접근, 참여 등으로 인해 회수
                불가능한 가치 제공이 완료된 경우
              </li>
              <li>
                회원의 과실, 단순 변심, 개인 일정 등의 사유로 서비스 이용이
                어려운 경우
              </li>
            </ul>
          </section>

          <section className="space-y-150">
            <h4 className="font-designer-16b">6. 환불 접수 방법</h4>
            <ul className="text-text-subtle ml-200 list-disc space-y-50 pl-4">
              <li>환불 요청은 이메일 또는 채널톡/문의 폼을 통해 접수</li>
              <li>
                환불 시 신분 확인을 위해 결제 정보 및 환불 계좌가 필요할 수 있음
              </li>
              <li>환불 처리는 접수 후 영업일 기준 3~5일 소요될 수 있음</li>
            </ul>
          </section>
        </Modal.Body>
        <Modal.Footer variant="form" className="gap-200">
          <Button
            type="button"
            color="secondary"
            size="medium"
            onClick={onClose}
          >
            계속 참여하기
          </Button>
          <Button type="button" color="primary" size="medium" onClick={onNext}>
            확인
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </>
  );
}

interface Step3ModalProps {
  groupStudyId: number;
  targetMemberId: number;
  onClose: () => void;
}

function Step3Modal({
  groupStudyId,
  targetMemberId,
  onClose,
}: Step3ModalProps) {
  const router = useRouter();

  const { mutate: kickMember } = useKickMember();

  const handleEndGroupStudy = () => {
    kickMember(
      {
        id: groupStudyId,
        reason: '중도하차',
        targetMemberId,
      },
      {
        onSuccess: () => {
          alert('중도하차 처리가 완료되었습니다.');
          router.push('/payment-management');
          onClose();
        },
        onError: () => {
          alert('중도하차 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        },
      },
    );
  };

  return (
    <>
      <Modal.Overlay />
      <Modal.Content
        size="small"
        className="w-[423px]"
        onInteractOutside={onClose}
      >
        <Modal.Header variant="alert">
          <Modal.Title>스터디 참여 종료하기</Modal.Title>
        </Modal.Header>

        <Modal.Body variant="alert" className="flex-col gap-100">
          <p>해당 스터디는 마이페이지 결제관리에서 확인하실 수 있습니다.</p>
        </Modal.Body>

        <Modal.Footer variant="alert">
          <Button
            color="primary"
            className="font-designer-14b w-[160px]"
            size="medium"
            onClick={handleEndGroupStudy}
          >
            확인
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </>
  );
}
