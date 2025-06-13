'use client'

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { FormField } from '../../../widgets/my-page/Profile-edit-card';
import { UpdateUserProfileRequest } from '../api/types';
import { updateUserProfile } from '../api/update-user-profile';

interface Props {
  onSubmit: (formData: UpdateUserProfileRequest) => void;
}

const skillOptions = [
  { label: 'HTML/CSS', value: 'HTML/CSS' },
  { label: 'JavaScript', value: 'JavaScript' },
  { label: 'React', value: 'React' },
  { label: 'Django', value: 'Django' },
  { label: 'MySQL', value: 'MySQL' },
];



export default function ProfileEditModal({ onSubmit }: Props) {
  const memberId = 1;

  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [blogOrSnsLink, setBlogOrSnsLink] = useState('');
  const [mbti, setMbti] = useState('');
  const [simpleIntroduction, setSimpleIntroduction] = useState('');
  const [interests, setInterests] = useState<string[]>([]);


  const handleSubmit = async () => {
    const formData: UpdateUserProfileRequest = {
      name,
      tel,
      githubLink,
      blogOrSnsLink,
      simpleIntroduction,
      mbti,
      birthDate: '1997-01-01', // 임시 생략
      interests,
      hobbies: [],  // 임시 생략
    };

    try {
      await updateUserProfile(memberId, formData);
      console.log('수정 완료!');
    } catch (err) {
      console.error('수정 실패:', err);
    }
  };


  return (
    <Modal.Provider>
      <Modal.Trigger className="w-full rounded-100 bg-fill-brand-default-default px-150 py-100 font-designer-16b text-text-inverse">
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
            <div className="flex flex-col gap-300">
              <div className="flex gap-500">
                <div className="flex w-[112px] font-designer-14b">
                  이미지 설정
                </div>
                <div className="h-[110px] w-[110px] rounded-full bg-red-100" />
              </div>
              <FormField
                label="이름 확인" type="text"
                description="소셜 계정에서 불러온 닉네임 대신 이름을 입력해 주세요."
                value={name} onChange={setName}
                required
              />
              <FormField
                label="연락처" type="text"
                description="스터디 진행을 위한 연락 가능한 정보를 입력해 주세요."
                value={tel} onChange={setTel}
                required
              />
              <FormField
                label="Github" type="text"
                description="스터디 진행을 위한 연락 가능한 정보를 입력해 주세요."
                value={githubLink} onChange={setGithubLink}
              />
              <FormField
                label="MBTI" type="text"
                description="자신의 성격 유형을 입력해 주세요."
                value={mbti} onChange={setMbti}
              />
              <FormField
                label="관심사" type="dropdown"
                value={interests} onChange={setInterests}
                options={skillOptions}
              />
              <FormField
                label="한마디 소개" type="textarea"
                description="스터디 진행을 위한 연락 가능한 정보를 입력해 주세요."
                value={simpleIntroduction} onChange={setSimpleIntroduction}
              />
              <FormField
                label="블로그/SNS 등 링크" type="text"
                description="본인의 활동을 확인할 수 있는 외부 링크가 있다면 입력해 주세요."
                value={blogOrSnsLink} onChange={setBlogOrSnsLink}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <div className="flex w-full justify-center gap-[8px]">
                <Button color="secondary" className="w-[140px] cursor-pointer">
                  취소
                </Button>
                <Button className="w-[140px] cursor-pointer" onClick={handleSubmit}>
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
