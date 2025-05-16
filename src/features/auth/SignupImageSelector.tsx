import { PencilIcon } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function SignupImageSelector({ image, setImage, fileInputRef, handleImageChange }: { image: string, setImage: (image: string) => void, fileInputRef: React.RefObject<HTMLInputElement>, handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  const setDefaultImage = () => setImage("/profile-default.svg");
  const openFileDialog = () => fileInputRef.current?.click();

  return (
    <div className="relative">
      <img
        src={image}
        alt="프로필"
        className="relative w-28 h-28 rounded-full border-2 border-pink-200 object-cover"
      />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="absolute bottom-0 right-0 bg-white border rounded-full p-2 shadow hover:bg-gray-100"
            aria-label="프로필 이미지 변경"
          >
            <PencilIcon className="w-5 h-5 text-gray-600" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          sideOffset={8}
          className="bg-white rounded shadow-lg border p-1 min-w-[120px] z-50"
        >
          <DropdownMenu.Item
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onSelect={setDefaultImage}
          >
            기본 이미지
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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