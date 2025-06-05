'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/shared/shadcn/ui/avatar'
import DefaultUserIcon from 'public/icons/DefaultUser.svg'

interface UserAvatarProps {
   image?: string
   alt?: string
   size?: number
}

export default function UserAvatar({ image, alt = 'user image', size = 32 }: UserAvatarProps) {
   return (
      <Avatar style={{ width: size, height: size }}>
         {image ? (
            <AvatarImage src={image} alt={alt} />
         ) : (
            <AvatarFallback>
               <DefaultUserIcon width={size} height={size} />
            </AvatarFallback>
         )}
      </Avatar>
   )
}
