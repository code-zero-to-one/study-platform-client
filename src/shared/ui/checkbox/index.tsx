import { cn } from '@/shared/shadcn/lib/utils';

const Checkbox = ({ id }: { id: string }) => {
  return (
    <input
      type="checkbox"
      id={id}
      className={cn(
        "bg-fill-neutral-subtle-default rounded-50 checked:bg-[url('/icons/shape.png')]",
      )}
    />
  );
};

export default Checkbox;
