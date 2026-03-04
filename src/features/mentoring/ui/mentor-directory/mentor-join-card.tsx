import { UserRoundPlus } from 'lucide-react';
import { MENTORING_LIST_LABELS } from '@/features/mentoring/const/mentoring-list-labels';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import PhoneVerificationModal from '@/components/common/modals/phone-verification-modal';

interface MentorJoinCardProps {
  memberId: number | undefined;
  shouldRenderVerificationModal: boolean;
  isVerificationModalOpen: boolean;
  isJoinButtonDisabled: boolean;
  onClickJoin: () => void;
  onVerificationModalOpenChange: (nextOpen: boolean) => void;
  onVerificationComplete: (phoneNumber: string) => void;
}

export default function MentorJoinCard({
  memberId,
  shouldRenderVerificationModal,
  isVerificationModalOpen,
  isJoinButtonDisabled,
  onClickJoin,
  onVerificationModalOpenChange,
  onVerificationComplete,
}: MentorJoinCardProps) {
  return (
    <>
      <article
        className={cn(
          'hover:shadow-2 hover:border-border-brand rounded-150',
          'border-border-subtle bg-background-default overflow-hidden border',
          'h-full transition-all',
        )}
      >
        <div className="from-background-neutral-strong to-background-accent-blue-strong relative flex h-[180px] flex-col items-center justify-center gap-100 bg-linear-to-br">
          <UserRoundPlus className="text-text-inverse/70 h-[40px] w-[40px]" />
          <p className="font-designer-13b text-text-inverse/60">
            {MENTORING_LIST_LABELS.recruitCaption}
          </p>
        </div>

        <div className="flex h-[calc(100%-180px)] flex-col justify-center px-300 py-200">
          <h3 className="font-designer-20b text-text-default mb-75">
            {MENTORING_LIST_LABELS.joinTitle}
          </h3>

          <p className="font-designer-16r text-text-subtle mb-150 line-clamp-2">
            {MENTORING_LIST_LABELS.joinDescription}
          </p>

          <p className="font-designer-13r text-text-subtle mb-150">
            {MENTORING_LIST_LABELS.joinMeta}
          </p>

          <div className="mb-200 grid grid-cols-2 gap-x-300 gap-y-100">
            {MENTORING_LIST_LABELS.joinMethods.map((label) => (
              <span
                key={label}
                className="font-designer-16r text-text-subtle inline-flex items-center"
              >
                {label}
              </span>
            ))}
          </div>

          <Button
            color="primary"
            size="medium"
            className="mt-200 w-full"
            onClick={onClickJoin}
            disabled={isJoinButtonDisabled}
          >
            {MENTORING_LIST_LABELS.joinCta}
          </Button>
        </div>
      </article>
      {shouldRenderVerificationModal && memberId && (
        <PhoneVerificationModal
          open={isVerificationModalOpen}
          onOpenChange={onVerificationModalOpenChange}
          onVerificationComplete={onVerificationComplete}
          memberId={memberId}
        />
      )}
    </>
  );
}
