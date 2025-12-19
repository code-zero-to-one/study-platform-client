// 공통 스텝헤더
export function StepHeader({ 
    title, 
    subtitle,
    icon: Icon 
  }: { 
    title: React.ReactNode; 
    subtitle: React.ReactNode;
    icon: React.ElementType;
  }) {
    return (
      <div className="mb-400 text-center sm:text-left">
        <div className="inline-flex items-center justify-center w-[48px] h-[48px] rounded-full bg-fill-brand-subtle-default mb-300">
          <Icon className="w-[24px] h-[24px] text-text-brand" />
        </div>
        <h2 className="font-designer-24b text-text-strong mb-100 leading-tight">
          {title}
        </h2>
        <p className="font-designer-14r text-text-subtle">
          {subtitle}
        </p>
      </div>
    );
  }