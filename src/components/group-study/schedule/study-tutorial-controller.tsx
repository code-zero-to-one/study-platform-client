'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import StudyCard from '@/components/group-study/schedule/study-card';
import {
  STUDY_TUTORIAL_STEPS,
  getStudyTutorialScenario,
} from '@/config/study-tutorial-steps';
import { TutorialOverlay } from '@/features/study/one-to-one/schedule/ui/tutorial';

const STUDY_TUTORIAL_KEY = 'study';

export default function StudyTutorialController() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorialActive = searchParams.get('tutorial') === STUDY_TUTORIAL_KEY;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (tutorialActive) {
      setStepIndex(0);
    }
  }, [tutorialActive]);

  const steps = STUDY_TUTORIAL_STEPS;

  const scenario = tutorialActive ? getStudyTutorialScenario(stepIndex) : null;

  const handleCloseTutorial = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tutorial');
    router.replace(`/home?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <StudyCard
        tutorialMode={tutorialActive}
        forcedStatus={scenario?.forcedStatus}
        forcedRole={scenario?.forcedRole}
        forceOpenReadyModal={scenario?.forceOpenReadyModal}
        forceOpenDoneModal={scenario?.forceOpenDoneModal}
      />
      <TutorialOverlay
        open={tutorialActive}
        steps={steps}
        activeIndex={stepIndex}
        onStepChange={setStepIndex}
        onClose={handleCloseTutorial}
        onFinish={handleCloseTutorial}
      />
    </>
  );
}
