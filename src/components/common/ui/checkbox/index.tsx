import Image from 'next/image';

const Checkbox = ({
  id,
  defaultChecked = false,
  checked = false,
  onToggle,
  themeColor = 'fill-success-default-default',
}: {
  id: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onToggle: () => void;
  themeColor?: string;
}) => {
  // Check if themeColor is a hex color (starts with #)
  const isHexColor = themeColor.startsWith('#');

  // Get the appropriate className or style
  const getThemeStyles = () => {
    if (isHexColor) {
      return {
        style: checked
          ? { borderColor: themeColor, backgroundColor: themeColor }
          : undefined,
        className: checked
          ? 'border-2'
          : 'border-border-default bg-fill-neutral-subtle-default border-2',
      };
    } else {
      return {
        style: undefined,
        className: checked
          ? `border-${themeColor} bg-${themeColor} border-2`
          : 'border-border-default bg-fill-neutral-subtle-default border-2',
      };
    }
  };

  const { style, className } = getThemeStyles();

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
        className={`rounded-50 inline-flex items-center justify-center transition-all duration-200 ${className}`}
        style={style}
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
