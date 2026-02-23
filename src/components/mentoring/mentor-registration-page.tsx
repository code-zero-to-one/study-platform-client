'use client';

import MentorRegistrationPageView from '@/components/mentoring/mentor-registration-page-view';
import { useMentorRegistrationController } from '@/features/mentoring/model/use-mentor-registration-controller';

export default function MentorRegistrationPage() {
  const controller = useMentorRegistrationController();

  return <MentorRegistrationPageView controller={controller} />;
}
