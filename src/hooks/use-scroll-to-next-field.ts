import { useCallback } from "react";

export const SCROLL_FIELD_ATTR = "data-scroll-field";

/**
 * 모달 폼에서 단일 선택 필드를 선택했을 때 다음 필드로 자동 스크롤하는 훅.
 * 각 필드 컨테이너에 `data-scroll-field="fieldName"` 속성을 추가한 뒤
 * 선택 이벤트 핸들러에서 `scrollToNext('fieldName')` 을 호출하세요.
 */
export function useScrollToNextField() {
	return useCallback((currentFieldName: string) => {
		const all = document.querySelectorAll(`[${SCROLL_FIELD_ATTR}]`);
		const arr = Array.from(all);
		const idx = arr.findIndex(
			(el) => el.getAttribute(SCROLL_FIELD_ATTR) === currentFieldName,
		);
		if (idx === -1 || idx >= arr.length - 1) return;

		const next = arr[idx + 1] as HTMLElement;
		next.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}, []);
}
