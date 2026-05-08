import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';

/**
 * 클래스 어드민은 아직 전용 이미지 업로드 티켓 API가 없어
 * 검증된 기존 업로드 인프라를 재사용한다.
 */
export const uploadAdminCourseImage = async (file: File): Promise<string> => {
  return uploadCommunityMarkdownImage(file);
};
