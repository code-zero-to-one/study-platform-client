import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import { Configuration } from '@/api/openapi/configuration';
import { GroupStudyFullResponseDto } from '@/api/openapi/models';
import Button from '@/components/ui/button';
import GroupStudyFormModal from '@/features/study/group/ui/group-study-form-modal';
import GroupStudyList from '@/features/study/group/ui/group-study-list';
import IconPlus from '@/shared/icons/plus.svg';
import { getServerCookie } from '@/utils/server-cookie';
import Sidebar from '@/widgets/home/sidebar';

interface GroupStudyResponse {
  content?: GroupStudyFullResponseDto;
}

export default async function Study() {
  const memberIdStr = await getServerCookie('memberId');
  const isLoggedIn = !!memberIdStr;

  // const config = new Configuration({
  //   basePath: process.env.NEXT_PUBLIC_API_BASE_URL,
  // });

  // const groupStudyApi = new GroupStudyManagementApi(config, config.basePath);

  // const response = await groupStudyApi.getGroupStudies();
  // const groupStudy = (response.data as GroupStudyResponse)?.content;

  // console.log('groupStudy', groupStudy);

  return (
    <div className="flex w-full gap-600 py-600">
      <div className="flex flex-1 flex-col gap-500">
        <div className="flex justify-between">
          <span className="font-designer-28b text-[#181D27]">
            스터디 둘러보기
          </span>
          <GroupStudyFormModal
            mode="create"
            trigger={
              <Button
                color="primary"
                size="medium"
                iconPosition="left"
                icon={<IconPlus />}
              >
                스터디 개설하기
              </Button>
            }
          />
        </div>
        <GroupStudyList isLoggedIn={isLoggedIn} />
      </div>
      {isLoggedIn && <Sidebar />}
    </div>
  );
}
