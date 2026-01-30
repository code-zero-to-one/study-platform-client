import { GetMyStudyHistoryParams } from '@/features/study/one-to-one/history/api/get-my-study-history';
import { getMyStudyHistoryServer } from '@/features/study/one-to-one/history/api/get-my-study-history.server';
import StudyHistoryTabClient from './study-history-tab-client';

export default async function StudyHistoryTab() {
  const initialParams: GetMyStudyHistoryParams = {
    page: 0,
    size: 15,
    sort: 'createdAt,desc',
  };

  const initialData = await getMyStudyHistoryServer(initialParams);

  return (
    <StudyHistoryTabClient
      initialData={initialData}
      initialParams={initialParams}
    />
  );
}
