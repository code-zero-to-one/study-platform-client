'use client';

import { Eye, X } from 'lucide-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import TextActionButton from '@/components/ui/text-action-button';
import { type MentorRegistrationControllerResult } from '@/features/mentoring/model/use-mentor-registration-controller';
import MentorDetailPage from '@/features/mentoring/ui/mentor-detail-page';
import MentoringGuideModal from '@/features/mentoring/ui/mentoring-guide-modal';
import MentorRegistrationEntryOnboarding from '@/features/mentoring/ui/registration/mentor-registration-entry-onboarding';
import MentorRegistrationForm from '@/features/mentoring/ui/registration/mentor-registration-form';
import MentorRegistrationHeader from '@/features/mentoring/ui/registration/mentor-registration-header';
import MentorRegistrationStateBoundary from '@/features/mentoring/ui/registration/mentor-registration-state-boundary';
import SettlementRegisterModal from '@/features/mentoring/ui/settings/settlement-register-modal';
import PhoneVerificationModal from '@/features/phone-verification/ui/phone-verification-modal';

const PAGE_CONTAINER_CLASS =
  'mx-auto w-full max-w-[1280px] px-150 py-400 sm:px-300 xl:px-400 xl:py-500';
const PREVIEW_SCROLL_NUDGE_MAX = 44;
const PREVIEW_SCROLL_RESPONSE_RATIO = 0.6;
const PREVIEW_SCROLL_TARGET_DAMPING = 0.62;
const PREVIEW_SCROLL_SMOOTHING = 0.42;
const PREVIEW_SCROLL_IDLE_THRESHOLD = 0.18;
const PREVIEW_PANEL_EXTRA_WIDTH = 200;
const PREVIEW_FORM_GAP = 60;

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

interface MentorRegistrationPageViewProps {
  controller: MentorRegistrationControllerResult;
}

export default function MentorRegistrationPageView({
  controller,
}: MentorRegistrationPageViewProps) {
  const { state, refs, actions } = controller;
  const previewPanelRef = useRef<HTMLElement>(null);
  const [previewPanelRightOffset, setPreviewPanelRightOffset] = useState(0);
  const previousScrollYRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const previewPanelBaseWidth = state.isResizing
    ? state.panelWidth
    : state.committedPanelWidth;
  const previewPanelTotalWidth = state.isPreviewOpen
    ? previewPanelBaseWidth + PREVIEW_PANEL_EXTRA_WIDTH
    : 0;

  useEffect(() => {
    if (!state.isPreviewOpen) {
      setPreviewPanelRightOffset(0);

      return;
    }

    const syncPreviewPanelRightOffset = () => {
      const layoutRect = refs.previewLayoutRef.current?.getBoundingClientRect();

      if (!layoutRect) {
        setPreviewPanelRightOffset(0);

        return;
      }

      const viewportRightGutter = Math.max(
        0,
        Math.floor(window.innerWidth - layoutRect.right),
      );
      setPreviewPanelRightOffset(viewportRightGutter);
    };

    syncPreviewPanelRightOffset();
    window.addEventListener('resize', syncPreviewPanelRightOffset);

    return () =>
      window.removeEventListener('resize', syncPreviewPanelRightOffset);
  }, [refs.previewLayoutRef, state.isPreviewOpen]);

  useEffect(() => {
    if (!state.isPreviewOpen) {
      previousScrollYRef.current = window.scrollY;
      currentOffsetRef.current = 0;
      targetOffsetRef.current = 0;
      previewPanelRef.current?.style.setProperty(
        '--preview-scroll-nudge',
        '0px',
      );
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      return;
    }

    const desktopQuery = window.matchMedia('(min-width: 1280px)');

    const animateOffset = () => {
      targetOffsetRef.current *= PREVIEW_SCROLL_TARGET_DAMPING;
      const nextOffset =
        currentOffsetRef.current +
        (targetOffsetRef.current - currentOffsetRef.current) *
          PREVIEW_SCROLL_SMOOTHING;

      currentOffsetRef.current = nextOffset;
      previewPanelRef.current?.style.setProperty(
        '--preview-scroll-nudge',
        `${nextOffset}px`,
      );

      const shouldStop =
        Math.abs(nextOffset) < PREVIEW_SCROLL_IDLE_THRESHOLD &&
        Math.abs(targetOffsetRef.current) < PREVIEW_SCROLL_IDLE_THRESHOLD;

      if (shouldStop) {
        currentOffsetRef.current = 0;
        targetOffsetRef.current = 0;
        previewPanelRef.current?.style.setProperty(
          '--preview-scroll-nudge',
          '0px',
        );
        animationFrameRef.current = null;

        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animateOffset);
    };

    const startAnimation = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animateOffset);
    };

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - previousScrollYRef.current;
      previousScrollYRef.current = nextScrollY;

      if (!desktopQuery.matches || delta === 0) {
        return;
      }

      targetOffsetRef.current = clamp(
        targetOffsetRef.current + delta * PREVIEW_SCROLL_RESPONSE_RATIO,
        -PREVIEW_SCROLL_NUDGE_MAX,
        PREVIEW_SCROLL_NUDGE_MAX,
      );

      startAnimation();
    };

    const handleViewportChange = () => {
      if (desktopQuery.matches) {
        return;
      }

      targetOffsetRef.current = 0;
      startAnimation();
    };

    previousScrollYRef.current = window.scrollY;
    previewPanelRef.current?.style.setProperty('--preview-scroll-nudge', '0px');
    window.addEventListener('scroll', handleScroll, { passive: true });
    desktopQuery.addEventListener('change', handleViewportChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      desktopQuery.removeEventListener('change', handleViewportChange);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [state.isPreviewOpen]);

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

  if (state.isEntryOnboardingOpen) {
    return (
      <MentorRegistrationEntryOnboarding
        initialValues={state.entryOnboardingValues}
        onComplete={actions.onCompleteEntryOnboarding}
        onSkip={actions.onSkipEntryOnboarding}
      />
    );
  }

  return (
    <div
      className={cn(PAGE_CONTAINER_CLASS, state.isResizing && 'select-none')}
      style={state.isResizing ? { cursor: 'col-resize' } : undefined}
    >
      {/*
       * XL 이상: grid 2컬럼 레이아웃 (폼 | 미리보기)
       *   - aside는 화면 우측 고정 카드로 렌더링되고, grid는 폼 영역 폭만 안정적으로 확보
       * XL 미만: 단일 컬럼 + aside는 fixed overlay drawer
       */}
      <div
        ref={refs.previewLayoutRef}
        className={cn(
          'xl:grid xl:grid-cols-[minmax(0,1fr)_var(--preview-panel-total-width)] xl:gap-x-[var(--preview-form-gap)]',
          !state.isResizing &&
            'xl:transition-[grid-template-columns] xl:duration-300',
        )}
        style={
          {
            '--preview-panel-width': `${previewPanelBaseWidth}px`,
            '--preview-panel-total-width': `${previewPanelTotalWidth}px`,
            '--preview-form-gap': `${PREVIEW_FORM_GAP}px`,
          } as CSSProperties
        }
      >
        {/* LEFT: 폼 영역 */}
        {/* min-w-0: grid item shrink 허용 / overflow-x-auto: 패널이 좁아져도 reflow 없이 가로 스크롤 */}
        <div className="min-w-0">
          <MentorRegistrationHeader
            onOpenGuide={actions.onOpenGuide}
            onReopenEntryOnboarding={actions.onReopenEntryOnboarding}
          />
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

        {/*
         * RIGHT: 미리보기 패널
         *   XL: 우측 중앙 고정 카드 — 스크롤 delta에 반응해 nudge 애니메이션
         *   XL 미만: fixed overlay drawer — translate 로 슬라이드 인/아웃
         */}
        <aside
          ref={previewPanelRef}
          className={cn(
            'bg-background-default border-border-subtle flex flex-col',
            state.isPreviewOpen && 'xl:border',
            // < XL: fixed overlay drawer
            'fixed top-0 right-0 z-40 h-[100dvh] w-full',
            !state.isResizing && 'transition-transform duration-300',
            state.isPreviewOpen ? 'translate-x-0' : 'translate-x-full',
            // XL: 고정 미리보기 카드 + 스크롤 관성 nudge
            'xl:rounded-200 xl:top-1/2 xl:right-[var(--preview-panel-right-offset)] xl:z-20 xl:h-[calc(100dvh-120px)] xl:w-[var(--preview-panel-total-width)] xl:self-start xl:overflow-hidden xl:transition-none',
            state.isPreviewOpen
              ? 'xl:[transform:translate3d(0,calc(-50%+var(--preview-scroll-nudge,0px)),0)]'
              : 'xl:translate-x-full',
          )}
          style={
            {
              '--preview-scroll-nudge': '0px',
              '--preview-panel-right-offset': `${previewPanelRightOffset}px`,
            } as CSSProperties
          }
        >
          {/* 리사이즈 핸들 (XL 이상에서만) */}
          <div
            className="group absolute top-0 left-0 z-10 hidden h-full w-[8px] cursor-col-resize xl:block"
            onPointerDown={actions.onPreviewResizeStart}
          />

          {/* 미리보기 패널 헤더 */}
          <div className="bg-background-default flex shrink-0 items-center justify-between px-250 py-150">
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
          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto xl:pointer-events-auto xl:overscroll-contain">
            <div className="min-w-[360px] [&_a]:pointer-events-none [&_button]:pointer-events-none">
              <MentorDetailPage
                mentor={state.previewMentor}
                previewMode
                highlightedSections={state.highlightedSections}
              />
            </div>
          </div>
        </aside>
      </div>

      {!state.isPreviewOpen && (
        <>
          {/* XL: 뷰포트 오른쪽 끝에 붙는 세로 탭 버튼 */}
          <button
            type="button"
            className="bg-fill-brand-default-default text-text-inverse border-border-brand rounded-l-150 font-designer-13b shadow-2 fixed right-0 z-30 hidden items-center gap-100 border px-125 py-300 xl:flex xl:flex-col"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
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

      {/* XL 미만에서만 표시되는 backdrop */}
      {state.isPreviewOpen && (
        <button
          type="button"
          className="bg-background-dimmer fixed inset-0 z-30 xl:hidden"
          onClick={actions.onClosePreview}
          aria-label="실시간 미리보기 닫기"
        />
      )}

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
