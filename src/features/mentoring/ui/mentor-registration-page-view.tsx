'use client';

import { Eye, X } from 'lucide-react';
import { type CSSProperties } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import TextActionButton from '@/components/ui/text-action-button';
import { type MentorRegistrationControllerResult } from '@/features/mentoring/model/use-mentor-registration-controller';
import MentorDetailPage from '@/features/mentoring/ui/mentor-detail-page';
import MentoringGuideModal from '@/features/mentoring/ui/mentoring-guide-modal';
import MentorRegistrationForm from '@/features/mentoring/ui/registration/mentor-registration-form';
import MentorRegistrationHeader from '@/features/mentoring/ui/registration/mentor-registration-header';
import MentorRegistrationStateBoundary from '@/features/mentoring/ui/registration/mentor-registration-state-boundary';
import SettlementRegisterModal from '@/features/mentoring/ui/settings/settlement-register-modal';
import PhoneVerificationModal from '@/features/phone-verification/ui/phone-verification-modal';

const PAGE_CONTAINER_CLASS =
  'mx-auto w-full max-w-[1280px] px-150 py-400 sm:px-300 xl:px-400 xl:py-500';

interface MentorRegistrationPageViewProps {
  controller: MentorRegistrationControllerResult;
}

export default function MentorRegistrationPageView({
  controller,
}: MentorRegistrationPageViewProps) {
  const { state, refs, actions } = controller;

  if (state.guardState !== 'ready') {
    return (
      <MentorRegistrationStateBoundary
        state={state.guardState}
        onOpenPhoneVerification={actions.onOpenPhoneVerification}
        phoneVerificationModal={
          state.shouldRenderPhoneVerificationModal &&
          state.guardState === 'verificationRequired' ? (
            <PhoneVerificationModal
              open={state.isPhoneVerificationModalOpen}
              onOpenChange={actions.onPhoneVerificationModalOpenChange}
              onVerificationComplete={actions.onPhoneVerificationComplete}
              memberId={state.memberId}
            />
          ) : undefined
        }
      />
    );
  }

  return (
    <div
      className={cn(PAGE_CONTAINER_CLASS, state.isResizing && 'select-none')}
      style={state.isResizing ? { cursor: 'col-resize' } : undefined}
    >
      <MentorRegistrationHeader onOpenGuide={actions.onOpenGuide} />

      <div
        ref={refs.previewLayoutRef}
        className={cn(
          state.isPreviewOpen && 'xl:pr-[var(--preview-panel-width)]',
        )}
        style={
          state.isPreviewOpen
            ? ({
                '--preview-panel-width': `${state.committedPanelWidth}px`,
              } as CSSProperties)
            : undefined
        }
      >
        {/* overflow-x-auto: 패널이 좁아져도 form 내용은 reflow 없이 가로 스크롤 */}
        <div className="overflow-x-auto">
          <MentorRegistrationForm
            form={state.form}
            onSubmit={actions.onSave}
            onCancel={actions.onCancel}
            onOpenSettlementModal={() =>
              actions.onSettlementModalOpenChange(true)
            }
          />
        </div>
      </div>

      {!state.isPreviewOpen && (
        <>
          {/* xl: 오른쪽 끝에 붙는 세로 탭 버튼 */}
          <button
            type="button"
            className="bg-fill-brand-default-default text-text-inverse border-border-brand rounded-l-150 font-designer-13b shadow-2 fixed right-0 z-30 hidden items-center gap-100 border px-125 py-300 xl:flex xl:flex-col"
            style={
              state.headerHeight > 0
                ? {
                    top: `calc(50% + ${state.headerHeight / 2}px)`,
                    transform: 'translateY(-50%)',
                  }
                : { top: '50%', transform: 'translateY(-50%)' }
            }
            onClick={actions.onOpenPreview}
            aria-label="실시간 미리보기 열기"
          >
            <Eye className="h-16 w-16" />
            <span className="tracking-widest [writing-mode:vertical-rl]">
              미리보기
            </span>
          </button>
          {/* 모바일/태블릿: 우측 하단 FAB */}
          <button
            type="button"
            className="bg-fill-brand-default-default text-text-inverse border-border-brand font-designer-14b shadow-3 rounded-500 fixed right-200 bottom-200 z-40 flex items-center gap-75 border px-200 py-150 xl:hidden"
            onClick={actions.onOpenPreview}
            aria-label="실시간 미리보기 열기"
          >
            <Eye className="h-16 w-16" />
            미리보기
          </button>
        </>
      )}

      {state.isPreviewOpen && (
        <button
          type="button"
          className="bg-background-dimmer fixed inset-0 z-40 xl:hidden"
          onClick={actions.onClosePreview}
          aria-label="실시간 미리보기 닫기"
        />
      )}

      <aside
        className={cn(
          'bg-background-default border-border-subtle fixed right-0 z-40 flex w-full flex-col border-l xl:w-[var(--preview-panel-width)]',
          !state.isResizing && 'transition-transform duration-300',
          state.isPreviewOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={
          {
            '--preview-panel-width': `${state.panelWidth}px`,
            top: state.headerHeight > 0 ? `${state.headerHeight}px` : 0,
            height:
              state.headerHeight > 0
                ? `calc(100dvh - ${state.headerHeight}px)`
                : '100dvh',
          } as CSSProperties
        }
      >
        {/* 리사이즈 핸들 (xl 이상에서만) */}
        <div
          className="group absolute top-0 left-0 z-10 hidden h-full w-[8px] cursor-col-resize xl:block"
          onMouseDown={actions.onPreviewResizeStart}
        >
          <div className="bg-border-subtle group-hover:bg-border-brand absolute top-0 left-[3px] h-full w-[2px] transition-colors" />
          <div className="border-border-subtle bg-background-default group-hover:border-border-brand absolute top-1/2 left-0 flex h-[40px] w-[8px] -translate-y-1/2 flex-col items-center justify-center gap-[3px] rounded-l-[4px] border border-r-0 transition-colors">
            <span className="bg-border-default group-hover:bg-border-brand h-[12px] w-[2px] rounded-full transition-colors" />
          </div>
        </div>

        {/* 미리보기 패널 헤더 */}
        <div className="border-border-subtle bg-background-default flex shrink-0 items-center justify-between border-b px-250 py-150">
          <div className="flex items-center gap-100">
            <Eye className="text-text-brand h-16 w-16" />
            <span className="font-designer-14b text-text-default">
              실시간 미리보기
            </span>
            <span className="font-designer-12r text-text-subtlest">
              · 실제 화면과 동일하게 표시됩니다
            </span>
          </div>
          <TextActionButton
            tone="default"
            weight="bold"
            withTransition
            icon={<X className="h-14 w-14" />}
            onClick={actions.onClosePreview}
            aria-label="실시간 미리보기 닫기"
          >
            닫기
          </TextActionButton>
        </div>
        {/* overflow-x-auto: 패널이 좁아져도 preview 내용은 reflow 없이 가로 스크롤 */}
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
          <div className="min-w-[360px] [&_a]:pointer-events-none [&_button]:pointer-events-none">
            <MentorDetailPage
              mentor={state.previewMentor}
              previewMode
              highlightedSections={state.highlightedSections}
            />
          </div>
        </div>
      </aside>

      <MentoringGuideModal
        open={state.isGuideOpen}
        onOpenChange={actions.onGuideOpenChange}
      />

      {state.shouldRenderPhoneVerificationModal && (
        <PhoneVerificationModal
          open={state.isPhoneVerificationModalOpen}
          onOpenChange={actions.onPhoneVerificationModalOpenChange}
          onVerificationComplete={actions.onPhoneVerificationComplete}
          memberId={state.memberId}
        />
      )}

      <SettlementRegisterModal
        open={state.isSettlementModalOpen}
        initialValue={state.settlementDraft ?? undefined}
        onOpenChange={actions.onSettlementModalOpenChange}
        onSubmit={actions.onSettlementSubmit}
      />

      <Modal.Root open={Boolean(state.welcomeOnboarding)}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content
            size="medium"
            className="w-[520px]"
            description="멘토 등록 온보딩 안내"
          >
            <Modal.Header className="border-border-default border-b py-200">
              <div className="flex flex-col gap-50">
                <Modal.Title>
                  {state.welcomeOnboarding?.displayName ?? '멘토님'}, 멘토가
                  되신 걸 환영합니다
                </Modal.Title>
                <p className="font-designer-13r text-text-subtle">
                  프로필이 공개되어 멘티가 신청할 수 있습니다. 첫 운영 준비를
                  체크해보세요.
                </p>
              </div>
            </Modal.Header>
            <Modal.Body className="px-300 py-250">
              <div className="rounded-100 bg-background-alternative px-125 py-100">
                <p className="font-designer-13m text-text-default">
                  준비 체크{' '}
                  <span className="font-designer-13b">
                    {state.welcomeOnboarding?.checklist.filter(
                      (item) => item.done,
                    ).length ?? 0}
                    /{state.welcomeOnboarding?.checklist.length ?? 0}
                  </span>
                </p>
              </div>
              <div className="mt-150 flex flex-col gap-100">
                {state.welcomeOnboarding?.checklist.map((item) => (
                  <div
                    key={item.title}
                    className={cn(
                      'rounded-100 border px-150 py-125',
                      item.done
                        ? 'border-border-brand bg-fill-brand-subtle-default/40'
                        : 'border-border-subtle bg-background-default',
                    )}
                  >
                    <div className="mb-50 flex items-center justify-between gap-100">
                      <p className="font-designer-14m text-text-default">
                        {item.title}
                      </p>
                      <span
                        className={cn(
                          'font-designer-12b rounded-500 px-100 py-25',
                          item.done
                            ? 'bg-fill-brand-subtle-default text-text-brand'
                            : 'bg-background-alternative text-text-subtle',
                        )}
                      >
                        {item.done ? '완료' : '권장'}
                      </span>
                    </div>
                    <p className="font-designer-12r text-text-subtle">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer className="flex flex-col gap-100 border-t-0 py-250 sm:flex-row sm:justify-end">
              <Button
                color="secondary"
                className="font-designer-14b w-full sm:w-auto"
                size="medium"
                onClick={actions.onWelcomeModalToRequestPage}
              >
                신청함 바로 가기
              </Button>
              <Button
                color="primary"
                className="font-designer-14b w-full sm:w-auto"
                size="medium"
                onClick={actions.onWelcomeModalToMentorPage}
              >
                내 멘토 페이지 보기
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      {state.isCancelModalOpen && (
        <div className="bg-background-dimmer fixed inset-0 z-50 flex items-center justify-center">
          <div className="rounded-150 bg-background-default w-full max-w-[420px] p-250">
            <h3 className="font-designer-20b text-text-default mb-75">
              작성 내용을 취소할까요?
            </h3>
            <p className="font-designer-14r text-text-subtle mb-200">
              저장하지 않고 이동하면 입력한 내용이 사라집니다.
            </p>
            <div className="flex flex-col-reverse gap-100 sm:flex-row sm:justify-end">
              <Button
                type="button"
                color="secondary"
                size="medium"
                className="w-full sm:w-auto"
                onClick={() => actions.onCancelModalOpenChange(false)}
              >
                계속 작성
              </Button>
              <Button
                type="button"
                color="primary"
                size="medium"
                className="w-full sm:w-auto"
                onClick={actions.onConfirmExitWithoutSaving}
              >
                나가기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
