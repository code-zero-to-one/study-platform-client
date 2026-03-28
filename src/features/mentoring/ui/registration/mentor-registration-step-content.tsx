'use client';

import MentorRegistrationBasicInformationStep from '@/features/mentoring/ui/registration/step-content/mentor-registration-basic-information-step';
import MentorRegistrationDescriptionStep from '@/features/mentoring/ui/registration/step-content/mentor-registration-description-step';
import MentorRegistrationMentorInformationStep from '@/features/mentoring/ui/registration/step-content/mentor-registration-mentor-information-step';
import MentorRegistrationPricingStep from '@/features/mentoring/ui/registration/step-content/mentor-registration-pricing-step';
import MentorRegistrationScheduleStep from '@/features/mentoring/ui/registration/step-content/mentor-registration-schedule-step';
import MentorRegistrationSettlementStep from '@/features/mentoring/ui/registration/step-content/mentor-registration-settlement-step';
import type { MentorRegistrationStepContentProps } from '@/features/mentoring/ui/registration/step-content/mentor-registration-step-content.types';

export default function MentorRegistrationStepContent({
  currentStepId,
  ...props
}: MentorRegistrationStepContentProps) {
  if (currentStepId === 'basicInformation') {
    return <MentorRegistrationBasicInformationStep {...props} />;
  }

  if (currentStepId === 'mentorInformation') {
    return <MentorRegistrationMentorInformationStep {...props} />;
  }

  if (currentStepId === 'pricingAndTime') {
    return <MentorRegistrationPricingStep {...props} />;
  }

  if (currentStepId === 'mentorDescription') {
    return <MentorRegistrationDescriptionStep {...props} />;
  }

  if (currentStepId === 'schedule') {
    return <MentorRegistrationScheduleStep {...props} />;
  }

  if (currentStepId === 'settlement') {
    return <MentorRegistrationSettlementStep {...props} />;
  }

  const unreachableStepId: never = currentStepId;

  return unreachableStepId;
}
