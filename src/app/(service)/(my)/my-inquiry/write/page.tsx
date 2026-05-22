'use client';

import { ArrowLeft, ImagePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { useToastStore } from '@/stores/use-toast-store';

// TODO: 1:1 문의 작성 API not yet available — wire POST /api/v1/inquiries when backend adds it
type InquiryType = '결제' | '클래스' | '운영' | '건의' | '고민';

const INQUIRY_TYPES: InquiryType[] = ['결제', '클래스', '운영', '건의', '고민'];

export default function MyInquiryWritePage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<InquiryType | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyKakao, setNotifyKakao] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    if (title || content) {
      setCancelDialogOpen(true);
    } else {
      router.push('/my-inquiry');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = '';
  };

  const handleDraft = () => {
    // TODO: POST /api/v1/inquiries/draft
    showToast('임시저장 기능은 준비 중입니다.', 'error');
  };

  const handleSubmit = async () => {
    if (!type) {
      showToast('문의 유형을 선택해 주세요.', 'error');
      return;
    }
    if (!title.trim()) {
      showToast('제목을 입력해 주세요.', 'error');
      return;
    }
    if (!content.trim()) {
      showToast('내용을 입력해 주세요.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: POST /api/v1/inquiries { type, title, content, imageKeys, notifyEmail, notifyKakao }
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast('문의가 등록되었습니다.', 'success');
      router.push('/my-inquiry');
    } catch {
      showToast('문의 등록에 실패했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-500">
      {/* 헤더 */}
      <div className="flex items-center gap-200">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-100 text-text-subtle hover:text-text-default"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-designer-24b text-text-default">문의 작성</h1>
      </div>

      {/* 폼 */}
      <div className="flex flex-col gap-400">
        {/* 유형 선택 */}
        <div className="flex flex-col gap-100">
          <label className="font-designer-14m text-text-default">
            유형 선택 <span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as InquiryType | '')}
            className="border-border-default rounded-100 font-designer-14r text-text-default border px-200 py-150 outline-none"
          >
            <option value="">유형을 선택해 주세요</option>
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-100">
          <label className="font-designer-14m text-text-default">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="제목을 입력해 주세요."
            className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest border px-200 py-150 outline-none"
          />
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-100">
          <label className="font-designer-14m text-text-default">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            maxLength={2000}
            placeholder="문의 내용을 자세히 작성해 주세요."
            className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest resize-none border px-200 py-150 outline-none"
          />
          <p className="font-designer-12r text-text-subtlest text-right">
            {content.length}/2000
          </p>
        </div>

        {/* 이미지 첨부 */}
        <div className="flex flex-col gap-100">
          <label className="font-designer-14m text-text-default">
            이미지 첨부{' '}
            <span className="font-designer-12r text-text-subtle">
              (최대 5장)
            </span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= 5}
            className="border-border-default rounded-150 flex h-1500 w-full flex-col items-center justify-center gap-100 border border-dashed hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus size={24} className="text-text-subtlest" />
            <p className="font-designer-14r text-text-subtle">
              클릭하여 이미지 업로드
            </p>
          </button>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-150">
              {images.map((file, index) => (
                <div
                  key={index}
                  className="border-border-subtle rounded-100 flex items-center gap-100 border px-200 py-100"
                >
                  <span className="font-designer-12r text-text-subtle max-w-1500 truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="font-designer-12r text-text-subtlest hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 알림 설정 */}
        <div className="flex flex-col gap-200">
          <label className="font-designer-14m text-text-default">
            알림 설정
          </label>
          <div className="flex flex-col gap-150">
            <label className="flex cursor-pointer items-center gap-200">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="h-400 w-400 rounded-50 accent-primary-500"
              />
              <span className="font-designer-14r text-text-default">
                이메일 알림
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-200">
              <input
                type="checkbox"
                checked={notifyKakao}
                onChange={(e) => setNotifyKakao(e.target.checked)}
                className="h-400 w-400 rounded-50 accent-primary-500"
              />
              <span className="font-designer-14r text-text-default">
                카카오톡 알림
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-200">
        <Button
          color="secondary"
          size="medium"
          className="flex-1"
          onClick={handleDraft}
        >
          임시저장
        </Button>
        <Button
          color="primary"
          size="medium"
          className="flex-1"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? '등록 중...' : '등록하기'}
        </Button>
      </div>

      {/* 작성 취소 확인 다이얼로그 */}
      <Modal.Root open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content size="medium">
            <Modal.Header variant="alert">
              <Modal.Title>작성을 취소하시겠어요?</Modal.Title>
            </Modal.Header>
            <Modal.Body variant="alert">
              <p className="font-designer-14r text-text-subtle text-center">
                작성 중인 내용이 저장되지 않습니다.
              </p>
            </Modal.Body>
            <Modal.Footer variant="alert">
              <div className="flex gap-200">
                <Button
                  color="secondary"
                  size="medium"
                  className="flex-1"
                  onClick={() => setCancelDialogOpen(false)}
                >
                  계속 작성
                </Button>
                <Button
                  color="primary"
                  size="medium"
                  className="flex-1"
                  onClick={() => router.push('/my-inquiry')}
                >
                  확인
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </div>
  );
}
