import PageContainer from '@/components/common/layout/page-container';
import Button from '@/components/common/ui/button';
import GroupStudyNoticeModal from '@/components/modals/group-notice-modal';

interface CreatePostProps {
  groupStudyId: number;
}

export default function CreatePost({ groupStudyId }: CreatePostProps) {
  return (
    <PageContainer className="bg-background-alternative rounded-100 my-500 flex h-[640px] items-center justify-center border-2 border-dashed border-[#D5D7DA]">
      <div className="flex flex-col gap-200 text-center">
        <p className="font-designer-20b">스터디에 대한 공지를 남겨주세요</p>
        <div className="font-designer-14r">
          스터디 일정, 과제 안내, 공지사항 등을 자유롭게 공유할 수 있습니다.
          <br />
          모든 멤버가 한눈에 확인할 수 있도록 중요한 내용을 정리해주세요.
        </div>

        <GroupStudyNoticeModal
          trigger={
            <Button size="medium" className="mt-300 h-600 w-[88px] self-center">
              작성하기
            </Button>
          }
          groupStudyId={groupStudyId}
        />
      </div>
    </PageContainer>
  );
}
