import { MultiDropdown, SingleDropdown } from '@/shared/ui/dropdown';
import { BaseInput, TextAreaInput } from '@/shared/ui/input';
import { ToggleButton } from '../toggle';

type InputType = 'text' | 'textarea' | 'singledropdown' | 'multidropdown' | 'togglegroup';

interface FormFieldProps<T> {
  label: string;
  description?: string;
  type: InputType;
  maxLength?: number;
  required?: boolean;
  options?: { value: string | number, label: string }[]
  value: T;
  direction?: 'horizontal' | 'vertical';
  onChange: (value: T) => void;
}


export function FormField<T>({
  label, description, type, required = false, maxLength = 30, options = [], value, direction = 'horizontal', onChange
}: FormFieldProps<T>) {

  const renderInput = () => {
    switch (type) {
      case 'text':
        return (
          <>
            <BaseInput.Provider
              placeholder="입력하세요."
              value={value as string}
              onChange={(e) => onChange(e.target.value as T)}
            />
            {description && (
              <div className="font-designer-13r text-text-subtle">{description}</div>
            )}
          </>
        );
      case 'textarea':
        return (
          <TextAreaInput.Provider
            placeholder="입력하세요."
            guideText={description}
            value={value as string}
            maxLength={maxLength}
            onChange={(e) => onChange(e as T)}
          />
        );
      case 'singledropdown':
        return (
          <>
            <SingleDropdown.Provider
              options={options}
              defaultValue={value ? (value as string) : undefined}
              placeholder="선택해주세요"
              onChange={(v) => onChange(v as T)}
            />
            {description && (
              <div className="font-designer-13r text-text-subtle">{description}</div>
            )}
          </>
        );
      case 'multidropdown':
        return (
          <>
            <MultiDropdown.Provider
              options={options}
              defaultValue={value as string[]}
              onChange={(v) => onChange(v as T)}
              placeholder="선택해주세요"
            />
            {description && (
              <div className="font-designer-13r text-text-subtle">{description}</div>
            )}
          </>
        );
      case 'togglegroup':
        {
          const toggleItem = (key: string | number) => {
            const prev = value as (string | number)[];
            const updated = prev.includes(key)
              ? prev.filter((item) => item !== key)
              : [...prev, key];
            onChange(updated as T);
          };


          return (
            <div className="flex flex-wrap gap-100">
              {options.map(({ value: optionValue, label }) => (
                <ToggleButton.Provider
                  key={optionValue}
                  pressed={(value as (string | number)[]).map(String).includes(optionValue.toString())}
                  onPressedChange={() => toggleItem(optionValue)}
                >
                  {label}
                </ToggleButton.Provider>
              ))}
            </div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${direction === 'vertical' ? 'flex-col gap-150' : 'gap-600'}`}>
      <div className={`flex ${direction === 'vertical' ? 'w-full gap-75 items-center' : 'w-[112px] gap-100 pt-100'}`}>
        <div className="font-designer-14b text-text-default">{label}</div>
        {required && <div className="font-designer-13r text-text-error">필수</div>}
      </div>
      <div className="flex flex-col gap-75 w-full">{renderInput()}</div>
    </div>
  );
}
