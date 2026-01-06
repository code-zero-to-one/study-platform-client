import Image from 'next/image';
import React from 'react';

export default function PostNotFound() {
  return (
    <div className="bg-background-alternative flex h-[640px]">
      <div className="m-auto flex flex-col items-center">
        <Image
          src="/images/post_not_found.png"
          alt="not_found"
          width={200}
          height={200}
        />

        <div className="flex flex-col gap-200 text-center">
          <div className="font-designer-20b">
            아직 등록된 공지가 없습니다.
            <br />
            리더가 <span className="text-text-brand">새 공지</span>를 올리면
            이곳에서 확인할 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
