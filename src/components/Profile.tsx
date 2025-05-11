export default function Profile() {
  return (
    <div className="flex items-center justify-between self-stretch bg-blue-500">
      <div className="flex w-[327px] flex-col items-start gap-[6px]">
        <div className="text-blue text-2xl leading-9 font-bold">신채호</div>
        <div className="self-stretch text-sm leading-[22px] font-normal text-[#252B37]">
          Title
        </div>
      </div>
      <div>ProfileImage</div>
    </div>
  );
}
