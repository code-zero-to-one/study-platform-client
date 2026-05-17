import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import GroupStudyThumbnailInput from '@/components/group-study/forms/group-study-thumbnail-input';

const meta: Meta<typeof GroupStudyThumbnailInput> = {
  component: GroupStudyThumbnailInput,
  argTypes: {
    image: {
      description:
        '이미지 URL 상태 입니다. (undefined인 경우 이미지가 없는 상태를 의미합니다.)',
    },
    onChangeImage: {
      description:
        '이미지 URL 상태를 변경하는 함수입니다. 파라미터는 이미지 URL 또는 undefined 입니다. (undefined인 경우 이미지가 제거된 상태를 의미합니다.)',
    },
  },
};

export default meta;

type Story = StoryObj<typeof GroupStudyThumbnailInput>;

export const Default: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);
    const image = file ? URL.createObjectURL(file) : undefined;

    return <GroupStudyThumbnailInput image={image} onChangeImage={setFile} />;
  },
};
