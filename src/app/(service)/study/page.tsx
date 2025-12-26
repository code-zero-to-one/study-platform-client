import { Metadata } from 'next';
import Button from '@/components/ui/button';
import GroupStudyFormModal from '@/features/study/group/ui/group-study-form-modal';
import GroupStudyList from '@/features/study/group/ui/group-study-list';
import IconPlus from '@/shared/icons/plus.svg';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
import { getServerCookie } from '@/utils/server-cookie';
import Sidebar from '@/widgets/home/sidebar';

export const metadata: Metadata = generateSEOMetadata({
  title: '스터디 둘러보기',
  description:
    '다양한 그룹 스터디를 찾아보고, 새로운 스터디를 개설해보세요. ZERO-ONE에서 함께할 스터디 동료를 만나세요.',
  path: '/study',
  keywords: [
    '그룹 스터디',
    '스터디 모집',
    '스터디 찾기',
    '협업 스터디',
    '스터디 커뮤니티',
  ],
  canonicalUrl: 'https://www.zeroone.it.kr/study',
});

export default async function Study() {
  const memberIdStr = await getServerCookie('memberId');
  const isLoggedIn = !!memberIdStr;

  return (
    <div className="gap-600 py-600 flex w-full">
      <div className="gap-500 flex flex-1 flex-col">
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
