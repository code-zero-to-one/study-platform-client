const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || 'https://test-blog.zeroone.it.kr';

// 공통 응답 타입 (flat 구조용)
export interface StrapiCollectionResponse<T> {
  data: (T & { id: number; documentId: string })[]; // documentId 추가
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// 단일 아이템 응답 타입
export interface StrapiSingleResponse<T> {
  data: (T & { id: number; documentId: string }) | null;
  meta: object;
}

// 공통 fetch 함수
async function strapiFetch<T>(path: string): Promise<T> {
  const url = `${STRAPI_URL}${path}`;

  const res = await fetch(url, {
    next: { revalidate: 60 }, // ISR 설정
  });

  if (!res.ok) {
    throw new Error(
      `Strapi fetch error: ${res.status} ${res.statusText} (${url})`,
    );
  }

  return (await res.json()) as T;
}

export { strapiFetch, STRAPI_URL };
