import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PencilIcon } from 'lucide-react';
import Image from 'next/image';

export default function SignupImageSelector({
  image,
  setImage,
  fileInputRef,
  handleImageChange,
}: {
  image: string;
  setImage: (image: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const setDefaultImage = () => setImage('/profile-default.svg');
  const openFileDialog = () => fileInputRef.current?.click();

  return (
    <div className="relative">
      <Image
        src={image}
        alt="프로필"
        className="relative h-28 w-28 rounded-full border-2 border-pink-200 object-cover"
      />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="absolute right-0 bottom-0 rounded-full border bg-white p-2 shadow hover:bg-gray-100"
            aria-label="프로필 이미지 변경"
          >
            <PencilIcon className="h-5 w-5 text-gray-600" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          sideOffset={8}
          className="z-50 min-w-[120px] rounded border bg-white p-1 shadow-lg"
        >
          <DropdownMenu.Item
            className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
            onSelect={setDefaultImage}
          >
            기본 이미지
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
            onSelect={openFileDialog}
          >
            앨범에서 선택
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </div>
  );
}
