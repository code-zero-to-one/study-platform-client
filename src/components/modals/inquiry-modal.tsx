'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToastStore } from '@/stores/use-toast-store';

type InquiryType = 'PAYMENT' | 'STUDY' | 'LEADER' | 'MENTOR' | 'BUG' | 'GENERAL';

interface InquiryFormData {
  type: InquiryType;
  title: string;
  content: string;
  images: File[];
}

interface InquiryModalProps {
  studyId: number;
  studyTitle: string;
  trigger?: React.ReactNode;
  onSubmit?: (data: InquiryFormData) => void;
  isGroupStudy?: boolean; // 그룹스터디 여부
}

/**
 * 스터디 문의 작성 모달
 * - Radix UI Dialog 기반
 * - 문의 종류 선택 (스터디/멘토/버그)
 * - 제목, 내용, 이미지 첨부
 */
export default function InquiryModal({
  studyId,
  studyTitle,
  trigger,
  onSubmit,
  isGroupStudy = true,
}: InquiryModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<InquiryFormData>({
    type: 'STUDY',
    title: '',
    content: '',
    images: [],
  });

  const showToast = useToastStore((state) => state.showToast);

  const inquiryTypeOptions = [
    { value: 'PAYMENT', label: '결제' },
    { value: 'STUDY', label: '스터디' },
    { value: 'LEADER', label: isGroupStudy ? '리더' : '멘토' },
    { value: 'BUG', label: '버그' },
    { value: 'GENERAL', label: '고민' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('제목을 입력해주세요', 'error');
      return;
    }

    if (!formData.content.trim()) {
      showToast('내용을 입력해주세요', 'error');
      return;
    }

    // 프로토타입: 제출 처리
    onSubmit?.(formData);
    
    // 알림 시뮬레이션 (멘토/관리자에게)
    showToast(
      `문의가 등록되었습니다. 멘토님께 알림이 전송됩니다.`,
      'success'
    );

    // 폼 초기화 및 모달 닫기
    setFormData({
      type: 'STUDY',
      title: '',
      content: '',
      images: [],
    });
    setOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        {trigger || (
          <Button color="primary" size="small">
            문의하기
          </Button>
        )}
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium" className="w-full">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <div>
              <Modal.Title className="font-designer-20b text-text-strong">
                스터디 문의하기
              </Modal.Title>
              <p className="font-designer-14m text-text-subtle mt-100">
                {studyTitle}
              </p>
            </div>
            <Modal.CloseButton />
          </Modal.Header>

          <Modal.Body className="overflow-auto flex-1 flex flex-col gap-400 p-400">
            <form onSubmit={handleSubmit} className="flex flex-col gap-400">
              {/* 문의 종류 */}
              <div className="flex flex-col gap-100">
                <label className="font-designer-14b text-text-default">
                  문의 종류 <span className="text-text-error">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as InquiryType,
                    }))
                  }
                  className="rounded-100 border border-border-default bg-white px-300 py-200 font-designer-14m focus:border-border-brand focus:outline-none hover:border-border-brand transition-colors cursor-pointer"
                >
                  {inquiryTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 제목 */}
              <div className="flex flex-col gap-100">
                <label className="font-designer-14b text-text-default">
                  제목 <span className="text-text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="문의 제목을 입력하세요"
                  className="rounded-100 border border-border-default px-300 py-200 font-designer-14m focus:border-border-brand focus:outline-none"
                  maxLength={100}
                />
                <p className="font-designer-12m text-text-subtlest text-right">
                  {formData.title.length}/100
                </p>
              </div>

              {/* 내용 */}
              <div className="flex flex-col gap-100">
                <label className="font-designer-14b text-text-default">
                  내용 <span className="text-text-error">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="문의 내용을 상세히 작성해주세요"
                  className="rounded-100 border border-border-default px-300 py-200 font-designer-14m focus:border-border-brand focus:outline-none min-h-[200px] resize-none"
                  maxLength={1000}
                />
                <p className="font-designer-12m text-text-subtlest text-right">
                  {formData.content.length}/1,000
                </p>
              </div>

              {/* 이미지 첨부 */}
              <div className="flex flex-col gap-100">
                <label className="font-designer-14b text-text-default">
                  관련 이미지 첨부 (선택)
                </label>
                <div className="flex flex-col gap-200">
                  <label className="cursor-pointer">
                    <div className="rounded-100 border-2 border-dashed border-border-default px-300 py-400 text-center hover:border-border-brand transition-colors">
                      <p className="font-designer-14m text-text-subtle">
                        클릭하여 이미지 선택 (최대 5장)
                      </p>
                      <p className="font-designer-12m text-text-subtlest mt-50">
                        JPG, PNG, GIF (각 5MB 이하)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={formData.images.length >= 5}
                    />
                  </label>

                  {/* 첨부된 이미지 미리보기 */}
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-200">
                      {formData.images.map((file, index) => (
                        <div
                          key={index}
                          className="relative group w-[100px] h-[100px] rounded-100 overflow-hidden border border-border-default"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`첨부 이미지 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-50 right-50 bg-background-neutral-strong text-text-inverse rounded-full w-[24px] h-[24px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-200 justify-end mt-200">
                <Button
                  type="button"
                  color="secondary"
                  onClick={() => setOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit" color="primary">
                  문의 등록
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
