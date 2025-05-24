import { XIcon } from 'lucide-react';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import ProfileEditCard from '../../widgets/my-page/Profile-edit-card';
import { useGetProfile, useUpdateProfile } from '@/hooks/profile';
import ProfileEditTextarea from './profile-edit-textarea';
import { useEffect, useState } from 'react';

export default function ProfileEditModal() {
  const { data: profile } = useGetProfile({ memberId: '10000' });
  const { mutate: updateProfile } = useUpdateProfile({ memberId: '10000' });

  const [name, setName] = useState(profile?.memberProfile.name);
  const [tel, setTel] = useState(profile?.memberProfile.tel);
  const [githubLink, setGithubLink] = useState(
    profile?.memberProfile.githubLink.url,
  );
  const [mbti, setMbti] = useState(profile?.memberProfile.mbti);
  const [selfIntroduction, setSelfIntroduction] = useState(
    profile?.memberInfo.selfIntroduction,
  );
  const [blogOrSnsLink, setBlogOrSnsLink] = useState(
    profile?.memberProfile.blogOrSnsLink.url,
  );

  const handleSubmit = () => {
    updateProfile({
      name,
      tel,
      githubLink,
      blogOrSnsLink,
      simpleIntroduction: selfIntroduction,
      mbti,
    });
  };

  useEffect(() => {
    setName(profile?.memberProfile.name);
    setTel(profile?.memberProfile.tel);
    setGithubLink(profile?.memberProfile.githubLink.url);
    setMbti(profile?.memberProfile.mbti);
    setSelfIntroduction(profile?.memberInfo.selfIntroduction);
    setBlogOrSnsLink(profile?.memberProfile.blogOrSnsLink.url);
  }, [profile]);

  return (
    <Modal.Provider>
      <Modal.Trigger className="w-full rounded-[8px] bg-[var(--color-fill-brand-default-default)] px-[8px] py-[12px] text-[16px] text-[var(--color-text-inverse)]">
        내 프로필 수정
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <div className="flex items-center justify-between">
              <Modal.Title>내 프로필 수정</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>
          <Modal.Body>
            {/* 기본 정보 */}
            <div className="flex h-[60vh] flex-col gap-[24px] overflow-y-auto">
              <div className="flex">
                <div className="w-[112px] text-[14px] leading-[22px] font-[700]">
                  이미지 설정
                </div>
                <div className="h-[110px] w-[110px] rounded-full bg-red-100" />
              </div>
              <ProfileEditCard
                title="이름 확인"
                description="소셜 계정에서 불러온 닉네임 대신 이름을 입력해 주세요."
                required
                defaultValue={profile?.memberProfile.name}
                onChange={(value) => setName(value)}
              />
              <ProfileEditCard
                title="연락처"
                description="스터디 진행을 위한 연락 가능한 정보를 입력해 주세요."
                required
                defaultValue={profile?.memberProfile.tel}
                onChange={(value) => setTel(value)}
              />
              <ProfileEditCard
                title="Github"
                description="스터디 진행을 위한 연락 가능한 정보를 입력해 주세요."
                required={false}
                defaultValue={profile?.memberProfile.githubLink.url}
                onChange={(value) => setGithubLink(value)}
              />
              <ProfileEditCard
                title="MBTI"
                description="자신의 성격 유형을 입력해 주세요."
                defaultValue={profile?.memberProfile.mbti}
                onChange={(value) => setMbti(value)}
              />
              <ProfileEditTextarea
                placeholder="입력하세요."
                title="한마디 소개"
                guideText="본인을 간단히 소개하는 한마디를 입력해 주세요."
                maxLength={30}
                defaultValue={profile?.memberInfo.selfIntroduction}
                onChange={(value) => setSelfIntroduction(value)}
              />
              <ProfileEditCard
                title="블로그/SNS 링크"
                description="본인의 활동을 확인할 수 있는 외부 링크가 있다면 입력해 주세요."
                defaultValue={profile?.memberProfile.blogOrSnsLink.url}
                onChange={(value) => setBlogOrSnsLink(value)}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <div className="flex w-full justify-center gap-[8px]">
                <Button color="secondary" className="w-[140px] cursor-pointer">
                  취소
                </Button>
                <Button
                  className="w-[140px] cursor-pointer"
                  onClick={handleSubmit}
                >
                  수정 완료
                </Button>
              </div>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Provider>
  );
}
