'use client';

import { XIcon } from 'lucide-react';
import Button from '../ui/button';
import { Modal } from '../ui/modal';

export default function PaymentTermsModal() {
  return (
    <Modal.Root>
      <Modal.Trigger className="text-xs text-gray-500 underline">
        내용보기
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium" description="서비스 이용약관">
          <Modal.Header className="flex items-center justify-between">
            <Modal.Title>ZeroOne IT 서비스 이용약관</Modal.Title>
            <Modal.Close>
              <XIcon className="h-5 w-5" />
            </Modal.Close>
          </Modal.Header>
          <Modal.Body className="space-y-400 text-sm">
            <h3 className="font-designer-18b">서비스 이용약관</h3>

            <section className="space-y-150">
              <h4 className="font-designer-16b">1. 결제 및 서비스 제공</h4>
              <p className="text-text-subtle">
                본 스터디 프로그램은 4주 과정의 온라인 학습 서비스이며, 결제
                완료 시 즉시 서비스 이용이 가능하도록 구성됩니다.
              </p>
            </section>

            <section className="space-y-150">
              <h4 className="font-designer-16b">2. 환불 가능 기간</h4>
              <p className="text-text-subtle">
                서비스 특성상 다음과 같은 환불 기준을 적용합니다.
              </p>

              <div className="mt-200 space-y-200">
                <div>
                  <p className="font-designer-14b">• 전액 환불</p>
                  <ul className="text-text-subtle ml-200 list-disc space-y-50 pl-4">
                    <li>결제일로부터 7일 이내</li>
                    <li>
                      스터디 자료 열람 및 참여 이력이 0회일 경우 가능(예: 강의
                      시청, 자료 다운로드, 미션 수행, 커뮤니티 글 열람/참여 등)
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-designer-14b">• 부분 환불</p>
                  <ul className="text-text-subtle ml-200 list-disc space-y-50 pl-4">
                    <li>
                      아래 조건을 모두 충족할 경우 부분 환불이 가능합니다.
                    </li>
                    <li>결제일로부터 7일 이내</li>
                    <li>스터디 자료 사용 또는 참여 이력이 있을 경우</li>
                    <li>
                      계산 방식 : 환불액 = 결제금액 - 총 금액 × (이용일수/총
                      스터디 일수)
                    </li>
                    <li>콘텐츠/세션 이용 횟수에 따른 차감 후 환불</li>
                  </ul>
                </div>

                <div>
                  <p className="font-designer-14b">• 환불 불가</p>
                  <ul className="text-text-subtle ml-200 list-disc space-y-50 pl-4">
                    <li>결제일로부터 7일 경과 후</li>
                    <li>서비스 기간의 50% 이상 이용 시</li>
                    <li>
                      스터디 자료 다운로드, 핵심 콘텐츠 접근, 참여 등으로 인해
                      회수 불가능한 가치 제공이 완료된 경우
                    </li>
                    <li>
                      회원의 과실, 단순 변심, 개인 일정 등의 사유로 서비스 이용이
                      어려운 경우
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-150">
              <h4 className="font-designer-16b">3. 환불 접수 방법</h4>
              <ol className="text-text-subtle ml-200 list-decimal space-y-50 pl-4">
                <li>환불 요청은 이메일 또는 채널톡/문의 폼을 통해 접수</li>
                <li>
                  환불 시 신분 확인을 위해 결제 정보 및 환불 계좌가 필요할 수
                  있음
                </li>
                <li>환불 처리는 접수 후 영업일 기준 3~5일 소요될 수 있음</li>
              </ol>
            </section>

            <section className="space-y-150">
              <h4 className="font-designer-16b">4. 강제 퇴장/정책 위반</h4>
              <p className="text-text-subtle">
                커뮤니티 규칙 위반, 불법 공유, 타인 비방 등 운영 정책을 위반한
                경우 별도 환불 없이 서비스 이용이 제한될 수 있습니다.
              </p>
            </section>
          </Modal.Body>
          <Modal.Footer className="flex justify-end">
            <Modal.Close asChild>
              <Button type="button" color="primary" size="medium">
                확인
              </Button>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
