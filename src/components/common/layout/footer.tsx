import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-300 bg-gray-100">
      <div className="mx-auto flex max-w-page items-start justify-between px-600 py-800">
        <div className="flex flex-col gap-300">
          <Image
            src="/icons/logo_title.svg"
            alt="ZERO ONE IT"
            width={180}
            height={25}
          />
          <div className="flex gap-400 font-designer-14r text-gray-800">
            <span>이용약관</span>
            <span className="font-designer-14b">개인정보처리방침</span>
            <span>1:1 문의하기</span>
          </div>
          <div className="flex flex-col gap-75 font-designer-14r text-gray-800">
            <div className="flex gap-400">
              <span>대표이사 : 조성진</span>
              <span>상호명: 정성컴퍼니</span>
              <span>사업자등록번호 : 798-31-01774</span>
            </div>
            <div className="flex gap-400">
              <span>호스팅 제공자 : ZERO-ONE</span>
              <span>주소 : 서울시 강남구 역삼동 620-17 203호</span>
            </div>
            <div className="flex gap-400">
              <span>이메일 : code0to1@gmail.com</span>
              <span>개인정보보호 책임자 : 윤동주</span>
            </div>
          </div>
          <p className="font-designer-14b text-gray-800">
            © 2024 ZERO-ONE. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-300">
          {[
            { src: '/icons/instagram.svg', alt: 'Instagram' },
            { src: '/icons/youtube.svg', alt: 'YouTube' },
            { src: '/kakao-icon.svg', alt: 'KakaoTalk' },
            { src: '/icons/thread.svg', alt: 'Threads' },
          ].map((icon) => (
            <div
              key={icon.alt}
              className="flex size-875 items-center justify-center rounded-full bg-background-default"
            >
              <Image src={icon.src} alt={icon.alt} width={32} height={32} />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
