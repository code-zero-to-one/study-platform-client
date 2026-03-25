'use client';

import { useMentorRegistrationController } from '@/features/mentoring/model/registration/use-mentor-registration-controller';
import MentorRegistrationPageView from '@/features/mentoring/ui/registration/shell/mentor-registration-page-view';

export default function MentorRegistrationPage() {
  const controller = useMentorRegistrationController();

  return <MentorRegistrationPageView controller={controller} />;
}
