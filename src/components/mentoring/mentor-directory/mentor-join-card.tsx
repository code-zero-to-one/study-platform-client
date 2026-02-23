import { UserRoundPlus } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import {
  MENTORING_LIST_LABELS,
} from '@/features/mentoring/const/mentoring-list-labels';
import PhoneVerificationModal from '@/features/phone-verification/ui/phone-verification-modal';

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
          'self-start transition-all',
        )}
      >
        <div className="from-background-neutral-strong to-background-accent-blue-strong relative flex h-[180px] flex-col items-center justify-center gap-100 bg-linear-to-br">
          <UserRoundPlus className="text-text-inverse/70 h-[40px] w-[40px]" />
          <p className="font-designer-13b text-text-inverse/60">
            {MENTORING_LIST_LABELS.recruitCaption}
          </p>
        </div>

        <div className="px-300 py-200">
          <div className="mb-100">
            <span className="font-designer-12b text-text-brand rounded-500 bg-fill-brand-subtle-default inline-flex items-center px-100 py-50">
              {MENTORING_LIST_LABELS.joinBadge}
            </span>
          </div>

          <h3 className="font-designer-20b text-text-default mb-75">
            {MENTORING_LIST_LABELS.joinTitle}
          </h3>

          <p className="font-designer-16r text-text-subtle mb-150 line-clamp-2">
            {MENTORING_LIST_LABELS.joinDescription}
          </p>

          <p className="font-designer-13r text-text-subtle mb-150">
            {MENTORING_LIST_LABELS.joinMeta}
          </p>

          <div className="mb-200 flex flex-wrap gap-x-300 gap-y-100">
            {MENTORING_LIST_LABELS.joinMethods.map((label) => (
              <span key={label} className="font-designer-16r text-text-subtle">
                {label}
              </span>
            ))}
          </div>

          <Button
            color="primary"
            size="medium"
            className="w-full"
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
