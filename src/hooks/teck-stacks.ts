import { useQuery } from '@tanstack/react-query';
import { getTechStacks } from '@/api/teck-stacks';
import { useGetProfile } from './profile';

export const useGetTechStacks = () => {
  return useQuery({ queryKey: ['tech-stacks'], queryFn: getTechStacks });
};

export const useGetSelectedTechStackDisplays = ({
  memberId,
}: {
  memberId: string;
}) => {
  const { data: techStacks } = useGetTechStacks();
  const { data: profile } = useGetProfile({ memberId });

  const techStackNames = techStacks
    ?.map((techStack) =>
      profile?.memberInfo.techStacks.includes(techStack.teckStackId)
        ? techStack.techStackName
        : null,
    )
    .filter(Boolean);

  return techStackNames;
};
