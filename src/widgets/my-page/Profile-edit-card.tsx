import { MultiDropdown } from '@/shared/ui/dropdown';
import { BaseInput, TextAreaInput } from '@/shared/ui/input';

type InputType = 'text' | 'textarea' | 'dropdown';

interface FormFieldProps<T> {
  label: string;
  description?: string;
  type: InputType;
  required?: boolean;
  options?: { label: string; value: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function FormField<T>({
  label, description, type, required = false, options = [], value, onChange
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
            onChange={(e) => onChange(e as T)}
          />
        );
      case 'dropdown':
        return (
          <MultiDropdown.Provider
            options={options}
            defaultValue={value as string[]}
            onChange={(v) => onChange(v as T)}
            placeholder="선택해주세요"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-600">
      <div className="flex w-[112px] gap-100 pt-100">
        <div className="font-designer-14b">{label}</div>
        {required && (
          <div className="font-designer-13r text-text-error">필수</div>
        )}
      </div>
      <div className="flex flex-col gap-75 w-full">
        {renderInput()}
      </div>
    </div>
  );
}
