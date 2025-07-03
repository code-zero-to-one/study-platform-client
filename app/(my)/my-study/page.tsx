import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getStudyDashboard } from '@/entities/user/api/get-user-profile';
import { getLoginUserId } from '@/shared/lib/get-login-user';
import MyStudyCard from '@/widgets/my-study/my-study-card';

export default async function MyStudy() {
  const memberId = await getLoginUserId();

  if (!memberId) {
    redirect('/login');
  }

  //const dashboard = await getStudyDashboard(memberId);

  return (
    <div className="flex flex-col gap-400">
      <div className="flex flex-col gap-200">
        <div className="flex items-center gap-75">
          <Image src="icons/file_icon.svg" alt="file" width={40} height={40} />
          <div className="font-designer-20b text-text-default">내 활동</div>
        </div>

        <div className="flex gap-200">
          <MyStudyCard title="총 참여" value="데이터 없음" />
          <MyStudyCard title="연속 참여" value="8" unit="주" />
          <MyStudyCard title="완료" value="23" unit="회" />
        </div>

        <div className="flex gap-200">
          <MyStudyCard title="최대 연속 참여" value="8" unit="주" />
          <MyStudyCard title="실패" value="23" unit="회" />
        </div>
      </div>

      <div className="flex flex-col gap-200">
        <div className="flex items-center gap-75">
          <Image src="icons/graph_icon.svg" alt="file" width={32} height={24} />
          <div className="font-designer-20b text-text-default">성장 지표</div>
        </div>

        <div className="flex gap-200">
          <MyStudyCard
            title="스터디 완료율"
            value="173"
            changeIndicator={{ type: 'increase', value: 8.2 }}
          />
          <MyStudyCard title="등급" value="S" unit="등급" />
          <MyStudyCard title="최대 연속 참여" value="8" unit="주" />
        </div>
      </div>
    </div>
  );
}
