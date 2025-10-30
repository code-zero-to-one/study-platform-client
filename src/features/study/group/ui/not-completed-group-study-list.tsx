import MyStudyInfoCard from '@/features/my-page/ui/my-study-info-card';
import { MemberStudyItem } from '../api/group-study-types';

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY';
}

interface NotCompletedGroupStudyListProps {
  studyList: MemberGroupStudyList[];
}

export default function NotCompletedGroupStudyList({
  studyList,
}: NotCompletedGroupStudyListProps) {
  return (
    <>
      {studyList.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-300">
          {studyList.map((study) => (
            <MyStudyInfoCard key={study.studyId} {...study} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <span className="font-designer-20b text-text-default">
            참여하는 스터디가 없습니다.
          </span>
          <span className="font-designer-15r text-text-subtlest">
            원하는 스터디를 찾아보세요!
          </span>
        </div>
      )}
    </>
  );
}
