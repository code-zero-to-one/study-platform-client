import Image from 'next/image';

const Checkbox = ({
  id,
  defaultChecked = false,
  checked = false,
  onToggle,
}: {
  id: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onToggle: () => void;
}) => {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center">
      <input
        id={id}
        type="checkbox"
        className="hidden"
        {...(checked !== undefined
          ? { checked, onChange: onToggle }
          : { defaultChecked, onChange: onToggle })}
      />
      <div
        className={`rounded-50 inline-flex items-center justify-center border-2 transition-all duration-200 ${checked ? 'bg-fill-success-default-default border-fill-success-default-default' : 'border-border-default bg-fill-neutral-subtle-default'}`}
      >
        <Image
          src="/icons/shape.svg"
          alt="checkbox"
          width={20}
          height={20}
          className={checked ? 'brightness-0 invert filter' : ''}
        />
      </div>
    </label>
  );
};

export default Checkbox;
