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
      <div className="relative h-[112px] w-[112px] overflow-hidden rounded-full">
        <Image src={image} alt="프로필" fill className="object-cover" />
        <img src={image} alt="next최적화안쓴프로필" className='object-covoer' />
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="bg-background-dimmer hover:bg-background-accent-gray-strong border-border-default absolute right-0 bottom-0 rounded-full border-2 p-75 shadow"
            aria-label="프로필 이미지 변경"
          >
            <PencilIcon className="text-icon-inverse h-200 w-200" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          side="right"
          sideOffset={8}
          className="rounded-50 border-border-default font-designer-14m text-text-subtle z-50 min-w-[120px] border bg-white p-50 shadow-lg"
        >
          <DropdownMenu.Item
            className="hover:text-text-default hover:font-designer-14b cursor-pointer px-50 py-[2px] hover:bg-gray-100"
            onSelect={setDefaultImage}
          >
            기본 이미지
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="hover:text-text-default hover:font-designer-14b cursor-pointer px-50 py-[2px] hover:bg-gray-100"
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
