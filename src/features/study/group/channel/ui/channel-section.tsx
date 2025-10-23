import Comments from './comment';
import Post from './post';
import { usePostQuery } from '../model/use-channel-query';

interface ChannelSectionProps {
  groupStudyId: number;
}

export default function ChannelSection({ groupStudyId }: ChannelSectionProps) {
  const { data, isLoading } = usePostQuery(groupStudyId);

  console.log('groupStudyId', groupStudyId);
  console.log('data', data);

  if (isLoading) {
    return;
  }

  return (
    <div className="flex flex-col gap-500">
      <Post data={data!} />
      <div>
        <Comments groupStudyId={groupStudyId} />
      </div>
    </div>
  );
}
