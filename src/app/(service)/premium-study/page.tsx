import { Plus } from 'lucide-react';
import { createApiServerInstance } from '@/api/client/open-api-instance';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import Button from '@/components/ui/button';
import GroupStudyFormModal from '@/features/study/group/ui/group-study-form-modal';
import PremiumStudyList from '@/features/study/premium/ui/premium-study-list';
import PremiumStudyPagination from '@/features/study/premium/ui/premium-study-pagination';

interface PremiumStudyPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PremiumStudyPage({
  searchParams,
}: PremiumStudyPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = 9;

  const groupStudyApi = createApiServerInstance(GroupStudyManagementApi);

  const { data } = await groupStudyApi.getGroupStudies(
    'PREMIUM_STUDY',
    currentPage,
    pageSize,
  );

  console.log('data', data);

  return (
    <div className="mx-auto max-w-[1200px] px-400 py-600">
      {/* 헤더 */}
      <div className="mb-400 flex items-center justify-between">
        <h1 className="font-designer-24b text-text-default">
          멘토스터디 둘러보기
        </h1>
        <GroupStudyFormModal
          mode="create"
          classification="PREMIUM_STUDY"
          trigger={
            <Button
              color="primary"
              size="small"
              icon={<Plus className="h-[16px] w-[16px]" />}
              iconPosition="left"
            >
              스터디 개설하기
            </Button>
          }
        />
      </div>

      {/* 스터디 카드 그리드 */}
      <PremiumStudyList studies={data.content.content} />

      {/* 페이지네이션 */}
      {data.totalPages > 1 && (
        <PremiumStudyPagination
          currentPage={currentPage}
          totalPages={data.totalPages}
        />
      )}
    </div>
  );
}
