import GroupStudyList from '@/features/study/group/ui/group-study-list';
import OpenGroupStudyModal from '@/features/study/group/ui/open-group-modal';
import IconPlus from '@/shared/icons/plus.svg';
import { getServerCookie } from '@/shared/lib/server-cookie';
import Button from '@/shared/ui/button';
import Sidebar from '@/widgets/home/sidebar';

export default async function Study() {
  const memberIdStr = await getServerCookie('memberId');
  const isLoggedIn = !!memberIdStr;

  return (
    <div className="flex w-full gap-600 py-600">
      <div className="flex flex-1 flex-col gap-500">
        <div className="flex justify-between">
          <span className="font-designer-28b text-[#181D27]">
            스터디 둘러보기
          </span>
          <OpenGroupStudyModal
            trigger={
              <Button
                color="primary"
                size="large"
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
