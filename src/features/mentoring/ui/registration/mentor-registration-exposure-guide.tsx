'use client';

import { useWatch } from 'react-hook-form';
import {
  type MentorRequiredStepCompletion,
  getMentorPublicExposureReadyState,
  isMentorScheduleStepComplete,
} from '@/features/mentoring/model/mentor-public-readiness-policy';
import PublicExposureGuideCard from '@/features/mentoring/ui/registration/mentor-public-exposure-guide-card';
import { normalizeMentorMarkdownContent } from '@/types/mentoring/markdown';
import {
  MENTOR_REGISTRATION_STEP_IDS,
  type MentorRegistrationFormProps,
} from '@/types/mentoring/registration-view';
import { WEEKDAY_KEYS } from '@/types/mentoring/settings';

interface MentorRegistrationExposureGuideProps {
  form: MentorRegistrationFormProps['form'];
  hasSelectedSkillTags: boolean;
  isMentorInformationSelectionReady: boolean;
}

export default function MentorRegistrationExposureGuide({
  form,
  hasSelectedSkillTags,
  isMentorInformationSelectionReady,
}: MentorRegistrationExposureGuideProps) {
  const { control } = form;
  const mentoringTitle = useWatch({
    control,
    name: 'mentoringTitle',
    defaultValue: '',
  });
  const appealLine = useWatch({
    control,
    name: 'appealLine',
    defaultValue: '',
  });
  const jobGroup = useWatch({
    control,
    name: 'jobGroup',
    defaultValue: '',
  });
  const jobTitle = useWatch({
    control,
    name: 'jobTitle',
    defaultValue: '',
  });
  const careerYears = useWatch({
    control,
    name: 'careerYears',
    defaultValue: '',
  });
  const detailedDescription = useWatch({
    control,
    name: 'detailedDescription',
    defaultValue: '',
  });
  const listVisible =
    useWatch({
      control,
      name: 'listVisible',
    }) === true;
  const noteEnabled = useWatch({
    control,
    name: 'noteEnabled',
  });
  const notePrice = useWatch({
    control,
    name: 'notePrice',
  });
  const simpleEnabled = useWatch({
    control,
    name: 'simpleEnabled',
  });
  const simplePrice = useWatch({
    control,
    name: 'simplePrice',
  });
  const deepEnabled = useWatch({
    control,
    name: 'deepEnabled',
  });
  const deepPrice = useWatch({
    control,
    name: 'deepPrice',
  });
  const offlineEnabled = useWatch({
    control,
    name: 'offlineEnabled',
  });
  const offlinePrice = useWatch({
    control,
    name: 'offlinePrice',
  });
  const schedule = useWatch({
    control,
    name: 'schedule',
  });

  const hasAnyEnabledMethod =
    noteEnabled === true ||
    simpleEnabled === true ||
    deepEnabled === true ||
    offlineEnabled === true;
  const hasScheduleRequiredMethodEnabled =
    simpleEnabled === true || deepEnabled === true || offlineEnabled === true;
  const hasAnyScheduleSlots = WEEKDAY_KEYS.some(
    (day) => (schedule?.weekly?.[day] ?? []).length > 0,
  );
  const requiredStepCompletion = {
    [MENTOR_REGISTRATION_STEP_IDS.basicInformation]:
      mentoringTitle.trim().length > 0 && appealLine.trim().length > 0,
    [MENTOR_REGISTRATION_STEP_IDS.mentorInformation]:
      jobGroup.trim().length > 0 &&
      jobTitle.trim().length > 0 &&
      careerYears.trim().length > 0 &&
      hasSelectedSkillTags &&
      isMentorInformationSelectionReady,
    [MENTOR_REGISTRATION_STEP_IDS.mentorDescription]:
      normalizeMentorMarkdownContent(detailedDescription).length > 0,
    [MENTOR_REGISTRATION_STEP_IDS.pricingAndTime]:
      (noteEnabled === true &&
        typeof notePrice === 'number' &&
        notePrice > 0) ||
      (simpleEnabled === true &&
        typeof simplePrice === 'number' &&
        simplePrice > 0) ||
      (deepEnabled === true &&
        typeof deepPrice === 'number' &&
        deepPrice > 0) ||
      (offlineEnabled === true &&
        typeof offlinePrice === 'number' &&
        offlinePrice > 0),
    [MENTOR_REGISTRATION_STEP_IDS.schedule]: isMentorScheduleStepComplete({
      hasEnabledMethod: hasAnyEnabledMethod,
      hasScheduleRequiredMethodEnabled,
      hasAnyScheduleSlots,
    }),
    [MENTOR_REGISTRATION_STEP_IDS.settlement]: false,
  } as const satisfies MentorRequiredStepCompletion;
  const exposureReadyState = getMentorPublicExposureReadyState(
    requiredStepCompletion,
  );

  return (
    <PublicExposureGuideCard
      listVisible={listVisible}
      exposureReadyState={exposureReadyState}
    />
  );
}
