import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from '@/features/auth/ui/login-modal';
import Button from '@/shared/ui/button';
import LandingForm from '@/widgets/landing/form';
import backgroundImg from '../../public/images/landing_page.png';

export const metadata: Metadata = {
  title: 'ZERO-ONE',
  description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼, ZERO-ONE',
};

export default async function Landing() {
  return (
    <div
      className="bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImg.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '9972px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div className="absolute top-[5.5%] left-[50%] flex translate-x-[-50%] justify-center">
        <LoginModal
          openTrigger={
            <Button color="primary" className="w-[190px] py-[12px] text-[20px]">
              제로원 시작하기
            </Button>
          }
        />
      </div>
      <div className="absolute right-[240px] bottom-[825px]">
        <LandingForm />
      </div>
      <div className="absolute bottom-[128px] left-[50%] flex translate-x-[-50%] items-center gap-[24px]">
        <Link
          href="https://www.threads.net/@code_zero_to_one"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/icons/thread.svg" alt="thread" width={40} height={40} />
        </Link>
        <Link
          href="https://www.instagram.com/code_zero_to_one/"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src="/icons/instagram.svg"
            alt="instagram"
            width={40}
            height={40}
          />
        </Link>
        <Link
          href="https://www.youtube.com/@코드제로투원"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src="/icons/youtube.svg"
            alt="youtube"
            width={40}
            height={40}
          />
        </Link>
      </div>
    </div>
  );
}
