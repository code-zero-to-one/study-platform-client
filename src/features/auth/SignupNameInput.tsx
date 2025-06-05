export default function SignupNameInput({ name, setName, error }: { name: string, setName: (name: string) => void, error: string }) {
    return (
      <>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="최예림"
          className={`border rounded px-4 py-3 w-full text-lg mt-2 ${error ? "border-pink-400" : "border-gray-200"}`}
        />
        <div className={`text-xs w-full text-left mt-1 ${error ? "text-pink-500" : "text-gray-400"}`}>
          {error ? "이름에는 숫자나 특수문자를 사용할 수 없습니다." : "닉네임이 아닌 실명을 입력해주세요. (예: 홍길동 )"}
        </div>
      </>
    );
  }