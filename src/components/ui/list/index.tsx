import { cn } from '@/shared/shadcn/lib/utils';

const List = ({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return <ul className={className}>{children}</ul>;
};

const ListItem = ({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <li
      className={cn(
        'rounded-50 bg-fill-neutral-subtle-default text-text-subtle font-designer-14m hover:bg-fill-neutral-subtle-hover active:bg-fill-neutral-subtle-pressed disabled:text-text-disabled flex h-600 items-center space-x-75 px-150',
        className,
      )}
    >
      {children}
    </li>
  );
};

List.Item = ListItem;

export default List;
