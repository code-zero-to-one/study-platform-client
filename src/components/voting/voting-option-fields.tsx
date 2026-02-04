'use client';

import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import type {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  FieldErrors,
} from 'react-hook-form';
import { BaseInput } from '@/components/ui/input';
import type { VotingCreateFormData } from '@/types/schemas/zod-schema';

interface VotingOptionFieldsProps {
  fields: FieldArrayWithId<VotingCreateFormData, 'options', 'id'>[];
  register: UseFormRegister<VotingCreateFormData>;
  append: UseFieldArrayAppend<VotingCreateFormData, 'options'>;
  remove: UseFieldArrayRemove;
  errors: FieldErrors<VotingCreateFormData>;
}

export default function VotingOptionFields({
  fields,
  register,
  append,
  remove,
  errors,
}: VotingOptionFieldsProps) {
  return (
    <div className="flex flex-col gap-200">
      <div className="font-designer-14b text-text-strong">
        선택지 <span className="text-text-critical">*</span>
        <span className="font-designer-12r text-text-subtle ml-100">
          (최소 2개, 최대 5개)
        </span>
      </div>
      <div className="flex flex-col gap-200">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-200">
            <div className="bg-fill-brand-subtle-default font-designer-13b text-text-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              {index + 1}
            </div>
            <div className="flex-1">
              {errors.options?.[index]?.label && (
                <p className="font-designer-12r text-text-critical mb-50">
                  {errors.options[index]?.label?.message}
                </p>
              )}
              <BaseInput
                {...register(`options.${index}.label`)}
                placeholder={`선택지 ${index + 1}`}
                maxLength={100}
                color={errors.options?.[index]?.label ? 'error' : 'default'}
              />
            </div>
            {fields.length > 2 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-100 text-text-subtle hover:bg-fill-critical-subtle-default hover:text-text-critical p-150 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {errors.options?.message && (
        <p className="font-designer-12r text-text-critical mt-100">
          {errors.options.message}
        </p>
      )}
      {fields.length < 5 && (
        <button
          type="button"
          onClick={() => append({ label: '' })}
          className="rounded-100 border-border-brand font-designer-13b text-text-brand hover:bg-fill-brand-subtle-default mt-100 flex items-center gap-100 border border-dashed px-300 py-200 transition-colors"
        >
          <Plus className="h-4 w-4" />
          선택지 추가
        </button>
      )}
    </div>
  );
}
