import { BaseInput } from '@/shared/ui/input';

export default function SignupNameInput({
  name,
  setName,
  error,
}: {
  name: string;
  setName: (name: string) => void;
  error: string;
}) {
  return (
    <div className="flex w-full flex-col gap-75">
      <BaseInput
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="최예림"
        className={`w-full`}
        color={error ? 'error' : 'default'}
      />
      <div
        className={`font-designer-13r ${error ? 'text-text-error' : 'text-text-subtlest'}`}
      >
        {error
          ? '이름에는 숫자나 특수문자를 사용할 수 없습니다. 두 글자 이상 입력해주세요.'
          : '닉네임이 아닌 실명을 입력해주세요. (예: 홍길동 )'}
      </div>
    </div>
  );
}
