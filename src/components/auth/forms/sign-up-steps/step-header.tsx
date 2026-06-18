import React from 'react';

// 공통 스텝헤더
export function StepHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="mb-400 text-center sm:text-left">
      {Icon && (
        <div className="bg-fill-brand-subtle-default mb-300 inline-flex size-600 items-center justify-center rounded-full">
          <Icon className="text-text-brand size-300" />
        </div>
      )}
      <h2 className="font-designer-24b text-text-strong mb-100 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="font-designer-14r text-text-subtle">{subtitle}</p>
      )}
    </div>
  );
}
