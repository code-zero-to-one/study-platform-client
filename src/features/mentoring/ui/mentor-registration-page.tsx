'use client';

import { useMentorRegistrationController } from '@/features/mentoring/model/use-mentor-registration-controller';
import MentorRegistrationPageView from '@/features/mentoring/ui/mentor-registration-page-view';

export default function MentorRegistrationPage() {
  const controller = useMentorRegistrationController();

  return <MentorRegistrationPageView controller={controller} />;
}
