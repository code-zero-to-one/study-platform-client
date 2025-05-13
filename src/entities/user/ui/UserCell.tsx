import Image from 'next/image';
import DefaultUserIcon from "public/icons/DefaultUser.svg";

interface UserCellProps {
   name: string;
   img?: string;
   size?: number;
}

export default function UserCell({ name, img, size = 32 }: UserCellProps) {
   return (
      <div className="flex items-center gap-150">
         {img ? (
            <Image
               src={img}
               alt={name}
               width={size}
               height={size}
               className="rounded-full"
            />
         ) : (
            <DefaultUserIcon width={size} height={size} />
         )}
         <span className='font-designer-14m text-text-default'>{name}</span>
      </div>
   );
}
