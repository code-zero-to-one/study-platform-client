import { Metadata } from 'next';
import Header from '@/widgets/landing/header';
import backgroundImg from '../../public/images/landing_page.png';
import Button from '@/shared/ui/button';
import LandingForm from '@/widgets/landing/form';

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
      <Header />
      <div className="absolute top-[5.5%] left-[50%] flex translate-x-[-50%] justify-center">
        <Button color="primary" className="w-[190px] py-[12px] text-[20px]">
          제로원 시작하기
        </Button>
      </div>
      <div className="absolute right-[240px] bottom-[825px]">
        <LandingForm />
      </div>
    </div>
  );
}
