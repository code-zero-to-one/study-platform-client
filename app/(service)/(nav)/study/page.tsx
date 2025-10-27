import GroupStudyList from '@/features/study/group/ui/group-study-list';
import OpenGroupStudyModal from '@/features/study/group/ui/open-group-modal';
import IconPlus from '@/shared/icons/plus.svg';
import Button from '@/shared/ui/button';
import Sidebar from '@/widgets/home/sidebar';

export default function Study() {
  // 스터디 개설 후 스터디그룹리스트 refetch 필요
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
        <GroupStudyList />
      </div>
      <Sidebar />
    </div>
  );
}
